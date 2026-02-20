import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-moderator-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    RouterModule
  ],
  template: `
    <div class="inventory-container">
      <div class="header">
        <h1>My Products</h1>
        <div>
          <button mat-button color="primary" routerLink="/moderator/dashboard" style="margin-right: 10px;">
            <mat-icon>arrow_back</mat-icon> Back to Dashboard
          </button>
          <button mat-flat-button color="primary" (click)="refresh()">
            <mat-icon>refresh</mat-icon> Refresh
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-row">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search by Name</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="searchQuery" (input)="filterProducts()">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="selectedCategory" (selectionChange)="filterProducts()">
            <mat-option value="">All Categories</mat-option>
            <mat-option value="MEN">Men</mat-option>
            <mat-option value="WOMEN">Women</mat-option>
            <mat-option value="KIDS">Kids</mat-option>
            <mat-option value="ELECTRONICS">Electronics</mat-option>
            <mat-option value="HOME_KITCHEN">Home & Kitchen</mat-option>
            <mat-option value="BEAUTY">Beauty</mat-option>
            <mat-option value="ACCESSORIES">Accessories</mat-option>
            <mat-option value="JEWELLERY">Jewellery</mat-option>
            <mat-option value="BAGS_FOOTWEAR">Bags & Footwear</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Table -->
      <table mat-table [dataSource]="filteredProducts()" class="mat-elevation-z2">
        <ng-container matColumnDef="product">
          <th mat-header-cell *matHeaderCellDef> Product </th>
          <td mat-cell *matCellDef="let element">
            <div class="product-cell">
              <img [src]="environment.apiUrl + '/images/product/' + (element.modelNo || element.id) + '/1'" class="thumb" alt="{{element.name}}"
                   (error)="$any($event.target).style.display='none'">
              <div class="info">
                <span class="name">{{element.name}}</span>
                <span class="model">#{{element.modelNo || element.id}}</span>
              </div>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef> Category </th>
          <td mat-cell *matCellDef="let element">
            <mat-chip>{{element.category}}</mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef> Price </th>
          <td mat-cell *matCellDef="let element">
            <span class="price">₹{{element.price?.toLocaleString()}}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="qty">
          <th mat-header-cell *matHeaderCellDef> Qty </th>
          <td mat-cell *matCellDef="let element">
            <span class="stock-badge" [class.zero]="element.quantity === 0" [class.low]="element.quantity > 0 && element.quantity < 10">
              {{element.quantity}}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Actions </th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button color="primary" (click)="editProduct(element)">
              <mat-icon>edit</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" [attr.colspan]="displayedColumns.length">
            <div class="no-data">
              <mat-icon>inventory</mat-icon>
              <p>No products found</p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `,
  styles: [`
    .inventory-container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    h1 { font-weight: 700; margin: 0; color: var(--text-main); }
    
    .filters-row { 
      display: grid; 
      grid-template-columns: 2fr 1fr; 
      gap: 15px; 
      margin-bottom: 30px; 
      background: var(--surface);
      padding: 20px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    
    .product-cell { display: flex; align-items: center; gap: 15px; }
    .thumb { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border); background: var(--surface-low); }
    .info { display: flex; flex-direction: column; }
    .name { font-weight: 600; font-size: 14px; color: var(--text-main); }
    .model { font-size: 12px; color: var(--text-secondary); }
    
    .price { font-weight: 700; color: #e63946; font-size: 16px; }
    
    .stock-badge { font-weight: 700; font-size: 16px; color: #10b981; }
    .stock-badge.low { color: #f59e0b; }
    .stock-badge.zero { color: #ef4444; }
    
    mat-chip { background: var(--surface-low) !important; color: var(--text-main) !important; border: 1px solid var(--border) !important; }
    
    table { width: 100%; border-radius: 8px; overflow: hidden; background: var(--surface); border: 1px solid var(--border); }
    
    .no-data { text-align: center; padding: 40px; color: var(--text-muted); }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 10px; }

    ::ng-deep .mat-mdc-header-cell {
      background: var(--surface-low) !important;
      color: var(--text-main) !important;
      font-weight: 600 !important;
    }

    ::ng-deep .mat-mdc-cell {
      color: var(--text-secondary) !important;
      border-bottom-color: var(--border) !important;
    }
  `]
})
export class ModeratorInventoryComponent implements OnInit {
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  protected environment = environment;

  allProducts: any[] = [];
  filteredProducts = signal<any[]>([]);

  searchQuery = '';
  selectedCategory = '';

  displayedColumns = ['product', 'category', 'price', 'qty', 'actions'];

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.productService.getModeratorProducts().then(products => {
      this.allProducts = products;
      this.filterProducts();
    });
  }

  filterProducts() {
    let temp = [...this.allProducts];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      temp = temp.filter(p => p.name?.toLowerCase().includes(q) || p.modelNo?.toString().includes(q));
    }

    if (this.selectedCategory) {
      temp = temp.filter(p => p.category === this.selectedCategory);
    }

    this.filteredProducts.set(temp);
  }

  editProduct(product: any) {
    this.router.navigate(['/moderator/edit-product', product.modelNo]);
  }
}
