import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../app/core/services/auth.service';

@Component({
  selector: 'sonara-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <span class="logo-icon">◈</span>
        <span class="logo-text">SONARA</span>
      </div>

      <nav class="nav-section">
        <div class="nav-title">DISCOVER</div>
        <a routerLink="/home" routerLinkActive="active" class="nav-item">
          <span class="icon">⌂</span> Home
        </a>
        <a routerLink="/explore" routerLinkActive="active" class="nav-item">
          <span class="icon">⌕</span> Explore & Search
        </a>
        <a routerLink="/artists" routerLinkActive="active" class="nav-item">
          <span class="icon">♪</span> Artists
        </a>
        <a routerLink="/actors" routerLinkActive="active" class="nav-item">
          <span class="icon">★</span> Actors & Soundtracks
        </a>
        <a routerLink="/movies" routerLinkActive="active" class="nav-item">
          <span class="icon">🎬</span> Movies
        </a>
      </nav>

      <nav class="nav-section">
        <div class="nav-title">MY COLLECTION</div>
        <a routerLink="/library" routerLinkActive="active" class="nav-item">
          <span class="icon">📚</span> My Library
        </a>
        <a routerLink="/favorites" routerLinkActive="active" class="nav-item">
          <span class="icon">♥</span> Favorite Songs
        </a>
      </nav>

      @if (auth.isAdmin()) {
        <nav class="nav-section">
          <div class="nav-title">SYSTEM</div>
          <a routerLink="/admin" routerLinkActive="active" class="nav-item admin-item">
            <span class="icon">⚙</span> Admin Studio
          </a>
        </nav>
      }

      <div class="user-footer">
        <a routerLink="/profile" class="user-card">
          <div class="avatar">{{ userInitial() }}</div>
          <div class="user-meta">
            <span class="user-name">{{ auth.user()?.full_name || 'Listener' }}</span>
            <span class="user-role">{{ auth.isAdmin() ? 'Administrator' : 'Premium' }}</span>
          </div>
        </a>
        <button class="logout-btn" (click)="logout()" title="Sign out">⏻</button>
      </div>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        width: 250px;
        height: 100%;
        background: rgba(10, 10, 18, 0.95);
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(24px);
        display: flex;
        flex-direction: column;
        padding: 24px 16px;
        box-sizing: border-box;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 8px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .logo-icon {
        font-size: 24px;
        color: var(--sn-cyan);
      }
      .logo-text {
        font-size: 22px;
        font-weight: 800;
        letter-spacing: 0.15em;
        background: linear-gradient(90deg, var(--sn-violet), var(--sn-cyan));
        -webkit-background-clip: text;
        color: transparent;
      }
      .nav-section {
        margin-top: 24px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .nav-title {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: rgba(255, 255, 255, 0.4);
        padding: 0 12px 8px;
      }
      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      .nav-item .icon {
        font-size: 16px;
        width: 18px;
        text-align: center;
      }
      .nav-item:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.06);
      }
      .nav-item.active {
        color: #fff;
        background: linear-gradient(90deg, rgba(139, 92, 246, 0.25), rgba(6, 182, 212, 0.15));
        border-left: 3px solid var(--sn-cyan);
      }
      .admin-item.active {
        border-left-color: #f59e0b;
      }
      .user-footer {
        margin-top: auto;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .user-card {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        overflow: hidden;
      }
      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--sn-violet), var(--sn-cyan));
        color: #fff;
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 14px;
      }
      .user-meta {
        display: flex;
        flex-direction: column;
      }
      .user-name {
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .user-role {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.45);
      }
      .logout-btn {
        background: none;
        border: 0;
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        font-size: 16px;
        padding: 8px;
        border-radius: 8px;
        transition: all 0.2s;
      }
      .logout-btn:hover {
        color: var(--sn-danger);
        background: rgba(248, 113, 113, 0.1);
      }
    `,
  ],
})
export class SidebarComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  userInitial(): string {
    return (this.auth.user()?.full_name || 'U').charAt(0).toUpperCase();
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
