import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AdminService } from '../../../core/services/admin.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatChipsModule,
    MatIconModule, MatMenuModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogModule, MatSnackBarModule, RouterModule],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  template: `
    <div class="orders-container">
      <div class="header">
        <h1>Order Management</h1>
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
          <mat-label>Search Orders</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="searchQuery" (input)="filterOrders()" 
                 placeholder="Search by customer name, email, or order ID">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="selectedStatus" (selectionChange)="filterOrders()">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="PENDING">Pending</mat-option>
            <mat-option value="SHIPPED">Shipped</mat-option>
            <mat-option value="DELIVERED">Delivered</mat-option>
            <mat-option value="CANCELLED">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Statistics -->
      <div class="stats-row">
        <div class="stat-box total">
          <mat-icon>shopping_cart</mat-icon>
          <div>
            <h3>{{ allOrders.length }}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div class="stat-box pending">
          <mat-icon>schedule</mat-icon>
          <div>
            <h3>{{ getCountByStatus('PENDING') }}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div class="stat-box shipped">
          <mat-icon>local_shipping</mat-icon>
          <div>
            <h3>{{ getCountByStatus('SHIPPED') }}</h3>
            <p>Shipped</p>
          </div>
        </div>
        <div class="stat-box delivered">
          <mat-icon>check_circle</mat-icon>
          <div>
            <h3>{{ getCountByStatus('DELIVERED') }}</h3>
            <p>Delivered</p>
          </div>
        </div>
      </div>
      
      <table mat-table [dataSource]="filteredOrders()" multiTemplateDataRows class="mat-elevation-z2">
        <!-- ID -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef> Order ID </th>
          <td mat-cell *matCellDef="let element"> #{{element.id || element.orderId}} </td>
        </ng-container>

        <!-- Customer -->
        <ng-container matColumnDef="user">
          <th mat-header-cell *matHeaderCellDef> Customer </th>
          <td mat-cell *matCellDef="let element">
            <div class="user-info">
              <span class="fw-bold">{{element.user?.name || 'Unknown'}}</span>
              <span class="text-muted small">{{element.user?.email}}</span>
            </div>
          </td>
        </ng-container>

        <!-- Date -->
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef> Date </th>
          <td mat-cell *matCellDef="let element"> {{element.orderDate | date:'mediumDate'}} </td>
        </ng-container>

        <!-- Amount -->
        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef> Total </th>
          <td mat-cell *matCellDef="let element"> 
            <span class="amount">{{element.totalAmount | currency:'INR':'symbol':'1.0-0'}}</span>
          </td>
        </ng-container>

        <!-- Status -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef> Status </th>
          <td mat-cell *matCellDef="let element">
            <mat-chip [class]="getStatusClass(element.status)">
              {{element.status}}
            </mat-chip>
          </td>
        </ng-container>

        <!-- Actions -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Actions </th>
          <td mat-cell *matCellDef="let element" (click)="$event.stopPropagation()">
            <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="updateStatus(element.id || element.orderId, 'PENDING')">Mark Pending</button>
              <button mat-menu-item (click)="updateStatus(element.id || element.orderId, 'SHIPPED')">Mark Shipped</button>
              <button mat-menu-item (click)="updateStatus(element.id || element.orderId, 'DELIVERED')">Mark Delivered</button>
              <button mat-menu-item (click)="openTrackingDialog(element)"><mat-icon>local_shipping</mat-icon> Update Tracking</button>
              <button mat-menu-item (click)="updateStatus(element.id || element.orderId, 'CANCELLED')" class="text-danger">Cancel Order</button>
              <button mat-menu-item (click)="deleteOrder(element)" class="text-danger"><mat-icon>delete</mat-icon> Delete Order</button>
            </mat-menu>
          </td>
        </ng-container>

        <!-- Expanded Content Column - The detail row is made up of this one column that spans across all columns -->
        <ng-container matColumnDef="expandedDetail">
          <td mat-cell *matCellDef="let element" [attr.colspan]="displayedColumns.length">
            <div class="example-element-detail" 
                 [@detailExpand]="element == expandedElement ? 'expanded' : 'collapsed'">
              
              <div class="order-items-list">
                 <h4>Order Items</h4>
                 <div class="item-row" *ngFor="let item of element.items">
                    <img [src]="environment.apiUrl + '/images/product/' + (item.product.modelNo || item.product.id) + '/1'" class="item-thumb" alt="Product Image" (error)="$any($event.target).style.display='none'">
                    <div class="item-details">
                       <span class="item-name">{{item.product.name}}</span>
                       <span class="item-meta">Model: {{item.product.modelNo}}</span>
                    </div>
                    <div class="item-price">
                       {{item.quantity}} x {{item.price | currency:'INR':'symbol':'1.0-0'}}
                       <br>
                       <strong>{{ item.quantity * item.price | currency:'INR':'symbol':'1.0-0' }}</strong>
                    </div>
                 </div>
              </div>

            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let element; columns: displayedColumns;"
            class="example-element-row"
            [class.example-expanded-row]="expandedElement === element"
            (click)="expandedElement = expandedElement === element ? null : element">
        </tr>
        <tr mat-row *matRowDef="let row; columns: ['expandedDetail']" class="example-detail-row"></tr>

        <!-- No data row -->
        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" [attr.colspan]="displayedColumns.length">
            <div class="no-data">
              <mat-icon>inbox</mat-icon>
              <p>No orders found matching your criteria</p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `,
  styles: [`
    .orders-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { font-weight: 700; margin: 0; color: var(--text-main); }
    
    .filters-row { 
      display: grid; 
      grid-template-columns: 2fr 1fr; 
      gap: 15px; 
      margin-bottom: 24px; 
      background: var(--surface);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    .search-field { flex: 1; }
    
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 24px; }
    .stat-box { padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 15px; color: white; }
    .stat-box.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .stat-box.pending { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .stat-box.shipped { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    .stat-box.delivered { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
    .stat-box mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .stat-box h3 { font-size: 28px; font-weight: 700; margin: 0; }
    .stat-box p { margin: 0; font-size: 14px; opacity: 0.9; }
    
    table { width: 100%; border-radius: 8px; overflow: hidden; background: var(--surface); border: 1px solid var(--border); }
    .user-info { display: flex; flex-direction: column; }
    .fw-bold { font-weight: 600; color: var(--text-main); }
    .small { font-size: 12px; }
    .text-muted { color: var(--text-muted); }
    .text-danger { color: #ef4444; }
    
    .amount { font-weight: 700; color: #e63946; font-size: 16px; }
    
    .mat-mdc-chip { font-weight: 600; font-size: 12px; letter-spacing: 0.5px; }
    .status-pending { background-color: rgba(255, 193, 7, 0.15) !important; color: #ffc107 !important; border: 1px solid rgba(255, 193, 7, 0.3) !important; }
    .status-shipped { background-color: rgba(13, 202, 240, 0.15) !important; color: #0dcaf0 !important; border: 1px solid rgba(13, 202, 240, 0.3) !important; }
    .status-delivered { background-color: rgba(25, 135, 84, 0.15) !important; color: #198754 !important; border: 1px solid rgba(25, 135, 84, 0.3) !important; }
    .status-cancelled { background-color: rgba(220, 53, 69, 0.15) !important; color: #dc3545 !important; border: 1px solid rgba(220, 53, 69, 0.3) !important; }
    
    .no-data { text-align: center; padding: 40px; color: var(--text-muted); }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 10px; }

    /* Expandable Row Styles */
    tr.example-detail-row { height: 0; }
    tr.example-element-row:not(.example-expanded-row):hover { background: var(--surface-low); cursor: pointer; }
    tr.example-element-row:not(.example-expanded-row):active { background: var(--surface-low); }
    .example-element-row td { border-bottom-width: 0; }
    
    .example-element-detail { overflow: hidden; display: flex; }
    
    .order-items-list { 
       width: 100%; padding: 20px; background: var(--surface-low); border-bottom: 1px solid var(--border); 
       box-shadow: inset 0 0 10px rgba(0,0,0,0.05);
    }
    .order-items-list h4 { margin: 0 0 15px; font-size: 16px; font-weight: 600; color: var(--text-main); }
    
    .item-row { display: flex; align-items: center; gap: 15px; padding: 10px; border-bottom: 1px solid var(--border); background: var(--surface); border-radius: 8px; margin-bottom: 8px; }
    .item-thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border); background: var(--surface-low); }
    .item-details { flex: 1; display: flex; flex-direction: column; }
    .item-name { font-weight: 600; color: var(--text-main); }
    .item-meta { font-size: 12px; color: var(--text-secondary); }
    .item-price { text-align: right; font-size: 14px; color: var(--text-main); }

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
export class AdminOrdersComponent {
  private adminService = inject(AdminService);
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  protected environment = environment;

  allOrders: any[] = [];
  filteredOrders = signal<any[]>([]);
  expandedElement: any | null = null;

  searchQuery = '';
  selectedStatus = '';

  displayedColumns = ['id', 'user', 'date', 'amount', 'status', 'actions'];

  constructor() {
    this.refresh();
  }

  refresh() {
    this.adminService.getAllOrders().then(data => {
      // Sort by ID desc
      this.allOrders = data.sort((a, b) => b.id - a.id);
      this.filterOrders();
    });
  }

  filterOrders() {
    let result = [...this.allOrders];

    // Filter by status
    if (this.selectedStatus) {
      result = result.filter(o => o.status === this.selectedStatus);
    }

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(o =>
        (o.id && o.id.toString().includes(query)) ||
        (o.orderId && o.orderId.toString().includes(query)) ||
        o.user?.name?.toLowerCase().includes(query) ||
        o.user?.email?.toLowerCase().includes(query)
      );
    }

    this.filteredOrders.set(result);
  }

  getCountByStatus(status: string): number {
    return this.allOrders.filter(o => o.status === status).length;
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'SHIPPED': return 'status-shipped';
      case 'DELIVERED': return 'status-delivered';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  updateStatus(id: number, status: string) {
    const url = `${environment.apiUrl}/admin/orders/${id}/status`;
    this.http.put(url, {}, { params: { status } }).subscribe(() => this.refresh());
  }

  deleteOrder(order: any) {
    const dialogRef = this.dialog.open(DeleteOrderConfirmDialog, {
      width: '450px',
      data: order
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          const url = `${environment.apiUrl}/admin/orders/${order.id || order.orderId}`;
          await this.http.delete(url).toPromise();
          this.snackBar.open('Order deleted successfully', 'Close', { duration: 3000 });
          this.refresh();
        } catch (err) {
          this.snackBar.open('Failed to delete order', 'Close', { duration: 3000 });
        }
      }
    });
  }

  openTrackingDialog(order: any) {
    const dialogRef = this.dialog.open(UpdateTrackingDialog, {
      width: '500px',
      data: order
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.adminService.updateOrderTracking(result.id, result.location, result.status);
          this.snackBar.open('Order tracking updated successfully', 'Close', { duration: 3000 });
          this.refresh();
        } catch (err) {
          this.snackBar.open('Failed to update tracking', 'Close', { duration: 3000 });
        }
      }
    });
  }
}

// Delete Order Confirmation Dialog
@Component({
  selector: 'app-delete-order-confirm',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete Order</h2>
    <mat-dialog-content>
      <p class="confirm-text">Are you sure you want to delete this order?</p>
      <div class="order-info">
        <div class="info-row">
          <strong>Order ID:</strong> <span>#{{ data.id || data.orderId }}</span>
        </div>
        <div class="info-row">
          <strong>Customer:</strong> <span>{{ data.user?.name }}</span>
        </div>
        <div class="info-row">
          <strong>Total:</strong> <span class="amount">₹{{ data.totalAmount }}</span>
        </div>
      </div>
      <p class="warning">This action cannot be undone. Product stock will be restored.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .confirm-text { margin: 0 0 15px 0; color: var(--text-main); }
    .order-info { 
      padding: 15px; 
      background: var(--surface-low); 
      border-radius: 8px; 
      margin: 15px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .info-row { display: flex; justify-content: space-between; color: var(--text-main); }
    .info-row strong { font-weight: 600; }
    .amount { color: #e63946; font-weight: 700; }
    .warning { 
      margin: 15px 0 0 0; 
      color: #ef4444; 
      font-weight: 500;
      font-size: 14px;
    }
  `]
})
export class DeleteOrderConfirmDialog {
  data = inject(MAT_DIALOG_DATA);
}

// Update Tracking Dialog
@Component({
  selector: 'app-update-tracking-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Update Order Tracking</h2>
    <mat-dialog-content>
      <p class="info-text">Update location and status for Order #{{data.id || data.orderId}}</p>
      
      <div class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Current Location</mat-label>
          <input matInput [(ngModel)]="location" placeholder="e.g. Mumbai Hub, Out for Delivery">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="status">
            <mat-option value="PENDING">Pending</mat-option>
            <mat-option value="PROCESSING">Processing</mat-option>
            <mat-option value="SHIPPED">Shipped</mat-option>
            <mat-option value="DELIVERED">Delivered</mat-option>
            <mat-option value="CANCELLED">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="current-info" *ngIf="data.currentLocation">
        <small>Current Location: <strong>{{data.currentLocation}}</strong></small>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="!location || !status">Update</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .info-text { margin-bottom: 20px; color: var(--text-secondary); }
    .form-container { display: flex; flex-direction: column; gap: 10px; }
    .full-width { width: 100%; }
    .current-info { margin-top: 10px; color: var(--text-secondary); }
  `]
})
export class UpdateTrackingDialog {
  data: any = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<UpdateTrackingDialog>);

  location = '';
  status = '';

  constructor() {
    this.status = this.data.status;
    this.location = this.data.currentLocation || '';
  }

  save() {
    this.dialogRef.close({
      id: this.data.id || this.data.orderId,
      location: this.location,
      status: this.status
    });
  }
}
