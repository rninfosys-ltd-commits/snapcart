import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SavedCard {
    id?: number;
    cardHolderName: string;
    brand: string;
    last4: string;
    expiry: string;
    token?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SavedCardService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/cards`;

    async getCards(): Promise<SavedCard[]> {
        return firstValueFrom(this.http.get<SavedCard[]>(this.apiUrl));
    }

    async saveCard(card: SavedCard): Promise<SavedCard> {
        return firstValueFrom(this.http.post<SavedCard>(this.apiUrl, card));
    }

    async deleteCard(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    }
}
