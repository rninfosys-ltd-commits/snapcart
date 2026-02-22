import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProductService } from '../../../core/services/product.service';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatDividerModule],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
    private sanitizer = inject(DomSanitizer);
    private productService = inject(ProductService);

    showContact = false;
    shopLinks = signal<{ name: string, path: string }[]>([]);
    helpLinks = ['Contact Us', 'FAQs', 'Shipping', 'Returns'];

    async ngOnInit() {
        try {
            const categories = await this.productService.getActiveCategories();
            this.shopLinks.set(categories.map(cat => ({
                name: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase(),
                path: `/cat/${cat}`
            })));
        } catch (err) {
            console.error('Failed to load active categories for footer', err);
        }
    }

    socialIcons = [
        { name: 'facebook', url: '#' },
        { name: 'twitter', url: '#' },
        { name: 'youtube', url: '#' },
        { name: 'instagram', url: '#' }
    ];

    getSocialIcon(name: string): SafeHtml {
        const icons: { [key: string]: string } = {
            facebook: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>',
            twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>',
            youtube: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2c.46-1.7.46-5.33.46-5.33s0-3.63-.46-5.33zM9.75 15.02V8.48L15.45 11.75l-5.7 3.27z"></path></svg>',
            instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>'
        };
        return this.sanitizer.bypassSecurityTrustHtml(icons[name] || '');
    }

    footerLinks = ['Return', 'Terms and Conditions', 'Privacy Policy'];

    toggleContact(): void {
        this.showContact = !this.showContact;
    }
}
