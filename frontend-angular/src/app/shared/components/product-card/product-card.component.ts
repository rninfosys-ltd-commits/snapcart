import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { RecentlyViewedService } from '../../../core/services/recently-viewed.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="product-card" (mouseenter)="isHovered.set(true)" (mouseleave)="isHovered.set(false)" (click)="onViewDetails()">
      <!-- Badges -->
      <div class="badges">
        <span *ngIf="isFlashSaleActive()" class="badge discount">
          -{{ Math.round(((product.price - product.salePrice) / product.price) * 100) }}%
        </span>
        <span *ngIf="!isFlashSaleActive() && product.discount" class="badge discount">{{product.discount}}% OFF</span>
        <span *ngIf="product.quantity === 0" class="badge out">Out of Stock</span>
        <span *ngIf="product.quantity > 0 && product.quantity <= 5" class="badge low">Low Stock</span>
        <span *ngIf="isInCart()" class="badge cart">In Cart</span>
      </div>

      <!-- Wishlist Btn -->
      <button class="wishlist-btn" (click)="$event.stopPropagation(); toggleWishlist()">
        <mat-icon [class.filled]="isInWishlist()">favorite</mat-icon>
      </button>

      <!-- Image Area -->
      <div class="image-container">
        <img [src]="imageSrc() || currentImage()" [alt]="product.name" 
             class="product-img"
             (error)="handleImageError()">
        
        <!-- Overlay -->
        <div class="overlay">
          <button mat-mini-fab color="basic" (click)="$event.stopPropagation(); onViewDetails()">
            <mat-icon>visibility</mat-icon>
          </button>
          <button mat-mini-fab color="primary" [disabled]="loading() || isInCart() || product.quantity === 0" (click)="$event.stopPropagation(); addToCart()">
             <mat-icon>{{ isInCart() ? 'check' : 'add_shopping_cart' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="card-body">
        <span *ngIf="product.brandName" class="brand-tag">{{product.brandName}}</span>
        <h3 class="product-name" [title]="product.name">{{product.name}}</h3>
        <p class="product-desc" [title]="product.description">{{product.description}}</p>
        
        <div class="price-row">
          <span class="price">{{(isFlashSaleActive() ? product.salePrice : product.price) | currency:'INR':'symbol':'1.0-0'}}</span>
          <span *ngIf="isFlashSaleActive() || (product.originalPrice > product.price)" class="original-price">
            {{(isFlashSaleActive() ? product.price : product.originalPrice) | currency:'INR':'symbol':'1.0-0'}}
          </span>
          <span *ngIf="isFlashSaleActive()" class="discount-text">
             {{ Math.round(((product.price - product.salePrice) / product.price) * 100) }}% OFF
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .product-card {
      background: var(--surface); 
      border-radius: 16px; 
      overflow: hidden;
      box-shadow: var(--shadow-md);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      position: relative; 
      cursor: pointer; 
      height: 100%; 
      display: flex; 
      flex-direction: column;
      border: 1px solid var(--border);
    }
    .product-card:hover { 
      transform: translateY(-6px); 
      box-shadow: var(--shadow-lg);
      border-color: var(--primary);
    }

    .badges { position: absolute; top: 12px; left: 12px; z-index: 2; display: flex; flex-direction: column; gap: 6px; }
    .badge { 
        padding: 4px 10px; 
        border-radius: 6px; 
        font-size: 10px; 
        font-weight: 700; 
        text-transform: uppercase; 
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        backdrop-filter: blur(4px);
    }
    .badge.discount { background: #ffebee; color: #d32f2f; border: 1px solid #ffcdd2; }
    .badge.out { background: #212529; color: white; }
    .badge.low { background: #fff8e1; color: #ff8f00; border: 1px solid #ffecb3; }
    .badge.cart { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }

    .wishlist-btn { 
      position: absolute; 
      top: 12px; 
      right: 12px; 
      z-index: 2; 
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(4px);
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: all 0.2s ease;
    }
    .wishlist-btn:hover { transform: scale(1.1); background: #fff; }
    .wishlist-btn mat-icon { font-size: 20px; width: 20px; height: 20px; color: #9ca3af; transition: color 0.2s; }
    .wishlist-btn mat-icon.filled { color: #ef4444; }

    .image-container { 
      position: relative; 
      padding-top: 100%; /* 1:1 Aspect Ratio */
      background: transparent; 
      overflow: hidden; 
    }
    .product-img { 
        position: absolute; 
        top: 50%; 
        left: 50%; 
        transform: translate(-50%, -50%);
        max-width: 70%; 
        max-height: 70%; 
        width: auto;
        height: auto;
        object-fit: contain; 
        transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); 
    }
    .product-card:hover .product-img {
        transform: translate(-50%, -50%) scale(1.05);
    }

    .overlay {
      position: absolute; bottom: 0; left: 0; width: 100%;
      padding: 16px;
      background: linear-gradient(to top, rgba(0,0,0,0.05), transparent);
      opacity: 0; transition: all 0.3s ease;
      display: flex; justify-content: center; gap: 12px;
      transform: translateY(20px);
    }
    .product-card:hover .overlay { opacity: 1; transform: translateY(0); }

    .card-body { 
      padding: 16px; 
      display: flex; 
      flex-direction: column; 
      flex-grow: 1; 
      background: var(--surface);
    }
    .brand-tag {
      font-size: 10px;
      font-weight: 800;
      color: #6366f1; /* Indigo */
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .product-name { 
      font-size: 15px; 
      font-weight: 600; 
      margin: 0 0 4px; 
      color: var(--text-main); 
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;  
      overflow: hidden;
    }
    .product-desc { 
      font-size: 13px; 
      color: var(--text-secondary); 
      margin: 0 0 12px; 
      white-space: nowrap; 
      overflow: hidden; 
      text-overflow: ellipsis; 
    }
    
    .price-row { display: flex; align-items: baseline; gap: 8px; margin-top: auto; }
    .price { font-size: 18px; font-weight: 800; color: var(--text-main); }
    .original-price { font-size: 12px; text-decoration: line-through; color: var(--text-muted); }
    .discount-text { font-size: 12px; color: #ef4444; font-weight: 600; }

    .action-btn { 
        width: 100%; 
        margin-top: 16px; 
        border-radius: 8px; 
        height: 40px;
        box-shadow: none;
        background: #f3f4f6;
        color: #1f2937;
        font-weight: 600;
        transition: all 0.2s;
    }
    .action-btn:hover { background: #e5e7eb; }
    .action-btn.added { background: #dcfce7; color: #166534; }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: any;

  private router = inject(Router);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private recentlyViewed = inject(RecentlyViewedService);

  isHovered = signal(false);
  loading = signal(false);
  imageSrc = signal<string | null>(null);
  protected Math = Math;

  isInCart = computed(() => {
    return this.cartService.cartItems().some((item: any) => item.product?.modelNo === this.product.modelNo);
  });

  isInWishlist = computed(() => {
    return this.wishlistService.wishlistItems().some((item: any) => item.productModelNo === this.product.modelNo);
  });

  isFlashSaleActive = computed(() => {
    if (!this.product.salePrice || !this.product.saleEndTime) return false;
    return new Date(this.product.saleEndTime) > new Date();
  });

  currentImage() {
    return `${environment.apiUrl}/images/product/${this.product.modelNo || this.product.id}/1`;
  }

  handleImageError() {
    // Hide the image if it fails to load
  }

  onViewDetails() {
    this.recentlyViewed.addRecentlyViewed(this.product.modelNo);
    this.router.navigate(['/products', this.product.modelNo]);
  }

  async addToCart() {
    if (this.loading()) return;
    this.loading.set(true);
    // Passing empty strings for size/color as defaults since this is a quick add from card
    // Ideally user should select variant, but for now we fix the signature mismatch
    await this.cartService.addToCart(this.product.modelNo, 1, this.product.variants?.[0]?.size || '', this.product.variants?.[0]?.color || '');
    this.loading.set(false);
  }

  async toggleWishlist() {
    if (this.isInWishlist()) {
      await this.wishlistService.removeFromWishlist(this.product.modelNo);
    } else {
      await this.wishlistService.addToWishlist(this.product.modelNo);
    }
  }
}
