import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SuperAdminService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/super-admin`;

    async getAdmins(): Promise<any[]> {
        return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/admins`));
    }

    async promoteToAdmin(userId: number, isSuper: boolean = false): Promise<any> {
        return firstValueFrom(this.http.post<any>(`${this.apiUrl}/promote/${userId}?isSuper=${isSuper}`, {}));
    }

    async demoteToUser(userId: number): Promise<any> {
        return firstValueFrom(this.http.post<any>(`${this.apiUrl}/demote/${userId}`, {}));
    }

    async getAuditLogs(): Promise<any[]> {
        return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/audit-logs`));
    }

    async getPlatformStats(): Promise<any> {
        return firstValueFrom(this.http.get<any>(`${this.apiUrl}/platform-stats`));
    }
}
