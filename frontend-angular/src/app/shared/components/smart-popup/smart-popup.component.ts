import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SmartPopupService } from '../../../core/services/smart-popup.service';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductVariant } from '../../../core/models/models';
import { Subscription, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-smart-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './smart-popup.component.html',
  styleUrls: ['./smart-popup.component.css']
})
export class SmartPopupComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  isVisible = false;
  isTrending = false;
  isLowStock = false;
  isFlashDeal = false;
  private autoCloseSub: Subscription | null = null;

  constructor(
    private smartPopupService: SmartPopupService,
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Delay popup slightly to not overwhelm user immediately
    setTimeout(() => {
      this.loadPopupProduct();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.autoCloseSub) {
      this.autoCloseSub.unsubscribe();
    }
  }

  loadPopupProduct(): void {
    // Try to get flash sales first for the "Flash Deal Popup" feel
    this.productService.getFlashSales().then((flashSales: Product[]) => {
      if (flashSales && flashSales.length > 0) {
        // Find one not yet shown
        const deal = flashSales.find((p: Product) => !this.smartPopupService.wasShown(p.modelNo));
        if (deal) {
          this.product = deal;
          this.isFlashDeal = true;
          this.determineTags(deal);
          this.showPopup();
          return;
        }
      }

      // Fallback to general popup logic if no flash deals
      this.smartPopupService.getPopupProduct().subscribe({
        next: (product: Product) => {
          if (product && !this.smartPopupService.wasShown(product.modelNo)) {
            setTimeout(() => {
              this.product = product;
              this.isFlashDeal = false;
              this.determineTags(product);
              this.showPopup();
            });
          }
        }
      });
    });
  }

  determineTags(product: Product): void {
    this.isTrending = product.averageRating >= 4.5;
    this.isLowStock = product.variants?.some((v: ProductVariant) => v.quantity < 10) || false;

    if (this.isFlashDeal) {
      this.isTrending = false; // Flash deal is more important
    } else if (!this.isTrending && !this.isLowStock) {
      this.isTrending = true;
    }
  }

  showPopup(): void {
    this.isVisible = true;
    if (this.product) {
      this.smartPopupService.markAsShown(this.product.modelNo);
    }

    // Auto close after 10 seconds
    this.autoCloseSub = timer(10000).subscribe(() => {
      this.closePopup();
    });
  }

  closePopup(): void {
    this.isVisible = false;
    if (this.autoCloseSub) {
      this.autoCloseSub.unsubscribe();
    }
  }

  navigateToProduct(): void {
    if (this.product) {
      this.router.navigate(['/products', this.product.modelNo]);
      this.closePopup();
    }
  }

  getProductImage(): string {
    if (this.product && this.product.variants && this.product.variants.length > 0) {
      const variant = this.product.variants[0];
      if (variant.images && variant.images.length > 0) {
        const image = variant.images[0];
        if (typeof image === 'object' && image.id) {
          return `${environment.apiUrl}/images/${image.id}`;
        }
      }
      return `${environment.apiUrl}/images/product/${this.product.modelNo || 0}/1`;
    }
    return 'assets/placeholder-shoe.png';
  }
}
