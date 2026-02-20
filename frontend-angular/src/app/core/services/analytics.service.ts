import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface AnalyticsSummary {
    totalRevenue: number;
    totalOrders: number;
    newCustomers: number;
    avgOrderValue: number;
}

export interface ChartData {
    labels: string[];
    data: number[];
    label: string;
}

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/moderator/analytics`;

    async getSummary(range: string = 'monthly'): Promise<AnalyticsSummary> {
        return firstValueFrom(this.http.get<AnalyticsSummary>(`${this.apiUrl}/summary`, { params: { range } }));
    }

    async getOrdersTrend(range: string = 'monthly'): Promise<ChartData> {
        return firstValueFrom(this.http.get<ChartData>(`${this.apiUrl}/orders-trend`, { params: { range } }));
    }

    async getRevenueTrend(range: string = 'monthly'): Promise<ChartData> {
        return firstValueFrom(this.http.get<ChartData>(`${this.apiUrl}/revenue-trend`, { params: { range } }));
    }

    async getCategoryDistribution(): Promise<ChartData> {
        return firstValueFrom(this.http.get<ChartData>(`${this.apiUrl}/category-distribution`));
    }
}
