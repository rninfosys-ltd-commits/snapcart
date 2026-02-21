import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-procure-inventory',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatSnackBarModule,
        MatCardModule,
        RouterModule
    ],
    template: `
    <div class="procure-container">
      <div class="header">
        <h1>Procure Inventory</h1>
        <p class="subtitle">Browse platform-master catalog to stock your shop</p>
      </div>

      <div class="catalog-grid" *ngIf="catalog().length > 0; else emptyTpl">
        <mat-card *ngFor="let product of catalog()" class="item-card">
          <img [src]="environment.apiUrl + '/images/product/' + product.modelNo + '/1'" 
               class="product-img" (error)="$any($event.target).src='assets/placeholder.png'">
          
          <mat-card-content class="card-body">
            <h3 class="product-name">{{product.name}}</h3>
            <p class="variant-count">{{product.variants?.length || 0}} Variants Available</p>
            
            <div class="variants-list">
              <div *ngFor="let variant of product.variants" class="variant-row">
                <div class="variant-info">
                  <span class="color-dot" [style.background-color]="variant.colorHex"></span>
                  <span class="v-details">{{variant.color}} / {{variant.size}}</span>
                </div>
                <div class="order-action">
                  <input type="number" [(ngModel)]="quantities[variant.id]" min="0" placeholder="Qty" class="qty-input">
                </div>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions class="card-footer">
            <button mat-flat-button color="primary" [disabled]="!hasItems(product)" (click)="buyForStore(product)">
              <mat-icon>shopping_cart</mat-icon> Add to My Stock
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <ng-template #emptyTpl>
        <div class="empty-state">
          <mat-icon>inventory_2</mat-icon>
          <h3>No Master Products Available</h3>
          <p>The platform administrator hasn't added any supply products yet.</p>
        </div>
      </ng-template>
    </div>
  `,
    styles: [`
    .procure-container { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
    .header { margin-bottom: 40px; }
    h1 { font-weight: 800; font-size: 32px; margin: 0; }
    .subtitle { color: var(--text-secondary); margin-top: 5px; }

    .catalog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .item-card {
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .item-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); }

    .product-img { width: 100%; height: 200px; object-fit: cover; }
    .card-body { padding: 20px !important; }
    .product-name { font-weight: 700; font-size: 18px; margin-bottom: 5px; }
    .variant-count { font-size: 12px; color: var(--primary); font-weight: 600; text-transform: uppercase; }

    .variants-list { margin-top: 15px; display: flex; flex-direction: column; gap: 10px; }
    .variant-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--surface-low); border-radius: 8px; }
    .variant-info { display: flex; align-items: center; gap: 8px; }
    .color-dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }
    .v-details { font-size: 13px; font-weight: 500; }

    .qty-input {
      width: 60px;
      height: 32px;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0 8px;
      font-size: 13px;
      text-align: center;
    }

    .card-footer { padding: 15px 20px !important; border-top: 1px solid var(--border); }
    .card-footer button { width: 100%; }

    .empty-state { text-align: center; padding: 100px 0; color: var(--text-muted); }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 20px; }
  `]
})
export class ProcureInventoryComponent implements OnInit {
    private productService = inject(ProductService);
    private snackBar = inject(MatSnackBar);
    protected environment = environment;

    catalog = signal<any[]>([]);
    quantities: { [key: number]: number } = {};

    ngOnInit() {
        this.loadCatalog();
    }

    async loadCatalog() {
        try {
            const data = await this.productService.getMasterCatalog();
            this.catalog.set(data);
        } catch (err) {
            this.snackBar.open('Failed to load master catalog', 'Close');
        }
    }

    hasItems(product: any): boolean {
        return product.variants.some((v: any) => this.quantities[v.id] && this.quantities[v.id] > 0);
    }

    async buyForStore(product: any) {
        const itemsToBuy = product.variants
            .filter((v: any) => this.quantities[v.id] && this.quantities[v.id] > 0)
            .map((v: any) => ({
                variantId: v.id,
                quantity: this.quantities[v.id]
            }));

        if (itemsToBuy.length === 0) return;

        try {
            await this.productService.placeProcurementOrder(itemsToBuy);
            this.snackBar.open(`Procured ${itemsToBuy.length} items for your store!`, 'Close', { duration: 3000 });

            // Clear quantities
            itemsToBuy.forEach((item: any) => this.quantities[item.variantId] = 0);
        } catch (err) {
            this.snackBar.open('Procurement failed. Please try again.', 'Close');
        }
    }
}
