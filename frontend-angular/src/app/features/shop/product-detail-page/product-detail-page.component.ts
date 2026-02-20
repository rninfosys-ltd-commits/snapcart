import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { RecentlyViewedService } from '../../../core/services/recently-viewed.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { SimilarProductsComponent } from '../../../shared/components/similar-products/similar-products.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Product, ProductVariant } from '../../../core/models/models';

@Component({
   selector: 'app-product-detail-page',
   standalone: true,
   imports: [
      CommonModule, RouterModule, FormsModule, MatButtonModule, MatIconModule,
      MatProgressSpinnerModule, MatInputModule, MatFormFieldModule, MatSnackBarModule, SimilarProductsComponent
   ],
   template: `
    <div class="container py-5 mt-5" *ngIf="product(); else loadingTpl">
      <div class="row g-5">
        <!-- Left: Product Images -->
        <div class="col-md-6">
          <div class="border rounded shadow-sm p-3 surface sticky-top" style="top: 140px;">
            <div class="position-relative main-image-container mb-3 bg-subtle-theme rounded overflow-hidden">
                <img [src]="currentMainImage() || 'assets/placeholder.png'" 
                     alt="Main" class="img-fluid w-100 object-fit-contain" style="height: 500px;"
                     (error)="handleMainImageError()">
                
                <button mat-icon-button class="position-absolute top-0 end-0 m-3 wishlist-btn" 
                        (click)="toggleWishlist()" [class.active]="isInWishlist()">
                   <mat-icon>{{ isInWishlist() ? 'favorite' : 'favorite_border' }}</mat-icon>
                </button>
            </div>

            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <div *ngFor="let img of currentVariantImages(); let i = index" 
                   class="thumbnail-wrapper"
                   (click)="setMainImage(img)"
                   [class.active]="currentMainImage() === getFullPath(img)">
                 <img [src]="getFullPath(img)" 
                      class="img-thumbnail" style="width: 70px; height: 70px; object-fit: cover; cursor: pointer;">
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Product Info -->
        <div class="col-md-6">
          <div class="product-info-column">
            <div class="mb-4">
               <h1 class="h2 fw-bold mb-1">{{ product()!.name }}</h1>
               <div class="d-flex align-items-center gap-3">
                  <span class="text-primary fw-600 fs-5">{{ product()!.brandName }}</span>
                  <div class="d-flex align-items-center gap-1 text-muted small">
                     <span class="badge bg-success d-flex align-items-center gap-1">
                        {{ averageRating() }} <mat-icon style="font-size: 14px; height: 14px; width: 14px;">star</mat-icon>
                     </span>
                     <span>| {{ product()!.reviewCount }} Verified Reviews</span>
                  </div>
               </div>
            </div>

            <div class="price-section mb-4 p-3 bg-subtle-theme rounded shadow-sm">
                <div class="d-flex align-items-baseline gap-3">
                   <h2 class="fw-bold mb-0">
                      {{ currentPrice() | currency:'INR':'symbol':'1.0-0' }}
                   </h2>
                   <span class="text-muted text-decoration-line-through fs-5" *ngIf="product()!.discountPercentage">
                      {{ (currentPrice() * 100 / (100 - (product()!.discountPercentage || 0))) | currency:'INR':'symbol':'1.0-0' }}
                   </span>
                   <span class="text-success fw-bold p-1 px-2 rounded" style="background: rgba(16, 185, 129, 0.1);" *ngIf="product()!.discountPercentage">
                      {{ product()!.discountPercentage }}% OFF
                   </span>
                </div>
                <p class="text-muted small mt-1 mb-0">Inclusive of all taxes</p>
            </div>

            <!-- Color Selection -->
            <div class="mb-4" *ngIf="uniqueColors().length > 0">
               <div class="d-flex justify-content-between">
                  <label class="form-label fw-bold small text-uppercase text-muted">Select Color: <span class="text-highlight">{{ selectedColor() }}</span></label>
               </div>
               <div class="d-flex gap-3 flex-wrap mt-2">
                 <div *ngFor="let color of uniqueColors()" 
                      class="color-wrapper"
                      [class.active]="selectedColor() === color"
                      (click)="selectColor(color)">
                      <div class="color-swatch-ring">
                         <div class="color-swatch" [style.background-color]="getColorHex(color)" [title]="color"></div>
                      </div>
                 </div>
               </div>
            </div>

            <!-- Size Selection -->
            <div class="mb-4" *ngIf="availableSizes().length > 0">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label fw-bold small text-uppercase text-muted m-0">Select Size</label>
                <button mat-button color="primary" class="p-0 size-chart-btn" style="min-width: unset; height: unset;">Size Chart</button>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <button *ngFor="let size of availableSizes()" 
                        type="button"
                        class="btn size-btn"
                        [class.active]="selectedSize() === size"
                        [class.btn-outline-theme]="selectedSize() !== size"
                        [class.btn-theme]="selectedSize() === size"
                        [disabled]="isOutOfStock(selectedColor()!, size)"
                        (click)="selectSize(size)">
                  {{ size }}
                </button>
              </div>
              <div class="mt-2">
                <small class="text-danger d-block fw-bold" *ngIf="showSizeError()">
                   <mat-icon style="font-size: 14px; width: 14px; height: 14px; vertical-align: middle;">error</mat-icon> 
                   Please select a size to continue
                </small>
                <small class="text-danger d-block" *ngIf="selectedSize() && isOutOfStock(selectedColor()!, selectedSize()!)">
                   This size is currently Out of Stock
                </small>
              </div>
            </div>
            
            <div class="actions-grid d-flex gap-3 mb-4">
              <button class="btn btn-primary btn-lg flex-grow-1 action-btn add-to-cart" 
                      [disabled]="isOutOfStock(selectedColor()!, selectedSize()! || '')"
                      (click)="handleAddToCart()">
                <mat-icon class="me-2">shopping_bag</mat-icon>
                <span>Add to Cart</span>
              </button>
              <button class="btn btn-theme btn-lg flex-grow-1 action-btn buy-now" 
                      [disabled]="isOutOfStock(selectedColor()!, selectedSize()! || '')"
                      (click)="handleBuyNow()">
                <mat-icon class="me-2">bolt</mat-icon>
                <span>Buy Now</span>
              </button>
            </div>

            <div class="delivery-check p-3 border rounded mb-4">
               <label class="form-label fw-bold small mb-2">Check Delivery & Services</label>
               <div class="input-group">
                  <span class="input-group-text bg-transparent border-end-0"><mat-icon class="text-muted">location_on</mat-icon></span>
                  <input type="text" class="form-control border-start-0" 
                         placeholder="Enter pincode" [(ngModel)]="pincode" maxlength="6">
                  <button class="btn btn-outline-primary fw-bold" (click)="checkPincode()">Check</button>
               </div>
               
               <div class="mt-2" *ngIf="deliveryResponse()">
                  <div *ngIf="deliveryResponse()?.serviceable; else notServiceable" class="text-success small fw-bold d-flex align-items-center gap-1">
                     <mat-icon style="font-size: 16px; width: 16px; height: 16px;">check_circle</mat-icon>
                     <span>Delivery in {{ deliveryResponse()?.estimatedDays }} days (by {{ deliveryResponse()?.estimatedDeliveryDate | date:'fullDate' }})</span>
                  </div>
                  <ng-template #notServiceable>
                     <div class="text-danger small fw-bold d-flex align-items-center gap-1">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">error</mat-icon>
                        {{ deliveryResponse()?.message || 'Delivery not available' }}
                     </div>
                  </ng-template>
               </div>

               <div class="mt-2 d-flex flex-column gap-1 small text-muted">
                  <div class="d-flex align-items-center gap-2">
                     <mat-icon style="font-size: 16px; width: 16px; height: 16px;">local_shipping</mat-icon>
                     Free delivery on orders above ₹999
                  </div>
                  <div class="d-flex align-items-center gap-2">
                     <mat-icon style="font-size: 16px; width: 16px; height: 16px;">assignment_return</mat-icon>
                     {{ product()!.isReturnable ? '7-day easy returns' : 'Non-returnable item' }}
                  </div>
               </div>
            </div>

            <div class="description-section">
               <h3 class="h6 fw-bold text-uppercase border-bottom pb-2 mb-3">Product Description</h3>
               <p class="text-secondary small mb-4" style="line-height: 1.8; white-space: pre-line;">{{ product()!.description }}</p>
               
               <div class="about-items" *ngIf="product()?.aboutItems?.length">
                  <h3 class="h6 fw-bold text-uppercase border-bottom pb-2 mb-3">About this item</h3>
                  <ul class="list-unstyled d-flex flex-column gap-2">
                     <li *ngFor="let item of product()?.aboutItems" class="d-flex gap-2 small">
                        <mat-icon class="text-primary mt-0" style="font-size: 18px; width: 18px; height: 18px;">chevron_right</mat-icon>
                        <span>{{ item }}</span>
                     </li>
                  </ul>
               </div>
            </div>
          </div>
        </div>
      </div>
      
       <!-- Additional Details & Reviews -->
      <div class="row mt-5 pt-5 border-top">
         <div class="col-12">
            <app-similar-products [currentModelNo]="product()!.modelNo + ''"></app-similar-products>
         </div>
      </div>

    </div>

    <ng-template #loadingTpl>
      <div class="d-flex flex-column justify-content-center align-items-center vh-100 gap-3">
        <mat-spinner diameter="50"></mat-spinner>
        <p class="text-muted">Hunting for the best deals...</p>
      </div>
    </ng-template>
   `,
   styles: [`
    .surface { background-color: var(--surface); }
    .bg-subtle-theme { background-color: var(--secondary-bg); }
    .text-highlight { color: var(--text-main); }
    .main-image-container { 
       transition: all 0.3s ease;
       border: 1px solid var(--border);
    }
    .thumbnail-wrapper {
      transition: all 0.2s ease;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 2px;
    }
    .thumbnail-wrapper.active { border: 2px solid var(--primary); padding: 1px; }
    
    .color-wrapper { cursor: pointer; transition: all 0.2s; }
    .color-swatch-ring {
       width: 44px;
       height: 44px;
       border: 2px solid transparent;
       border-radius: 50%;
       display: flex;
       align-items: center;
       justify-content: center;
    }
    .color-wrapper.active .color-swatch-ring { border-color: var(--primary); }
    .color-swatch { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border); }
    
    .size-btn {
      min-width: 54px;
      height: 48px;
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .size-btn.active { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

    .action-buttons button { height: 56px; font-weight: 600; border-radius: 8px; }
    .wishlist-btn { background: var(--surface); box-shadow: 0 2px 8px rgba(0,0,0,0.1); color: var(--text-secondary); }
    .wishlist-btn.active mat-icon { color: #f43f5e; font-variation-settings: 'FILL' 1; }

    .action-btn { transition: all 0.2s; border-radius: 8px; font-weight: 700 !important; }
    .action-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .add-to-cart { background: var(--surface); color: var(--primary); border: 2px solid var(--primary); }
    .add-to-cart:hover:not(:disabled) { background: var(--primary); color: white; }
    .buy-now { background: var(--primary); color: white; border: none; }
    
    /* Theme Buttons */
    .btn-theme { background-color: var(--text-main); color: var(--surface); border: 1px solid var(--text-main); }
    .btn-theme:hover { background-color: var(--primary); border-color: var(--primary); color: white; }
    
    .btn-outline-theme { background-color: transparent; color: var(--text-main); border: 1px solid var(--border); }
    .btn-outline-theme:hover { border-color: var(--text-main); }
   `]
})
export class ProductDetailPageComponent implements OnInit {
   private route = inject(ActivatedRoute);
   private router = inject(Router);
   private productService = inject(ProductService);
   private cartService = inject(CartService);
   public auth = inject(AuthService);
   private recentlyViewed = inject(RecentlyViewedService);
   private wishlistService = inject(WishlistService);
   private snackBar = inject(MatSnackBar);

   product = signal<Product | null>(null);
   variants = computed(() => this.product()?.variants || []);

   // Selection State
   selectedColor = signal<string | null>(null);
   selectedSize = signal<string | null>(null);
   mainImage = signal<string | null>(null);

   pincode = '';
   showSizeError = signal(false);

   // Computed State
   uniqueColors = computed(() => {
      const colors = new Set<string>();
      this.variants().forEach(v => colors.add(v.color));
      return Array.from(colors);
   });

   availableSizes = computed(() => {
      if (!this.selectedColor()) return [];
      return this.variants()
         .filter(v => v.color === this.selectedColor())
         .map(v => v.size)
         .sort(); // Add custom Sort logic if needed (S, M, L, XL)
   });

   currentVariant = computed(() => {
      if (!this.selectedColor() || !this.selectedSize()) return null;
      return this.variants().find(v => v.color === this.selectedColor() && v.size === this.selectedSize()) || null;
   });

   // If no specific size selected, get first variant of selected color for price/image
   displayVariant = computed(() => {
      if (!this.selectedColor()) return this.variants()[0] || null;
      // If size is selected, use exact variant
      if (this.selectedSize()) return this.currentVariant();
      // Else use first variant of that color
      return this.variants().find(v => v.color === this.selectedColor()) || null;
   });

   currentPrice = computed(() => this.displayVariant()?.price || this.product()?.price || 0);
   currentVariantImages = computed(() => this.displayVariant()?.images || []);

   currentMainImage = computed(() => {
      if (this.mainImage()) return this.mainImage();
      const imgs = this.currentVariantImages();
      if (imgs.length > 0) {
         return this.getFullPath(imgs[0]);
      }
      return 'assets/placeholder-shoe.png';
   });

   getFullPath(image: any): string {
      const product = this.product();
      if (!product) return 'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image';

      // Use direct image ID endpoint if available (Fixes variant image issue)
      if (image && typeof image === 'object' && image.id) {
         return `${environment.apiUrl}/images/${image.id}`;
      }

      // Legacy fallback: Try to map based on index if no ID (shouldn't happen with new backend)
      if (image && typeof image === 'object') {
         const currentVar = this.displayVariant();
         if (currentVar && currentVar.images) {
            const imageIndex = currentVar.images.findIndex((img: any) =>
               img.id === image.id || img.imageUrl === image.imageUrl
            );
            if (imageIndex !== -1) {
               // This legacy path might still be buggy for variants 2+, but we prefer ID above
               return `${environment.apiUrl}/images/product/${product.modelNo}/${imageIndex + 1}`;
            }
         }
      }

      // Final fallback
      return `${environment.apiUrl}/images/product/${product.modelNo}/1`;
   }

   averageRating = computed(() => this.product()?.averageRating || 0);

   isInWishlist = computed(() => {
      const p = this.product();
      return p ? this.wishlistService.isInWishlist(p.modelNo) : false;
   });

   constructor() {
      effect(() => {
         // Reset main image when variant changes (color change)
         const displayVar = this.displayVariant();
         if (displayVar && displayVar.images.length > 0) {
            this.mainImage.set(this.getFullPath(displayVar.images[0]));
         }
      }, { allowSignalWrites: true });
   }

   ngOnInit() {
      this.route.params.subscribe(params => {
         const modelNo = params['modelNo'];
         if (modelNo) {
            this.loadProduct(modelNo);
         }
      });

      this.route.queryParams.subscribe(params => {
         if (params['setupReview']) {
            // Simulate opening review modal
            setTimeout(() => {
               const rating = prompt('Rate this product (1-5):');
               const comment = prompt('Write your review:');
               if (rating && comment) {
                  this.snackBar.open('Review submitted successfully!', 'Close', { duration: 3000 });
               }
            }, 1000);
         }
      });
   }

   async loadProduct(modelNo: string) {
      try {
         const p = await this.productService.getProductByModelNo(modelNo);
         this.product.set(p);

         // Initialize selection
         if (p.variants && p.variants.length > 0) {
            const firstVar = p.variants[0];
            this.selectedColor.set(firstVar.color);
            // Verify this.mainImage initializes via effect
         }

         // Track view
         if (this.auth.user()) {
            this.recentlyViewed.addRecentlyViewed(p.modelNo);
         }
      } catch (err) {
         console.error(err);
         this.snackBar.open('Failed to load product', 'Close');
      }
   }

   getColorHex(colorName: string): string {
      // Ideally this comes from backend variants, 
      // but if `colorHex` is missing, map common names or use variant.colorHex
      const v = this.variants().find(v => v.color === colorName);
      return v?.colorHex || colorName;
   }

   selectColor(color: string) {
      this.selectedColor.set(color);
      this.selectedSize.set(null); // Reset size on colour change
   }

   selectSize(size: string) {
      this.selectedSize.set(size);
      this.showSizeError.set(false);
   }

   // We need to update the template to use getFullPath(img.imageUrl)
   // But we can't easily change template from here.
   // Instead, let's make a method accessible to template:

   setMainImage(image: any) {
      this.mainImage.set(this.getFullPath(image));
   }

   handleMainImageError() {
      console.warn('Failed to load product image:', this.currentMainImage());
      this.mainImage.set('https://placehold.co/600x600/e2e8f0/64748b?text=No+Image');
   }

   isOutOfStock(color: string, size: string): boolean {
      const v = this.variants().find(v => v.color === color && v.size === size);
      return v ? v.quantity === 0 : true;
   }

   async toggleWishlist() {
      if (!this.auth.user()) {
         this.router.navigate(['/login']);
         return;
      }
      const p = this.product();
      if (!p) return;

      if (this.isInWishlist()) {
         await this.wishlistService.removeFromWishlist(p.modelNo);
         this.snackBar.open('Removed from wishlist', 'Close', { duration: 2000 });
      } else {
         await this.wishlistService.addToWishlist(p.modelNo);
         this.snackBar.open('Added to wishlist', 'Close', { duration: 2000 });
      }
   }

   async handleAddToCart() {
      if (!this.auth.user()) {
         this.router.navigate(['/login']);
         return;
      }

      if (!this.selectedSize()) {
         this.showSizeError.set(true);
         return;
      }

      const v = this.currentVariant();
      if (!v || v.quantity === 0) {
         this.snackBar.open('Selected variant is out of stock', 'Close');
         return;
      }

      await this.cartService.addToCart(this.product()!.modelNo, 1, this.selectedSize()!, this.selectedColor()!);
      this.snackBar.open('Added to cart!', 'View Cart', { duration: 3000 })
         .onAction().subscribe(() => this.router.navigate(['/cart']));
   }

   async handleBuyNow() {
      if (!this.auth.user()) {
         this.router.navigate(['/login']);
         return;
      }

      if (!this.selectedSize()) {
         this.showSizeError.set(true);
         return;
      }

      const v = this.currentVariant();
      if (!v || v.quantity === 0) {
         this.snackBar.open('Out of stock', 'Close');
         return;
      }

      await this.cartService.addToCart(this.product()!.modelNo, 1, this.selectedSize()!, this.selectedColor()!);
      this.router.navigate(['/checkout']);
   }

   deliveryResponse = signal<any>(null);

   async checkPincode() {
      if (this.pincode.length === 6 && !isNaN(Number(this.pincode))) {
         try {
            const product = this.product();
            if (!product) return;
            const res = await this.productService.checkDelivery(product.modelNo, this.pincode);
            this.deliveryResponse.set(res);
         } catch (err) {
            this.snackBar.open('Failed to check pincode', 'Close');
         }
      } else {
         this.snackBar.open('Invalid pincode', 'Retry');
         this.deliveryResponse.set(null);
      }
   }

   isFlashSaleActive() {
      // Implement if backend provides flash sale flag in Product response
      return false;
   }
}
