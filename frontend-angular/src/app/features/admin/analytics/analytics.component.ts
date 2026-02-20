import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, BaseChartDirective, RouterModule],
  template: `
    <div class="analytics-container">
      <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h1 class="page-title" style="margin: 0;">Detailed Analytics</h1>
        <button mat-button color="primary" routerLink="/admin/dashboard">
          <mat-icon>arrow_back</mat-icon> Back to Home
        </button>
      </div>

      <div class="charts-wrapper">
        <!-- Sales Trend (Area Chart) -->
        <mat-card class="full-width-chart">
          <mat-card-header>
            <mat-icon mat-card-avatar class="header-icon">trending_up</mat-icon>
            <mat-card-title>Sales Performance</mat-card-title>
            <mat-card-subtitle>Revenue over the last 7 days</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <canvas baseChart height="300"
              [data]="salesData"
              [options]="lineOptions"
              [type]="'line'">
            </canvas>
          </mat-card-content>
        </mat-card>

        <div class="split-charts">
          <!-- Order Status (Bar Chart) -->
          <mat-card class="half-chart">
            <mat-card-header>
              <mat-icon mat-card-avatar class="header-icon">pie_chart</mat-icon>
              <mat-card-title>Order Status</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart height="250"
                [data]="statusData"
                [options]="barOptions"
                [type]="'bar'">
              </canvas>
            </mat-card-content>
          </mat-card>

          <!-- Category performance can go here -->
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container { max-width: 1400px; margin: 0 auto; padding: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--text-main); margin-bottom: 24px; }
    .header-icon { color: var(--primary); }
    
    .charts-wrapper { display: flex; flex-direction: column; gap: 24px; }
    .full-width-chart { 
      padding: 16px; 
      border-radius: 16px; 
      background: var(--surface) !important;
      border: 1px solid var(--border) !important;
      color: var(--text-main) !important;
    }
    ::ng-deep .mat-mdc-card-subtitle { color: var(--text-secondary) !important; }
    
    .split-charts { display: grid; grid-template-columns: 1fr; gap: 24px; }
    @media(min-width: 1024px) { .split-charts { grid-template-columns: 1fr 1fr; } }
    
    .half-chart { 
      padding: 16px; 
      border-radius: 16px; 
      background: var(--surface) !important;
      border: 1px solid var(--border) !important;
      color: var(--text-main) !important;
    }
  `]
})
export class AnalyticsComponent {
  private adminService = inject(AdminService);

  salesData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Revenue', fill: true, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }]
  };

  statusData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Orders', backgroundColor: ['#11998e', '#38ef7d', '#FDC830', '#e63946'] }]
  };

  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: 'var(--text-secondary)' }, grid: { display: false } },
      y: { ticks: { color: 'var(--text-secondary)' }, grid: { color: 'var(--border)' } }
    }
  };
  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: 'var(--text-secondary)' }, grid: { color: 'var(--border)' } },
      y: { ticks: { color: 'var(--text-secondary)' }, grid: { display: false } }
    }
  };

  constructor() {
    this.adminService.getAnalytics().then(stats => {
      // Sales
      this.salesData = {
        labels: stats.revenueTrend.map((d: any) => d.name),
        datasets: [{ ...this.salesData.datasets[0], data: stats.revenueTrend.map((d: any) => d.value) }]
      };

      // Status
      this.statusData = {
        labels: stats.orderStatusDistribution.map((d: any) => d.name),
        datasets: [
          {
            ...this.statusData.datasets[0],
            data: stats.orderStatusDistribution.map((d: any) => d.value),
            backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
          }
        ]
      };
    });
  }
}
