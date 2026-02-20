import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentDTO {
    id: number;
    orderId: number;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    qrCodeData: string;
    transactionId?: string;
    paymentDate?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = `${environment.apiUrl}/payments`;

    constructor(private http: HttpClient) { }

    /**
     * Initiate payment for an order
     */
    initiatePayment(orderId: number): Observable<PaymentDTO> {
        return this.http.post<PaymentDTO>(`${this.apiUrl}/initiate`, { orderId });
    }

    /**
     * Get QR code image for payment
     */
    getQRCodeImage(paymentId: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${paymentId}/qr-code`, {
            responseType: 'blob'
        });
    }

    /**
     * Verify payment completion
     */
    verifyPayment(paymentId: number, transactionId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/verify`, {
            paymentId: paymentId.toString(),
            transactionId
        });
    }

    /**
     * Get payment status for an order
     */
    getPaymentByOrderId(orderId: number): Observable<PaymentDTO> {
        return this.http.get<PaymentDTO>(`${this.apiUrl}/order/${orderId}`);
    }
}
