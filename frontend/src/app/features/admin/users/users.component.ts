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
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
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
