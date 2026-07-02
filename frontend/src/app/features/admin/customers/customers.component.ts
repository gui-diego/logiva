import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { timeout, catchError, of, filter, switchMap } from 'rxjs';
import { CustomerApiService } from '../../../core/api/domain-api.service';
import { Customer } from '../../../core/models';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <header class="page-header">
      <div>
        <h2>Clientes</h2>
        <p class="subtitle">Cadastro e gestão de clientes</p>
      </div>
    </header>

    <div class="content-grid">
      <mat-card class="table-card">
        <mat-card-header>
          <mat-card-title>Clientes cadastrados</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loading()) {
            <div class="loading"><mat-spinner /></div>
          } @else {
            <table mat-table [dataSource]="dataSource" class="customers-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Nome</th>
                <td mat-cell *matCellDef="let row">{{ row.name }}</td>
              </ng-container>

              <ng-container matColumnDef="document">
                <th mat-header-cell *matHeaderCellDef>Documento</th>
                <td mat-cell *matCellDef="let row">{{ row.document || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="city">
                <th mat-header-cell *matHeaderCellDef>Cidade</th>
                <td mat-cell *matCellDef="let row">{{ row.city || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let row" class="actions-cell">
                  <button mat-icon-button type="button" title="Editar" (click)="startEdit(row)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button type="button" title="Excluir" (click)="remove(row)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>

      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editingId() ? 'Editar cliente' : 'Novo cliente' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="col-6">
                <mat-label>Nome</mat-label>
                <input matInput formControlName="name" placeholder="Ex: Empresa ABC" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="col-6">
                <mat-label>Documento</mat-label>
                <input matInput formControlName="document" placeholder="CPF ou CNPJ" />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="col-6">
                <mat-label>Cidade</mat-label>
                <input matInput formControlName="city" placeholder="Ex: São Paulo" />
              </mat-form-field>
            </div>

            <div class="form-actions">
              @if (editingId()) {
                <button mat-stroked-button type="button" (click)="cancelEdit()" [disabled]="saving()">
                  Cancelar
                </button>
              }
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                @if (saving()) {
                  <mat-spinner diameter="20" />
                } @else {
                  <ng-container>
                    <mat-icon>{{ editingId() ? 'save' : 'add' }}</mat-icon>
                    {{ editingId() ? 'Salvar' : 'Cadastrar' }}
                  </ng-container>
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .page-header { margin-bottom: 24px; }

    h2 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
    }

    .subtitle {
      margin: 6px 0 0;
      color: #64748b;
      font-size: 14px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr minmax(380px, 440px);
      gap: 20px;
      align-items: start;
    }

    @media (max-width: 960px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    .form-card,
    .table-card {
      border-radius: 16px;
      border: 1px solid rgba(15, 23, 42, 0.06);
      box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
    }

    .form-card mat-card-content,
    .table-card mat-card-content {
      padding-top: 20px;
    }

    .form {
      width: 100%;
    }

    .form-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0 16px;
      width: 100%;
    }

    .col-6 {
      flex: 0 0 calc(50% - 8px);
      min-width: 0;
    }

    @media (max-width: 600px) {
      .col-6 {
        flex: 0 0 100%;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      width: 100%;
      margin-top: 8px;
    }

    button mat-icon {
      margin-right: 4px;
      vertical-align: middle;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .customers-table { width: 100%; }

    .loading {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .actions-cell {
      text-align: right;
      white-space: nowrap;
    }
  `,
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
