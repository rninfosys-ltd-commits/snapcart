import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    mobile: string;
    gender: string;
    profileImage?: string;
    hasProfilePicture?: boolean;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/profile`;

    async getProfile(): Promise<UserProfile> {
        return firstValueFrom(this.http.get<UserProfile>(this.apiUrl));
    }

    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        return firstValueFrom(this.http.put<UserProfile>(this.apiUrl, data));
    }

    async uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return firstValueFrom(this.http.post<{ imageUrl: string }>(`${this.apiUrl}/picture`, formData));
    }
}
