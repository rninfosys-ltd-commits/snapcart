import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { Cart, CartItem } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private http = inject(HttpClient);
    private auth = inject(AuthService);
    private apiUrl = `${environment.apiUrl}/cart`;

    // State Management with Signals
    cart = signal<Cart>({ items: [], totalAmount: 0 });
    loading = signal<boolean>(false);

    // Computed Values
    cartItems = computed(() => this.cart().items || []);

    cartCount = computed(() => {
        return this.cartItems().reduce((total: number, item: CartItem) => total + (item.quantity || 1), 0) || 0;
    });

    totalAmount = computed(() => this.cart().totalAmount || 0);

    constructor() {
        effect(() => {
            const user = this.auth.user();
            if (user) {
                // Check if user has ROLE_USER
                const roles = user.roles || [];
                // Simple check: if not admin/moderator, fetch cart
                if (!roles.includes('ADMIN') && !roles.includes('MODERATOR')) {
                    this.fetchCart();
                } else {
                    this.cart.set({ items: [], totalAmount: 0 });
                }
            } else {
                this.cart.set({ items: [], totalAmount: 0 });
            }
        });
    }

    async fetchCart() {
        try {
            this.loading.set(true);
            const data = await firstValueFrom(this.http.get<Cart>(this.apiUrl));
            this.cart.set(data);
        } catch (e) {
            console.error('Failed to fetch cart', e);
        } finally {
            this.loading.set(false);
        }
    }

    async refreshCart() {
        return this.fetchCart();
    }

    /**
     * Add to cart now requires color to identify variant
     */
    async addToCart(productModelNo: string | number, quantity: number = 1, size: string, color: string): Promise<any> {
        try {
            this.loading.set(true);
            const data = await firstValueFrom(
                this.http.post<Cart>(`${this.apiUrl}/add`, { productModelNo, quantity, size, color })
            );
            this.cart.set(data);
            return { success: true };
        } catch (e) {
            console.error('Failed to add to cart', e);
            return { success: false };
        } finally {
            this.loading.set(false);
        }
    }

    async removeFromCart(productModelNo: string) {
        // Deprecated: Remove by Item ID is better
        console.warn('Use removeFromCartById instead');
        return { success: false };
    }

    async removeFromCartById(cartItemId: number) {
        try {
            this.loading.set(true);
            const data = await firstValueFrom(
                this.http.delete<Cart>(`${this.apiUrl}/remove/item/${cartItemId}`)
            );
            this.cart.set(data);
            return { success: true };
        } catch (e) {
            console.error('Failed to remove item by ID', e);
            return { success: false };
        } finally {
            this.loading.set(false);
        }
    }

    async updateItemQuantity(cartItemId: number, quantity: number) {
        try {
            this.loading.set(true);
            const data = await firstValueFrom(
                this.http.put<Cart>(`${this.apiUrl}/update/item/${cartItemId}`, { quantity })
            );
            this.cart.set(data);
            return { success: true };
        } catch (e) {
            console.error('Failed to update quantity', e);
            return { success: false };
        } finally {
            this.loading.set(false);
        }
    }

    // START: Fix for ambiguous update
    // Ideally we should have an endpoint like PUT /api/cart/update/item/{itemId}
    // If backend doesn't support it, we might need to rely on remove/add flow or fix backend.

    async clearCart() {
        try {
            this.loading.set(true);
            const data = await firstValueFrom(
                this.http.delete<Cart>(`${this.apiUrl}/clear`)
            );
            this.cart.set({ items: [], totalAmount: 0 });
            return { success: true };
        } catch (e) {
            console.error('Failed to clear cart', e);
            return { success: false };
        } finally {
            this.loading.set(false);
        }
    }
}
