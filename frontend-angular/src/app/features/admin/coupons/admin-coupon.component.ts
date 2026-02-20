import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { CouponService } from '../../../core/services/coupon.service';
import { CreateCouponDialogComponent } from './create-coupon-dialog.component';

@Component({
  selector: 'app-admin-coupon',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressBarModule,
    RouterModule
  ],
  template: `
    <div class="page-container">
       <div class="page-header">
         <div>
            <h1>Manage Coupons</h1>
            <p class="subtitle">Create and manage discount codes for your store</p>
         </div>
         <div class="header-actions">
           <button mat-button color="primary" routerLink="/admin/dashboard">
             <mat-icon>arrow_back</mat-icon> Dashboard
           </button>
           <button mat-flat-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon> Create Coupon
           </button>
         </div>
       </div>
       
       <div class="content-card">
          <table mat-table [dataSource]="coupons()" class="mat-elevation-z0">
            <!-- Code -->
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef> Code </th>
              <td mat-cell *matCellDef="let element"> 
                <span class="code-badge">{{element.code}}</span>
                <div class="desc">{{element.description}}</div>
              </td>
            </ng-container>

            <!-- Discount -->
            <ng-container matColumnDef="discount">
              <th mat-header-cell *matHeaderCellDef> Discount </th>
              <td mat-cell *matCellDef="let element"> 
                <span class="discount-value">
                  {{element.discountValue}}{{element.discountType === 'PERCENTAGE' ? '%' : '₹'}} OFF
                </span>
                <div class="sub-text" *ngIf="element.minOrderAmount > 0">Min Order: ₹{{element.minOrderAmount}}</div>
              </td>
            </ng-container>

            <!-- Validity -->
            <ng-container matColumnDef="validity">
              <th mat-header-cell *matHeaderCellDef> Validity </th>
              <td mat-cell *matCellDef="let element"> 
                <div class="date-range">
                  <div>From: {{element.validFrom | date:'mediumDate'}}</div>
                  <div *ngIf="element.validUntil">To: {{element.validUntil | date:'mediumDate'}}</div>
                  <div *ngIf="!element.validUntil">No Expiry</div>
                </div>
              </td>
            </ng-container>

            <!-- Usage -->
            <ng-container matColumnDef="usage">
              <th mat-header-cell *matHeaderCellDef> Usage </th>
              <td mat-cell *matCellDef="let element"> 
                <div class="usage-stat">
                  <span>{{element.usedCount}} used</span>
                  <span class="limit" *ngIf="element.usageLimit > 0"> / {{element.usageLimit}} limit</span>
                  <span class="limit" *ngIf="element.usageLimit === 0"> / ∞</span>
                </div>
                <mat-progress-bar mode="determinate" 
                  [value]="element.usageLimit > 0 ? (element.usedCount / element.usageLimit) * 100 : 0">
                </mat-progress-bar>
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Status </th>
              <td mat-cell *matCellDef="let element"> 
                <mat-chip [color]="getCouponStatus(element).color" highlighted>
                  {{getCouponStatus(element).label}}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions </th>
              <td mat-cell *matCellDef="let element"> 
                <button mat-icon-button color="warn" (click)="deleteCoupon(element.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <!-- No Data -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="6">
                <div class="empty-state">
                  <mat-icon>local_offer</mat-icon>
                  <p>No coupons found. Create one to get started!</p>
                </div>
              </td>
            </tr>
          </table>
       </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    h1 { margin: 0; font-size: 1.75rem; font-weight: 700; color: var(--text-main); }
    .subtitle { color: var(--text-secondary); margin: 4px 0 0; }
    .header-actions { display: flex; gap: 12px; }

    .content-card { background: var(--surface); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
    
    table { width: 100%; border-radius: 8px; overflow: hidden; background: var(--surface); }
    
    .code-badge { 
      font-family: 'Monaco', monospace; 
      font-weight: 700; 
      color: var(--primary); 
      background: var(--surface-low); 
      padding: 4px 10px; 
      border-radius: 6px; 
      border: 1px dashed var(--primary);
    }
    .desc { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; max-width: 200px; }

    .discount-value { font-weight: 700; font-size: 1.1rem; color: var(--text-main); }
    .sub-text { font-size: 0.75rem; color: var(--text-muted); }

    .date-range { font-size: 0.85rem; color: var(--text-secondary); }
    
    .usage-stat { font-size: 0.85rem; margin-bottom: 4px; display: flex; justify-content: space-between; color: var(--text-main); }
    .limit { color: var(--text-muted); }

    .empty-state { text-align: center; padding: 60px; color: var(--text-muted); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; }

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
export class AdminCouponComponent {
  private couponService = inject(CouponService);
  private dialog = inject(MatDialog);

  coupons = signal<any[]>([]);
  displayedColumns = ['code', 'discount', 'validity', 'usage', 'status', 'actions'];

  constructor() {
    this.refresh();
  }

  refresh() {
    this.couponService.getAllCoupons().then(data => this.coupons.set(data));
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateCouponDialogComponent, {
      width: '600px',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refresh();
      }
    });
  }

  getCouponStatus(coupon: any): { label: string, color: string } {
    // Note: Backend JSON uses 'active' property for boolean isActive, and 'valid' for boolean isValid()
    if (!coupon.active) return { label: 'Inactive', color: 'warn' };

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) return { label: 'Scheduled', color: 'accent' };
    if (coupon.validUntil && new Date(coupon.validUntil) < now) return { label: 'Expired', color: 'warn' };

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return { label: 'Depleted', color: 'warn' };

    return { label: 'Active', color: 'primary' };
  }

  deleteCoupon(id: number) {
    if (confirm('Are you sure you want to delete this coupon?')) {
      this.couponService.deleteCoupon(id).then(() => this.refresh());
    }
  }
}
