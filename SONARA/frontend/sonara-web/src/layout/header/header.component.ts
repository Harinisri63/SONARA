import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../app/core/services/auth.service';

@Component({
  selector: 'sonara-header',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="header">
      <div class="search-box">
        <span class="search-icon">⌕</span>
        <input
          type="text"
          placeholder="Search songs, artists, actors, or movies..."
          [(ngModel)]="searchQuery"
          (keydown.enter)="onSearch()"
        />
      </div>

      <div class="actions">
        <span class="user-greeting">Welcome, {{ auth.user()?.full_name || 'Listener' }}</span>
        <div class="status-indicator">
          <span class="dot"></span>
          <span>ONLINE</span>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .header {
        height: 64px;
        padding: 0 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(13, 13, 22, 0.6);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .search-box {
        position: relative;
        width: 380px;
      }
      .search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 16px;
        color: rgba(255, 255, 255, 0.4);
      }
      .search-box input {
        width: 100%;
        padding: 10px 14px 10px 38px;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        font-size: 13px;
        box-sizing: border-box;
        transition: all 0.2s ease;
      }
      .search-box input:focus {
        outline: none;
        border-color: var(--sn-cyan);
        background: rgba(255, 255, 255, 0.08);
      }
      .actions {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      .user-greeting {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.8);
      }
      .status-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        color: var(--sn-cyan);
        background: rgba(6, 182, 212, 0.1);
        padding: 4px 10px;
        border-radius: 12px;
        border: 1px solid rgba(6, 182, 212, 0.2);
      }
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--sn-cyan);
        box-shadow: 0 0 8px var(--sn-cyan);
      }
    `,
  ],
})
export class HeaderComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  searchQuery = '';

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/explore'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }
}
