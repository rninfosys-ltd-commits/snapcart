import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <div class="admin-layout">
      <!-- Top Navbar -->
      <mat-toolbar class="admin-navbar">
        <div class="nav-left" routerLink="/admin/dashboard" style="cursor: pointer;">
          <mat-icon class="logo-icon">directions_run</mat-icon>
          <span class="logo-text">SnapCart ADMIN</span>
        </div>
        
        <span class="spacer"></span>
        
        <div class="nav-right">
          
          <a mat-button routerLink="/" class="nav-link">
            <mat-icon>store</mat-icon>
            Store
          </a>
          
          <button mat-button [matMenuTriggerFor]="profileMenu" class="nav-link">
            <mat-icon>account_circle</mat-icon>
            Profile
          </button>
          
          <mat-menu #profileMenu="matMenu">
            <button mat-menu-item routerLink="/admin/profile">
              <mat-icon>person</mat-icon>
              <span>My Profile</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <!-- Main Content -->
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { min-height: 100vh; background-color: var(--background); }
    
    .admin-navbar {
      background-color: var(--surface);
      color: var(--text-main);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
      height: 64px;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
    }
    
    .nav-left { display: flex; align-items: center; gap: 12px; }
    .logo-icon { color: var(--primary); font-size: 28px; width: 28px; height: 28px; }
    .logo-text { font-weight: 700; font-size: 18px; letter-spacing: 1px; color: var(--text-main); }
    
    .spacer { flex: 1; }
    
    .nav-right { display: flex; align-items: center; gap: 8px; }
    .nav-link { color: var(--text-main); font-weight: 500; }
    .nav-link mat-icon { margin-right: 8px; }
    
    .theme-toggle { color: var(--text-main); }
    
    .admin-content {
      /* No padding here, dashboard has its own container */
    }
  `]
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
