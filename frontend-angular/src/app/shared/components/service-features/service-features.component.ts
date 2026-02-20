
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-service-features',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './service-features.component.html',
    styleUrls: ['./service-features.component.scss']
})
export class ServiceFeaturesComponent {
    features = [
        {
            icon: 'local_shipping',
            title: 'Free Shipping',
            description: 'On orders over ₹999'
        },
        {
            icon: 'payment',
            title: 'Secure Payment',
            description: '100% secure checkout'
        },
        {
            icon: 'sync',
            title: 'Easy Returns',
            description: '30-day return policy'
        },
        {
            icon: 'star',
            title: 'Premium Quality',
            description: 'Crafted with care'
        }
    ];
}
