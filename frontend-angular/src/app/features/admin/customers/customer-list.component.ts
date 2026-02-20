import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterModule
  ],
  template: `
    <div class="customers-container">
      <div class="header">
        <div style="display: flex; align-items: center; gap: 20px;">
          <h1>Registered Users</h1>
          <div class="count-badge">{{ filteredUsers().length }} Users</div>
        </div>
        <button mat-button color="primary" routerLink="/admin/dashboard">
          <mat-icon>arrow_back</mat-icon> Back to Home
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-row">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search by Name or Email</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="searchQuery" (input)="filterUsers()" placeholder="Ex: John Doe">
        </mat-form-field>

        <mat-form-field appearance="outline" class="role-field">
          <mat-label>Filter by Role</mat-label>
          <mat-select [(ngModel)]="selectedRole" (selectionChange)="filterUsers()">
            <mat-option value="">All Roles</mat-option>
            <mat-option value="ADMIN">Admins Only</mat-option>
            <mat-option value="USER">Users Only</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      
      <table mat-table [dataSource]="filteredUsers()" class="mat-elevation-z2">
        <!-- Avatar -->
        <ng-container matColumnDef="avatar">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let element">
            <div class="avatar-circle" [class.admin]="element.role === 'ADMIN'">
                {{ element.name.charAt(0).toUpperCase() }}
            </div>
          </td>
        </ng-container>

        <!-- Name -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef> Name </th>
          <td mat-cell *matCellDef="let element"> 
            <span style="font-weight: 500;">{{element.name}}</span>
          </td>
        </ng-container>

        <!-- Email -->
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef> Email </th>
          <td mat-cell *matCellDef="let element"> {{element.email}} </td>
        </ng-container>

        <!-- Mobile -->
        <ng-container matColumnDef="mobile">
          <th mat-header-cell *matHeaderCellDef> Mobile </th>
          <td mat-cell *matCellDef="let element"> {{element.mobile || '-'}} </td>
        </ng-container>

        <!-- Role -->
        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef> Role </th>
          <td mat-cell *matCellDef="let element">
            <mat-chip [color]="element.role === 'ADMIN' ? 'warn' : 'primary'" highlighted>
                {{element.role}}
            </mat-chip>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        
        <!-- No data row -->
        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" [attr.colspan]="displayedColumns.length">
            <div class="no-data">
              <mat-icon>person_search</mat-icon>
              <p>No users found matching your criteria</p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `,
  styles: [`
    .customers-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { margin: 0; font-weight: 700; color: var(--text-main); }
    .count-badge { background: var(--primary); color: white; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 14px; }
    
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
    .role-field { flex: 1; margin-bottom: -1.25em; }

    table { width: 100%; border-radius: 8px; overflow: hidden; background: var(--surface); border: 1px solid var(--border); }
    
    .avatar-circle { 
        width: 40px; height: 40px; border-radius: 50%; 
        color: white; display: flex; justify-content: center; align-items: center; 
        font-weight: 700; font-size: 1.1rem;
        background-color: var(--primary);
    }
    .avatar-circle.admin { background-color: #ef4444; }

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
  `]
})
export class CustomerListComponent {
  private adminService = inject(AdminService);

  allUsers: any[] = [];
  filteredUsers = signal<any[]>([]);

  searchQuery = '';
  selectedRole = '';

  displayedColumns = ['avatar', 'name', 'email', 'mobile', 'role'];

  constructor() {
    this.adminService.getAllUsers().then(data => {
      // Exclude API users if needed, or keep all
      this.allUsers = data.filter(u => u.role !== 'API_USER');
      this.filterUsers();
    });
  }

  filterUsers() {
    let temp = [...this.allUsers];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      temp = temp.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }

    if (this.selectedRole) {
      temp = temp.filter(u => u.role === this.selectedRole);
    }

    this.filteredUsers.set(temp);
  }
}
