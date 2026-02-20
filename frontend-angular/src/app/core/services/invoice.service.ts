import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    /**
     * Download invoice for an order
     */
    downloadInvoice(orderId: number): void {
        const url = `${this.apiUrl}/orders/${orderId}/invoice`;
        window.open(url, '_blank');
    }

    /**
     * Resend invoice email (SUPER_ADMIN only)
     */
    resendInvoice(orderId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/invoices/${orderId}/resend`, {});
    }
}
