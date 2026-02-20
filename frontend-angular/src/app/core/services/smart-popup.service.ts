import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Product } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class SmartPopupService {
    private apiUrl = `${environment.apiUrl}/public/popup`;
    private shownProducts = new Set<number | string>();
    private sessionKey = 'popup_shown_products';

    constructor(private http: HttpClient) {
        // Load from sessionStorage
        const stored = sessionStorage.getItem(this.sessionKey);
        if (stored) {
            this.shownProducts = new Set(JSON.parse(stored));
        }
    }

    /**
     * Get product for smart popup
     */
    getPopupProduct(): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/product`);
    }

    /**
     * Mark product as shown in this session
     */
    markAsShown(productId: number | string): void {
        this.shownProducts.add(productId);
        sessionStorage.setItem(this.sessionKey, JSON.stringify(Array.from(this.shownProducts)));
    }

    /**
     * Check if product was already shown in this session
     */
    wasShown(productId: number | string): boolean {
        return this.shownProducts.has(productId);
    }

    /**
     * Clear shown products (for testing)
     */
    clearSession(): void {
        this.shownProducts.clear();
        sessionStorage.removeItem(this.sessionKey);
    }
}
