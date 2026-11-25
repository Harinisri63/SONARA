import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { authGuard, guestGuard } from './auth.guard';

function setup(loggedIn: boolean) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: { whenReady: () => of(true), isAuthenticated: signal(loggedIn) } },
    ],
  });
}

describe('route guards', () => {
  it('authGuard redirects anonymous users to /login', (done) => {
    setup(false);
    (TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as any).subscribe((r: UrlTree) => {
      expect(TestBed.inject(Router).serializeUrl(r)).toBe('/login'); done();
    });
  });
  it('authGuard allows signed-in users', (done) => {
    setup(true);
    (TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as any).subscribe((r: boolean) => {
      expect(r).toBeTrue(); done();
    });
  });
  it('guestGuard sends signed-in users to /home', (done) => {
    setup(true);
    (TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any)) as any).subscribe((r: UrlTree) => {
      expect(TestBed.inject(Router).serializeUrl(r)).toBe('/home'); done();
    });
  });
});
