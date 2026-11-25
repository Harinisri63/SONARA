import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../app/core/services/auth.service';

@Component({
  selector: 'sonara-profile',
  standalone: true,
  template: `
    <div class="profile-page">
      <header class="profile-card">
        <div class="avatar">{{ userInitial() }}</div>
        <div class="user-meta">
          <span class="badge">{{ auth.isAdmin() ? 'ADMINISTRATOR' : 'PREMIUM MEMBER' }}</span>
          <h1>{{ auth.user()?.full_name }}</h1>
          <p class="handle">&#64;{{ auth.user()?.username }} • {{ auth.user()?.email }}</p>
        </div>
      </header>

      <section class="stats-grid">
        <div class="stat-card">
          <span class="val">Immersion</span>
          <span class="lbl">Spatial 3D Audio Active</span>
        </div>
        <div class="stat-card">
          <span class="val">High-Res</span>
          <span class="lbl">Range 206 Streaming</span>
        </div>
        <div class="stat-card">
          <span class="val">Active</span>
          <span class="lbl">Session Token Secured</span>
        </div>
      </section>

      <section class="actions-section">
        <h2>Account Settings</h2>
        <div class="settings-list">
          <div class="setting-item">
            <div>
              <span class="title">Email Verification</span>
              <span class="desc">Verified via SONARA Auth Server</span>
            </div>
            <span class="badge-green">Active</span>
          </div>

          <div class="setting-item">
            <div>
              <span class="title">Sign out from this device</span>
              <span class="desc">Revokes active refresh tokens and cookies</span>
            </div>
            <button class="logout-action-btn" (click)="logout()">Sign Out</button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .profile-page {
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 36px;
      }
      .profile-card {
        display: flex;
        align-items: center;
        gap: 28px;
        padding: 36px;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(6, 182, 212, 0.25));
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--sn-violet), var(--sn-cyan));
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 40px;
        font-weight: 800;
        box-shadow: 0 0 25px rgba(6, 182, 212, 0.4);
      }
      .badge {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: var(--sn-cyan);
      }
      .user-meta h1 {
        font-size: 32px;
        color: #fff;
        margin: 6px 0;
      }
      .handle {
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
        margin: 0;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
      }
      .stat-card {
        padding: 24px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .val {
        font-size: 22px;
        font-weight: 700;
        color: #fff;
      }
      .lbl {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
      }
      .actions-section h2 {
        font-size: 20px;
        color: #fff;
        margin: 0 0 16px;
      }
      .settings-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .setting-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
      }
      .setting-item .title {
        display: block;
        color: #fff;
        font-size: 15px;
        font-weight: 600;
      }
      .setting-item .desc {
        display: block;
        color: rgba(255, 255, 255, 0.45);
        font-size: 12px;
        margin-top: 2px;
      }
      .badge-green {
        font-size: 12px;
        font-weight: 700;
        color: #10b981;
        background: rgba(16, 185, 129, 0.12);
        padding: 4px 10px;
        border-radius: 10px;
      }
      .logout-action-btn {
        padding: 8px 18px;
        border-radius: 10px;
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .logout-action-btn:hover {
        background: #ef4444;
        color: #fff;
      }
    `,
  ],
})
export class ProfileComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  userInitial(): string {
    return (this.auth.user()?.full_name || 'U').charAt(0).toUpperCase();
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
