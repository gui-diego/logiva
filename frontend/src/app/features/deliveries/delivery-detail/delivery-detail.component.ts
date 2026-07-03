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
  templateUrl: './delivery-detail.component.html',
  styleUrl: './delivery-detail.component.scss',
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
