import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { trigger, transition, style, animate } from '@angular/animations';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-flash-sale-section',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
    templateUrl: './flash-sale-section.component.html',
    styleUrls: ['./flash-sale-section.component.scss'],
    animations: [
        trigger('cardHover', [
            transition(':enter', [
                style({ opacity: 0, scale: 0.9 }),
                animate('400ms ease-out', style({ opacity: 1, scale: 1 }))
            ])
        ])
    ]
})
export class FlashSaleSectionComponent implements OnInit, OnDestroy {
    private productService = inject(ProductService);
    private router = inject(Router);
    protected environment = environment;

    products = signal<any[]>([]);
    timeLeft = signal({ hours: 0, minutes: 0, seconds: 0 });
    private timer: any;

    ngOnInit() {
        this.fetchFlashSales();
    }

    ngOnDestroy() {
        if (this.timer) clearInterval(this.timer);
    }

    async fetchFlashSales() {
        const data = await this.productService.getFlashSales();
        this.products.set(data);

        // Find the earliest end time
        if (data && data.length > 0) {
            const endTimes = data
                .map(p => {
                    // Check variants for sale time
                    const v = p.variants?.find((v: any) => v.saleEndTime);
                    return v?.saleEndTime ? new Date(v.saleEndTime).getTime() : 0;
                })
                .filter(t => t > Date.now());

            if (endTimes.length > 0) {
                const earliestEnd = Math.min(...endTimes);
                this.startCountdown(new Date(earliestEnd));
            } else {
                // Fallback to end of day if no end times or all passed
                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999);
                this.startCountdown(endOfDay);
            }
        }
    }

    startCountdown(endTime: Date) {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            const now = new Date().getTime();
            const diff = endTime.getTime() - now;

            if (diff > 0) {
                this.timeLeft.set({
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60)
                });
            } else {
                this.timeLeft.set({ hours: 0, minutes: 0, seconds: 0 });
                clearInterval(this.timer);
            }
        }, 1000);
    }

    handleNavigate(modelNo: number | string) {
        this.router.navigate(['/products', modelNo]);
    }

    calculateDiscount(original: number, sale: number) {
        if (!sale) return 20;
        return Math.round(((original - sale) / original) * 100);
    }

    formatCurrency(value: number) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    }
}
