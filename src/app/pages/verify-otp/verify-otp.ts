import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  imports: [FormsModule, RouterLink, ButtonModule, InputOtpModule, InputTextModule, MessageModule],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.scss',
})
export class VerifyOtp {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly email = signal(this.route.snapshot.queryParamMap.get('email') || '');
  readonly otp = signal('');
  readonly error = signal('');
  readonly message = signal('');
  readonly loading = signal(false);
  readonly canResend = computed(() => this.email().trim().length > 0);

  verify(): void {
    this.error.set('');
    this.message.set('');

    if (!this.email() || !/^\d{6}$/.test(this.otp())) {
      this.error.set('Enter your email and the 6-digit OTP.');
      return;
    }
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.auth.verifyOTP(this.email(), this.otp()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.message.set(res.message || 'Email verified! You can login now.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Verification failed.');
      },
    });
  }

  resend(): void {
    this.error.set('');
    this.message.set('');

    if (!this.email()) {
      this.error.set('Enter your registered email first.');
      return;
    }

    this.loading.set(true);
    this.auth.resendOTP(this.email()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.message.set(res.message);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Could not send the OTP email.');
      },
    });
  }
}
