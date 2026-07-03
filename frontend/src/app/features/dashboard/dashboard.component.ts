import { Component, OnInit, inject, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { timeout, catchError, of } from 'rxjs';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PageSkeletonComponent } from '../../shared/components/page-skeleton/page-skeleton.component';
import { AnalyticsApiService } from '../../core/api/domain-api.service';
import { AnalyticsOverview, DeliveryStatus, StatusCount, DeliveryTrend } from '../../core/models';
import { DELIVERY_STATUS_LABELS } from '../../shared/utils/delivery-status.labels';

const STATUS_LABELS = DELIVERY_STATUS_LABELS;

const EMPTY_DOUGHNUT: ChartConfiguration<'doughnut'>['data'] = {
  labels: [],
  datasets: [{ data: [] }],
};

const EMPTY_BAR: ChartConfiguration<'bar'>['data'] = {
  labels: [],
  datasets: [{ data: [], label: 'Entregas' }],
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PageHeaderComponent, PageSkeletonComponent, KpiCardComponent, BaseChartDirective, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly analyticsApi = inject(AnalyticsApiService);

  readonly loading = signal(true);
  readonly showCharts = signal(false);
  readonly overview = signal<AnalyticsOverview | null>(null);
  readonly statusChartData = signal(EMPTY_DOUGHNUT);
  readonly trendChartData = signal(EMPTY_BAR);

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } },
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.2)' } },
      x: { grid: { display: false } },
    },
  };

  ngOnInit(): void {
    let pending = 3;
    const done = () => {
      if (--pending <= 0) {
        this.loading.set(false);
        this.showCharts.set(true);
      }
    };

    this.analyticsApi
      .overview()
      .pipe(timeout(15000), catchError(() => of(null)))
      .subscribe((data) => {
        this.overview.set(data);
        done();
      });

    this.analyticsApi
      .byStatus()
      .pipe(timeout(15000), catchError(() => of([] as StatusCount[])))
      .subscribe((data) => {
        this.statusChartData.set({
          labels: data.map((d) => STATUS_LABELS[d.status] ?? d.status),
          datasets: [{
            data: data.map((d) => d.count),
            backgroundColor: ['#60a5fa', '#818cf8', '#fb923c', '#c084fc', '#4ade80', '#f87171', '#f472b6'],
            borderWidth: 0,
          }],
        });
        done();
      });

    this.analyticsApi
      .deliveryTrend(7)
      .pipe(timeout(15000), catchError(() => of([] as DeliveryTrend[])))
      .subscribe((data) => {
        this.trendChartData.set({
          labels: data.map((d) => d.date),
          datasets: [{
            label: 'Entregas',
            data: data.map((d) => d.count),
            backgroundColor: '#2563eb',
            borderRadius: 8,
            borderSkipped: false,
          }],
        });
        done();
      });
  }
}
