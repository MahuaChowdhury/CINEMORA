import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

import { environment } from '../../environments/environment';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface LoginResponse {
  token: string;
  user: SessionUser;
}

const TOKEN_KEY = 'netflix-clone:token';
const USER_KEY = 'netflix-clone:user';

/** Attaches the JWT to every outgoing request. */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};

/**
 * Authentication backed by the Express API: register -> email OTP -> login.
 * The JWT and the session user are kept in localStorage; user state is a signal.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly currentUser = signal<SessionUser | null>(this.restore());
  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  register(data: { name: string; email: string; password: string }) {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/register`, data);
  }

  verifyOTP(email: string, otp: string) {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/verify-otp`, { email, otp });
  }

  resendOTP(email: string) {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/resend-otp`, { email });
  }

  login(data: { email: string; password: string }) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, data)
      .pipe(tap((result) => this.save(result)));
  }

  signOut(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Ignore storage failures; state is cleared below regardless.
    }
    this.currentUser.set(null);
  }

  /** Display name for the header/avatar; falls back to the email prefix. */
  displayName(): string {
    const user = this.currentUser();
    if (user?.name) {
      return user.name;
    }
    return (user?.email ?? '').split('@')[0] || 'Guest';
  }

  private restore(): SessionUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  }

  private save(result: LoginResponse): void {
    try {
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    } catch {
      // Private-mode storage failures keep the session in-memory only.
    }
    this.currentUser.set(result.user);
  }
}
