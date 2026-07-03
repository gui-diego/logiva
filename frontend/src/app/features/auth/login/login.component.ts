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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
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
