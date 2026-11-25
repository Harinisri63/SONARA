import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_PATHS } from '../../constants/api.constants';
import { AuthResult, LoginRequest, RegisterRequest, User } from '../../models/user.model';

/** Tokens live in HttpOnly cookies set by the API; JavaScript never sees them. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  private _user = signal<User | null>(null);
  private _ready = signal(false);

  readonly user = this._user.asReadonly();
  readonly ready = this._ready.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.roles.includes('Admin') ?? false);

  restoreSession(): void {
    const cachedUser = localStorage.getItem('sonara_user');
    if (cachedUser) {
      try {
        this._user.set(JSON.parse(cachedUser));
      } catch {}
    }
    this.http.get<User>(this.base + API_PATHS.auth.me).pipe(catchError(() => of(null))).subscribe((u) => {
      this._user.set(u);
      if (u) {
        localStorage.setItem('sonara_user', JSON.stringify(u));
      } else {
        localStorage.removeItem('sonara_user');
        localStorage.removeItem('sonara_access_token');
      }
      this._ready.set(true);
    });
  }

  /** Resolves once the initial session check has finished (used by guards). */
  whenReady(): Observable<boolean> {
    if (this._ready()) return of(true);
    const cachedUser = localStorage.getItem('sonara_user');
    if (cachedUser && !this._user()) {
      try {
        this._user.set(JSON.parse(cachedUser));
      } catch {}
    }
    return this.http.get<User>(this.base + API_PATHS.auth.me).pipe(
      tap((u) => {
        this._user.set(u);
        if (u) {
          localStorage.setItem('sonara_user', JSON.stringify(u));
        } else {
          localStorage.removeItem('sonara_user');
          localStorage.removeItem('sonara_access_token');
        }
      }),
      catchError(() => of(null)),
      tap(() => this._ready.set(true)),
      map(() => true),
    );
  }

  register(body: RegisterRequest) {
    return this.http.post<User>(this.base + API_PATHS.auth.register, body);
  }

  login(body: LoginRequest) {
    return this.http
      .post<AuthResult>(this.base + API_PATHS.auth.login, body)
      .pipe(tap((r) => {
        this._user.set(r.user);
        if (r.access_token) {
          localStorage.setItem('sonara_access_token', r.access_token);
        }
        if (r.user) {
          localStorage.setItem('sonara_user', JSON.stringify(r.user));
        }
      }));
  }

  refresh() {
    return this.http.post<AuthResult>(this.base + API_PATHS.auth.refresh, {}).pipe(tap((r) => {
      this._user.set(r.user);
      if (r.access_token) {
        localStorage.setItem('sonara_access_token', r.access_token);
      }
      if (r.user) {
        localStorage.setItem('sonara_user', JSON.stringify(r.user));
      }
    }));
  }

  logout() {
    localStorage.removeItem('sonara_access_token');
    localStorage.removeItem('sonara_user');
    return this.http.post(this.base + API_PATHS.auth.logout, {}).pipe(tap(() => this._user.set(null)));
  }

  clearLocalSession(): void {
    localStorage.removeItem('sonara_access_token');
    localStorage.removeItem('sonara_user');
    this._user.set(null);
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(this.base + API_PATHS.auth.forgot, { email });
  }

  isUsernameAvailable(username: string) {
    return this.http
      .get<{ available: boolean }>(this.base + API_PATHS.auth.checkUsername, { params: { username } })
      .pipe(map((r) => r.available));
  }
}
