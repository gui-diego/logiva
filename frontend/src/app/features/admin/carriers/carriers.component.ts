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
  template: `
    <header class="page-header">
      <div>
        <h2>Transportadoras</h2>
        <p class="subtitle">Cadastro e gestão de parceiros logísticos</p>
      </div>
    </header>

    <div class="content-grid">
      <mat-card class="table-card">
        <mat-card-header>
          <mat-card-title>Transportadoras cadastradas</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loading()) {
            <div class="loading"><mat-spinner /></div>
          } @else {
            <table mat-table [dataSource]="dataSource" class="carriers-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Nome</th>
                <td mat-cell *matCellDef="let row">{{ row.name }}</td>
              </ng-container>

              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef>Código</th>
                <td mat-cell *matCellDef="let row">
                  <span class="code-chip">{{ row.code }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="active">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let row">
                  <span class="status-chip" [class.inactive]="!row.active">
                    {{ row.active ? 'Ativa' : 'Inativa' }}
                  </span>
                </td>
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
          <mat-card-title>{{ editingId() ? 'Editar transportadora' : 'Nova transportadora' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="col-6">
                <mat-label>Nome</mat-label>
                <input matInput formControlName="name" placeholder="Ex: Express Brasil" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="col-6">
                <mat-label>Código</mat-label>
                <input matInput formControlName="code" placeholder="Ex: EXBR" />
                <mat-hint>Identificador único (sigla)</mat-hint>
              </mat-form-field>
            </div>

            @if (editingId()) {
              <div class="form-row">
                <div class="col-6 active-toggle">
                  <mat-slide-toggle formControlName="active" color="primary">
                    Transportadora ativa
                  </mat-slide-toggle>
                </div>
              </div>
            }

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

    .active-toggle {
      display: flex;
      align-items: center;
      min-height: 56px;
      padding-left: 4px;
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

    .carriers-table { width: 100%; }

    .loading {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .actions-cell {
      text-align: right;
      white-space: nowrap;
    }

    .code-chip {
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      background: #eff6ff;
      color: #1d4ed8;
    }

    .status-chip {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      background: #ecfdf5;
      color: #047857;
    }

    .status-chip.inactive {
      background: #f1f5f9;
      color: #64748b;
    }
  `,
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
