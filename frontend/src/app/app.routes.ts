import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'deliveries',
        loadComponent: () =>
          import('./features/deliveries/delivery-list/delivery-list.component').then(
            (m) => m.DeliveryListComponent,
          ),
      },
      {
        path: 'deliveries/:id',
        loadComponent: () =>
          import('./features/deliveries/delivery-detail/delivery-detail.component').then(
            (m) => m.DeliveryDetailComponent,
          ),
      },
      {
        path: 'admin/users',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./features/admin/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'admin/carriers',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./features/admin/carriers/carriers.component').then((m) => m.CarriersComponent),
      },
      {
        path: 'admin/customers',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./features/admin/customers/customers.component').then((m) => m.CustomersComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
