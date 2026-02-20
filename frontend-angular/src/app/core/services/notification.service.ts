import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CartToastComponent, CartToastData } from '../../shared/components/cart-toast/cart-toast.component';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);

    showCartToast(product: any, type: 'success' | 'error' = 'success', message?: string) {
        const defaultMessage = type === 'success' ? 'Added successfully to your cart.' : 'Failed to update cart.';

        this.snackBar.openFromComponent(CartToastComponent, {
            data: {
                type,
                message: message || defaultMessage,
                product,
                onViewCart: () => this.router.navigate(['/cart'])
            } as CartToastData,
            duration: 4000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['boutique-toast']
        });
    }

    showInfo(message: string) {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
        });
    }
}
