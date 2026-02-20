import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-order-tracking-timeline',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
    <div class="timeline-container">
      <div class="timeline-item" *ngFor="let record of trackingHistory; let last = last; let first = first">
        <div class="timeline-marker">
          <div class="dot" [class.active]="first">
            <mat-icon *ngIf="first">check</mat-icon>
          </div>
          <div class="line" *ngIf="!last"></div>
        </div>
        <div class="timeline-content">
          <div class="status-row">
            <span class="status">{{ record.status.replace('_', ' ') }}</span>
            <span class="timestamp">{{ record.timestamp | date:'short' }}</span>
          </div>
          <div class="location">{{ record.city }}, {{ record.state }}</div>
          <div class="description" *ngIf="record.description">{{ record.description }}</div>
        </div>
      </div>
      
      <div *ngIf="!trackingHistory || trackingHistory.length === 0" class="empty-state">
        No tracking information available yet.
      </div>
    </div>
  `,
    styles: [`
    .timeline-container {
      padding: 20px 10px;
    }
    .timeline-item {
      display: flex;
      gap: 15px;
      margin-bottom: 0;
    }
    .timeline-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 24px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ccc;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dot.active {
      width: 24px;
      height: 24px;
      background: #2e7d32;
      color: white;
      margin-top: -6px;
    }
    .dot.active mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .line {
      flex: 1;
      width: 2px;
      background: #eee;
      margin: 4px 0;
      min-height: 50px;
    }
    .timeline-content {
      flex: 1;
      padding-bottom: 30px;
    }
    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
    }
    .status {
      font-weight: 700;
      color: #333;
      text-transform: capitalize;
    }
    .timestamp {
      font-size: 12px;
      color: #757575;
    }
    .location {
      font-size: 14px;
      color: #555;
      margin-bottom: 4px;
    }
    .description {
      font-size: 13px;
      color: #757575;
      font-style: italic;
    }
    .empty-state {
      text-align: center;
      color: #757575;
      padding: 20px;
    }
  `]
})
export class OrderTrackingTimelineComponent {
    @Input() trackingHistory: any[] = [];
}
