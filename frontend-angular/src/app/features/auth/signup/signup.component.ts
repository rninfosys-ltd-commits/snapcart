import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-signup',
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
        MatSelectModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    loading = false;
    error = '';
    success = false;
    showPassword = false;
    showConfirmPassword = false;

    signupForm = this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', [Validators.pattern(/^[0-9]{10}$/)]],
        gender: ['', [Validators.required]],
        password: ['', [
            Validators.required,
            Validators.minLength(8),
            this.patternValidator(/[A-Z]/, { hasUppercase: true }),
            this.patternValidator(/[a-z]/, { hasLowercase: true }),
            this.patternValidator(/[0-9]/, { hasNumber: true }),
            this.patternValidator(/[!@#$%^&*(),.?":{}|<>]/, { hasSpecialCharacter: true }),
        ]],
        confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;
            const valid = regex.test(control.value);
            return valid ? null : error;
        };
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');
        return password && confirmPassword && password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
    }

    async submit() {
        if (this.signupForm.invalid) return;

        this.loading = true;
        this.error = '';

        const { confirmPassword, ...signupData } = this.signupForm.value;

        const result = await this.auth.signup(signupData);

        if (result.success) {
            // Auto login
            const loginRes = await this.auth.login(signupData.email || '', signupData.password || '');
            if (loginRes.success) {
                this.success = true;
                setTimeout(() => this.router.navigate(['/']), 1000); // Go to home
            } else {
                // If login fails (unlikely), valid success but redirect to login
                this.success = true;
                setTimeout(() => this.router.navigate(['/login']), 2000);
            }
        } else {
            this.error = result.message;
        }
        this.loading = false;
    }
}
