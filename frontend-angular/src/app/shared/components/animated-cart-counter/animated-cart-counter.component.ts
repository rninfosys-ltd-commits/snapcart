import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { trigger, transition, style, animate, keyframes, group } from '@angular/animations';
import { CartService } from '../../../core/services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-animated-cart-counter',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatBadgeModule],
  template: `
    <div class="cart-container" (click)="navigate()" [attr.data-count]="cartCount()">
      <div [@cartIconAnim]="isAnimating()" class="icon-wrapper">
        <mat-icon>shopping_bag</mat-icon>
      </div>
      
      @if (cartCount() > 0) {
        <span class="badge-pill" [@badgeAnim]="cartCount()">
          <span class="count-text" [@countTextAnim]="cartCount()">{{ cartCount() }}</span>
        </span>
      }

      <!-- Pulse Effect -->
      @if (isAnimating()) {
        <div class="pulse-ring" [@pulseAnim]></div>
      }
    </div>
  `,
  styles: [`
    .cart-container {
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      transition: transform 0.2s ease-in-out;
    }
    .cart-container:hover {
      transform: scale(1.1);
    }
    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: inherit;
    }
    .badge-pill {
      position: absolute;
      top: 0;
      right: -5px;
      background-color: #e63946;
      color: white;
      border-radius: 50%;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: bold;
      padding: 0 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 10;
    }
    .count-text {
      display: inline-block;
    }
    .pulse-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
      border: 2px solid #e63946;
      border-radius: 50%;
      pointer-events: none;
      z-index: 5;
    }
  `],
  animations: [
    trigger('cartIconAnim', [
      transition('false => true', [
        animate('600ms', keyframes([
          style({ transform: 'rotate(0) scale(1)', offset: 0 }),
          style({ transform: 'rotate(-10deg) scale(1.1)', offset: 0.2 }),
          style({ transform: 'rotate(10deg) scale(1.1)', offset: 0.4 }),
          style({ transform: 'rotate(-10deg) scale(1.1)', offset: 0.6 }),
          style({ transform: 'rotate(0) scale(1)', offset: 1.0 })
        ]))
      ])
    ]),
    trigger('badgeAnim', [
      transition('* => *', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    trigger('countTextAnim', [
      transition('* => *', [
        animate('200ms', keyframes([
          style({ transform: 'translateY(-10px)', opacity: 0, offset: 0 }),
          style({ transform: 'translateY(0)', opacity: 1, offset: 1.0 })
        ]))
      ])
    ]),
    trigger('pulseAnim', [
      transition(':enter', [
        style({ transform: 'translate(-50%, -50%) scale(0)', opacity: 0.8 }),
        animate('600ms ease-out', style({ transform: 'translate(-50%, -50%) scale(2)', opacity: 0 }))
      ])
    ])
  ]
})
export class AnimatedCartCounterComponent {
  private cartService = inject(CartService);
  private router = inject(Router);

  cartCount = this.cartService.cartCount;
  isAnimating = signal(false);
  private prevCount = -1; // Initialize with -1 to trigger on first render if count > 0

  constructor() {
    effect(() => {
      const count = this.cartCount();
      if (this.prevCount !== -1 && count !== this.prevCount) {
        this.triggerAnimation();
      }
      this.prevCount = count;
    });
  }

  private triggerAnimation() {
    this.isAnimating.set(true);
    setTimeout(() => {
      this.isAnimating.set(false);
    }, 600);
  }

  navigate() {
    this.router.navigate(['/cart']);
  }
}
