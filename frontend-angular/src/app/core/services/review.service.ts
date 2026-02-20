import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/reviews`;

    async getAllReviews(): Promise<any[]> {
        return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/all`));
    }

    async deleteReview(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    }
}
