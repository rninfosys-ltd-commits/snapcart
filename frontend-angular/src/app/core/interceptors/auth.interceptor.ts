import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
    let token = '';

    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            token = user.jwt || user.token || '';
        } catch (e) {
            console.error('Error parsing user from localStorage', e);
        }
    }

    if (token) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(authReq);
    }

    return next(req);
};
