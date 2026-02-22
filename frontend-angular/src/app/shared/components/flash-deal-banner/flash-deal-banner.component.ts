
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/models';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-flash-deal-banner',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './flash-deal-banner.component.html',
    styleUrls: ['./flash-deal-banner.component.scss']
})
export class FlashDealBannerComponent {
    @Input() product!: Product;
    @Output() shopNow = new EventEmitter<Product>();

    get primaryImage(): string {
        if (this.product.primaryImage) return this.product.primaryImage;
        if (this.product.variants && this.product.variants.length > 0) {
            const primary = this.product.variants[0].images.find(img => img.isPrimary);
            if (primary) return primary.imageUrl;
            if (this.product.variants[0].images.length > 0) return this.product.variants[0].images[0].imageUrl;
        }
        return 'assets/imagenotavailableplaceholder.png';
    }

    get discountPercentage(): number {
        if (this.product.discountPercentage) return this.product.discountPercentage;
        if (this.product.price && this.product.salePrice) {
            return Math.round(((this.product.price - this.product.salePrice) / this.product.price) * 100);
        }
        return 0;
    }

    onShopNow() {
        this.shopNow.emit(this.product);
    }
}
