import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { OrderService } from '../../../core/services/order.service';
import { environment } from '../../../../environments/environment';

import { RouterLink } from '@angular/router';
import { OrderTrackingTimelineComponent } from '../../../shared/components/order-tracking-timeline/order-tracking-timeline.component';

@Component({
   selector: 'app-my-orders',
   standalone: true,
   imports: [CommonModule, MatTabsModule, MatButtonModule, MatIconModule, MatStepperModule, RouterLink, OrderTrackingTimelineComponent],
   template: `
    <div class="page-container">
       <h1 class="page-title">Your Orders</h1>

       <div class="top-controls">
           <div class="search-section">
                <!-- Search implemented as visual placeholder to match design -->
                <div class="search-box">
                    <mat-icon class="search-icon">search</mat-icon>
                    <input type="text" placeholder="Search all orders">
                    <button class="search-btn">Search Orders</button>
                </div>
           </div>
           
           <button mat-flat-button color="primary" class="new-order-btn" (click)="shopNow()">Browse Products</button>
       </div>

       <div class="nav-tabs">
           <a [class.active]="activeFilter() === 'all'" (click)="activeFilter.set('all')">Orders</a>
           <a [class.active]="activeFilter() === 'buy-again'" (click)="activeFilter.set('buy-again')">Buy Again</a>
           <a [class.active]="activeFilter() === 'not-shipped'" (click)="activeFilter.set('not-shipped')">Not Yet Shipped</a>
           <a [class.active]="activeFilter() === 'cancelled'" (click)="activeFilter.set('cancelled')">Cancelled Orders</a>
       </div>

       <div class="filter-text">
           <strong>{{ filteredOrders().length }} orders</strong> placed in 
           <select class="time-filter">
               <option>past 3 months</option>
               <option>2026</option>
               <option>2025</option>
           </select>
       </div>

       <div *ngIf="loading()" class="center-box">
          <div class="spinner"></div> Loading orders...
       </div>

       <div *ngIf="!loading() && filteredOrders().length === 0" class="center-box">
          <h3>No orders found.</h3>
          <button mat-raised-button color="warn" (click)="shopNow()">Start Shopping</button>
       </div>

       <!-- Order List -->
       <div class="orders-list">
          <div class="order-card" *ngFor="let order of filteredOrders()">
             
             <!-- Order Header -->
             <div class="card-header">
                <div class="header-group">
                    <div class="header-col">
                       <span class="label">ORDER PLACED</span>
                       <span class="value">{{ order.orderDate | date:'d MMMM y' }}</span>
                    </div>
                    <div class="header-col">
                        <span class="label">TOTAL</span>
                        <span class="value">{{ order.totalAmount | currency:'INR' }}</span>
                    </div>
                    <div class="header-col">
                        <span class="label">SHIP TO</span>
                        <span class="value link popover-trigger">
                            {{ order.shippingAddressName || 'Customer' }} 
                            <mat-icon class="sm-icon">keyboard_arrow_down</mat-icon>
                        </span>
                    </div>
                </div>
                
                <div class="header-col right-align">
                    <span class="label">ORDER # {{ order.id }}</span>
                    <div class="links">
                        <a class="link" (click)="viewOrderDetails(order.id)">View order details</a>
                        <span class="divider">|</span>
                        <a class="link" (click)="downloadInvoice(order.id)">Invoice <mat-icon class="sm-icon">keyboard_arrow_down</mat-icon></a>
                    </div>
                </div>
             </div>

             <!-- Order Body -->
             <div class="card-body">
                 <div class="status-section">
                    <h3 class="delivery-status" [class.delivered]="order.status === 'DELIVERED'">
                        {{ order.status === 'DELIVERED' ? 'Delivered ' + (order.lastStatusUpdate || order.orderDate | date:'d MMMM') : order.status }}
                    </h3>
                    <p class="status-msg" *ngIf="order.status === 'DELIVERED'">Package was handed to resident</p>
                    <p class="status-msg" *ngIf="order.status !== 'DELIVERED'">Expected delivery: {{ getDeliveryDate(order.orderDate) | date:'d MMM' }}</p>
                 </div>

                 <div class="items-container">
                     <div class="item-row" *ngFor="let item of order.items">
                         <!-- Image -->
                         <div class="item-img">
                             <img [src]="environment.apiUrl + '/images/product/' + (item.product.modelNo || item.product.id) + '/1'" 
                                  (error)="$any($event.target).src='assets/placeholder-shoe.png'">
                         </div>

                         <!-- Content -->
                         <div class="item-content">
                             <a class="product-title" [routerLink]="['/shop/product', item.product.modelNo]">{{ item.product.name }}</a>
                             
                             <div class="item-meta">
                                 <span class="return-window" *ngIf="order.status === 'DELIVERED'">
                                     <ng-container *ngIf="item.product.isReturnable; else noReturn">
                                         Return window closed on {{ getReturnDate(order.orderDate) | date:'d MMM y' }}
                                     </ng-container>
                                     <ng-template #noReturn>Not eligible for return</ng-template>
                                 </span>
                                 <span *ngIf="order.status !== 'DELIVERED'">Sold by: SnapCart Retail Pvt. Ltd.</span>
                                 
                                 <div class="price-qty">
                                     Qty: {{item.quantity}} | {{ item.price | currency:'INR' }}
                                 </div>
                             </div>

                             <div class="primary-actions">
                                 <button class="buy-again-btn" (click)="buyAgain(item)">
                                     <mat-icon>refresh</mat-icon> Buy it again
                                 </button>
                                 <button class="view-item-btn" [routerLink]="['/shop/product', item.product.modelNo]">View your item</button>
                             </div>
                         </div>

                         <!-- Right Side Stack Buttons -->
                         <div class="item-actions-stack">
                             <button class="stack-btn primary-yellow" *ngIf="order.status === 'DELIVERED'">Get product support</button>
                             
                             <button class="stack-btn" *ngIf="order.status !== 'DELIVERED'" (click)="toggleTracking(order)">
                                 {{ order.showTracking ? 'Hide tracking' : 'Track package' }}
                              </button>
                              
                              <div *ngIf="order.showTracking" style="margin-top: 15px; border-top: 1px solid #ddd; background: #fafafa; border-radius: 8px; width: 100%;">
                                 <app-order-tracking-timeline [trackingHistory]="order.trackingHistory"></app-order-tracking-timeline>
                              </div>
                             
                             <button class="stack-btn" *ngIf="order.status === 'DELIVERED' && item.product.isReturnable" (click)="returnItem(order.id, item)">Return or replace items</button>
                             
                             <button class="stack-btn">Share gift receipt</button>
                             
                             <button class="stack-btn" *ngIf="order.status === 'DELIVERED'" (click)="writeReview(item.product.modelNo)">Write a product review</button>

                             <button class="stack-btn" *ngIf="order.status === 'PENDING'" (click)="cancelOrder(order.id)">Cancel Order</button>
                         </div>
                     </div>
                 </div>
             </div>
          </div>
       </div>
    </div>
  `,
   styles: [`
    .page-container { max-width: 1000px; margin: 40px auto; padding: 20px; font-family: "Amazon Ember", Arial, sans-serif; }
    .page-title { font-size: 28px; font-weight: 400; margin-bottom: 20px; color: #333; }
    
    .top-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }

    .search-section { flex: 1; max-width: 600px; }
    .search-box { display: flex; align-items: stretch; border: 1px solid #ccc; border-radius: 4px; overflow: hidden; height: 34px; }
    .search-icon { display: flex; align-items: center; justify-content: center; width: 40px; color: #555; background: #f3f3f3; }
    .search-box input { flex: 1; border: none; padding: 0 10px; outline: none; font-size: 14px; }
    .search-btn { background: #333; color: white; border: none; padding: 0 20px; font-weight: 600; font-size: 13px; cursor: pointer; }

    .nav-tabs { display: flex; border-bottom: 1px solid #ddd; margin-bottom: 20px; }
    .nav-tabs a { 
        padding: 10px 20px; cursor: pointer; color: #555; text-decoration: none; font-size: 14px; 
        border-bottom: 2px solid transparent; 
    }
    .nav-tabs a.active { color: #000; font-weight: 700; border-bottom: 2px solid #e47911; }
    .nav-tabs a:hover { color: #e47911; }

    .filter-text { margin-bottom: 15px; font-size: 14px; color: #333; }
    .time-filter { 
        padding: 4px; border-radius: 4px; border: 1px solid #ccc; background: #f0f2f2; 
        font-size: 13px; box-shadow: 0 2px 5px rgba(15,17,23,.15); cursor: pointer;
    }

    .center-box { text-align: center; padding: 60px 0; color: #64748b; }

    /* Order Card Styles */
    .order-card { 
       border: 1px solid #d5d9d9; border-radius: 8px; margin-bottom: 20px; overflow: hidden; background: white;
    }
    
    .card-header { 
       background: #f0f2f2; padding: 14px 18px; border-bottom: 1px solid #d5d9d9;
       display: flex; justify-content: space-between; align-items: flex-start; 
       color: #565959; font-size: 12px;
    }
    .header-group { display: flex; gap: 60px; }
    .header-col { display: flex; flex-direction: column; gap: 4px; }
    .header-col.right-align { align-items: flex-end; }
    
    .label { font-size: 12px; text-transform: uppercase; color: #565959; }
    .value { font-size: 14px; color: #333; }
    .link { color: #007185; text-decoration: none; cursor: pointer; }
    .link:hover { text-decoration: underline; color: #c45500; }
    .popover-trigger { display: flex; align-items: center; gap: 2px; }
    .sm-icon { font-size: 16px; width: 16px; height: 16px; }

    .links { display: flex; gap: 8px; align-items: center; margin-top: 4px; }
    .divider { color: #d5d9d9; }

    .card-body { padding: 20px; }
    .status-section { margin-bottom: 20px; }
    .delivery-status { font-size: 18px; font-weight: 700; margin: 0 0 5px; color: #333; }
    .delivery-status.delivered { color: #333; } /* Could be green, but Amazon uses black often for historic */
    .status-msg { font-size: 14px; color: #333; margin: 0; }

    /* Item Row */
    .items-container { display: flex; flex-direction: column; gap: 30px; }
    .item-row { display: flex; gap: 20px; align-items: flex-start; }
    
    .item-img { width: 90px; height: 90px; flex-shrink: 0; }
    .item-img img { width: 100%; height: 100%; object-fit: contain; }

    .item-content { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .product-title { font-size: 14px; color: #007185; font-weight: 600; text-decoration: none; line-height: 1.4; }
    .product-title:hover { text-decoration: underline; color: #c45500; }
    
    .item-meta { font-size: 12px; color: #565959; margin-bottom: 8px; }
    .price-qty { margin-top: 4px; color: #333; }

    .primary-actions { display: flex; gap: 10px; }
    
    .buy-again-btn { 
        display: flex; align-items: center; gap: 6px; 
        background: #FFD814; border: 1px solid #FCD200; border-radius: 8px;
        padding: 6px 14px; font-size: 13px; cursor: pointer; box-shadow: 0 2px 5px rgba(213,217,217,.5); 
    }
    .buy-again-btn:hover { background: #F7CA00; }
    .buy-again-btn mat-icon { font-size: 18px; width: 18px; height: 18px; color: #0f1111; }

    .view-item-btn {
        background: white; border: 1px solid #D5D9D9; border-radius: 8px;
        padding: 6px 14px; font-size: 13px; cursor: pointer; box-shadow: 0 2px 5px rgba(213,217,217,.5);
    }
    .view-item-btn:hover { background: #F7FAFA; border-color: #D5D9D9; }

    /* Right Side Stack */
    .item-actions-stack { display: flex; flex-direction: column; gap: 8px; width: 220px; flex-shrink: 0; }
    .stack-btn {
        width: 100%; text-align: center; padding: 6px 10px; border-radius: 8px;
        border: 1px solid #D5D9D9; background: white; font-size: 13px; cursor: pointer;
        box-shadow: 0 2px 5px rgba(213,217,217,.5);
    }
    .stack-btn:hover { background: #F7FAFA; }
    
    .stack-btn.primary-yellow { 
        background: #FFD814; border-color: #FCD200; 
    }
    .stack-btn.primary-yellow:hover { background: #F7CA00; }

    @media (max-width: 768px) {
        .header-group { gap: 20px; flex-wrap: wrap; }
        .item-row { flex-direction: column; }
        .item-actions-stack { width: 100%; flex-direction: row; flex-wrap: wrap; }
        .stack-btn { width: auto; flex: 1; }
    }
   `]
})
export class MyOrdersComponent {
   orderService = inject(OrderService);
   router = inject(Router);
   protected environment = environment;

   orders = signal<any[]>([]);
   loading = signal(true);
   activeFilter = signal('all');

   filters = [
      { key: 'all', label: 'All Orders' },
      { key: 'PENDING', label: 'Pending' },
      { key: 'PROCESSING', label: 'Processing' },
      { key: 'SHIPPED', label: 'Shipped' },
      { key: 'DELIVERED', label: 'Delivered' },
      { key: 'CANCELLED', label: 'Cancelled' }
   ];

   constructor() {
      this.loadOrders();
   }

   async loadOrders() {
      try {
         this.loading.set(true);
         const data = await this.orderService.fetchUserOrders();
         // Sort by date desc
         this.orders.set(data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
      } finally {
         this.loading.set(false);
      }
   }

   filteredOrders() {
      const f = this.activeFilter();
      if (f === 'all') return this.orders();
      if (f === 'buy-again') return this.orders().filter(o => o.status === 'DELIVERED'); // Simple logic for demo
      if (f === 'not-shipped') return this.orders().filter(o => o.status === 'PENDING' || o.status === 'PROCESSING');
      if (f === 'cancelled') return this.orders().filter(o => o.status === 'CANCELLED');
      return this.orders().filter(o => o.status === f);
   }

   shopNow() {
      this.router.navigate(['/shop']);
   }

   async cancelOrder(id: number) {
      if (confirm('Are you sure you want to cancel this order?')) {
         await this.orderService.cancelOrder(id);
         this.loadOrders();
      }
   }

   async downloadInvoice(orderId: number) {
      try {
         const blob = await this.orderService.downloadInvoice(orderId);
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `Invoice_${orderId}.pdf`;
         document.body.appendChild(a);
         a.click();
         window.URL.revokeObjectURL(url);
         document.body.removeChild(a);
      } catch (err) {
         console.error(err);
         alert('Failed to download invoice');
      }
   }

   viewOrderDetails(orderId: number) {
      // Placeholder for potential detailed view page
      console.log('View order details', orderId);
   }

   async toggleTracking(order: any) {
      if (!order.showTracking) {
         // Load tracking if not already present or needs refresh
         try {
            order.trackingHistory = await this.orderService.getTracking(order.id);
            order.showTracking = true;
         } catch (err) {
            console.error('Failed to load tracking', err);
         }
      } else {
         order.showTracking = false;
      }
   }

   getReturnDate(orderDate: string): Date {
      const date = new Date(orderDate);
      date.setDate(date.getDate() + 7); // 7 day return window
      return date;
   }

   getDeliveryDate(orderDate: string): Date {
      const date = new Date(orderDate);
      date.setDate(date.getDate() + 5); // 5 day delivery estimation
      return date;
   }

   buyAgain(item: any) {
      this.router.navigate(['/shop/product', item.product.modelNo]);
   }

   writeReview(productModelNo: number) {
      if (!productModelNo) return;
      this.router.navigate(['/shop/product', productModelNo], { queryParams: { setupReview: true } });
   }

   returnItem(orderId: number, item: any) {
      const reason = prompt('Please let us know why you want to return/replace this item:');
      if (reason) {
         alert(`Return request submitted for ${item.product.name}. We will contact you shortly.`);
      }
   }
}
