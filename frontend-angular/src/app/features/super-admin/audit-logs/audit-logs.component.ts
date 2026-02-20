import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminService } from '../../../core/services/super-admin.service';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-audit-logs',
    standalone: true,
    imports: [CommonModule, MatTableModule, MatChipsModule, MatIconModule, MatButtonModule],
    template: `
    <div class="logs-container">
      <header class="page-header">
        <h1>System Audit Logs</h1>
        <p>Immutable record of critical administrative operations</p>
      </header>

      <div class="table-container mat-elevation-z2">
        <table mat-table [dataSource]="logs()" class="full-width">
          
          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef> Time </th>
            <td mat-cell *matCellDef="let log"> {{ log.timestamp | date:'medium' }} </td>
          </ng-container>

          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef> Action </th>
            <td mat-cell *matCellDef="let log"> 
              <span class="action-tag" [class]="log.action.toLowerCase()">{{ log.action }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="performedBy">
            <th mat-header-cell *matHeaderCellDef> Actor </th>
            <td mat-cell *matCellDef="let log"> 
                <div class="actor">
                    <mat-icon>person</mat-icon>
                    {{ log.performedBy }}
                </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="target">
            <th mat-header-cell *matHeaderCellDef> Target </th>
            <td mat-cell *matCellDef="let log"> {{ log.targetEntity }} (ID: {{ log.targetId }}) </td>
          </ng-container>

          <ng-container matColumnDef="details">
            <th mat-header-cell *matHeaderCellDef> Details </th>
            <td mat-cell *matCellDef="let log" class="details-cell"> {{ log.details }} </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class="no-logs" *ngIf="logs().length === 0">
           <mat-icon>inbox</mat-icon>
           <p>No audit records found.</p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .logs-container { max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; font-weight: 800; color: var(--text-main); }
    
    .table-container { 
      background: var(--surface); 
      border-radius: 12px; 
      overflow: hidden; 
      border: 1px solid var(--border); 
    }
    
    .full-width { width: 100%; }
    
    .action-tag { 
      padding: 4px 10px; 
      border-radius: 6px; 
      font-size: 0.75rem; 
      font-weight: 700; 
      background: rgba(var(--primary-rgb), 0.1); 
      color: var(--primary);
    }
    .role_promotion { background: #e8f5e9; color: #2e7d32; }
    .role_demotion { background: #ffebee; color: #c62828; }

    .actor { display: flex; align-items: center; gap: 8px; font-weight: 500; }
    .actor mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--text-muted); }

    .details-cell { color: var(--text-secondary); max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .no-logs { padding: 4rem; text-align: center; color: var(--text-muted); }
    .no-logs mat-icon { font-size: 48px; width: 48px; height: 48px; }

    ::ng-deep table.mat-mdc-table { background: transparent !important; }
    ::ng-deep .mat-mdc-header-cell { color: var(--text-muted) !important; font-weight: 700 !important; }
    ::ng-deep .mat-mdc-cell { color: var(--text-main) !important; padding: 16px 24px !important; }
  `]
})
export class AuditLogsComponent implements OnInit {
    private service = inject(SuperAdminService);
    logs = signal<any[]>([]);
    displayedColumns = ['timestamp', 'action', 'performedBy', 'target', 'details'];

    ngOnInit() {
        this.loadLogs();
    }

    async loadLogs() {
        try {
            this.logs.set(await this.service.getAuditLogs());
        } catch (e) { console.error(e); }
    }
}
