import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Employee {
    id?: number;
    name: string;
    email: string;
    mobile: string;
    gender: string;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class ModeratorService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/moderators`; // Base URL for moderators

    // Profile Management
    async getMyProfile(): Promise<any> {
        return firstValueFrom(this.http.get<any>(`${this.apiUrl}/me`));
    }

    async updateMyProfile(data: any): Promise<any> {
        return firstValueFrom(this.http.put<any>(`${this.apiUrl}/me`, data));
    }

    // Employee Management
    async getEmployees(): Promise<Employee[]> {
        return firstValueFrom(this.http.get<Employee[]>(`${this.apiUrl}/me/employees`));
    }

    async createEmployee(data: any): Promise<Employee> {
        return firstValueFrom(this.http.post<Employee>(`${this.apiUrl}/me/employees`, data));
    }

    // Orders
    async getAllOrders(): Promise<any[]> {
        // According to ModeratorOrderController: GET /api/moderators/orders
        const response: any = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/orders`));
        return response.content || response; // Handle Page<Order> or List<Order>
    }

    async getOrderById(id: number): Promise<any> {
        return firstValueFrom(this.http.get<any>(`${this.apiUrl}/orders/${id}`));
    }

    async updateOrderStatus(id: number, status: string): Promise<any> {
        return firstValueFrom(this.http.put<any>(
            `${this.apiUrl}/orders/${id}/status`,
            { status } // Controller expects body: { "status": "SHIPPED" }
        ));
    }

    async getPaymentDetails(id: number): Promise<any> {
        return firstValueFrom(this.http.get<any>(`${this.apiUrl}/orders/${id}/payment`));
    }
}
