import { Routes } from '@angular/router';
import { authGuard, adminGuard, superAdminGuard, teamGuard } from './core/guards/auth.guard';
import { ModeratorLayoutComponent } from './features/moderator/layout/moderator-layout.component';
import { ModeratorDashboardComponent } from './features/moderator/dashboard/moderator-dashboard.component';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/landing/landing-page.component').then(m => m.LandingPageComponent),
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent)
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
    },
    {
        path: 'contact-us',
        loadComponent: () => import('./features/pages/contact-us/contact-us.component').then(m => m.ContactUsComponent)
    },
    // Public User Pages
    {
        path: 'products',
        loadComponent: () => import('./features/shop/all-products/all-products.component').then(m => m.AllProductsComponent)
    },
    {
        path: 'products/:modelNo',
        loadComponent: () => import('./features/shop/product-detail-page/product-detail-page.component').then(m => m.ProductDetailPageComponent)
    },
    {
        path: 'cat/:cat',
        loadComponent: () => import('./features/shop/all-products/all-products.component').then(m => m.AllProductsComponent)
    },
    {
        path: 'cat/:cat/:subcategory',
        loadComponent: () => import('./features/shop/all-products/all-products.component').then(m => m.AllProductsComponent)
    },
    {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart-page/cart-page.component').then(m => m.CartPageComponent)
    },
    {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () => import('./features/checkout/checkout-page/checkout-page.component').then(m => m.CheckoutPage)
    },
    {
        path: 'my-orders',
        canActivate: [authGuard],
        loadComponent: () => import('./features/pages/my-orders/my-orders.component').then(m => m.MyOrdersComponent)
    },
    {
        path: 'wishlist',
        canActivate: [authGuard],
        loadComponent: () => import('./features/pages/wishlist-page/wishlist-page.component').then(m => m.WishlistPageComponent)
    },
    {
        path: 'my-profile',
        canActivate: [authGuard],
        loadComponent: () => import('./features/pages/profile-page/profile-page.component').then(m => m.ProfilePageComponent)
    },
    {
        path: 'my-addresses',
        canActivate: [authGuard],
        loadComponent: () => import('./features/pages/saved-addresses/saved-addresses.component').then(m => m.SavedAddressesComponent)
    },

    // Admin Routes
    {
        path: 'adminHome',
        redirectTo: 'admin/dashboard',
        pathMatch: 'full'
    },
    {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'add-product',
                loadComponent: () => import('./features/admin/add-product/add-product.component').then(m => m.AddProductComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./features/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent)
            },
            {
                path: 'products', // ShowAllProducts
                loadComponent: () => import('./features/admin/inventory/inventory.component').then(m => m.InventoryComponent)
            },
            {
                path: 'users', // ShowAllCustomers
                loadComponent: () => import('./features/admin/customers/customer-list.component').then(m => m.CustomerListComponent)
            },
            {
                path: 'analytics',
                loadComponent: () => import('./features/admin/analytics/analytics.component').then(m => m.AnalyticsComponent)
            },
            {
                path: 'reviews',
                loadComponent: () => import('./features/admin/reviews/reviews.component').then(m => m.ReviewsComponent)
            },
            {
                path: 'inventory',
                loadComponent: () => import('./features/admin/inventory/inventory.component').then(m => m.InventoryComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/pages/profile-page/profile-page.component').then(m => m.ProfilePageComponent)
            },
            {
                path: 'coupons',
                loadComponent: () => import('./features/admin/coupons/admin-coupon.component').then(m => m.AdminCouponComponent)
            },
            {
                path: 'flash-deals',
                loadComponent: () => import('./features/admin/flash-deals/flash-deals.component').then(m => m.AdminFlashDealsComponent)
            }
        ]
    },

    // Moderator Routes
    {
        path: 'moderator',
        canActivate: [authGuard],
        loadComponent: () => import('./features/moderator/layout/moderator-layout.component').then(m => m.ModeratorLayoutComponent),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/moderator/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'products',
                loadComponent: () => import('./features/moderator/inventory/inventory.component').then(m => m.ModeratorInventoryComponent)
            },
            {
                path: 'edit-product/:modelNo',
                loadComponent: () => import('./features/moderator/edit-product/edit-product.component').then(m => m.EditProductComponent)
            },
            {
                path: 'employees',
                canActivate: [teamGuard],
                loadComponent: () => import('./features/moderator/employee-management/employee-management.component').then(m => m.EmployeeManagementComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./features/moderator/orders/moderator-orders.component').then(m => m.ModeratorOrdersComponent)
            },
            {
                path: 'reviews',
                loadComponent: () => import('./features/moderator/reviews/moderator-reviews.component').then(m => m.ModeratorReviewsComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/pages/profile-page/profile-page.component').then(m => m.ProfilePageComponent)
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: 'moderatorHome',
        redirectTo: 'moderator/dashboard',
        pathMatch: 'full'
    },

    // Super Admin Routes
    {
        path: 'super-admin',
        canActivate: [superAdminGuard],
        loadChildren: () => import('./features/super-admin/super-admin.routes').then(m => m.SUPER_ADMIN_ROUTES)
    },

    { path: '**', redirectTo: 'home' }
];
