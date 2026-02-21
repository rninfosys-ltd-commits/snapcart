import { Routes } from '@angular/router';
import { SuperAdminLayoutComponent } from './layout/super-admin-layout.component';
import { SuperAdminDashboardComponent } from './dashboard/dashboard.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import { AdminManagementComponent } from './admin-management/admin-management.component';

export const SUPER_ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: SuperAdminLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: SuperAdminDashboardComponent },
            { path: 'audit-logs', component: AuditLogsComponent },
            { path: 'admins', component: AdminManagementComponent },
            {
                path: 'products',
                loadComponent: () => import('../admin/inventory/inventory.component').then(m => m.InventoryComponent)
            },
            {
                path: 'add-product',
                loadComponent: () => import('../admin/add-product/add-product.component').then(m => m.AddProductComponent)
            }
        ]
    }
];
