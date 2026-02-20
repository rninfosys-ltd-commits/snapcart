import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { CouponService } from '../../../core/services/coupon.service';

@Component({
  selector: 'app-create-coupon-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>Create New Coupon</h2>
      
      <form [formGroup]="couponForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Coupon Code</mat-label>
              <input matInput formControlName="code" placeholder="Ex: SAVE10" style="text-transform: uppercase">
              <mat-error *ngIf="couponForm.get('code')?.hasError('required')">Code is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Discount Type</mat-label>
              <mat-select formControlName="discountType">
                <mat-option value="PERCENTAGE">Percentage (%)</mat-option>
                <mat-option value="FIXED">Fixed Amount (₹)</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Discount Value</mat-label>
              <input matInput type="number" formControlName="discountValue">
              <span matSuffix style="margin-right: 8px">{{ couponForm.value.discountType === 'PERCENTAGE' ? '%' : '₹' }}</span>
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="couponForm.value.discountType === 'PERCENTAGE'">
              <mat-label>Max Discount (Optional)</mat-label>
              <input matInput type="number" formControlName="maxDiscount">
              <span matTextPrefix>₹&nbsp;</span>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="2"></textarea>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Min Order Amount</mat-label>
              <input matInput type="number" formControlName="minOrderAmount">
              <span matTextPrefix>₹&nbsp;</span>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Usage Limit (0 for unlimited)</mat-label>
              <input matInput type="number" formControlName="usageLimit">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Valid From</mat-label>
              <input matInput [matDatepicker]="picker1" formControlName="validFrom">
              <mat-datepicker-toggle matIconSuffix [for]="picker1"></mat-datepicker-toggle>
              <mat-datepicker #picker1></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Valid Until</mat-label>
              <input matInput [matDatepicker]="picker2" formControlName="validUntil">
              <mat-datepicker-toggle matIconSuffix [for]="picker2"></mat-datepicker-toggle>
              <mat-datepicker #picker2></mat-datepicker>
            </mat-form-field>
          </div>

        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" mat-dialog-close>Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="couponForm.invalid || loading()">
            {{ loading() ? 'Creating...' : 'Create Coupon' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 20px; min-width: 500px; }
    h2 { margin: 0 0 20px; font-weight: 600; color: #1a1a2e; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; display: block; }
    mat-dialog-content { padding: 0 !important; overflow: visible !important; }
    mat-dialog-actions { padding: 20px 0 0 !important; margin: 0 !important; }
  `]
})
export class CreateCouponDialogComponent {
  private fb = inject(FormBuilder);
  private couponService = inject(CouponService);
  private dialogRef = inject(MatDialogRef<CreateCouponDialogComponent>);

  loading = signal(false);

  couponForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    discountType: ['PERCENTAGE', Validators.required],
    discountValue: [0, [Validators.required, Validators.min(1)]],
    minOrderAmount: [0, Validators.min(0)],
    maxDiscount: [null],
    usageLimit: [0, Validators.min(0)],
    validFrom: [new Date(), Validators.required],
    validUntil: [null] // Optional
  });

  onSubmit() {
    if (this.couponForm.invalid) return;

    this.loading.set(true);
    const formValue = this.couponForm.value;

    // Format dates to ISO string without time (or with time if needed) 
    // to match backend LocalDateTime expectation (YYYY-MM-DDTHH:mm:ss)
    const formatDate = (date: any) => {
      if (!date) return null;
      const d = new Date(date);
      const pad = (n: number) => n < 10 ? '0' + n : n;
      return d.getFullYear() + '-' +
        pad(d.getMonth() + 1) + '-' +
        pad(d.getDate()) + 'T' +
        pad(d.getHours()) + ':' +
        pad(d.getMinutes()) + ':' +
        pad(d.getSeconds());
    };

    const payload = {
      ...formValue,
      validFrom: formatDate(formValue.validFrom),
      validUntil: formatDate(formValue.validUntil)
    };

    this.couponService.createCoupon(payload).then(() => {
      this.dialogRef.close(true);
    }).catch(err => {
      console.error('Failed to create coupon', err);
      this.loading.set(false);
      // Show more detailed error if available
      const msg = err.error?.message || 'Failed to create coupon. Code might already exist.';
      alert(msg);
    });
  }
}
