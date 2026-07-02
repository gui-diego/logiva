import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { timeout, catchError, of } from 'rxjs';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { BrasiliaDatePipe } from '../../../shared/pipes/brasilia-date.pipe';
import { DeliveryApiService } from '../../../core/api/domain-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Delivery, DeliveryStatus } from '../../../core/models';
import { ALL_DELIVERY_STATUSES, getDeliveryStatusLabel } from '../../../shared/utils/delivery-status.labels';

const STATUSES = ALL_DELIVERY_STATUSES;

@Component({
  selector: 'app-delivery-detail',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    StatusBadgeComponent,
    BrasiliaDatePipe,
  ],
  template: `
    <a routerLink="/deliveries" class="back-link">
      <mat-icon>arrow_back</mat-icon> Voltar
    </a>

    @if (loading()) {
      <div class="loading"><mat-spinner /></div>
    } @else if (errorMessage()) {
      <mat-card class="error-card">
        <mat-icon>error_outline</mat-icon>
        <p>{{ errorMessage() }}</p>
      </mat-card>
    } @else if (delivery()) {
      <div class="header">
        <h2>{{ delivery()!.trackingCode }}</h2>
        <app-status-badge [status]="delivery()!.status" />
      </div>

      <div class="grid">
        <mat-card>
          <mat-card-header><mat-card-title>Detalhes</mat-card-title></mat-card-header>
          <mat-card-content>
            <dl class="details">
              <dt>Origem</dt><dd>{{ delivery()!.originCity }}</dd>
              <dt>Destino</dt><dd>{{ delivery()!.destinationCity }}</dd>
              <dt>Transportadora</dt><dd>{{ delivery()!.carrierName }}</dd>
              <dt>Cliente</dt><dd>{{ delivery()!.customerName }}</dd>
              <dt>Peso</dt><dd>{{ delivery()!.weightKg ?? '-' }} kg</dd>
              <dt>Previsão</dt>
              <dd>{{ delivery()!.estimatedDeliveryAt | brasiliaDate }}</dd>
              @if (delivery()!.deliveredAt) {
                <dt>Entregue em</dt>
                <dd>{{ delivery()!.deliveredAt | brasiliaDate }}</dd>
              }
              @if (delivery()!.assignedToEmail) {
                <dt>Responsável</dt>
                <dd>{{ delivery()!.assignedToEmail }}</dd>
              }
            </dl>
          </mat-card-content>
        </mat-card>

        @if (auth.hasRole('OPERATOR') && delivery()!.status !== 'DELIVERED') {
          <mat-card class="update-status-card">
            <mat-card-header><mat-card-title>Atualizar status</mat-card-title></mat-card-header>
            <mat-card-content>
              <form [formGroup]="statusForm" (ngSubmit)="updateStatus()" class="status-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Novo status</mat-label>
                <mat-select formControlName="status">
                  <mat-select-trigger>
                    {{ getStatusLabel(statusForm.value.status!) }}
                  </mat-select-trigger>
                  @for (s of statuses; track s) {
                      <mat-option [value]="s">{{ getStatusLabel(s) }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Observação</mat-label>
                  <input matInput formControlName="note" />
                </mat-form-field>
                <button mat-flat-button color="primary" type="submit" [disabled]="statusForm.invalid || updating()">
                  @if (updating()) {
                    <mat-spinner diameter="20" />
                  } @else {
                    Atualizar
                  }
                </button>
              </form>
            </mat-card-content>
          </mat-card>
        } @else if (auth.hasRole('OPERATOR') && delivery()!.status === 'DELIVERED') {
          <mat-card class="locked-card">
            <mat-card-content>
              <div class="locked-message">
                <mat-icon>lock</mat-icon>
                <p>Esta entrega foi finalizada e não permite mais alterações de status.</p>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <mat-card class="timeline-card">
        <mat-card-header><mat-card-title>Histórico</mat-card-title></mat-card-header>
        <mat-card-content>
          @if (delivery()!.statusHistory?.length) {
            <mat-list>
              @for (item of delivery()!.statusHistory; track $index) {
                <mat-list-item>
                  <mat-icon matListItemIcon>history</mat-icon>
                  <span matListItemTitle>
                    <app-status-badge [status]="item.status" />
                    — {{ item.changedAt | brasiliaDate }}
                  </span>
                  @if (item.note) {
                    <span matListItemLine>{{ item.note }}</span>
                  }
                </mat-list-item>
              }
            </mat-list>
          } @else {
            <p class="empty-history">Nenhum histórico registrado.</p>
          }
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: `
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #1976d2;
      text-decoration: none;
      margin-bottom: 16px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .details {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 8px 16px;
    }

    dt { color: #64748b; font-weight: 500; }
    dd { margin: 0; }

    .status-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .update-status-card mat-card-content {
      padding-top: 20px;
    }

    .locked-card mat-card-content {
      padding: 20px 24px;
    }

    .locked-message {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #64748b;
    }

    .locked-message mat-icon {
      color: #94a3b8;
    }

    .locked-message p {
      margin: 0;
      font-size: 14px;
    }

    .full-width { width: 100%; }
    .timeline-card { margin-top: 8px; }

    .loading {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .error-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px;
      color: #b91c1c;
      background: #fef2f2;
    }

    .error-card p { margin: 0; }

    .empty-history {
      margin: 0;
      color: #94a3b8;
      font-size: 14px;
    }
  `,
})
export class DeliveryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly deliveryApi = inject(DeliveryApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly statuses = STATUSES;
  readonly getStatusLabel = getDeliveryStatusLabel;
  readonly delivery = signal<Delivery | null>(null);
  readonly loading = signal(true);
  readonly updating = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly statusForm = this.fb.nonNullable.group({
    status: ['' as DeliveryStatus, Validators.required],
    note: [''],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.deliveryApi
      .getById(id)
      .pipe(
        timeout(15000),
        catchError(() => {
          this.errorMessage.set('Entrega não encontrada ou erro ao carregar.');
          return of(null);
        }),
      )
      .subscribe((data) => {
        if (data) {
          this.delivery.set(data);
          this.statusForm.patchValue({ status: data.status });
        }
        this.loading.set(false);
      });
  }

  updateStatus(): void {
    const current = this.delivery();
    if (!current || this.statusForm.invalid) return;

    this.updating.set(true);
    const { status, note } = this.statusForm.getRawValue();

    this.deliveryApi.updateStatus(current.id, status, note || undefined).subscribe({
      next: (updated) => {
        this.delivery.set(updated);
        this.snackBar.open('Status atualizado com sucesso', 'OK', { duration: 3000 });
        this.updating.set(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Erro ao atualizar status';
        this.snackBar.open(message, 'OK', { duration: 4000 });
        this.updating.set(false);
      },
    });
  }
}
