import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecentlyViewedService } from '../../../core/services/recently-viewed.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-recently-viewed-section',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
    templateUrl: './recently-viewed-section.component.html',
    styleUrls: ['./recently-viewed-section.component.scss']
})
export class RecentlyViewedSectionComponent {
    private recentlyViewedService = inject(RecentlyViewedService);
    private router = inject(Router);
    private auth = inject(AuthService);

    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    items = signal<any[]>([]);

    ngOnInit() {
        if (this.auth.user()) {
            this.loadRecentlyViewed();
        }
    }

    async loadRecentlyViewed() {
        const products = await this.recentlyViewedService.getRecentlyViewed();
        this.items.set(products);
    }

    scroll(direction: 'left' | 'right') {
        if (this.scrollContainer) {
            const scrollAmount = 300;
            this.scrollContainer.nativeElement.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    handleNavigate(modelNo: number | string) {
        this.router.navigate(['/products', modelNo]);
    }

    formatPrice(price: number) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    }

    getProductImage(product: any): string {
        // Use the same approach as product-card component
        return `${environment.apiUrl}/images/product/${product.modelNo}/1`;
    }
}
