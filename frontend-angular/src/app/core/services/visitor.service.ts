import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class VisitorService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);
    private apiUrl = `${environment.apiUrl}/visitors`;
    private readonly STORAGE_KEY = 'visitor_token';

    async init() {
        if (!isPlatformBrowser(this.platformId)) return;

        let token = localStorage.getItem(this.STORAGE_KEY);
        if (!token) {
            token = uuidv4();
            localStorage.setItem(this.STORAGE_KEY, token);
            await this.trackVisitor(token);
        } else {
            // Optional: Track returning visitor
            await this.trackVisitor(token);
        }
    }

    private async trackVisitor(token: string) {
        try {
            const metadata = {
                visitorToken: token,
                ipAddress: '', // IP is usually handled by backend, but we send structure
                deviceType: this.getDeviceType(),
                browser: this.getBrowserInfo(),
                email: null
            };
            await firstValueFrom(this.http.post(`${this.apiUrl}/track`, metadata));
        } catch (error) {
            console.error('Failed to track visitor', error);
        }
    }

    async updateEmail(email: string) {
        if (!isPlatformBrowser(this.platformId)) return;

        const token = localStorage.getItem(this.STORAGE_KEY);
        if (token) {
            try {
                await firstValueFrom(this.http.post(`${this.apiUrl}/email`, { visitorToken: token, email }));
            } catch (error) {
                console.error('Failed to update visitor email', error);
            }
        }
    }

    private getDeviceType(): string {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    }

    private getBrowserInfo(): string {
        const ua = navigator.userAgent;
        let tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    }
}
