import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatStepperModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    loading = false;
    activeStep = 0;
    email = '';
    otp = '';

    emailForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    otpForm = this.fb.group({
        otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    resetForm = this.fb.group({
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
    }, {
        validators: (control) => {
            const p = control.get('newPassword');
            const cp = control.get('confirmPassword');
            return p && cp && p.value !== cp.value ? { mismatch: true } : null;
        }
    });

    async sendOtp() {
        if (this.emailForm.invalid) return;
        this.loading = true;
        this.email = this.emailForm.value.email!;
        const res = await this.auth.sendOtp(this.email);
        if (res.success) {
            this.activeStep = 1;
        } else {
            alert(res.message);
        }
        this.loading = false;
    }

    async verifyOtp() {
        if (this.otpForm.invalid) return;
        this.loading = true;
        this.otp = this.otpForm.value.otp!;
        const res = await this.auth.verifyOtp(this.email, this.otp);
        if (res.success) {
            this.activeStep = 2;
        } else {
            alert(res.message);
        }
        this.loading = false;
    }

    async resetPassword() {
        if (this.resetForm.invalid) return;
        this.loading = true;
        const res = await this.auth.resetPassword({
            email: this.email,
            otp: this.otp,
            newPassword: this.resetForm.value.newPassword
        });
        if (res.success) {
            alert('Password reset successfully!');
            this.router.navigate(['/login']);
        } else {
            alert(res.message);
        }
        this.loading = false;
    }
}
