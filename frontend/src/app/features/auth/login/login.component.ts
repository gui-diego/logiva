import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom, timeout } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-page">
      <mat-card class="login-card">
        <div class="login-header">
          <mat-icon class="logo">local_shipping</mat-icon>
          <h1>Logiva</h1>
          <p>Monitoramento de entregas</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>E-mail</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Senha</mat-label>
            <input matInput type="password" formControlName="password" />
          </mat-form-field>

          @if (errorMessage()) {
            <p class="error">{{ errorMessage() }}</p>
          }

          <button
            mat-flat-button
            color="primary"
            class="full-width submit-btn"
            type="submit"
            [disabled]="loading() || form.invalid"
          >
            @if (loading()) {
              <mat-spinner diameter="20" />
            } @else {
              Entrar
            }
          </button>
        </form>

        <div class="demo-credentials">
          <small>Demo: admin@logistics.com / admin123</small>
          <small>Demo: operator@logistics.com / operator123</small>
        </div>
      </mat-card>
    </div>
  `,
  styles: `
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%);
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 32px;
    }
    .login-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
    }
    h1 {
      margin: 8px 0 4px;
      font-size: 22px;
    }
    p {
      margin: 0;
      color: #666;
    }
    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }
    .error {
      color: #c62828;
      font-size: 14px;
      margin: 0 0 12px;
    }
    .demo-credentials {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: center;
      color: #888;
    }
    .submit-btn {
      min-height: 40px;
    }
  `,
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set('');
    const { email, password } = this.form.getRawValue();

    void this.attemptLogin(email, password);
  }

  private async attemptLogin(email: string, password: string): Promise<void> {
    try {
      await firstValueFrom(this.auth.login(email, password).pipe(timeout(15000)));
      await this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      const error = err as { name?: string; error?: { message?: string } | string };
      if (error?.name === 'TimeoutError') {
        this.errorMessage.set('Servidor não respondeu. Tente novamente.');
      } else if (typeof error?.error === 'string') {
        this.errorMessage.set(error.error);
      } else {
        this.errorMessage.set(
          error?.error?.message ?? 'Credenciais inválidas. Tente novamente.',
        );
      }
    } finally {
      this.loading.set(false);
      this.cdr.detectChanges();
    }
  }
}
