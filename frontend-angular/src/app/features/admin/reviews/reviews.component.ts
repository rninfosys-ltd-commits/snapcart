import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterModule
  ],
  template: `
    <div class="reviews-container">
      <div class="header">
        <h1>Review Moderation</h1>
        <div>
           <button mat-button color="primary" routerLink="/admin/dashboard">
            <mat-icon>arrow_back</mat-icon> Back to Home
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-row">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search by Product or User</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="searchQuery" (input)="filterReviews()" placeholder="Ex: Classic Loafers">
        </mat-form-field>

        <mat-form-field appearance="outline" class="rating-field">
          <mat-label>Filter by Rating</mat-label>
          <mat-select [(ngModel)]="selectedRating" (selectionChange)="filterReviews()">
            <mat-option [value]="0">All Ratings</mat-option>
            <mat-option [value]="5">5 Stars Only</mat-option>
            <mat-option [value]="4">4 Stars & Up</mat-option>
            <mat-option [value]="3">3 Stars & Up</mat-option>
            <mat-option [value]="2">2 Stars & Up</mat-option>
            <mat-option [value]="1">1 Star & Up</mat-option>
          </mat-select>
        </mat-form-field>
        
        <div class="stats">
            <span class="count">{{ filteredReviews().length }}</span>
            <span class="label">reviews found</span>
        </div>
      </div>
      
      <table mat-table [dataSource]="filteredReviews()" class="mat-elevation-z2">
        <!-- Product -->
        <ng-container matColumnDef="product">
          <th mat-header-cell *matHeaderCellDef> Product </th>
          <td mat-cell *matCellDef="let element"> 
            <div class="product-info">
                <span class="p-name">{{element.product?.name || 'Unknown Product'}}</span>
            </div>
          </td>
        </ng-container>

        <!-- Model No. -->
        <ng-container matColumnDef="modelNo">
          <th mat-header-cell *matHeaderCellDef> Model No. </th>
          <td mat-cell *matCellDef="let element">
            <span class="model-badge">{{element.product?.modelNo || 'N/A'}}</span>
          </td>
        </ng-container>

        <!-- Rating -->
        <ng-container matColumnDef="rating">
          <th mat-header-cell *matHeaderCellDef> Rating </th>
          <td mat-cell *matCellDef="let element">
            <div class="rating-box" [ngClass]="'stars-' + element.rating">
              <mat-icon class="star">star</mat-icon>
              <span>{{element.rating}}</span>
            </div>
          </td>
        </ng-container>

        <!-- Comment -->
        <ng-container matColumnDef="comment">
          <th mat-header-cell *matHeaderCellDef> Comment </th>
          <td mat-cell *matCellDef="let element"> 
            <p class="comment-text">{{element.comment}}</p>
          </td>
        </ng-container>

        <!-- User -->
        <ng-container matColumnDef="user">
          <th mat-header-cell *matHeaderCellDef> User </th>
          <td mat-cell *matCellDef="let element"> 
            <div class="user-info">
                <mat-icon class="user-icon">person</mat-icon>
                <span>{{element.user?.name || 'Anonymous'}}</span>
            </div>
          </td>
        </ng-container>

        <!-- Actions -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Actions </th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button color="warn" (click)="deleteReview(element.id)" matTooltip="Delete Review">
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
              <mat-icon>rate_review</mat-icon>
              <p>No reviews matching your filters</p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `,
  styles: [`
    .reviews-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { margin: 0; font-weight: 700; color: var(--text-main); }

    .filters-row { 
      display: flex; 
      gap: 16px; 
      margin-bottom: 24px; 
      align-items: center;
      background: var(--surface);
      padding: 16px;
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
    }
    .search-field { flex: 2; margin-bottom: -1.25em; }
    .rating-field { flex: 1; margin-bottom: -1.25em; }
    
    .stats { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      padding: 0 16px;
      border-left: 1px solid var(--border);
    }
    .stats .count { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
    .stats .label { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; }

    table { width: 100%; border-radius: 8px; overflow: hidden; background: var(--surface); }
    
    .product-info { display: flex; flex-direction: column; }
    .p-name { font-weight: 500; font-size: 0.9rem; color: var(--text-main); }
    
    .model-badge {
      display: inline-block;
      padding: 4px 12px;
      background: var(--surface-low);
      color: var(--primary);
      border: 1px solid var(--border);
      font-weight: 700;
      font-size: 0.85rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
    }

    .rating-box { 
      display: inline-flex; 
      align-items: center; 
      gap: 4px; 
      font-weight: 700; 
      padding: 4px 8px; 
      border-radius: 4px; 
      background: var(--surface-low);
      color: var(--text-secondary);
    }
    .rating-box.stars-5 { color: #10b981; background: rgba(16, 185, 129, 0.1); }
    .rating-box.stars-4 { color: #22c55e; background: rgba(34, 197, 94, 0.1); }
    .rating-box.stars-3 { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
    .rating-box.stars-2 { color: #f97316; background: rgba(249, 115, 22, 0.1); }
    .rating-box.stars-1 { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
    
    .star { font-size: 18px; width: 18px; height: 18px; }
    
    .comment-text { 
      max-width: 400px; 
      white-space: nowrap; 
      overflow: hidden; 
      text-overflow: ellipsis; 
      color: var(--text-main);
    }
    .comment-text:hover {
      white-space: normal;
      overflow: visible;
      background: var(--surface-elevated);
      position: relative;
      z-index: 10;
      box-shadow: var(--shadow-md);
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--border);
    }

    .user-info { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); }
    .user-icon { font-size: 18px; width: 18px; height: 18px; opacity: 0.7; }

    .no-data { text-align: center; padding: 60px; color: var(--text-muted); }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }

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
export class ReviewsComponent {
  private reviewService = inject(ReviewService);

  allReviews: any[] = [];
  filteredReviews = signal<any[]>([]);

  searchQuery = '';
  selectedRating = 0; // 0 = All

  displayedColumns = ['product', 'modelNo', 'rating', 'comment', 'user', 'actions'];

  constructor() {
    this.refresh();
  }

  refresh() {
    this.reviewService.getAllReviews().then(data => {
      this.allReviews = data || [];
      this.filterReviews();
    });
  }

  filterReviews() {
    let temp = [...this.allReviews];

    // Filter by Rating
    if (this.selectedRating > 0) {
      // Filter logic: Typically "X Stars & Up" implies >= X
      // But if user wants EXACTLY X stars, we'd use ===. 
      // The select options say "X Stars & Up", implying >=
      // However looking at standard e-com, usually it's exact or >=. 
      // I'll stick to >= as per my labels in template.
      temp = temp.filter(r => r.rating >= this.selectedRating);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      temp = temp.filter(r =>
        (r.product?.name?.toLowerCase().includes(q)) ||
        (r.user?.name?.toLowerCase().includes(q)) ||
        (r.comment?.toLowerCase().includes(q))
      );
    }

    this.filteredReviews.set(temp);
  }

  deleteReview(id: number) {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(id).then(() => this.refresh());
    }
  }
}
