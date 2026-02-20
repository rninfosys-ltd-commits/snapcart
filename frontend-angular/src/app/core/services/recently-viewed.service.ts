import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Product } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RecentlyViewedService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/user/recently-viewed`;

    async getRecentlyViewed(): Promise<Product[]> {
        try {
            return await firstValueFrom(this.http.get<Product[]>(this.apiUrl));
        } catch (err) {
            console.error('Failed to fetch recently viewed', err);
            return [];
        }
    }

    async addRecentlyViewed(productModelNo: number): Promise<void> {
        try {
            await firstValueFrom(this.http.post<void>(`${this.apiUrl}/${productModelNo}`, {}));
        } catch (err) {
            // Silently fail or log debug
            console.debug('Failed to add recently viewed', err);
        }
    }
}
