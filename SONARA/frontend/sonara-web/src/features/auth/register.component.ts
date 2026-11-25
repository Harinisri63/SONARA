import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../app/core/services/auth.service';

import { ThreeSceneComponent } from '../../shared/components/three-scene/three-scene.component';

const strong = (c: AbstractControl): ValidationErrors | null =>
  /[a-z]/.test(c.value) && /[A-Z]/.test(c.value) && /\d/.test(c.value) ? null : { weak: true };
const matches = (g: AbstractControl): ValidationErrors | null =>
  g.get('password')!.value === g.get('confirm_password')!.value ? null : { mismatch: true };

@Component({
  selector: 'sonara-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ThreeSceneComponent],
  styleUrl: './auth.styles.scss',
  template: `
    <sonara-three-scene></sonara-three-scene>
    <main class="card">
      <h1>SONARA</h1>
      <p class="sub">Create your account</p>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <label for="full_name">Full name</label>
        <input id="full_name" type="text" formControlName="full_name" autocomplete="name" />
        @if (bad('full_name')) { <div class="err">Enter your name (2+ characters)</div> }

        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email" autocomplete="email" />
        @if (bad('email')) { <div class="err">Enter a valid email</div> }

        <label for="username">Username</label>
        <input id="username" type="text" formControlName="username" autocomplete="username" />
        @if (bad('username')) { <div class="err">3–50 letters, numbers, . _ -</div> }

        <label for="password">Password</label>
        <input id="password" type="password" formControlName="password" autocomplete="new-password" />
        @if (bad('password')) { <div class="err">8+ characters with upper-case, lower-case and a number</div> }

        <label for="confirm">Confirm password</label>
        <input id="confirm" type="password" formControlName="confirm_password" autocomplete="new-password" />
        @if (form.touched && form.errors?.['mismatch']) { <div class="err">Passwords do not match</div> }

        @if (error()) { <div class="banner" role="alert">{{ error() }}</div> }
        <button class="primary" type="submit" [disabled]="loading()">{{ loading() ? 'Creating…' : 'Create account' }}</button>
      </form>
      <div class="foot">Have an account? <a class="link" routerLink="/login">Sign in</a></div>
    </main>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group(
    {
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_.-]{3,50}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), strong]],
      confirm_password: ['', Validators.required],
    },
    { validators: matches },
  );

  bad(name: 'full_name' | 'email' | 'username' | 'password'): boolean {
    const c = this.form.controls[name];
    return c.touched && c.invalid;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true); this.error.set('');
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
        if (e.status === 409) {
          this.error.set(e.error?.error?.message ?? 'Email or username already in use');
        } else if (e.status === 422 || e.status === 400) {
          const detail = e.error?.error?.details?.[0]?.msg || e.error?.error?.message || e.error?.detail;
          this.error.set(detail ? `Validation error: ${detail}` : 'Registration failed. Check the form.');
        } else if (e.status === 0) {
          this.error.set('Cannot reach backend server. Please make sure the backend is running on port 8000.');
        } else {
          this.error.set(e.error?.error?.message ?? 'Registration failed due to a server error. Please try again.');
        }
      },
    });
  }
}
