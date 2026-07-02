import { Component, OnInit, inject, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { timeout, catchError, of } from 'rxjs';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
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
  imports: [KpiCardComponent, BaseChartDirective, MatProgressSpinnerModule],
  template: `
    <header class="page-header">
      <div>
        <h2>Dashboard</h2>
        <p class="subtitle">Visão geral das operações de entrega</p>
      </div>
    </header>

    @if (loading()) {
      <div class="loading"><mat-spinner /></div>
    } @else {
      <div class="kpi-grid">
        <app-kpi-card
          label="Total de entregas"
          [value]="overview()?.totalDeliveries ?? 0"
          hint="Volume monitorado"
          icon="inventory_2"
          iconBg="linear-gradient(135deg, #2563eb, #1d4ed8)"
          accentColor="#2563eb"
        />
        <app-kpi-card
          label="Entregues"
          [value]="overview()?.delivered ?? 0"
          hint="Concluídas com sucesso"
          icon="check_circle"
          iconBg="linear-gradient(135deg, #16a34a, #15803d)"
          accentColor="#16a34a"
        />
        <app-kpi-card
          label="Atrasadas"
          [value]="overview()?.delayed ?? 0"
          hint="Fora do prazo previsto"
          icon="warning"
          iconBg="linear-gradient(135deg, #dc2626, #b91c1c)"
          accentColor="#dc2626"
        />
        <app-kpi-card
          label="Taxa no prazo"
          [value]="overview()?.onTimeRate ?? 0"
          suffix="%"
          hint="Entregas concluídas / total"
          icon="trending_up"
          iconBg="linear-gradient(135deg, #ea580c, #c2410c)"
          accentColor="#ea580c"
        />
      </div>

      @if (showCharts()) {
        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Entregas por status</h3>
              <span class="chart-meta">Distribuição atual</span>
            </div>
            <div class="chart-body">
              <canvas baseChart [data]="statusChartData()" [options]="doughnutOptions" type="doughnut"></canvas>
            </div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <h3>Tendência</h3>
              <span class="chart-meta">Últimos 7 dias</span>
            </div>
            <div class="chart-body">
              <canvas baseChart [data]="trendChartData()" [options]="barOptions" type="bar"></canvas>
            </div>
          </div>
        </div>
      }
    }
  `,
  styles: `
    .page-header {
      margin-bottom: 28px;
    }

    h2 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .subtitle {
      margin: 6px 0 0;
      color: #64748b;
      font-size: 14px;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 64px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 28px;
    }

    @media (max-width: 1200px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    @media (max-width: 900px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }

    .chart-card {
      background: #fff;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid rgba(15, 23, 42, 0.06);
      box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
    }

    .chart-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
    }

    .chart-meta {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
    }

    .chart-body {
      min-height: 260px;
      position: relative;
    }
  `,
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
