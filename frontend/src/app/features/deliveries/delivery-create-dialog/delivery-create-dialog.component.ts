import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  CarrierApiService,
  CustomerApiService,
  DeliveryApiService,
} from '../../../core/api/domain-api.service';
import { Carrier, Customer, DeliveryStatus } from '../../../core/models';
import { ALL_DELIVERY_STATUSES, getDeliveryStatusLabel } from '../../../shared/utils/delivery-status.labels';

const INITIAL_STATUSES: DeliveryStatus[] = ['PENDING', 'PICKED_UP'];

@Component({
  selector: 'app-delivery-create-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Nova entrega</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Código de rastreio</mat-label>
          <input matInput formControlName="trackingCode" />
          <button mat-icon-button matSuffix type="button" (click)="generateTrackingCode()" title="Gerar código">
            <mat-icon>autorenew</mat-icon>
          </button>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status inicial</mat-label>
          <mat-select formControlName="status">
            <mat-select-trigger>
              {{ getStatusLabel(form.value.status!) }}
            </mat-select-trigger>
            @for (s of initialStatuses; track s) {
              <mat-option [value]="s">{{ getStatusLabel(s) }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Previsão de entrega</mat-label>
          <input matInput type="datetime-local" formControlName="estimatedDeliveryAt" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Cidade de origem</mat-label>
          <input matInput formControlName="originCity" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Cidade de destino</mat-label>
          <input matInput formControlName="destinationCity" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Peso (kg)</mat-label>
          <input matInput type="number" formControlName="weightKg" min="0" step="0.01" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Transportadora</mat-label>
          <mat-select formControlName="carrierId">
            @for (c of carriers; track c.id) {
              <mat-option [value]="c.id">{{ c.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Cliente</mat-label>
          <mat-select formControlName="customerId">
            @for (c of customers; track c.id) {
              <mat-option [value]="c.id">{{ c.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="saving">Cancelar</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="form.invalid || saving">
        @if (saving) {
          <mat-spinner diameter="20" />
        } @else {
          Criar entrega
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 16px;
      min-width: 480px;
      padding-top: 8px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    @media (max-width: 560px) {
      .form-grid {
        grid-template-columns: 1fr;
        min-width: 280px;
      }
    }
  `,
})
export class DeliveryCreateDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly deliveryApi = inject(DeliveryApiService);
  private readonly carrierApi = inject(CarrierApiService);
  private readonly customerApi = inject(CustomerApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<DeliveryCreateDialogComponent>);

  readonly initialStatuses = INITIAL_STATUSES;
  readonly getStatusLabel = getDeliveryStatusLabel;
  carriers: Carrier[] = [];
  customers: Customer[] = [];
  saving = false;

  readonly form = this.fb.nonNullable.group({
    trackingCode: ['', Validators.required],
    status: ['PENDING' as DeliveryStatus, Validators.required],
    estimatedDeliveryAt: [''],
    originCity: ['', Validators.required],
    destinationCity: ['', Validators.required],
    weightKg: [null as number | null],
    carrierId: [null as number | null, Validators.required],
    customerId: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.generateTrackingCode();
    this.carrierApi.list().subscribe((carriers) => (this.carriers = carriers));
    this.customerApi.list().subscribe((customers) => (this.customers = customers));
  }

  generateTrackingCode(): void {
    const code = `TRK${Date.now().toString().slice(-8)}`;
    this.form.patchValue({ trackingCode: code });
  }

  submit(): void {
    if (this.form.invalid) return;

    this.saving = true;
    const raw = this.form.getRawValue();

    this.deliveryApi
      .create({
        trackingCode: raw.trackingCode,
        status: raw.status,
        originCity: raw.originCity,
        destinationCity: raw.destinationCity,
        carrierId: raw.carrierId!,
        customerId: raw.customerId!,
        weightKg: raw.weightKg ?? undefined,
        estimatedDeliveryAt: raw.estimatedDeliveryAt
          ? new Date(raw.estimatedDeliveryAt).toISOString().slice(0, 19)
          : undefined,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Entrega criada com sucesso', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Erro ao criar entrega';
          this.snackBar.open(message, 'OK', { duration: 4000 });
          this.saving = false;
        },
      });
  }
}
