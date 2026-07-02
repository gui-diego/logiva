import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="brand">
          <mat-icon>local_shipping</mat-icon>
          <span>Logiva</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/deliveries" routerLinkActive="active">
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            <span matListItemTitle>Entregas</span>
          </a>
          @if (auth.hasRole('ADMIN')) {
            <a mat-list-item routerLink="/admin/carriers" routerLinkActive="active">
              <mat-icon matListItemIcon>local_shipping</mat-icon>
              <span matListItemTitle>Transportadoras</span>
            </a>
            <a mat-list-item routerLink="/admin/customers" routerLinkActive="active">
              <mat-icon matListItemIcon>business</mat-icon>
              <span matListItemTitle>Clientes</span>
            </a>
            <a mat-list-item routerLink="/admin/users" routerLinkActive="active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Usuários</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <span class="spacer"></span>
          <span class="user-email">{{ auth.currentUser()?.email }}</span>
          <button mat-icon-button (click)="auth.logout()" title="Sair">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>
        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .layout-container {
      height: 100vh;
    }
    .sidenav {
      width: 240px;
      border-right: 1px solid #e0e0e0;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 20px 16px;
      font-size: 18px;
      font-weight: 600;
      color: #1565c0;
    }
    .active {
      background: rgba(25, 118, 210, 0.08);
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .spacer {
      flex: 1;
    }
    .user-email {
      font-size: 14px;
      margin-right: 8px;
      opacity: 0.9;
    }
    .content {
      padding: 24px;
      max-width: 1400px;
    }
  `,
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);
}
