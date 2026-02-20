import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin`;

    // Analytics
    async getAnalytics(): Promise<any> {
        return firstValueFrom(this.http.get<any>(`${this.apiUrl}/analytics`));
    }

    // Inventory
    async getInventorySummary(): Promise<any> {
        return firstValueFrom(this.http.get<any>(`${this.apiUrl}/inventory/summary`));
    }

    async updateStock(modelNo: string, quantity: number): Promise<any> {
        return firstValueFrom(this.http.put<any>(`${this.apiUrl}/inventory/${modelNo}/stock`, {}, {
            params: { quantity: quantity.toString() }
        }));
    }

    // Users
    async getAllUsers(): Promise<any[]> {
        return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/users`));
    }

    // Orders (Admin View)
    async getAllOrders(): Promise<any[]> {
        return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/orders/all`));
    }

    async updateOrderTracking(orderId: number, location: string, status: string): Promise<any> {
        return firstValueFrom(this.http.put<any>(
            `${this.apiUrl}/orders/${orderId}/tracking`,
            {},
            { params: { location, status } }
        ));
    }
}
