
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-cta-section',
    standalone: true,
    imports: [CommonModule, MatButtonModule],
    templateUrl: './cta-section.component.html',
    styleUrls: ['./cta-section.component.scss']
})
export class CtaSectionComponent {
    auth = inject(AuthService);
    router = inject(Router);

    // Expose user signal to template
    user = this.auth.user;

    navigateToSignup() {
        this.router.navigate(['/signup']);
    }
}
