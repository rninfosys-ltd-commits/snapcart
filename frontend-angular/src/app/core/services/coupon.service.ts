import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CouponService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin/coupons`;

    // For Admin Use
    async getAllCoupons(): Promise<any[]> {
        try {
            return await firstValueFrom(this.http.get<any[]>(this.apiUrl));
        } catch (error) {
            console.error('Error fetching admin coupons:', error);
            // Fallback to active coupons if admin fails (e.g. user checks)
            return this.getAvailableCoupons();
        }
    }

    // For Public User Use
    async getAvailableCoupons(): Promise<any[]> {
        const publicUrl = `${environment.apiUrl}/coupons/active`;
        try {
            return await firstValueFrom(this.http.get<any[]>(publicUrl));
        } catch (error) {
            console.error('Error fetching active coupons:', error);
            return [];
        }
    }

    async createCoupon(coupon: any): Promise<any> {
        return await firstValueFrom(this.http.post<any>(this.apiUrl, coupon));
    }

    async deleteCoupon(id: number): Promise<void> {
        await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    }

    async validateCoupon(code: string, amount: number): Promise<any> {
        const validateUrl = `${environment.apiUrl}/coupons/validate`;
        // Use POST for consistency with user controller if needed, but public is GET.
        // Let's use GET but ensure cartValue is the param name.
        const params = { code, cartValue: amount.toString() };
        return await firstValueFrom(this.http.get<any>(validateUrl, { params }));
    }
}
