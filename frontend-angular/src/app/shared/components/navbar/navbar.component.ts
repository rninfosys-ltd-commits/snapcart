import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';


// Shared Components
import { SearchDropdownComponent } from '../search-dropdown/search-dropdown.component';
import { AnimatedCartCounterComponent } from '../animated-cart-counter/animated-cart-counter.component';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatBadgeModule,
        MatTooltipModule,
        MatDividerModule,
        SearchDropdownComponent,
        AnimatedCartCounterComponent

    ],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
    private auth = inject(AuthService);
    private wishlist = inject(WishlistService);
    private router = inject(Router);

    // Expose to template
    user = this.auth.user; // Assuming user is available in AuthService
    primaryRole = this.auth.primaryRole;
    wishlistCount = this.wishlist.wishlistCount;

    hoveredCategory = signal<string | null>(null);
    moreDropdownOpen = signal(false);

    setHovered(category: string | null) {
        this.hoveredCategory.set(category);
    }

    setMoreOpen(open: boolean) {
        this.moreDropdownOpen.set(open);
    }

    // Mobile Menu Logic
    isMobileMenuOpen = signal(false);
    mobileCategoryExpanded = signal<string | null>(null);

    toggleMobileMenu() {
        this.isMobileMenuOpen.update(v => !v);
    }

    toggleMobileCategory(category: string) {
        this.mobileCategoryExpanded.update(v => v === category ? null : category);
    }

    logout() {
        this.auth.logout();
        this.router.navigate(['/login']);
        this.isMobileMenuOpen.set(false);
    }

    handleLogoClick(event: Event) {
        event.preventDefault();
        // Logic from React: check roles or go to /
        this.router.navigate(['/']);
    }

    categories = [
        'MEN', 'WOMEN', 'KIDS', 'ELECTRONICS',
        'HOME_KITCHEN', 'BEAUTY', 'ACCESSORIES',
        'JEWELLERY', 'BAGS_FOOTWEAR'
    ];

    mainCategories = [
        'MEN', 'WOMEN', 'KIDS', 'ELECTRONICS',
        'HOME_KITCHEN', 'BEAUTY'
    ];

    moreCategories = [
        'ACCESSORIES', 'JEWELLERY', 'BAGS_FOOTWEAR'
    ];

    getCategoryPath(category: string): string {
        return `/cat/${category}`;
    }

    getCategoryLabel(category: string): string {
        return category.replace(/_/g, ' ');
    }
}
