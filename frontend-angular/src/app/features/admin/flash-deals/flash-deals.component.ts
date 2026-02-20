import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { FlashSaleService } from '../../../core/services/flash-sale.service';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-flash-deals',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatCardModule,
    MatDatepickerModule, MatNativeDateModule, MatSnackBarModule, RouterModule
  ],
  template: `
    <div class="flash-deals-container p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>Flash Deals Management</h1>
        <button mat-flat-button color="primary" routerLink="/admin/dashboard">
          <mat-icon>arrow_back</mat-icon> Back to Dashboard
        </button>
      </div>

      <div class="row">
        <!-- Active Flash Sales -->
        <div class="col-md-7">
          <mat-card class="mb-4">
            <mat-card-header>
              <mat-card-title>Active Flash Deals</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="activeFlashSales()" class="w-100">
                <ng-container matColumnDef="image">
                  <th mat-header-cell *matHeaderCellDef> Image </th>
                  <td mat-cell *matCellDef="let element"> 
                    <img [src]="environment.apiUrl + '/images/product/' + (element.modelNo || element.id) + '/1'" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" (error)="$any($event.target).style.display='none'">
                  </td>
                </ng-container>

                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef> Name </th>
                  <td mat-cell *matCellDef="let element"> {{element.name}} </td>
                </ng-container>

                <ng-container matColumnDef="price">
                  <th mat-header-cell *matHeaderCellDef> Original </th>
                  <td mat-cell *matCellDef="let element"> {{element.price | currency:'INR'}} </td>
                </ng-container>

                <ng-container matColumnDef="salePrice">
                  <th mat-header-cell *matHeaderCellDef> Sale </th>
                  <td mat-cell *matCellDef="let element"> <strong>{{element.salePrice | currency:'INR'}}</strong> </td>
                </ng-container>

                <ng-container matColumnDef="endDate">
                  <th mat-header-cell *matHeaderCellDef> Ends At </th>
                  <td mat-cell *matCellDef="let element"> {{element.saleEndTime | date:'short'}} </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef> Actions </th>
                  <td mat-cell *matCellDef="let element">
                    <button mat-icon-button color="warn" (click)="removeDeal(element.modelNo)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="activeColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: activeColumns;"></tr>
              </table>
              <div *ngIf="activeFlashSales().length === 0" class="text-center p-4 text-muted">
                No active flash deals.
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Add New Flash Sale -->
        <div class="col-md-5">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Create New Flash Deal</mat-card-title>
            </mat-card-header>
            <mat-card-content class="pt-3">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Search Product (Model No)</mat-label>
                <input matInput [(ngModel)]="searchModelNo" (change)="lookupProduct()" placeholder="Enter Model No">
                <button mat-icon-button matSuffix (click)="lookupProduct()">
                  <mat-icon>search</mat-icon>
                </button>
              </mat-form-field>

              <div *ngIf="selectedProduct()" class="product-preview mb-3 p-3 border rounded">
                <div class="d-flex align-items-center gap-3">
                  <img [src]="environment.apiUrl + '/images/product/' + (selectedProduct().modelNo || selectedProduct().id) + '/1'" style="width: 60px; height: 60px; object-fit: cover;" (error)="$any($event.target).style.display='none'">
                  <div>
                    <h6 class="mb-0">{{selectedProduct().name}}</h6>
                    <small class="text-muted">Current Price: {{selectedProduct().price | currency:'INR'}}</small>
                  </div>
                </div>
              </div>

              <div *ngIf="selectedProduct()">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Sale Price</mat-label>
                  <input matInput type="number" [(ngModel)]="newDeal.salePrice">
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>End Date & Time</mat-label>
                  <input matInput [(ngModel)]="newDeal.saleEndTime" type="datetime-local">
                  <mat-hint>Choose when the flash deal should expire.</mat-hint>
                </mat-form-field>

                <button mat-raised-button color="accent" class="w-100 mt-3" (click)="saveDeal()">
                  ACTIVATE FLASH DEAL
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .flash-deals-container { max-width: 1200px; margin: 0 auto; }
    h1 { font-weight: 700; color: var(--text-main); }
    
    mat-card {
      background: var(--surface) !important;
      border: 1px solid var(--border) !important;
      box-shadow: var(--shadow-sm) !important;
    }
    
    mat-card-title {
      color: var(--text-main) !important;
      font-weight: 600 !important;
    }

    .product-preview { 
      background: var(--surface-low);
      border-color: var(--border) !important;
      color: var(--text-main);
    }

    ::ng-deep .mat-mdc-header-cell {
      background: var(--surface-low) !important;
      color: var(--text-main) !important;
      font-weight: 600 !important;
    }

    ::ng-deep .mat-mdc-cell {
      color: var(--text-secondary) !important;
      border-bottom-color: var(--border) !important;
    }
    
    .text-muted { color: var(--text-muted) !important; }
    strong { color: var(--text-main); }
  `]
})
export class AdminFlashDealsComponent implements OnInit {
  private productService = inject(ProductService);
  private flashSaleService = inject(FlashSaleService);
  private snackBar = inject(MatSnackBar);
  protected environment = environment;

  activeFlashSales = signal<any[]>([]);
  activeColumns = ['image', 'name', 'price', 'salePrice', 'endDate', 'actions'];

  searchModelNo = '';
  selectedProduct = signal<any>(null);

  newDeal = {
    salePrice: 0,
    saleEndTime: ''
  };

  ngOnInit() {
    this.refresh();
  }

  async refresh() {
    try {
      const sales = await this.flashSaleService.getAllFlashSales();
      this.activeFlashSales.set(sales);
    } catch (err) {
      console.error(err);
    }
  }

  async lookupProduct() {
    if (!this.searchModelNo) return;
    try {
      const product = await this.productService.getProductByModelNo(this.searchModelNo);
      this.selectedProduct.set(product);
      this.newDeal.salePrice = Math.round(product.price * 0.7); // Suggested 30% off

      // Suggest 24 hours from now
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      this.newDeal.saleEndTime = tomorrow.toISOString().slice(0, 16);
    } catch (err) {
      this.snackBar.open('Product not found!', 'Close', { duration: 3000 });
      this.selectedProduct.set(null);
    }
  }

  async saveDeal() {
    try {
      await this.flashSaleService.setFlashSale(this.selectedProduct().modelNo, this.newDeal);
      this.snackBar.open('Flash deal activated!', 'Close', { duration: 3000 });
      this.selectedProduct.set(null);
      this.searchModelNo = '';
      this.refresh();
    } catch (err) {
      this.snackBar.open('Failed to activate deal', 'Close', { duration: 3000 });
    }
  }

  async removeDeal(modelNo: number) {
    try {
      await this.flashSaleService.removeFlashSale(modelNo);
      this.snackBar.open('Flash deal removed', 'Close', { duration: 3000 });
      this.refresh();
    } catch (err) {
      this.snackBar.open('Failed to remove deal', 'Close', { duration: 3000 });
    }
  }
}
