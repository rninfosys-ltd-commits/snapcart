import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FlashSaleService {
    private http = inject(HttpClient);
    private adminUrl = `${environment.apiUrl}/admin/flash-sales`;

    async getAllFlashSales(): Promise<any[]> {
        return firstValueFrom(this.http.get<any[]>(this.adminUrl));
    }

    async setFlashSale(modelNo: number, data: { salePrice: number, saleEndTime: string }): Promise<any> {
        return firstValueFrom(this.http.post<any>(`${this.adminUrl}/${modelNo}`, data));
    }

    async removeFlashSale(modelNo: number): Promise<any> {
        return firstValueFrom(this.http.delete<any>(`${this.adminUrl}/${modelNo}`));
    }
}
