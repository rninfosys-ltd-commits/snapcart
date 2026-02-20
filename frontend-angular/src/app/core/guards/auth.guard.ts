import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.user()) {
        return true;
    }

    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.user();
    if (user && (['ADMIN', 'MODERATOR', 'SUPER_ADMIN', 'EMPLOYEE'].includes(user.role) ||
        (user.roles && (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_MODERATOR') || user.roles.includes('ROLE_SUPER_ADMIN') || user.roles.includes('ROLE_EMPLOYEE'))))) {
        return true;
    }

    router.navigate(['/']);
    return false;
};

export const superAdminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.user();
    if (user && (user.role === 'SUPER_ADMIN' || (user.roles && user.roles.includes('ROLE_SUPER_ADMIN')))) {
        return true;
    }

    router.navigate(['/']);
    return false;
};

export const teamGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.user();
    // Allow MODERATOR, ADMIN, SUPER_ADMIN but NOT EMPLOYEE
    if (user && (['ADMIN', 'MODERATOR', 'SUPER_ADMIN'].includes(user.role) ||
        (user.roles && (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_MODERATOR') || user.roles.includes('ROLE_SUPER_ADMIN'))))) {
        return true;
    }

    // Redirect Employees or others to dashboard if they try to access team management
    router.navigate(['/moderator/dashboard']);
    return false;
};
