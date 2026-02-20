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
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { EditProductDialogComponent } from './edit-product-dialog.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-inventory',
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
        <h1>Product Management</h1>
        <div>
          <button mat-button color="primary" routerLink="/admin/dashboard" style="margin-right: 10px;">
            <mat-icon>arrow_back</mat-icon> Back to Home
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
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>SubCategory</mat-label>
          <mat-select [(ngModel)]="selectedSubCategory" (selectionChange)="filterProducts()" [disabled]="!selectedCategory">
            <mat-option value="">All SubCategories</mat-option>
            <mat-option *ngFor="let sub of currentSubCategories" [value]="sub.value">{{sub.label}}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-box total">
          <mat-icon>inventory</mat-icon>
          <div>
            <h3>{{ allProducts.length }}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div class="stat-box men">
          <mat-icon>person</mat-icon>
          <div>
            <h3>{{ getCountByCategory('MEN') }}</h3>
            <p>Men's</p>
          </div>
        </div>
        <div class="stat-box women">
          <mat-icon>person</mat-icon>
          <div>
            <h3>{{ getCountByCategory('WOMEN') }}</h3>
            <p>Women's</p>
          </div>
        </div>
        <div class="stat-box kids">
          <mat-icon>child_care</mat-icon>
          <div>
            <h3>{{ getCountByCategory('KIDS') }}</h3>
            <p>Kids</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <table mat-table [dataSource]="filteredProducts()" class="mat-elevation-z2">
        <!-- Product -->
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

        <!-- Category -->
        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef> Category </th>
          <td mat-cell *matCellDef="let element">
            <mat-chip>{{element.category}}</mat-chip>
            <mat-chip class="sub">{{element.subCategory}}</mat-chip>
          </td>
        </ng-container>

        <!-- Product Group -->
        <ng-container matColumnDef="group">
          <th mat-header-cell *matHeaderCellDef> Group </th>
          <td mat-cell *matCellDef="let element">
            <span class="group-text">{{element.productGroup || '-'}}</span>
          </td>
        </ng-container>

        <!-- Price -->
        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef> Price </th>
          <td mat-cell *matCellDef="let element">
            <span class="price">₹{{element.price?.toLocaleString()}}</span>
          </td>
        </ng-container>

        <!-- Stock -->
        <ng-container matColumnDef="qty">
          <th mat-header-cell *matHeaderCellDef> Qty </th>
          <td mat-cell *matCellDef="let element">
            <span class="stock-badge" [class.zero]="element.quantity === 0" [class.low]="element.quantity > 0 && element.quantity < 10">
              {{element.quantity}}
            </span>
          </td>
        </ng-container>

        <!-- Images -->
        <ng-container matColumnDef="images">
          <th mat-header-cell *matHeaderCellDef> Images </th>
          <td mat-cell *matCellDef="let element">
            <div class="images-cell">
              <img [src]="environment.apiUrl + '/images/product/' + (element.modelNo || element.id) + '/1'" class="mini-thumb" alt="1"
                   (error)="$any($event.target).style.display='none'">
              <img [src]="environment.apiUrl + '/images/product/' + (element.modelNo || element.id) + '/2'" class="mini-thumb" alt="2"
                   (error)="$any($event.target).style.display='none'">
              <img [src]="environment.apiUrl + '/images/product/' + (element.modelNo || element.id) + '/3'" class="mini-thumb" alt="3"
                   (error)="$any($event.target).style.display='none'">
            </div>
          </td>
        </ng-container>

        <!-- Actions -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Actions </th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button color="primary" (click)="editProduct(element)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteProduct(element)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

        <!-- No data row -->
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
      grid-template-columns: 2fr 1fr 1fr; 
      gap: 15px; 
      margin-bottom: 30px; 
      background: var(--surface);
      padding: 20px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    .search-field { flex: 1; }
    
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .stat-box { padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 15px; color: white; }
    .stat-box.total { background: linear-gradient(135deg, #e63946 0%, #d62839 100%); }
    .stat-box.men { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .stat-box.women { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .stat-box.kids { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
    .stat-box mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .stat-box h3 { font-size: 28px; font-weight: 700; margin: 0; }
    .stat-box p { margin: 0; font-size: 14px; opacity: 0.9; }
    
    .product-cell { display: flex; align-items: center; gap: 15px; }
    .thumb { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border); background: var(--surface-low); }
    .info { display: flex; flex-direction: column; }
    .name { font-weight: 600; font-size: 14px; color: var(--text-main); }
    .model { font-size: 12px; color: var(--text-secondary); }
    
    .price { font-weight: 700; color: #e63946; font-size: 16px; }
    
    .stock-badge { font-weight: 700; font-size: 16px; color: #10b981; }
    .stock-badge.low { color: #f59e0b; }
    .stock-badge.zero { color: #ef4444; }
    
    .images-cell { display: flex; gap: 5px; }
    .mini-thumb { width: 30px; height: 30px; border-radius: 4px; object-fit: cover; border: 1px solid var(--border); background: var(--surface-low); }
    
    mat-chip { background: var(--surface-low) !important; color: var(--text-main) !important; border: 1px solid var(--border) !important; }
    mat-chip.sub { border-color: var(--primary) !important; color: var(--primary) !important; background: transparent !important; }
    
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

    ::ng-deep .mat-mdc-row:hover {
      background-color: var(--surface-low) !important;
    }
  `]
})
export class InventoryComponent implements OnInit {
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  protected environment = environment;

  allProducts: any[] = [];
  filteredProducts = signal<any[]>([]);

  searchQuery = '';
  selectedCategory = '';
  selectedSubCategory = '';

  subcategoriesMap: any = {
    MEN: [
      { value: 'BOOTS', label: 'Boots' },
      { value: 'CASUAL', label: 'Casual' },
      { value: 'FORMALSHOES', label: 'Formal Shoes' },
      { value: 'SLIDERS', label: 'Sliders/Flip Flops' },
      { value: 'SPORTSSHOES', label: 'Sports Shoes' },
      { value: 'JACKETS', label: 'Jackets' },
      { value: 'SHIRTS', label: 'Shirts' },
      { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts' },
      { value: 'T_SHIRTS', label: 'T-Shirts' },
      { value: 'JEANS', label: 'Jeans' },
      { value: 'TROUSERS', label: 'Trousers' },
      { value: 'SHORTS', label: 'Shorts' }
    ],
    WOMEN: [
      { value: 'CASUAL_SHOES', label: 'Casual Shoes' },
      { value: 'SLIDERS_FLIP_FLOPS', label: 'Sliders/Flip Flops' },
      { value: 'SPORTSSHOES', label: 'Sports Shoes' },
      { value: 'JACKETS', label: 'Jackets' },
      { value: 'TOPS_T_SHIRTS', label: 'Tops/T-Shirts' },
      { value: 'DRESSES', label: 'Dresses' },
      { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts' }
    ],
    KIDS: [
      { value: 'CASUAL', label: 'Casual (Boys)' },
      { value: 'SPORTSSHOES', label: 'Sports Shoes (Boys)' },
      { value: 'T_SHIRTS', label: 'T-Shirts (Boys)' },
      { value: 'SHIRTS', label: 'Shirts (Boys)' },
      { value: 'JEANS', label: 'Jeans (Boys)' },
      { value: 'TROUSERS', label: 'Trousers (Boys)' },
      { value: 'SHORTS', label: 'Shorts (Boys)' },
      { value: 'JACKETS', label: 'Jackets (Boys)' },
      { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts (Boys)' },
      { value: 'CASUAL_SHOES', label: 'Casual Shoes (Girls)' },
      { value: 'SCHOOL_SHOES', label: 'School Shoes (Girls)' },
      { value: 'TOPS_T_SHIRTS', label: 'Tops/T-Shirts (Girls)' },
      { value: 'DRESSES', label: 'Dresses (Girls)' },
      { value: 'JEANS', label: 'Jeans (Girls)' },
      { value: 'TROUSERS', label: 'Trousers (Girls)' },
      { value: 'SHORTS', label: 'Shorts (Girls)' },
      { value: 'JACKETS', label: 'Jackets (Girls)' },
      { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts (Girls)' }
    ]
  };

  get currentSubCategories() {
    return this.selectedCategory ? this.subcategoriesMap[this.selectedCategory] || [] : [];
  }

  displayedColumns = ['product', 'category', 'group', 'price', 'qty', 'images', 'actions'];

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.productService.getAllProducts().then(products => {
      this.allProducts = products;
      this.filterProducts();
    });
  }

  filterProducts() {
    let temp = [...this.allProducts];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      temp = temp.filter(p => p.name?.toLowerCase().includes(q) || p.modelNo?.toLowerCase().includes(q));
    }

    if (this.selectedCategory) {
      temp = temp.filter(p => p.category === this.selectedCategory);
    }

    if (this.selectedSubCategory) {
      temp = temp.filter(p => p.subCategory === this.selectedSubCategory);
    }

    this.filteredProducts.set(temp);
  }

  getCountByCategory(category: string): number {
    return this.allProducts.filter(p => p.category === category).length;
  }

  editProduct(product: any) {
    const dialogRef = this.dialog.open(EditProductDialogComponent, {
      width: '800px',
      data: product,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refresh();
      }
    });
  }

  deleteProduct(product: any) {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
      data: product
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.productService.deleteProduct(product.modelNo || product.id);
          this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
          this.refresh();
        } catch (err) {
          this.snackBar.open('Failed to delete product', 'Close', { duration: 3000 });
        }
      }
    });
  }
}

// Delete Confirmation Dialog
@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete Product</h2>
    <mat-dialog-content>
      <p class="confirm-text">Are you sure you want to delete this product?</p>
      <div class="product-info">
        <strong>{{ data.name }}</strong>
        <span class="model">Model: {{ data.modelNo || data.id }}</span>
      </div>
      <p class="warning">This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .confirm-text { margin: 0 0 15px 0; color: var(--text-main); }
    .product-info { 
      padding: 15px; 
      background: var(--surface-low); 
      border-radius: 8px; 
      margin: 15px 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .product-info strong { color: var(--text-main); font-size: 16px; }
    .product-info .model { color: var(--text-secondary); font-size: 14px; }
    .warning { 
      margin: 15px 0 0 0; 
      color: #ef4444; 
      font-weight: 500;
      font-size: 14px;
    }
  `]
})
export class DeleteConfirmDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
