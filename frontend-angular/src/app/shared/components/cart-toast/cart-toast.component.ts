import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';
import { environment } from '../../../../environments/environment';

export interface CartToastData {
  type: 'success' | 'error' | 'info';
  message: string;
  product?: any;
  onViewCart?: () => void;
}

@Component({
  selector: 'app-cart-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="toast-container" [class]="data.type" @toastAnim>
      <div class="toast-header d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <mat-icon class="status-icon me-2">{{ getIcon() }}</mat-icon>
          <span class="fw-bold">{{ getTitle() }}</span>
        </div>
        <button mat-icon-button class="close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="toast-body p-3">
        <div class="d-flex align-items-center">
          @if (data.product) {
            <img [src]="environment.apiUrl + '/images/product/' + (data.product.modelNo || data.product.id) + '/1'" class="rounded me-3" style="width: 50px; height: 50px; object-fit: contain;" (error)="$any($event.target).style.display='none'">
            <div class="flex-grow-1 overflow-hidden">
              <h6 class="mb-1 text-truncate">{{ data.product.name }}</h6>
              <p class="mb-0 small opacity-75">{{ data.message }}</p>
            </div>
          } @else {
            <p class="mb-0">{{ data.message }}</p>
          }
        </div>

        @if (data.type === 'success' && data.onViewCart) {
          <div class="d-flex gap-2 mt-3">
            <button mat-stroked-button color="primary" class="flex-grow-1 btn-sm" (click)="close()">
              Continue
            </button>
            <button mat-flat-button color="primary" class="flex-grow-1 btn-sm" (click)="viewCart()">
              View Cart
            </button>
          </div>
        }
      </div>
      
      <div class="progress-bar" [style.animation-duration.ms]="4000"></div>
    </div>
  `,
  styles: [`
    .toast-container {
      background: var(--surface);
      color: var(--text);
      min-width: 300px;
      max-width: 400px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      border: 1px solid var(--border);
    }

    .toast-header {
      padding: 8px 16px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      
      &.success { background: #e6fcf5; color: #087f5b; .status-icon { color: #087f5b; } }
      &.error { background: #fff5f5; color: #c92a2a; .status-icon { color: #c92a2a; } }
    }

    .toast-container.success { border-left: 4px solid #087f5b; }
    .toast-container.error { border-left: 4px solid #c92a2a; }

    .status-icon { font-size: 20px; width: 20px; height: 20px; }
    .close-btn { width: 32px; height: 32px; line-height: 32px; mat-icon { font-size: 18px; } }

    .progress-bar {
      height: 3px;
      background: #e63946;
      width: 100%;
      animation: progress linear forwards;
    }

    @keyframes progress { from { width: 100%; } to { width: 0%; } }
  `],
  animations: [
    trigger('toastAnim', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class CartToastComponent {
  protected environment = environment;
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: CartToastData,
    private snackBarRef: MatSnackBarRef<CartToastComponent>
  ) { }

  getIcon() {
    switch (this.data.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      default: return 'info';
    }
  }

  getTitle() {
    switch (this.data.type) {
      case 'success': return 'Added to Boutique Cart';
      case 'error': return 'Cart Update Error';
      default: return 'Boutique Notification';
    }
  }

  close() { this.snackBarRef.dismiss(); }

  viewCart() {
    if (this.data.onViewCart) this.data.onViewCart();
    this.close();
  }
}
