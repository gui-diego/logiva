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
  template: `
    <div class="page-header">
      <div>
        <h2>Entregas</h2>
        <p class="subtitle">
          @if (auth.hasRole('OPERATOR')) {
            Registre e acompanhe entregas operacionais
          } @else {
            Visão geral de todas as entregas
          }
        </p>
      </div>
      @if (auth.hasRole('OPERATOR')) {
        <button mat-flat-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Nova entrega
        </button>
      }
    </div>

    <form [formGroup]="filters" class="filters" (ngSubmit)="load()">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Status</mat-label>
        <mat-select formControlName="status">
          <mat-select-trigger>
            @if (filters.value.status) {
              {{ getStatusLabel(filters.value.status) }}
            } @else {
              Todos
            }
          </mat-select-trigger>
          <mat-option value="">Todos</mat-option>
          @for (s of statuses; track s) {
            <mat-option [value]="s">{{ getStatusLabel(s) }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Transportadora</mat-label>
        <mat-select formControlName="carrierId">
          <mat-option value="">Todas</mat-option>
          @for (c of carriers; track c.id) {
            <mat-option [value]="c.id">{{ c.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
        <mat-label>Buscar</mat-label>
        <input matInput formControlName="search" placeholder="Código ou cidade" />
      </mat-form-field>

      <div class="filter-actions">
        <button mat-stroked-button type="button" (click)="clearFilters()">Limpar</button>
        <button mat-flat-button color="primary" type="submit">Filtrar</button>
      </div>
    </form>

    @if (loading()) {
      <div class="loading"><mat-spinner /></div>
    } @else {
      <table mat-table [dataSource]="dataSource" class="mat-elevation-z1">
        <ng-container matColumnDef="trackingCode">
          <th mat-header-cell *matHeaderCellDef>Código</th>
          <td mat-cell *matCellDef="let row">
            <a [routerLink]="['/deliveries', row.id]" class="link">{{ row.trackingCode }}</a>
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let row">
            <app-status-badge [status]="row.status" />
          </td>
        </ng-container>

        <ng-container matColumnDef="route">
          <th mat-header-cell *matHeaderCellDef>Rota</th>
          <td mat-cell *matCellDef="let row">{{ row.originCity }} → {{ row.destinationCity }}</td>
        </ng-container>

        <ng-container matColumnDef="carrier">
          <th mat-header-cell *matHeaderCellDef>Transportadora</th>
          <td mat-cell *matCellDef="let row">{{ row.carrierName }}</td>
        </ng-container>

        <ng-container matColumnDef="customer">
          <th mat-header-cell *matHeaderCellDef>Cliente</th>
          <td mat-cell *matCellDef="let row">{{ row.customerName }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>

      <mat-paginator
        [length]="totalElements"
        [pageSize]="pageSize"
        [pageIndex]="page"
        [pageSizeOptions]="[5, 10, 25]"
        (page)="onPage($event)"
      />
    }
  `,
  styles: `
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }

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

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      margin-bottom: 16px;
    }

    .filters mat-form-field {
      margin: 0;
    }

    .filter-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 56px;
    }

    .search-field { min-width: 220px; }
    table { width: 100%; }
    .link { color: #1976d2; text-decoration: none; font-weight: 500; }
    .loading { display: flex; justify-content: center; padding: 48px; }
  `,
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
