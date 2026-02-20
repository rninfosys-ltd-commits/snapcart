import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HeroSliderComponent } from '../../shared/components/hero-slider/hero-slider.component';
import { FlashSaleSectionComponent } from '../../shared/components/flash-sale-section/flash-sale-section.component';
import { ServiceFeaturesComponent } from '../../shared/components/service-features/service-features.component';
import { RecommendedSectionComponent } from '../../shared/components/recommended-section/recommended-section.component';
import { RecentlyViewedSectionComponent } from '../../shared/components/recently-viewed-section/recently-viewed-section.component';
import { CategorySectionComponent } from '../../shared/components/category-section/category-section.component';
import { FeaturedProductsComponent } from '../../shared/components/featured-products/featured-products.component';
import { CtaSectionComponent } from '../../shared/components/cta-section/cta-section.component';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [
        CommonModule,
        HeroSliderComponent,
        FlashSaleSectionComponent,
        ServiceFeaturesComponent,
        RecommendedSectionComponent,
        RecentlyViewedSectionComponent,
        CategorySectionComponent,
        FeaturedProductsComponent,
        CtaSectionComponent
    ],
    template: `
    <main class="landing-page" style="background-color: #f8fafc; min-height: 100vh;">
      <app-hero-slider></app-hero-slider>
      <app-flash-sale-section></app-flash-sale-section>
      <app-service-features></app-service-features>
      <app-recommended-section></app-recommended-section>
      <app-recently-viewed-section></app-recently-viewed-section>
      <app-category-section></app-category-section>
      <app-featured-products></app-featured-products>
      <app-cta-section></app-cta-section>
    </main>
  `
})
export class LandingPageComponent implements OnInit {
    private auth = inject(AuthService);
    private router = inject(Router);

    constructor() {
        effect(() => {
            const user = this.auth.user();
            if (user) {
                this.handleRoleRedirection(user);
            }
        });
    }

    ngOnInit(): void {
        const user = this.auth.user();
        if (user) {
            this.handleRoleRedirection(user);
        }
    }

    private handleRoleRedirection(user: any): void {
        const roles = user.roles || [];
        if (roles.includes('ROLE_SUPER_ADMIN')) {
            this.router.navigate(['/super-admin/dashboard']);
        } else if (roles.includes('ROLE_ADMIN')) {
            this.router.navigate(['/admin/dashboard']);
        } else if (roles.includes('ROLE_MODERATOR')) {
            this.router.navigate(['/moderator/dashboard']);
        } else {
            this.router.navigate(['/home']);
        }
    }
}
