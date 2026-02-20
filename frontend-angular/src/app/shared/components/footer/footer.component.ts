import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatDividerModule],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})
export class FooterComponent {
    showContact = false;

    shopLinks = [
        { name: 'Men', path: '/cat/MEN' },
        { name: 'Women', path: '/cat/WOMEN' },
        { name: 'Kids', path: '/cat/KIDS' },
        { name: 'Electronics', path: '/cat/ELECTRONICS' },
        { name: 'Home & Kitchen', path: '/cat/HOME_KITCHEN' },
        { name: 'Beauty', path: '/cat/BEAUTY' },
        { name: 'Accessories', path: '/cat/ACCESSORIES' },
        { name: 'Jewellery', path: '/cat/JEWELLERY' },
        { name: 'Bags & Footwear', path: '/cat/BAGS_FOOTWEAR' }
    ];
    helpLinks = ['Contact Us', 'FAQs', 'Shipping', 'Returns'];

    socialIcons = [
        { name: 'facebook', url: '#' },
        { name: 'twitter', url: '#' },
        { name: 'youtube', url: '#' },
        { name: 'instagram', url: '#' }
    ];

    footerLinks = ['Return', 'Terms and Conditions', 'Privacy Policy'];

    toggleContact(): void {
        this.showContact = !this.showContact;
    }
}
