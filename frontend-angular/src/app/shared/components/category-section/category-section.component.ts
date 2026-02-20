
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-category-section',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './category-section.component.html',
    styleUrls: ['./category-section.component.scss']
})
export class CategorySectionComponent {
    categories = [
        {
            name: 'Men',
            image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=300',
            count: '500+ Styles',
            link: '/cat/MEN',
            color: '#2a618a'
        },
        {
            name: 'Women',
            image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300',
            count: '800+ Styles',
            link: '/cat/WOMEN',
            color: '#e91e63'
        },
        {
            name: 'Kids',
            image: 'https://images.unsplash.com/photo-1514095503000-bcfa6a44475c?w=300',
            count: '300+ Styles',
            link: '/cat/KIDS',
            color: '#4caf50'
        },
        {
            name: 'Electronics',
            image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300',
            count: '150+ Gadgets',
            link: '/cat/ELECTRONICS',
            color: '#ff9800'
        },
        {
            name: 'Home & Kitchen',
            image: 'https://images.unsplash.com/photo-1556911220-e150213ff167?w=300',
            count: '200+ Items',
            link: '/cat/HOME_KITCHEN',
            color: '#795548'
        },
        {
            name: 'Beauty',
            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300',
            count: '100+ Products',
            link: '/cat/BEAUTY',
            color: '#9c27b0'
        }
    ];
}
