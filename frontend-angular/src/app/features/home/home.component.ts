import { Component, inject, signal, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSliderComponent } from '../../shared/components/hero-slider/hero-slider.component';
import { RecentlyViewedSectionComponent } from '../../shared/components/recently-viewed-section/recently-viewed-section.component';
import { CategorySectionComponent } from '../../shared/components/category-section/category-section.component';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSliderComponent,
    RecentlyViewedSectionComponent,
    CategorySectionComponent,
    ProductCardComponent,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private productService = inject(ProductService);
  private router = inject(Router);

  user = this.auth.user;
  randomProducts = signal<Product[]>([]);
  flashDeals = signal<Product[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  pageSize = signal(20);
  currentPage = signal(0);
  hasMore = signal(true);
  selectedCategory = signal<string>('All');

  // Computed signal for filtered products
  displayedProducts = computed(() => {
    const category = this.selectedCategory();
    const products = this.randomProducts();

    if (category === 'All') {
      return products;
    }

    return products.filter(p => p.category === category);
  });

  navigateToProduct(modelNo: number | string) {
    this.router.navigate(['/products', modelNo]);
  }

  filterByCategory(category: string) {
    this.selectedCategory.set(category);
  }

  constructor() {
    effect(() => {
      // removed role check, always load
      this.loadInitialData();
    });
  }

  ngOnInit() {
    // loadInitialData is handled by effect or manually if effect only runs on change
    // safest is to call it here once.
    this.loadInitialData();
    this.initScrollReveal();
  }

  private initScrollReveal() {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    // Wait for DOM to render
    setTimeout(() => {
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach(el => observer.observe(el));
    }, 100);
  }

  private checkRoleAccess(user: any): boolean {
    const roles = user.roles || [];
    if (roles.includes('ROLE_ADMIN')) {
      this.router.navigate(['/admin/dashboard']);
      return false;
    }
    if (roles.includes('ROLE_MODERATOR')) {
      this.router.navigate(['/moderator/dashboard']);
      return false;
    }
    return true;
  }

  async loadInitialData() {
    if (this.randomProducts().length > 0 && !this.loading()) return; // avoid double call

    this.loading.set(true);
    this.currentPage.set(0);
    try {
      const [pageData, flash] = await Promise.all([
        this.productService.getProductsPaginated(0, this.pageSize()),
        this.productService.getFlashSales()
      ]);
      this.randomProducts.set(pageData.content || []);
      this.flashDeals.set(flash);
      this.hasMore.set(!pageData.last && !pageData.empty);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadMore() {
    if (this.loadingMore() || !this.hasMore()) return;

    this.loadingMore.set(true);
    const nextPage = this.currentPage() + 1;
    try {
      const pageData = await this.productService.getProductsPaginated(nextPage, this.pageSize());
      if (pageData.content && pageData.content.length > 0) {
        this.randomProducts.update(current => [...current, ...pageData.content]);
        this.currentPage.set(nextPage);
        this.hasMore.set(!pageData.last);
      } else {
        this.hasMore.set(false);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      this.loadingMore.set(false);
    }
  }
}
