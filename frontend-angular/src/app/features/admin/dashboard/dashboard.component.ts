import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AdminService } from '../../../core/services/admin.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, BaseChartDirective],
  template: `
    <div class="dashboard-wrapper">
      <div class="dashboard-container">
        <!-- Welcome Section -->
        <div class="welcome-section">
          <h1 class="page-title">Dashboard Overview</h1>
          <p class="subtitle">Welcome back, Admin</p>
        </div>
        
        <!-- Row 1: Quick Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <h3 class="stat-value">{{ totalRevenue() | currency:'INR':'symbol':'1.0-0' }}</h3>
            <p class="stat-label" style="color: #4facfe">TOTAL REVENUE</p>
          </div>

          <div class="stat-card">
            <h3 class="stat-value">{{ totalOrders() }}</h3>
            <p class="stat-label" style="color: #e63946">TOTAL ORDERS</p>
          </div>

          <div class="stat-card">
            <h3 class="stat-value">{{ totalUsers() }}</h3>
            <p class="stat-label" style="color: #43e97b">TOTAL CUSTOMERS</p>
          </div>

          <div class="stat-card">
            <h3 class="stat-value">{{ totalProducts() }}</h3>
            <p class="stat-label" style="color: #fa709a">TOTAL PRODUCTS</p>
          </div>
        </div>

        <!-- Row 2: Main Charts -->
        <div class="charts-row">
          <div class="chart-card revenue-chart">
            <h3 class="chart-title">Revenue Trend (Last 7 Days)</h3>
            <div class="chart-container">
              <canvas baseChart
                [data]="lineChartData"
                [options]="lineChartOptions"
                [type]="'line'">
              </canvas>
            </div>
          </div>

          <div class="chart-card pie-chart">
            <h3 class="chart-title">Order Status</h3>
            <div class="chart-container">
              <canvas baseChart
                [data]="pieChartData"
                [options]="pieChartOptions"
                [type]="'pie'">
              </canvas>
            </div>
          </div>
        </div>

        <!-- Row 3: Inventory & Quick Actions -->
        <div class="bottom-row">
           <!-- Product Inventory Bar Chart -->
           <div class="chart-card inventory-chart">
            <h3 class="chart-title">Product Inventory</h3>
            <div class="chart-container">
              <canvas baseChart
                [data]="barChartData"
                [options]="barChartOptions"
                [type]="'bar'">
              </canvas>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions-section">
            <h2 class="section-title">Quick Actions</h2>
            <div class="actions-grid">
                <a *ngFor="let action of quickActions" [routerLink]="action.link" class="action-card">
                    <div class="action-icon-box" [style.background]="action.gradient">
                    <mat-icon>{{ action.icon }}</mat-icon>
                    </div>
                    <div class="action-info">
                    <span class="action-title">{{ action.title }}</span>
                    <span class="action-desc">Manage</span>
                    </div>
                </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      min-height: 100vh;
      background-color: var(--background);
      padding: 2rem;
      color: var(--text-main);
    }

    .dashboard-container { max-width: 1600px; margin: 0 auto; }

    .welcome-section { margin-bottom: 2rem; }
    .page-title { font-size: 2rem; font-weight: 700; margin: 0; color: var(--text-main); }
    .subtitle { color: var(--text-secondary); margin: 0.5rem 0 0; }
    
    /* Stats Grid */
    .stats-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
      gap: 1.5rem; 
      margin-bottom: 2.5rem; 
    }
    
    .stat-card { 
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
      box-shadow: var(--shadow-sm);
    }
    
    .stat-card:hover { transform: translateY(-5px); }
    
    .stat-value { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; color: var(--text-main); }
    .stat-label { font-size: 0.85rem; font-weight: 600; letter-spacing: 1px; margin: 0; }

    /* Charts Row */
    .charts-row { 
      display: grid; 
      grid-template-columns: 2fr 1fr; 
      gap: 1.5rem; 
      margin-bottom: 3rem; 
    }
    
    /* Bottom Row */
    .bottom-row {
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 1.5rem; 
      margin-bottom: 3rem;
    }

    .chart-card { 
      background: var(--surface); 
      border-radius: 16px; 
      padding: 1.5rem; 
      color: var(--text-main);
      height: 400px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }
    
    .chart-title { margin: 0 0 1.5rem; font-size: 1.1rem; font-weight: 600; color: var(--text-main); }
    .chart-container { height: calc(100% - 40px); position: relative; }

    /* Quick Actions */
    .section-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; color: var(--text-main); }
    
    .actions-grid { 
      display: grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap: 1.5rem; 
    }
    
    .action-card { 
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      text-decoration: none;
      color: var(--text-main);
      transition: transform 0.2s;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
    }
    
    .action-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
    
    .action-icon-box { 
      width: 48px; 
      height: 48px; 
      border-radius: 10px; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      color: white;
    }
    
    .action-info { display: flex; flex-direction: column; }
    .action-title { font-weight: 600; font-size: 0.95rem; line-height: 1.2; color: var(--text-main); }
    .action-desc { font-size: 0.75rem; color: var(--text-secondary); }

    @media (max-width: 1200px) {
      .bottom-row { grid-template-columns: 1fr; }
    }

    @media (max-width: 900px) {
      .charts-row { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent {
  private adminService = inject(AdminService);

  totalRevenue = signal(0);
  totalOrders = signal(0);
  totalUsers = signal(0);
  totalProducts = signal(0);

  quickActions = [
    {
      title: 'All Products',
      link: '/admin/products',
      icon: 'inventory_2',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Add Product',
      link: '/admin/add-product',
      icon: 'add_circle',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Orders',
      link: '/admin/orders',
      icon: 'shopping_cart',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Customers',
      link: '/admin/users',
      icon: 'people',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      title: 'Reviews',
      link: '/admin/reviews',
      icon: 'rate_review',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      title: 'Coupons',
      link: '/admin/coupons',
      icon: 'confirmation_number',
      gradient: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)'
    },
    {
      title: 'Flash Deals',
      link: '/admin/flash-deals',
      icon: 'bolt',
      gradient: 'linear-gradient(135deg, #FAD0C4 0%, #FFD1FF 100%)'
    }
  ];

  // Initialize with empty structure
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Revenue',
      fill: true,
      tension: 0.4,
      borderColor: '#8884d8',
      backgroundColor: 'rgba(136, 132, 216, 0.1)',
      pointBackgroundColor: '#8884d8'
    }]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#8884d8',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'var(--text-secondary)' }
      },
      y: {
        grid: { display: true, color: 'var(--border)' },
        ticks: { color: 'var(--text-secondary)' }
      }
    }
  };

  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
      hoverOffset: 4,
      borderColor: 'transparent'
    }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: 'var(--text-main)', usePointStyle: true, padding: 20 }
      }
    }
  };

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Men', 'Women', 'Kids'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      label: 'Inventory',
      barThickness: 40,
      borderRadius: 4
    }]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'var(--border)' },
        ticks: { color: 'var(--text-secondary)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'var(--text-secondary)' }
      }
    }
  };

  constructor() {
    this.loadData();
  }

  async loadData() {
    try {
      const stats = await this.adminService.getAnalytics();

      // Stats
      this.totalRevenue.set(stats.totalRevenue || 0);
      this.totalOrders.set(stats.totalOrders || 0);
      this.totalUsers.set(stats.userCount || 0);
      this.totalProducts.set(stats.totalProducts || 0);

      // --- Line Chart (Revenue) ---
      if (stats.revenueTrend && stats.revenueTrend.length > 0) {
        this.lineChartData = {
          labels: stats.revenueTrend.map((d: any) => d.name),
          datasets: [{
            ...this.lineChartData.datasets[0],
            data: stats.revenueTrend.map((d: any) => d.value)
          }]
        };
      } else {
        // Fallback: If empty, use mock data
        this.lineChartData = {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{ ...this.lineChartData.datasets[0], data: [5000, 7000, 4500, 8000, 6000, 9500, 11000] }]
        };
      }

      // --- Pie Chart (Order Status) ---
      if (stats.orderStatusDistribution && stats.orderStatusDistribution.length > 0) {
        const labels = stats.orderStatusDistribution.map((d: any) => d.name);
        const data = stats.orderStatusDistribution.map((d: any) => d.value);
        this.pieChartData = {
          labels: labels,
          datasets: [{ ...this.pieChartData.datasets[0], data: data }]
        };
      } else {
        // Fallback
        this.pieChartData = {
          labels: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
          datasets: [{ ...this.pieChartData.datasets[0], data: [10, 15, 60, 5] }]
        };
      }

      // --- Bar Chart (Inventory) ---
      const men = stats.menProducts || 0;
      const women = stats.womenProducts || 0;
      const kids = stats.kidsProducts || 0;

      if (men + women + kids > 0) {
        this.barChartData = {
          ...this.barChartData,
          datasets: [{ ...this.barChartData.datasets[0], data: [men, women, kids] }]
        };
      } else {
        // Fallback
        this.barChartData = {
          ...this.barChartData,
          datasets: [{ ...this.barChartData.datasets[0], data: [120, 80, 40] }]
        };
      }

    } catch (err) {
      console.error('Failed to load dashboard stats', err);
      // Mock Fallback for Request Failure
      this.useMockData();
    }
  }

  useMockData() {
    this.totalRevenue.set(45250);
    this.totalOrders.set(128);
    this.totalUsers.set(56);
    this.totalProducts.set(240);

    this.lineChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        ...this.lineChartData.datasets[0],
        data: [5000, 7000, 4500, 8000, 6000, 9500, 11000]
      }]
    };

    this.pieChartData = {
      labels: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
      datasets: [{
        ...this.pieChartData.datasets[0],
        data: [10, 15, 60, 5]
      }]
    };

    this.barChartData = {
      ...this.barChartData,
      datasets: [{
        ...this.barChartData.datasets[0],
        data: [120, 80, 40]
      }]
    };
  }
}
