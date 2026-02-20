import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductService } from '../../../core/services/product.service';

@Component({
    selector: 'app-wishlist-page',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, ProductCardComponent],
    template: `
    <div class="page-container">
       <div class="header">
          <h1>My Wishlist</h1>
          <p>{{ wishlistItems().length }} Items</p>
       </div>

       <div *ngIf="loading()" class="center-box">
          <div class="spinner"></div>
       </div>

       <div *ngIf="!loading() && wishlistItems().length === 0" class="center-box">
          <mat-icon class="large-icon">favorite_border</mat-icon>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love to your wishlist.</p>
          <button mat-raised-button color="primary" (click)="shopNow()">Start Shopping</button>
       </div>

       <div class="products-grid" *ngIf="!loading() && products().length > 0">
          <app-product-card *ngFor="let p of products()" [product]="p"></app-product-card>
       </div>
    </div>
  `,
    styles: [`
    .page-container { max-width: 1400px; margin: 100px auto 40px; padding: 20px; }
    .header { margin-bottom: 30px; }
    h1 { font-weight: 700; margin: 0; color: var(--text-main); }
    p { color: var(--text-secondary); }
    
    .center-box { 
      text-align: center; 
      padding: 80px 0; 
      color: var(--text-secondary); 
    }
    .large-icon { font-size: 80px; width: 80px; height: 80px; margin-bottom: 20px; opacity: 0.3; }

    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; }
  `]
})
export class WishlistPageComponent {
    wishlistService = inject(WishlistService);
    router = inject(Router);

    wishlistItems = this.wishlistService.wishlistItems;
    loading = this.wishlistService.loading;

    // Reactively compute products from wishlist items
    products = computed(() => {
        return this.wishlistItems()
            .map(item => item.product)
            .filter(product => !!product);
    });

    shopNow() {
        this.router.navigate(['/all-products']);
    }
}
