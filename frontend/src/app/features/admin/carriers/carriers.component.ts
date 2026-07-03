import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { timeout, catchError, of, filter, switchMap } from 'rxjs';
import { CarrierApiService } from '../../../core/api/domain-api.service';
import { Carrier } from '../../../core/models';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-carriers',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './carriers.component.html',
  styleUrl: './carriers.component.scss',
})
export class CarriersComponent implements OnInit {
  private readonly carrierApi = inject(CarrierApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly fb = inject(FormBuilder);

  readonly dataSource = new MatTableDataSource<Carrier>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly columns = ['name', 'code', 'active', 'actions'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    active: [true],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.carrierApi
      .list()
      .pipe(
        timeout(15000),
        catchError(() => of([] as Carrier[])),
      )
      .subscribe((carriers) => {
        this.dataSource.data = carriers;
        this.loading.set(false);
      });
  }

  startEdit(carrier: Carrier): void {
    this.editingId.set(carrier.id);
    this.form.patchValue({
      name: carrier.name,
      code: carrier.code,
      active: carrier.active,
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', code: '', active: true });
  }

  submit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const { name, code, active } = this.form.getRawValue();
    const editingId = this.editingId();

    const request$ = editingId
      ? this.carrierApi.update(editingId, { name, code: code.toUpperCase(), active })
      : this.carrierApi.create({ name, code: code.toUpperCase() });

    request$.subscribe({
      next: () => {
        const message = editingId
          ? 'Transportadora atualizada com sucesso'
          : 'Transportadora cadastrada com sucesso';
        this.snackBar.open(message, 'OK', { duration: 3000 });
        this.cancelEdit();
        this.saving.set(false);
        this.load();
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erro ao salvar transportadora';
        this.snackBar.open(message, 'OK', { duration: 4000 });
        this.saving.set(false);
      },
    });
  }

  remove(carrier: Carrier): void {
    this.confirmDialog
      .open({
        title: 'Excluir transportadora',
        message: `Deseja realmente excluir a transportadora "${carrier.name}"? Esta ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        confirmColor: 'warn',
      })
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() => this.carrierApi.delete(carrier.id)),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Transportadora excluída com sucesso', 'OK', { duration: 3000 });
          if (this.editingId() === carrier.id) {
            this.cancelEdit();
          }
          this.load();
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Erro ao excluir transportadora';
          this.snackBar.open(message, 'OK', { duration: 4000 });
        },
      });
  }
}
