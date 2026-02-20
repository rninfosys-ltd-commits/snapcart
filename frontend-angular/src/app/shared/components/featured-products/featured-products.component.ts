
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-featured-products',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: './featured-products.component.html',
    styleUrls: ['./featured-products.component.scss']
})
export class FeaturedProductsComponent implements OnInit {
    private productService = inject(ProductService);
    private router = inject(Router);
    protected environment = environment;

    products = signal<any[]>([]);
    loading = signal(true);

    async ngOnInit() {
        try {
            const data = await this.productService.getFeatured();
            // Take only top 4 for the featured section logic if needed, or display all
            this.products.set(data.slice(0, 4));
        } finally {
            this.loading.set(false);
        }
    }

    formatPrice(price: number) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    }

    navigateToProduct(modelNo: number | string) {
        this.router.navigate(['/products', modelNo]);
    }
}
