import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    // Signal to track current user
    user = signal<any | null>(this.getSavedUser());

    isLoggedIn(): boolean {
        return !!this.user();
    }

    primaryRole = computed(() => {
        const user = this.user();
        if (!user) return null;

        // Normalize roles: handle array, singular string, and "ROLE_" prefix
        let roles: string[] = [];
        if (Array.isArray(user.roles)) {
            roles = user.roles;
        } else if (typeof user.role === 'string') {
            roles = [user.role];
        }

        // Ensure we check for both prefixed and non-prefixed versions
        const hasRole = (r: string) => roles.includes(r) || roles.includes(`ROLE_${r}`);

        if (hasRole('SUPER_ADMIN')) return 'SUPER_ADMIN';
        if (hasRole('ADMIN')) return 'ADMIN';
        if (hasRole('MODERATOR')) return 'MODERATOR';
        if (hasRole('EMPLOYEE')) return 'EMPLOYEE';
        if (hasRole('USER')) return 'USER';
        return null; // Return null if no known role found
    });

    constructor(private http: HttpClient) {
        // PROACTIVE DEV LOGIN: Check for 'autoLogin' query param OR environment setting
        const urlParams = new URLSearchParams(window.location.search);
        const autoLoginEmail = urlParams.get('autoLogin');

        // Only auto-login if explicitly requested via query param
        if (autoLoginEmail && !this.user()) {
            this.devAutoLogin(autoLoginEmail);
        }
    }

    private getSavedUser(): any | null {
        const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    }

    async devAutoLogin(email: string) {
        try {
            const response = await firstValueFrom(
                this.http.post<any>(`${this.apiUrl}/dev-login`, { email })
            );
            this.user.set(response);
            localStorage.setItem('user', JSON.stringify(response));
            console.log('✅ Proactive dev auto-login successful for:', email);
        } catch (err) {
            console.warn('❌ Proactive dev auto-login failed');
        }
    }

    async login(email: string, password: string, staySignedIn: boolean = false): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.http.post<any>(`${this.apiUrl}/signin`, { email, password })
            );

            // Save to signal and storage
            this.user.set(response);
            const storage = staySignedIn ? localStorage : sessionStorage;
            storage.setItem('user', JSON.stringify(response));

            return { success: true, user: response };
        } catch (err: any) {
            return {
                success: false,
                message: err.error?.message || 'Invalid credentials'
            };
        }
    }

    logout() {
        this.user.set(null);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
    }

    async signup(userData: any): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.http.post<any>(`${this.apiUrl}/signup`, userData)
            );
            return { success: true, message: response.message };
        } catch (err: any) {
            return {
                success: false,
                message: err.error?.message || 'Signup failed. Please try again.'
            };
        }
    }

    async sendOtp(email: string): Promise<any> {
        try {
            await firstValueFrom(this.http.post(`${this.apiUrl}/otp/send`, { email }));
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err.error || 'Failed to send OTP' };
        }
    }

    async verifyOtp(email: string, otp: string): Promise<any> {
        try {
            await firstValueFrom(this.http.post(`${this.apiUrl}/otp/verify`, { email, otp }));
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err.error || 'Invalid OTP' };
        }
    }

    async resetPassword(data: any): Promise<any> {
        try {
            await firstValueFrom(this.http.post(`${this.apiUrl}/otp/reset-password`, data));
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err.error || 'Failed to reset password' };
        }
    }
}

