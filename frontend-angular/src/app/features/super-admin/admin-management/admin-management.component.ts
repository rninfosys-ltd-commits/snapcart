import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminService } from '../../../core/services/super-admin.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-management',
    standalone: true,
    imports: [
        CommonModule, MatTableModule, MatButtonModule, MatIconModule,
        MatInputModule, MatFormFieldModule, FormsModule
    ],
    template: `
    <div class="management-container">
      <header class="page-header">
        <h1>Admin Hierarchy Management</h1>
        <p>Control system access levels and delegate platform authority</p>
      </header>

      <div class="promotion-tool mat-elevation-z1">
        <h3>Promote User to Admin</h3>
        <div class="tool-row">
          <mat-form-field appearance="outline">
            <mat-label>User ID</mat-label>
            <input matInput type="number" [(ngModel)]="userIdToPromote" placeholder="Enter User ID">
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="promote()" [disabled]="!userIdToPromote">
            <mat-icon>add_moderator</mat-icon>
            Promote to Admin
          </button>
        </div>
      </div>

      <div class="table-container mat-elevation-z2">
        <table mat-table [dataSource]="admins()" class="full-width">
          
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let admin"> {{ admin.id }} </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Name </th>
            <td mat-cell *matCellDef="let admin"> 
               <div class="name-cell">
                 <strong>{{ admin.name }}</strong>
                 <small>{{ admin.email }}</small>
               </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef> Role </th>
            <td mat-cell *matCellDef="let admin"> 
               <span class="role-badge" [class.super]="admin.role === 'SUPER_ADMIN'">
                 {{ admin.role }}
               </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let admin">
              <button mat-button color="warn" *ngIf="admin.role !== 'SUPER_ADMIN'" (click)="demote(admin.id)">
                <mat-icon>person_remove</mat-icon>
                Demote to User
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
    styles: [`
    .management-container { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; font-weight: 800; color: var(--text-main); }

    .promotion-tool { 
      background: var(--surface); 
      padding: 1.5rem; 
      border-radius: 12px; 
      margin-bottom: 2.5rem; 
      border: 1px solid var(--border);
    }
    .promotion-tool h3 { margin-top: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
    .tool-row { display: flex; gap: 1rem; align-items: baseline; }
    
    .table-container { 
      background: var(--surface); 
      border-radius: 12px; 
      overflow: hidden; 
      border: 1px solid var(--border); 
    }
    .full-width { width: 100%; }
    
    .name-cell { display: flex; flex-direction: column; }
    .name-cell strong { font-size: 1rem; color: var(--text-main); }
    .name-cell small { color: var(--text-muted); }

    .role-badge { 
      background: #e1f5fe; color: #01579b; border-radius: 4px; 
      padding: 2px 8px; font-size: 0.8rem; font-weight: 700; 
    }
    .role-badge.super { background: #ede7f6; color: #4527a0; border: 1px solid #d1c4e9; }

    ::ng-deep table.mat-mdc-table { background: transparent !important; }
    ::ng-deep .mat-mdc-header-cell { color: var(--text-muted) !important; font-weight: 700 !important; }
    ::ng-deep .mat-mdc-cell { color: var(--text-main) !important; padding: 16px 24px !important; }
  `]
})
export class AdminManagementComponent implements OnInit {
    private service = inject(SuperAdminService);
    admins = signal<any[]>([]);
    userIdToPromote: number | null = null;
    displayedColumns = ['id', 'name', 'role', 'actions'];

    ngOnInit() {
        this.loadAdmins();
    }

    async loadAdmins() {
        try {
            this.admins.set(await this.service.getAdmins());
        } catch (e) { console.error(e); }
    }

    async promote() {
        if (!this.userIdToPromote) return;
        try {
            await this.service.promoteToAdmin(this.userIdToPromote);
            this.userIdToPromote = null;
            this.loadAdmins();
        } catch (e) { alert('Promotion failed'); }
    }

    async demote(userId: number) {
        if (!confirm('Are you sure you want to demote this admin?')) return;
        try {
            await this.service.demoteToUser(userId);
            this.loadAdmins();
        } catch (e) { alert('Demotion failed'); }
    }
}
