import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CarrierApiService, DeliveryApiService } from '../../../core/api/domain-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Carrier, Delivery, DeliveryStatus } from '../../../core/models';
import { ALL_DELIVERY_STATUSES, getDeliveryStatusLabel } from '../../../shared/utils/delivery-status.labels';
import { DeliveryCreateDialogComponent } from '../delivery-create-dialog/delivery-create-dialog.component';

const STATUSES = ALL_DELIVERY_STATUSES;

@Component({
  selector: 'app-delivery-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    StatusBadgeComponent,
  ],
  templateUrl: './delivery-list.component.html',
  styleUrl: './delivery-list.component.scss',
})
export class DeliveryListComponent implements OnInit {
  private readonly deliveryApi = inject(DeliveryApiService);
  private readonly carrierApi = inject(CarrierApiService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly statuses = STATUSES;
  readonly getStatusLabel = getDeliveryStatusLabel;
  readonly displayedColumns = ['trackingCode', 'status', 'route', 'carrier', 'customer'];

  carriers: Carrier[] = [];
  readonly dataSource = new MatTableDataSource<Delivery>([]);
  readonly loading = signal(true);
  page = 0;
  pageSize = 10;
  totalElements = 0;

  readonly filters = this.fb.nonNullable.group({
    status: [''],
    carrierId: [''],
    search: [''],
  });

  ngOnInit(): void {
    this.carrierApi.list().subscribe((carriers) => {
      this.carriers = carriers;
    });
    this.load();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(DeliveryCreateDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
    });

    ref.afterClosed().subscribe((created) => {
      if (created) {
        this.page = 0;
        this.load();
      }
    });
  }

  load(): void {
    this.loading.set(true);
    const { status, carrierId, search } = this.filters.getRawValue();

    this.deliveryApi.list({
      status: (status || undefined) as DeliveryStatus | undefined,
      carrierId: carrierId ? Number(carrierId) : undefined,
      search: search || undefined,
      page: this.page,
      size: this.pageSize,
    }).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.totalElements = response.totalElements;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onPage(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  clearFilters(): void {
    this.filters.reset();
    this.page = 0;
    this.load();
  }
}
