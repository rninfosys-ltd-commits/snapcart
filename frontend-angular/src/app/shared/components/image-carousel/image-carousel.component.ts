import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-image-carousel',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: './image-carousel.component.html',
    styleUrls: ['./image-carousel.component.scss'],
    animations: [
        trigger('slideAnimation', [
            transition(':increment', [
                group([
                    query(':enter', [
                        style({ transform: 'translateX(100%)', opacity: 0 }),
                        animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
                    ], { optional: true }),
                    query(':leave', [
                        animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'translateX(-100%)', opacity: 0 }))
                    ], { optional: true })
                ])
            ]),
            transition(':decrement', [
                group([
                    query(':enter', [
                        style({ transform: 'translateX(-100%)', opacity: 0 }),
                        animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
                    ], { optional: true }),
                    query(':leave', [
                        animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'translateX(100%)', opacity: 0 }))
                    ], { optional: true })
                ])
            ])
        ])
    ]
})
export class ImageCarouselComponent implements OnInit, OnDestroy {
    carouselImages = [
        {
            src: "https://redtape.com/cdn/shop/files/1600x900_1700x.jpg?v=1743666355",
            alt: "Slide 1",
        },
        {
            src: "https://redtape.com/cdn/shop/files/APPAREL-1600x900_1700x_7bde42c0-69fb-460c-a0ea-0474f204dec5_1700x.webp?v=1741691113",
            alt: "Slide 2",
        },
        {
            src: "https://redtape.com/cdn/shop/files/PERFUME.CAP-1600x900_1700x_9b1fc2b3-fdfc-4e3d-81e4-458cb5e16808_1700x.webp?v=1741691256",
            alt: "Slide 3",
        },
    ];

    currentIndex = signal(0);
    private intervalId: any;

    ngOnInit() {
        this.startAutoSlide();
    }

    ngOnDestroy() {
        this.stopAutoSlide();
    }

    next() {
        this.currentIndex.update(i => (i + 1) % this.carouselImages.length);
        this.resetAutoSlide();
    }

    prev() {
        this.currentIndex.update(i => (i - 1 + this.carouselImages.length) % this.carouselImages.length);
        this.resetAutoSlide();
    }

    private startAutoSlide() {
        this.intervalId = setInterval(() => {
            this.currentIndex.update(i => (i + 1) % this.carouselImages.length);
        }, 5000);
    }

    private stopAutoSlide() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    private resetAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    }
}
