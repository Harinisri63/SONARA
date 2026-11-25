import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../app/core/services/auth.service';

import { ThreeSceneComponent } from '../../shared/components/three-scene/three-scene.component';

@Component({
  selector: 'sonara-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ThreeSceneComponent],
  styleUrl: './auth.styles.scss',
  template: `
    <sonara-three-scene></sonara-three-scene>
    <main class="card">
      <h1>SONARA</h1>
      <p class="sub">Sign in to continue</p>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <label for="identifier">Email or username</label>
        <input id="identifier" type="text" formControlName="identifier" autocomplete="username" />
        @if (form.controls.identifier.touched && form.controls.identifier.invalid) {
          <div class="err">Enter your email or username</div>
        }

        <label for="password">Password</label>
        <div class="pw">
          <input id="password" [type]="show() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" />
          <button type="button" class="link" (click)="show.set(!show())" [attr.aria-pressed]="show()">{{ show() ? 'Hide' : 'Show' }}</button>
        </div>
        @if (form.controls.password.touched && form.controls.password.invalid) {
          <div class="err">Enter your password</div>
        }

        <div class="row">
          <label style="margin:0"><input type="checkbox" formControlName="remember_me" /> Remember me</label>
          <a class="link" routerLink="/forgot-password">Forgot password?</a>
        </div>

        @if (error()) { <div class="banner" role="alert">{{ error() }}</div> }
        <button class="primary" type="submit" [disabled]="loading()">{{ loading() ? 'Signing in…' : 'Sign in' }}</button>
      </form>
      <div class="foot">New here? <a class="link" routerLink="/register">Create an account</a></div>
    </main>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  show = signal(false);
  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', Validators.required],
    remember_me: [false],
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true); this.error.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/home'),
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(e.status === 401 ? 'Incorrect email/username or password' : 'Could not sign in. Try again.');
      },
    });
  }
}
