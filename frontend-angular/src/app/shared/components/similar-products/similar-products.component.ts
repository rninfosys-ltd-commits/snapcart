import { Component, Input, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-similar-products',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
    templateUrl: './similar-products.component.html',
    styleUrls: ['./similar-products.component.scss']
})
export class SimilarProductsComponent implements OnChanges {
    private productService = inject(ProductService);
    private router = inject(Router);
    protected environment = environment;

    @Input({ required: true }) currentModelNo!: string;

    products = signal<any[]>([]);
    loading = signal(true);

    ngOnChanges(changes: SimpleChanges) {
        if (changes['currentModelNo'] && this.currentModelNo) {
            this.fetchSimilar();
        }
    }

    async fetchSimilar() {
        try {
            this.loading.set(true);
            const data = await this.productService.getSimilar(this.currentModelNo);
            this.products.set(data);
        } finally {
            this.loading.set(false);
        }
    }

    handleNavigate(modelNo: number | string) {
        this.router.navigate(['/products', modelNo]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    formatPrice(price: number) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    }
}
