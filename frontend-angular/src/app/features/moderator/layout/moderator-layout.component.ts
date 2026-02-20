import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-moderator-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <div class="moderator-layout">
      <!-- Top Navbar -->
      <mat-toolbar class="moderator-navbar">
        <div class="nav-left" routerLink="/moderator/dashboard" style="cursor: pointer;">
          <mat-icon class="logo-icon">directions_run</mat-icon>
          <div class="logo-box">
             <span class="logo-text">SnapCart</span>
             <span class="role-badge">{{ auth.primaryRole() || 'GUEST' }}</span>
          </div>
        </div>
        
        <span class="spacer"></span>
        
        <div class="nav-right">
          
          <a mat-button routerLink="/moderator/employees" class="nav-link" *ngIf="auth.primaryRole() === 'MODERATOR' || auth.primaryRole() === 'ADMIN'">
            <mat-icon>group</mat-icon>
            Team
          </a>

          <a mat-button routerLink="/" class="nav-link">
            <mat-icon>store</mat-icon>
            Store
          </a>
          
          <button mat-button [matMenuTriggerFor]="profileMenu" class="nav-link">
            <mat-icon>account_circle</mat-icon>
            Profile
          </button>
          
          <mat-menu #profileMenu="matMenu">
            <button mat-menu-item routerLink="/moderator/profile">
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
      <main class="moderator-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .moderator-layout { min-height: 100vh; background-color: var(--background); }
    
    .moderator-navbar {
      background-color: var(--surface);
      color: var(--text-main);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
      height: 64px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
      box-shadow: var(--shadow-sm);
    }
    
    .nav-left { display: flex; align-items: center; gap: 12px; }
    .logo-icon { color: var(--primary); font-size: 28px; width: 28px; height: 28px; }
    .logo-box { display: flex; flex-direction: column; line-height: 1; }
    .logo-text { font-weight: 800; font-size: 16px; letter-spacing: 1px; color: var(--text-main); }
    .role-badge { 
      font-size: 10px; font-weight: 700; color: var(--primary); 
      background: var(--surface-low); padding: 2px 4px; border-radius: 4px; width: fit-content;
      margin-top: 2px;
    }
    
    .spacer { flex: 1; }
    
    .nav-right { display: flex; align-items: center; gap: 8px; }
    .nav-link { color: var(--text-main); font-weight: 500; }
    .nav-link mat-icon { margin-right: 8px; }
    
    .theme-toggle { color: var(--text-main); }
    
    .moderator-content {
      padding: 0; /* Let child components handle their own spacing */
      max-width: 100%;
      margin: 0;
    }
  `]
})
export class ModeratorLayoutComponent {
  auth = inject(AuthService);
  router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
