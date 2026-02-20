import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService, PaymentDTO } from '../../../core/services/payment.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-payment-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-modal.component.html',
    styleUrls: ['./payment-modal.component.css']
})
export class PaymentModalComponent implements OnInit, OnChanges {
    @Input() orderId: number | null = null;
    @Input() isVisible = false;
    @Output() closeEvent = new EventEmitter<void>();
    @Output() paymentCompleted = new EventEmitter<void>();

    payment: PaymentDTO | null = null;
    qrCodeUrl: SafeUrl | null = null;
    isValidating = false;
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' = 'PENDING';

    constructor(
        private paymentService: PaymentService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isVisible'] && this.isVisible && this.orderId) {
            setTimeout(() => this.initiatePayment(), 0);
        }
    }

    initiatePayment(): void {
        if (!this.orderId) return;

        this.paymentStatus = 'PENDING';
        this.paymentService.initiatePayment(this.orderId).subscribe({
            next: (payment) => {
                this.payment = payment;
                this.loadQRCode(payment.id);
            },
            error: (err) => {
                console.error('Payment initiation failed', err);
                this.paymentStatus = 'FAILED';
            }
        });
    }

    loadQRCode(paymentId: number): void {
        this.paymentService.getQRCodeImage(paymentId).subscribe({
            next: (blob) => {
                const objectUrl = URL.createObjectURL(blob);
                this.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
            },
            error: (err) => {
                console.error('Failed to load QR code', err);
                this.qrCodeUrl = null;
            }
        });
    }

    verifyPayment(): void {
        if (!this.payment) return;

        this.isValidating = true;

        const transactionId = prompt("Please enter the Transaction ID / Reference Number from your UPI app:");

        if (transactionId) {
            this.paymentService.verifyPayment(this.payment.id, transactionId).subscribe({
                next: (res) => {
                    this.paymentStatus = 'COMPLETED';
                    this.isValidating = false;
                    setTimeout(() => {
                        this.paymentCompleted.emit();
                    }, 2000);
                },
                error: (err) => {
                    this.isValidating = false;
                    alert("Payment verification failed. Please try again.");
                }
            });
        } else {
            this.isValidating = false;
        }
    }

    close(): void {
        this.closeEvent.emit();
        this.paymentStatus = 'PENDING';
        this.payment = null;
        this.qrCodeUrl = null;
    }
}
