
import { AuthService } from '../../../core/services/auth.service';
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';


@Component({
  selector: 'app-login',
  standalone: true, // Ensure this is true
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loading = false;
  error = '';
  hidePassword = true;

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    staySignedIn: [true]
  });

  constructor() {
    // If already logged in, redirect appropriately
    const currentUser = this.auth.user();
    if (currentUser) {
      this.redirectUserByRole(currentUser);
    }
  }

  private redirectUserByRole(user: any) {
    const roles = user?.roles || [];
    if (roles.includes('ROLE_SUPER_ADMIN')) {
      this.router.navigate(['/super-admin/dashboard']);
    } else if (roles.includes('ROLE_ADMIN')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (roles.includes('ROLE_MODERATOR') || roles.includes('ROLE_EMPLOYEE')) {
      this.router.navigate(['/moderatorHome']);
    } else {
      this.router.navigate(['/']);
    }
  }

  async submit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';

    const { email, password, staySignedIn } = this.loginForm.value;
    const result = await this.auth.login(email!, password!, staySignedIn!);

    if (result.success) {
      this.redirectUserByRole(result.user);
    } else {
      this.error = result.message;
    }

    this.loading = false;
  }
}
