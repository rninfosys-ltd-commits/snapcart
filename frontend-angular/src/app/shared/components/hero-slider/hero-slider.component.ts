import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, transition, style, animate, query, group, keyframes } from '@angular/animations';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-hero-slider',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
    templateUrl: './hero-slider.component.html',
    styleUrls: ['./hero-slider.component.scss'],
    animations: [
        trigger('slideAnimation', [
            transition(':enter', [
                style({ opacity: 0, scale: 1.1 }),
                animate('800ms ease-out', style({ opacity: 1, scale: 1 }))
            ]),
            transition(':leave', [
                animate('800ms ease-in', style({ opacity: 0 }))
            ])
        ]),
        trigger('contentAnimation', [
            transition('* => *', [
                query('.animate-text', [
                    style({ opacity: 0, transform: 'translateY(30px)' }),
                    animate('800ms 300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
                ], { optional: true })
            ])
        ])
    ]
})
export class HeroSliderComponent implements OnInit, OnDestroy {
    private productService = inject(ProductService);
    private router = inject(Router);
    protected environment = environment;

    products = signal<any[]>([]);
    currentIndex = signal(0);
    loading = signal(true);
    private timer: any;

    ngOnInit() {
        this.fetchData();
    }

    ngOnDestroy() {
        if (this.timer) clearInterval(this.timer);
    }

    async fetchData() {
        try {
            const featured = await this.productService.getFeatured();
            this.products.set(featured);

            if (featured.length > 1) {
                this.startAutoSlide();
            }
        } catch (error) {
            console.error('Error fetching hero data:', error);
        } finally {
            this.loading.set(false);
        }
    }

    // Keep helper for banner
    get featuredFlashDeal() {
        if (this.products().length > 0) return this.products()[0];
        return null;
    }

    startAutoSlide() {
        this.timer = setInterval(() => {
            this.currentIndex.update(prev => (prev + 1) % this.products().length);
        }, 5000);
    }

    handleShopNow(product: any) {
        this.router.navigate(['/products', product.modelNo]);
    }

    setIndex(index: number) {
        this.currentIndex.set(index);
        if (this.timer) clearInterval(this.timer);
        this.startAutoSlide();
    }

    get activeSideProduct() {
        return null;
    }

    getBannerImage(product: any): string {
        if (product.primaryImage) return product.primaryImage;
        if (product.variants && product.variants.length > 0) {
            const primary = product.variants[0].images.find((img: any) => img.isPrimary);
            if (primary) return primary.imageUrl;
            if (product.variants[0].images.length > 0) return product.variants[0].images[0].imageUrl;
        }
        return 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400';
    }

    getDiscount(product: any): number {
        if (product.discountPercentage) return product.discountPercentage;
        if (product.price && product.salePrice && product.salePrice < product.price) {
            return Math.round(((product.price - product.salePrice) / product.price) * 100);
        }
        return 0;
    }

    isFlashSale(product: any): boolean {
        return false;
    }

    formatCurrency(value: number) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    }
}
