import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { timeout, catchError, of } from 'rxjs';
import { UserApiService } from '../../../core/api/domain-api.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MatTableModule, MatProgressSpinnerModule, MatCardModule, MatIconModule],
  template: `
    <header class="page-header">
      <div>
        <h2>Usuários</h2>
        <p class="subtitle">Gestão de acesso ao sistema</p>
      </div>
    </header>

    @if (loading()) {
      <div class="loading"><mat-spinner /></div>
    } @else if (errorMessage()) {
      <mat-card class="error-card">
        <mat-icon>lock</mat-icon>
        <p>{{ errorMessage() }}</p>
      </mat-card>
    } @else {
      <mat-card class="table-card">
        <table mat-table [dataSource]="dataSource" class="users-table">
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>E-mail</th>
            <td mat-cell *matCellDef="let row">{{ row.email }}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Perfil</th>
            <td mat-cell *matCellDef="let row">
              <span class="role-chip" [class.admin]="row.role === 'ADMIN'">{{ row.role }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="active">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let row">
              <span class="status-chip" [class.inactive]="!row.active">
                {{ row.active ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </mat-card>
    }
  `,
  styles: `
    .page-header {
      margin-bottom: 24px;
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

    .loading {
      display: flex;
      justify-content: center;
      padding: 64px;
    }

    .table-card,
    .error-card {
      border-radius: 16px;
      border: 1px solid rgba(15, 23, 42, 0.06);
      box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
      overflow: hidden;
    }

    .table-card {
      padding: 0;
    }

    .users-table {
      width: 100%;
    }

    .error-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px;
      color: #b91c1c;
      background: #fef2f2;
    }

    .error-card mat-icon {
      color: #dc2626;
    }

    .error-card p {
      margin: 0;
    }

    .role-chip {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      background: #eff6ff;
      color: #1d4ed8;
    }

    .role-chip.admin {
      background: #faf5ff;
      color: #7c3aed;
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
export class UsersComponent implements OnInit {
  private readonly userApi = inject(UserApiService);

  readonly dataSource = new MatTableDataSource<User>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly columns = ['email', 'role', 'active'];

  ngOnInit(): void {
    this.userApi
      .list()
      .pipe(
        timeout(15000),
        catchError((err) => {
          if (err.status === 403 || err.status === 401) {
            this.errorMessage.set('Acesso restrito a administradores.');
          } else {
            this.errorMessage.set('Não foi possível carregar os usuários.');
          }
          return of([] as User[]);
        }),
      )
      .subscribe((users) => {
        this.dataSource.data = users;
        this.loading.set(false);
      });
  }
}
