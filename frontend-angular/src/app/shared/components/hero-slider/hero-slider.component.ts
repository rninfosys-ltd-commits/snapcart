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
        this.fetchFeatured();
    }

    ngOnDestroy() {
        if (this.timer) clearInterval(this.timer);
    }

    async fetchFeatured() {
        try {
            const data = await this.productService.getFeatured();
            this.products.set(data);
            if (data.length > 1) {
                this.startAutoSlide();
            }
        } finally {
            this.loading.set(false);
        }
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
        // Reset timer on manual change
        if (this.timer) clearInterval(this.timer);
        this.startAutoSlide();
    }

    formatCurrency(value: number) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    }
}
