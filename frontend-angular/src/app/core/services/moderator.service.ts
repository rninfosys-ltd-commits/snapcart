import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Employee {
    id: number;
    name: string;
    email: string;
    mobile: string;
    gender: string;
    role: string;
    parentId: number;
}

@Injectable({
    providedIn: 'root'
})
export class ModeratorService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/moderators/me`;

    async getEmployees(): Promise<Employee[]> {
        return firstValueFrom(this.http.get<Employee[]>(`${this.apiUrl}/employees`));
    }

    async createEmployee(signupData: any): Promise<Employee> {
        return firstValueFrom(this.http.post<Employee>(`${this.apiUrl}/employees`, signupData));
    }

    async getMyProfile(): Promise<any> {
        return firstValueFrom(this.http.get<any>(this.apiUrl));
    }

    async updateMyProfile(data: any): Promise<any> {
        return firstValueFrom(this.http.put<any>(this.apiUrl, data));
    }
}
