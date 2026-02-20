import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-all-products',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, MatProgressSpinnerModule, MatIconModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header / Toolbar -->
      <div class="products-navbar">
        <div class="nav-left">
           <h1>All Products</h1>
           <span class="count-tag">{{ filteredProducts().length }} items</span>
        </div>
        
        <div class="nav-right">
          <div class="search-bar">
             <mat-icon>search</mat-icon>
             <input type="text" placeholder="Search product..." [(ngModel)]="searchQuery" (input)="filter()">
          </div>
          
          <div class="filter-group">
            <mat-icon class="filter-icon">filter_list</mat-icon>
            <select [(ngModel)]="selectedCategory" (change)="onCategoryChange()" class="cat-select">
              <option value="All">All Categories</option>
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
              <option value="KIDS">Kids</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="HOME_KITCHEN">Home & Kitchen</option>
              <option value="BEAUTY">Beauty</option>
              <option value="ACCESSORIES">Accessories</option>
              <option value="JEWELLERY">Jewellery</option>
              <option value="BAGS_FOOTWEAR">Bags & Footwear</option>
            </select>
          </div>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- Loading -->
        <div *ngIf="loading()" class="center-box">
          <mat-spinner diameter="50"></mat-spinner>
        </div>

        <!-- Empty -->
        <div *ngIf="!loading() && filteredProducts().length === 0" class="center-box">
          <mat-icon class="large-icon">sentiment_dissatisfied</mat-icon>
          <p>No products found matching your criteria.</p>
          <button class="reset-btn" (click)="resetFilters()">Reset Filters</button>
        </div>

        <!-- Grid -->
        <div class="products-grid" *ngIf="!loading() && filteredProducts().length > 0">
          <app-product-card *ngFor="let product of filteredProducts()" [product]="product"></app-product-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { min-height: 100vh; background-color: var(--background); }
    
    .products-navbar {
      background-color: var(--surface);
      color: var(--text-main);
      border-bottom: 1px solid var(--border);
      padding: 0 40px;
      height: 80px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 80px; /* Offset to sit below main navbar */
      z-index: 99;
      box-shadow: var(--shadow-sm);
    }
    
    .nav-left { display: flex; align-items: center; gap: 16px; }
    .nav-left h1 { font-size: 1.5rem; font-weight: 800; margin: 0; color: var(--text-main); letter-spacing: -0.5px; }
    .count-tag { 
      font-size: 11px; font-weight: 700; color: var(--primary); 
      background: var(--surface-low); padding: 4px 8px; border-radius: 6px; 
      text-transform: uppercase;
    }

    .nav-right { display: flex; align-items: center; gap: 20px; }
    
    .search-bar { 
      background: var(--surface-low); 
      border: 1px solid var(--border); 
      border-radius: 12px; 
      padding: 0 16px; 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      width: 350px;
      height: 44px;
      transition: all 0.3s;
    }
    .search-bar:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1); }
    .search-bar mat-icon { color: var(--text-muted); font-size: 20px; width: 20px; height: 20px; }
    .search-bar input { 
      border: none; outline: none; width: 100%; font-size: 0.95rem; background: transparent; color: var(--text-main);
    }

    .filter-group { display: flex; align-items: center; gap: 8px; }
    .filter-icon { color: var(--text-muted); font-size: 20px; width: 20px; height: 20px; }
    
    .cat-select {
      padding: 0 16px; 
      height: 44px;
      border-radius: 12px; 
      border: 1px solid var(--border); 
      background: var(--surface-low); 
      color: var(--text-main);
      font-size: 0.95rem; 
      outline: none; 
      cursor: pointer;
      min-width: 160px;
      transition: all 0.3s;
    }
    .cat-select:focus { border-color: var(--primary); }

    .content-wrapper { max-width: 1400px; margin: 0 auto; padding: 40px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 32px; }

    .center-box { 
      display: flex; flex-direction: column; align-items: center; justify-content: center; 
      padding: 100px 0; color: var(--text-secondary); text-align: center;
    }
    .large-icon { font-size: 80px; width: 80px; height: 80px; margin-bottom: 24px; color: var(--text-muted); opacity: 0.3; }
    
    .reset-btn { 
      background: var(--primary); color: white; border: none; padding: 12px 32px; 
      border-radius: 12px; margin-top: 24px; cursor: pointer; font-weight: 600;
      transition: transform 0.2s;
    }
    .reset-btn:hover { transform: scale(1.05); }

    @media (max-width: 900px) {
      .products-navbar { height: auto; padding: 20px; flex-direction: column; gap: 16px; }
      .search-bar { width: 100%; }
      .nav-right { width: 100%; justify-content: space-between; }
    }
  `]
})
export class AllProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  products: any[] = [];
  filteredProducts = signal<any[]>([]);
  loading = signal(true);

  searchQuery = '';
  selectedCategory = 'All';
  selectedSubcategory = '';

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const cat = params.get('cat');
      const subcat = params.get('subcategory');

      // Always reset if navigating
      this.selectedCategory = 'All';
      this.selectedSubcategory = '';

      if (cat) {
        this.selectedCategory = cat.toUpperCase();
      }
      if (subcat) {
        this.selectedSubcategory = subcat.toUpperCase();
      }

      this.loadProducts();
    });

    this.route.queryParams.subscribe(params => {
      if (params['search']) this.searchQuery = params['search'];
      if (params['category']) this.selectedCategory = params['category'];
      if (params['subcategory']) this.selectedSubcategory = params['subcategory'];
      // Only reload if search changed, otherwise paramMap handles category changes
      if (params['search']) this.loadProducts();
    });
  }

  async loadProducts() {
    try {
      // Always load all products from /api/products (same as React version)
      this.products = await this.productService.getAllProducts();
      console.log('Loaded products:', this.products.length);
      this.filter();
    } catch (error) {
      console.error('Error loading products:', error);
      this.products = [];
      this.filteredProducts.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  filter() {
    let res = this.products;

    // If search query exists, prioritize it and ignore category filters
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      res = res.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.brandName && p.brandName.toLowerCase().includes(q))
      );
    }
    // Only apply category/subcategory filters if NO search query
    else {
      // If both category and subcategory are specified, use AND logic
      if (this.selectedCategory !== 'All' && this.selectedSubcategory) {
        res = res.filter(p =>
          p.category && p.category.toUpperCase() === this.selectedCategory &&
          p.subCategory && p.subCategory.toUpperCase() === this.selectedSubcategory
        );
      }
      // If only category is specified
      else if (this.selectedCategory !== 'All') {
        res = res.filter(p => p.category && p.category.toUpperCase() === this.selectedCategory);
      }
      // If only subcategory is specified
      else if (this.selectedSubcategory) {
        res = res.filter(p => p.subCategory && p.subCategory.toUpperCase() === this.selectedSubcategory);
      }
    }

    console.log(`Filtering: Query="${this.searchQuery}", Cat="${this.selectedCategory}", Products=${this.products.length}, Result=${res.length}`);
    this.filteredProducts.set(res);
  }

  onCategoryChange() {
    // Navigate to update URL which will trigger loadProducts via paramMap
    if (this.selectedCategory && this.selectedCategory !== 'All') {
      this.router.navigate(['/cat', this.selectedCategory]);
    } else {
      this.router.navigate(['/products']);
    }
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.selectedSubcategory = '';
    this.router.navigate(['/products']);
  }
}
