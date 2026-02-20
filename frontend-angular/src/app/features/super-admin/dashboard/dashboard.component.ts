import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminService } from '../../../core/services/super-admin.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-super-admin-dashboard',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
    template: `
    <div class="dashboard-root">
      <header class="page-header">
        <h1>Global Optimization Dashboard</h1>
        <p>Real-time platform oversight and systems integrity</p>
      </header>

      <div class="stats-grid" *ngIf="stats(); else loading">
        <mat-card class="stat-card primary">
          <mat-card-header>
            <mat-icon mat-card-avatar>group</mat-icon>
            <mat-card-title>Total Users</mat-card-title>
            <mat-card-subtitle>Active platform accounts</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <span class="stat-value">{{ stats()?.totalUsers }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card accent">
          <mat-card-header>
            <mat-icon mat-card-avatar>admin_panel_settings</mat-icon>
            <mat-card-title>Admins</mat-card-title>
            <mat-card-subtitle>System administrators</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <span class="stat-value">{{ stats()?.adminCount }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card info">
          <mat-card-header>
            <mat-icon mat-card-avatar>verified_user</mat-icon>
            <mat-card-title>Super Admins</mat-card-title>
            <mat-card-subtitle>Platform owners</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <span class="stat-value">{{ stats()?.superAdminCount }}</span>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card warn">
          <mat-card-header>
            <mat-icon mat-card-avatar>support_agent</mat-icon>
            <mat-card-title>Moderators</mat-card-title>
            <mat-card-subtitle>Brand managers</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <span class="stat-value">{{ stats()?.moderatorCount }}</span>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loading>
        <div class="loader">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Analyzing platform data...</p>
        </div>
      </ng-template>

      <div class="system-health">
        <h3>System Health</h3>
        <div class="health-grid">
           <div class="health-item">
              <span class="label">Backend Status</span>
              <span class="status online">ONLINE</span>
           </div>
           <div class="health-item">
              <span class="label">Database</span>
              <span class="status online">HEALTHY</span>
           </div>
           <div class="health-item">
              <span class="label">Auth Provider</span>
              <span class="status online">STABLE</span>
           </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .dashboard-root { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: 2.5rem; font-weight: 800; margin: 0; color: var(--text-main); }
    .page-header p { color: var(--text-muted); font-size: 1.1rem; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
    .stat-card { border-radius: 16px; border: 1px solid var(--border); transition: transform 0.3s; }
    .stat-card:hover { transform: translateY(-5px); }
    .stat-value { font-size: 3rem; font-weight: 900; color: var(--text-main); line-height: 1; }
    
    .primary { border-top: 4px solid var(--primary); }
    .accent { border-top: 4px solid #7c4dff; }
    .info { border-top: 4px solid #00b0ff; }
    .warn { border-top: 4px solid #ffab40; }

    .loader { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: var(--text-secondary); }
    
    .system-health { margin-top: 3rem; background: var(--surface); padding: 2rem; border-radius: 16px; border: 1px solid var(--border); }
    .health-grid { display: flex; gap: 3rem; margin-top: 1rem; }
    .health-item { display: flex; flex-direction: column; gap: 4px; }
    .health-item .label { font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase; }
    .status { font-weight: 700; font-size: 1rem; }
    .online { color: #00c853; }
  `]
})
export class SuperAdminDashboardComponent implements OnInit {
    private service = inject(SuperAdminService);
    stats = signal<any>(null);

    ngOnInit() {
        this.loadStats();
    }

    async loadStats() {
        try {
            this.stats.set(await this.service.getPlatformStats());
        } catch (e) { console.error(e); }
    }
}
