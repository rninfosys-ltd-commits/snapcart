import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-moderator-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="dash-container">
       <div class="welcome-section">
          <div class="profile-header">
            <div class="avatar-ph">
              <mat-icon>security</mat-icon>
            </div>
            <div class="welcome-text">
               <h1>Welcome back, <span class="highlight">{{ user()?.name }}</span></h1>
               <p>Moderator Control Center • SnapCart</p>
            </div>
          </div>
       </div>
       
       <div class="section-header">
          <h2>Quick Management</h2>
          <div class="divider"></div>
       </div>

       <div class="cards-grid">
         <div class="action-card" *ngFor="let card of cards" (click)="navigate(card.link)">
            <div class="card-bg" [style.background]="card.gradient"></div>
            <div class="card-content">
               <div class="icon-box">
                 <mat-icon>{{card.icon}}</mat-icon>
               </div>
               <div class="text-box">
                  <h3>{{card.title}}</h3>
                  <p>{{card.description}}</p>
               </div>
               <mat-icon class="arrow-icon">chevron_right</mat-icon>
            </div>
         </div>
       </div>
    </div>
  `,
  styles: [`
    .dash-container { max-width: 1200px; margin: 0 auto; }
    
    .welcome-section { margin-bottom: 48px; }
    .profile-header { display: flex; align-items: center; gap: 24px; }
    
    .avatar-ph { 
      width: 80px; height: 80px; background: var(--primary); 
      border-radius: 20px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 20px rgba(230, 57, 70, 0.2);
      color: white; rotate: -5deg;
    }
    .avatar-ph mat-icon { font-size: 40px; width: 40px; height: 40px; }
    
    .welcome-text h1 { font-size: 2.2rem; font-weight: 800; margin: 0; color: var(--text-main); }
    .welcome-text .highlight { color: var(--primary); }
    .welcome-text p { color: var(--text-secondary); font-size: 1.1rem; margin: 4px 0 0; }
    
    .section-header { margin-bottom: 24px; }
    .section-header h2 { font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .divider { width: 40px; height: 4px; background: var(--primary); border-radius: 2px; }

    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px; }
    
    .action-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      height: 140px;
      box-shadow: var(--shadow-sm);
    }
    
    .action-card:hover { 
      transform: translateY(-5px); 
      box-shadow: var(--shadow-md);
      border-color: var(--primary);
    }
    
    .card-bg {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      opacity: 0.05;
      transition: opacity 0.3s;
    }
    .action-card:hover .card-bg { opacity: 0.1; }
    
    .card-content {
      position: relative;
      z-index: 1;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      height: 100%;
    }
    
    .icon-box { 
      width: 64px; height: 64px; background: var(--surface-low); 
      border-radius: 16px; display: flex; align-items: center; justify-content: center;
      color: var(--primary);
      transition: all 0.3s;
    }
    .action-card:hover .icon-box { background: var(--primary); color: white; }
    .icon-box mat-icon { font-size: 32px; width: 32px; height: 32px; }
    
    .text-box { flex: 1; }
    .text-box h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 4px; color: var(--text-main); }
    .text-box p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; line-height: 1.4; }
    
    .arrow-icon { color: var(--text-muted); opacity: 0.5; transition: all 0.3s; }
    .action-card:hover .arrow-icon { transform: translateX(5px); color: var(--primary); opacity: 1; }
  `]
})
export class ModeratorDashboardComponent {
  auth = inject(AuthService);
  router = inject(Router);

  user = this.auth.user;

  cards = [
    {
      title: 'My Products',
      link: '/moderator/products',
      description: 'Manage and view products added by you.',

      icon: 'inventory_2',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Add Product',
      link: '/admin/add-product', // Reusing admin component
      description: 'Add new shoes to your collection.',
      icon: 'add_circle',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Orders',
      link: '/admin/orders', // Reusing admin component
      description: 'Track and manage customer orders.',
      icon: 'shopping_cart',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Reviews',
      link: '/admin/reviews', // Reusing admin component
      description: 'Check customer reviews and feedback.',
      icon: 'star',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ];

  navigate(link: string) {
    this.router.navigate([link]);
  }
}
