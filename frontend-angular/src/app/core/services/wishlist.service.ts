import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { Wishlist, WishlistItem } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private http = inject(HttpClient);
    private auth = inject(AuthService);
    private apiUrl = `${environment.apiUrl}/wishlist`;

    // State Management
    wishlist = signal<Wishlist>({ id: 0, items: [] });
    loading = signal<boolean>(false);

    // Computed Values
    wishlistItems = computed(() => this.wishlist().items || []);
    wishlistCount = computed(() => this.wishlistItems().length);

    constructor() {
        effect(() => {
            if (this.auth.user()) {
                this.fetchWishlist();
            } else {
                this.wishlist.set({ id: 0, items: [] });
            }
        });
    }

    async fetchWishlist() {
        try {
            this.loading.set(true);
            const data = await firstValueFrom(this.http.get<Wishlist>(this.apiUrl));
            this.wishlist.set(data);
        } catch (err) {
            console.error('Failed to fetch wishlist', err);
        } finally {
            this.loading.set(false);
        }
    }

    async addToWishlist(productModelNo: string | number) {
        try {
            const data = await firstValueFrom(this.http.post<Wishlist>(`${this.apiUrl}/add/${productModelNo}`, {}));
            this.wishlist.set(data);
            return true;
        } catch (err) {
            console.error('Error adding to wishlist', err);
            return false;
        }
    }

    async removeFromWishlist(productModelNo: string | number) {
        try {
            const data = await firstValueFrom(this.http.delete<Wishlist>(`${this.apiUrl}/remove/${productModelNo}`));
            this.wishlist.set(data);
            return true;
        } catch (err) {
            console.error('Error removing from wishlist', err);
            return false;
        }
    }

    isInWishlist(productModelNo: number): boolean {
        return this.wishlistItems().some((item: WishlistItem) => item.product?.modelNo === productModelNo);
    }
}
