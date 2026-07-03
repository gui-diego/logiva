import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { timeout, catchError, of, filter, switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PageSkeletonComponent } from '../../../shared/components/page-skeleton/page-skeleton.component';
import { CustomerApiService } from '../../../core/api/domain-api.service';
import { Customer } from '../../../core/models';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeaderComponent,
    PageSkeletonComponent,
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
})
export class CustomersComponent implements OnInit {
  private readonly customerApi = inject(CustomerApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly fb = inject(FormBuilder);

  readonly dataSource = new MatTableDataSource<Customer>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly columns = ['name', 'document', 'city', 'actions'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    document: [''],
    city: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.customerApi
      .list()
      .pipe(
        timeout(15000),
        catchError(() => of([] as Customer[])),
      )
      .subscribe((customers) => {
        this.dataSource.data = customers;
        this.loading.set(false);
      });
  }

  startEdit(customer: Customer): void {
    this.editingId.set(customer.id);
    this.form.patchValue({
      name: customer.name,
      document: customer.document ?? '',
      city: customer.city ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const { name, document, city } = this.form.getRawValue();
    const payload = {
      name,
      document: document.trim() || undefined,
      city: city.trim() || undefined,
    };

    const editingId = this.editingId();
    const request$ = editingId
      ? this.customerApi.update(editingId, payload)
      : this.customerApi.create(payload);

    request$.subscribe({
      next: () => {
        const message = editingId ? 'Cliente atualizado com sucesso' : 'Cliente cadastrado com sucesso';
        this.snackBar.open(message, 'OK', { duration: 3000 });
        this.cancelEdit();
        this.saving.set(false);
        this.load();
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erro ao salvar cliente';
        this.snackBar.open(message, 'OK', { duration: 4000 });
        this.saving.set(false);
      },
    });
  }

  remove(customer: Customer): void {
    this.confirmDialog
      .open({
        title: 'Excluir cliente',
        message: `Deseja realmente excluir o cliente "${customer.name}"? Esta ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        confirmColor: 'warn',
      })
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() => this.customerApi.delete(customer.id)),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Cliente excluído com sucesso', 'OK', { duration: 3000 });
          if (this.editingId() === customer.id) {
            this.cancelEdit();
          }
          this.load();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Erro ao excluir cliente';
          this.snackBar.open(message, 'OK', { duration: 4000 });
        },
      });
  }
}
