import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AnalyticsService, AnalyticsSummary, ChartData } from '../../../core/services/analytics.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        BaseChartDirective
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    private analyticsService = inject(AnalyticsService);
    private router = inject(Router); // Injected Router

    summary = signal<AnalyticsSummary | null>(null);
    loading = signal(true);
    selectedRange = signal('monthly');
    today = new Date();

    // Chart Data
    revenueChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
    ordersChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
    categoryChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };

    // Chart Options
    lineChartOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: { legend: { display: true } }
    };
    barChartOptions: ChartOptions<'bar'> = {
        responsive: true,
    };
    pieChartOptions: ChartOptions<'pie'> = {
        responsive: true,
    };

    ngOnInit() {
        this.loadDashboardData();
    }

    async loadDashboardData() {
        try {
            this.loading.set(true);
            const range = this.selectedRange();

            // Fetch all data in parallel
            const [summary, revenue, orders, categories] = await Promise.all([
                this.analyticsService.getSummary(range),
                this.analyticsService.getRevenueTrend(range),
                this.analyticsService.getOrdersTrend(range),
                this.analyticsService.getCategoryDistribution()
            ]);

            this.summary.set(summary);

            // Configure Revenue Chart
            this.revenueChartData = {
                labels: revenue.labels,
                datasets: [{
                    data: revenue.data,
                    label: revenue.label,
                    fill: true,
                    tension: 0.4,
                    borderColor: '#4db6ac',
                    backgroundColor: 'rgba(77, 182, 172, 0.2)'
                }]
            };

            // Configure Orders Chart
            this.ordersChartData = {
                labels: orders.labels,
                datasets: [{
                    data: orders.data,
                    label: orders.label,
                    backgroundColor: '#3b82f6'
                }]
            };

            // Configure Category Chart
            this.categoryChartData = {
                labels: categories.labels,
                datasets: [{
                    data: categories.data,
                    backgroundColor: ['#4db6ac', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']
                }]
            };

        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            this.loading.set(false);
        }
    }

    onRangeChange(range: string) {
        this.selectedRange.set(range);
        this.loadDashboardData();
    }

    cards = [
        {
            title: 'My Products',
            link: '/moderator/products',
            description: 'Manage and view products added by you.',
            icon: 'inventory_2',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            title: 'Add Product',
            link: '/admin/add-product', // Keep this or change if moderator specific add exists
            description: 'Add new shoes to your collection.',
            icon: 'add_circle',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            title: 'Orders',
            link: '/moderator/orders',
            description: 'Track and manage customer orders.',
            icon: 'shopping_cart',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
            title: 'Reviews',
            link: '/moderator/reviews',
            description: 'Check customer reviews and feedback.',
            icon: 'star',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        }
    ];

    getIconClass(icon: string): string {
        switch (icon) {
            case 'inventory_2': return 'inventory';
            case 'add_circle': return 'add';
            case 'shopping_cart': return 'orders';
            case 'star': return 'reviews';
            default: return '';
        }
    }

    navigate(link: string) {
        this.router.navigate([link]); // Fixed: using this.router instead of router
    }

    downloadChart(canvasId: string, fileName: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) return;

        // Create a temporary link to download the image
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}_${new Date().getTime()}.png`);
        link.click();
    }

    printReport() {
        window.print();
    }
}
