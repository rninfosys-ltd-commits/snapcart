import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatToolbarModule, MatButtonModule,
    MatIconModule, MatMenuModule, MatSidenavModule, MatListModule
  ],
  template: `
    <div class="super-admin-layout">
      <mat-toolbar class="top-navbar">
        <button mat-icon-button (click)="sidenav.toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="logo">SUPER ADMIN PANEL</span>
        <span class="spacer"></span>
        <button mat-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
          {{ auth.user()?.name }}
        </button>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidebar">
          <mat-nav-list>
            <a mat-list-item routerLink="/super-admin/dashboard" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/super-admin/admins" routerLinkActive="active">
              <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
              <span matListItemTitle>Admin Management</span>
            </a>
            <a mat-list-item routerLink="/super-admin/audit-logs" routerLinkActive="active">
              <mat-icon matListItemIcon>history_edu</mat-icon>
              <span matListItemTitle>Audit Logs</span>
            </a>
            <mat-divider></mat-divider>
            <a mat-list-item routerLink="/admin/dashboard">
              <mat-icon matListItemIcon>arrow_back</mat-icon>
              <span matListItemTitle>Go to Admin</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>

      <mat-menu #userMenu="matMenu">
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Logout</span>
        </button>
      </mat-menu>
    </div>
  `,
  styles: [`
    .super-admin-layout { height: 100vh; display: flex; flex-direction: column; }
    .top-navbar { 
      background: var(--surface); 
      color: var(--text-main); 
      border-bottom: 1px solid var(--border);
      z-index: 1000;
    }
    .logo { font-weight: 800; letter-spacing: 1px; margin-left: 12px; }
    .spacer { flex: 1; }
    .sidenav-container { flex: 1; }
    .sidebar { width: 260px; background: var(--surface); border-right: 1px solid var(--border); }
    .main-content { padding: 2rem; background: var(--background); }
    .active { background: rgba(var(--primary-rgb), 0.1); color: var(--primary) !important; }
    mat-nav-list a { border-radius: 8px; margin: 4px 8px; }
  `]
})
export class SuperAdminLayoutComponent {
  auth = inject(AuthService);
  router = inject(Router);
  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
