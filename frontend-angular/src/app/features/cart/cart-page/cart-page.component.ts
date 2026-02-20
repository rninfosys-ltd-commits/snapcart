import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-cart-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './cart-page.component.html',
    styleUrls: ['./cart-page.component.scss'],
    animations: [
        trigger('listAnimation', [
            transition('* => *', [
                query(':enter', [
                    style({ opacity: 0, transform: 'translateY(20px)' }),
                    stagger('100ms', [
                        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
                    ])
                ], { optional: true }),
                query(':leave', [
                    animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(-100px)' }))
                ], { optional: true })
            ])
        ])
    ]
})
export class CartPageComponent implements OnInit {
    private cartService = inject(CartService);
    private auth = inject(AuthService);
    private router = inject(Router);
    protected environment = environment;

    cartItems = this.cartService.cartItems;
    cartTotal = this.cartService.totalAmount;
    loading = this.cartService.loading;
    isProcessing = false;

    ngOnInit() {
        if (!this.auth.user()) {
            this.router.navigate(['/login']);
        } else {
            this.cartService.fetchCart();
        }
    }

    async handleRemove(item: any) {
        try {
            if (item.id) {
                await this.cartService.removeFromCartById(item.id);
            } else {
                // Fallback
                await this.cartService.removeFromCart(item?.product?.modelNo);
            }
        } catch (err) {
            console.error('Failed to remove item', err);
        }
    }

    async handleClear() {
        try {
            await this.cartService.clearCart();
        } catch (err) {
            console.error('Failed to clear cart', err);
        }
    }

    async handleQuantityChange(item: any, newQuantity: number) {
        if (newQuantity < 1) return;
        try {
            await this.cartService.updateItemQuantity(item.id, newQuantity);
        } catch (err) {
            console.error('Failed to update quantity', err);
        }
    }

    handleCheckout() {
        this.isProcessing = true;
        setTimeout(() => {
            this.router.navigate(['/checkout']);
            this.isProcessing = false;
        }, 1000);
    }

    formatCurrency(value: number) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    }
}
