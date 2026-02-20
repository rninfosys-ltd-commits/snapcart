import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { trigger, transition, style, animate } from '@angular/animations';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-recommended-section',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
    templateUrl: './recommended-section.component.html',
    styleUrls: ['./recommended-section.component.scss'],
    animations: [
        trigger('fadeInScale', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95)' }),
                animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
            ])
        ])
    ]
})
export class RecommendedSectionComponent implements OnInit {
    private productService = inject(ProductService);
    private auth = inject(AuthService);
    private router = inject(Router);
    protected environment = environment;

    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    products = signal<any[]>([]);
    loading = signal(true);
    currentUser = this.auth.user;

    ngOnInit() {
        this.fetchRecommendations();
    }

    async fetchRecommendations() {
        try {
            const data = await this.productService.getRecommendations();
            this.products.set(data);
        } finally {
            this.loading.set(false);
        }
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
}
