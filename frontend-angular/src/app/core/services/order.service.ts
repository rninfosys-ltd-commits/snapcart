import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Order } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/orders`;

    async placeOrder(orderData: { shippingAddress: any, paymentMethod: string }): Promise<Order> {
        return firstValueFrom(this.http.post<Order>(`${this.apiUrl}/place`, orderData));
    }

    async fetchUserOrders(): Promise<Order[]> {
        try {
            return await firstValueFrom(this.http.get<Order[]>(`${this.apiUrl}/my-orders`));
        } catch (err) {
            console.error('Failed to fetch user orders', err);
            return [];
        }
    }

    async checkFirstOrder(): Promise<boolean> {
        try {
            return await firstValueFrom(this.http.get<boolean>(`${this.apiUrl}/check-first-order`));
        } catch (err) {
            return false;
        }
    }

    async getOrderById(id: number): Promise<Order> {
        return firstValueFrom(this.http.get<Order>(`${this.apiUrl}/${id}`));
    }

    async cancelOrder(orderId: number): Promise<void> {
        return firstValueFrom(this.http.post<void>(`${this.apiUrl}/${orderId}/cancel`, {}));
    }

    async downloadInvoice(orderId: number): Promise<Blob> {
        return firstValueFrom(this.http.get(
            `${this.apiUrl}/${orderId}/invoice`,
            { responseType: 'blob' }
        ));
    }

    async getTracking(orderId: number): Promise<any[]> {
        try {
            return await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/${orderId}/tracking`));
        } catch (err) {
            console.error('Failed to fetch tracking', err);
            return [];
        }
    }

    async addTracking(orderId: number, trackingData: any): Promise<any> {
        return firstValueFrom(this.http.post<any>(`${this.apiUrl}/${orderId}/tracking`, trackingData));
    }
}
