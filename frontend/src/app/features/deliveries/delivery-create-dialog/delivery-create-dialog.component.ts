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
  templateUrl: './delivery-create-dialog.component.html',
  styleUrl: './delivery-create-dialog.component.scss',
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
