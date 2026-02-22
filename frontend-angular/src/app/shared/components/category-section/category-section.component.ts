
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
    selector: 'app-category-section',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './category-section.component.html',
    styleUrls: ['./category-section.component.scss']
})
export class CategorySectionComponent implements OnInit {
    private productService = inject(ProductService);

    activeCategories = signal<string[]>([]);

    categoryMetadata: Record<string, { image: string, color: string }> = {
        'MEN': { image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=300', color: '#2a618a' },
        'WOMEN': { image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300', color: '#e91e63' },
        'KIDS': { image: 'https://images.unsplash.com/photo-1514095503000-bcfa6a44475c?w=300', color: '#4caf50' },
        'ELECTRONICS': { image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300', color: '#ff9800' },
        'HOME_KITCHEN': { image: 'https://images.unsplash.com/photo-1556911220-e150213ff167?w=300', color: '#795548' },
        'BEAUTY': { image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300', color: '#9c27b0' },
        'ACCESSORIES': { image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300', color: '#607d8b' },
        'JEWELLERY': { image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300', color: '#d4af37' },
        'BAGS_FOOTWEAR': { image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300', color: '#795548' }
    };

    ngOnInit() {
        this.loadCategories();
    }

    async loadCategories() {
        const categories = await this.productService.getActiveCategories();
        this.activeCategories.set(categories);
    }

    getDisplayCategories() {
        return this.activeCategories().map(cat => ({
            name: this.formatName(cat),
            image: this.categoryMetadata[cat]?.image || 'https://cdn-icons-png.flaticon.com/512/3050/3050239.png',
            link: `/cat/${cat}`,
            color: this.categoryMetadata[cat]?.color || '#666'
        }));
    }

    private formatName(cat: string): string {
        return cat.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
}
