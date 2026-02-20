import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { ProfileService, UserProfile } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { AddressService, Address } from '../../../core/services/address.service';
import { SavedCardService, SavedCard } from '../../../core/services/saved-card.service';
import { ModeratorService } from '../../../core/services/moderator.service';
import { environment } from '../../../../environments/environment';

@Component({
   selector: 'app-profile-page',
   standalone: true,
   imports: [
      CommonModule, ReactiveFormsModule,
      MatButtonModule, MatInputModule, MatIconModule, MatSelectModule, MatCheckboxModule, RouterModule
   ],
   template: `
    <div class="profile-container">
       <div class="profile-card">
          <div class="header">
             <div *ngIf="authService.user()?.role === 'ADMIN'" style="text-align: right; margin-bottom: 15px;">
                <button mat-button color="accent" routerLink="/admin/dashboard" style="background: rgba(255,255,255,0.1); color: white;">
                   <mat-icon>arrow_back</mat-icon> Back to Dashboard
                </button>
             </div>
             <div class="avatar-area">
                <div class="avatar-wrapper">
                   <img [src]="profileImage() || 'assets/default-avatar.png'" class="avatar">
                   <button class="edit-avatar" (click)="fileInput.click()">
                      <mat-icon>edit</mat-icon>
                   </button>
                   <input #fileInput type="file" hidden (change)="onFileSelected($event)" accept="image/*">
                </div>
                <div class="user-info">
                   <h2>{{ profile()?.name }}</h2>
                   <p>{{ profile()?.email }}</p>
                   <span class="role-badge">{{ profile()?.role }}</span>
                </div>
             </div>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="form-content">
             <h3>Personal Information</h3>
             
             <div class="grid-row">
                <mat-form-field appearance="outline">
                   <mat-label>Full Name</mat-label>
                   <input matInput formControlName="name">
                </mat-form-field>

                <mat-form-field appearance="outline">
                   <mat-label>Phone Number</mat-label>
                   <input matInput formControlName="phone">
                </mat-form-field>
             </div>

             <div class="grid-row">
                <mat-form-field appearance="outline">
                   <mat-label>Email</mat-label>
                   <input matInput formControlName="email" readonly>
                   <mat-hint>Email cannot be changed</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline">
                   <mat-label>Gender</mat-label>
                   <mat-select formControlName="gender">
                      <mat-option value="MALE">Male</mat-option>
                      <mat-option value="FEMALE">Female</mat-option>
                      <mat-option value="OTHER">Other</mat-option>
                   </mat-select>
                </mat-form-field>
             </div>

             <div class="actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
                   {{ loading() ? 'Saving...' : 'Save Changes' }}
                </button>
             </div>
          </form>

          <!-- Moderator Specific Sections -->
          <div class="moderator-sections" *ngIf="profile()?.role === 'MODERATOR' && moderatorProfile()">
             <div class="section-divider"></div>
             
             <form [formGroup]="moderatorForm" (ngSubmit)="saveModeratorProfile()" class="form-content">
                <h3>Business & Financial Details</h3>
                <p class="section-desc">Complete these details to activate your brand and receive payments.</p>

                <h4>Brand Information</h4>
                <div class="grid-row">
                    <mat-form-field appearance="outline">
                        <mat-label>Brand Name</mat-label>
                        <input matInput formControlName="brandName">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>Logo URL</mat-label>
                        <input matInput formControlName="brandLogoUrl" placeholder="https://...">
                    </mat-form-field>
                </div>
                <mat-form-field appearance="outline" style="width: 100%;">
                    <mat-label>Brand Description</mat-label>
                    <textarea matInput formControlName="brandDescription" rows="3"></textarea>
                </mat-form-field>

                <h4>Warehouse Address</h4>
                <div class="grid-row three-col">
                    <mat-form-field appearance="outline">
                        <mat-label>City</mat-label>
                        <input matInput formControlName="warehouseCity">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                        <mat-label>State</mat-label>
                        <input matInput formControlName="warehouseState">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                        <mat-label>Pincode</mat-label>
                        <input matInput formControlName="warehousePincode">
                    </mat-form-field>
                </div>

                <h4>Financial Details</h4>
                <div class="grid-row">
                    <mat-form-field appearance="outline">
                        <mat-label>Bank Account Number</mat-label>
                        <input matInput formControlName="bankAccountNumber" type="password">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                        <mat-label>IFSC Code</mat-label>
                        <input matInput formControlName="ifscCode">
                    </mat-form-field>
                </div>
                <div class="grid-row">
                    <mat-form-field appearance="outline">
                        <mat-label>PAN Number</mat-label>
                        <input matInput formControlName="panNumber">
                    </mat-form-field>
                </div>

                <h4>Contract & Agreement</h4>
                <div class="contract-box" [class.signed]="moderatorProfile().isContractSigned">
                    <div *ngIf="moderatorProfile().isContractSigned; else signContract">
                        <div class="signed-status">
                            <mat-icon>verified</mat-icon>
                            <div>
                                <strong>Contract Signed</strong>
                                <p>Signed on {{ moderatorProfile().contractSignedAt | date:'medium' }}</p>
                            </div>
                        </div>
                    </div>
                    <ng-template #signContract>
                        <p class="contract-text">
                            By signing this contract, you agree to the Terms of Service, Seller Policies, and Commission Structure of SnapCart.
                            You confirm that all provided business and financial information is accurate.
                        </p>
                        <mat-checkbox formControlName="agreeToTerms">I agree to the Terms and Conditions</mat-checkbox>
                        
                        <div class="signature-field" *ngIf="moderatorForm.get('agreeToTerms')?.value">
                            <mat-form-field appearance="outline" style="width: 100%;">
                                <mat-label>Digital Signature (Type Full Name)</mat-label>
                                <input matInput formControlName="signatureUrl" placeholder="e.g. John Doe">
                                <mat-hint> typing your full name acts as a digital signature</mat-hint>
                            </mat-form-field>
                        </div>
                    </ng-template>
                </div>

                <div class="actions">
                    <button mat-raised-button color="accent" type="submit" [disabled]="loading() || moderatorForm.invalid || (!moderatorProfile().isContractSigned && !moderatorForm.get('agreeToTerms')?.value)">
                        {{ loading() ? 'Updating...' : 'Update Business Details' }}
                    </button>
                </div>
             </form>
          </div>

          <!-- User Specific Sections -->
          <div class="user-sections" *ngIf="profile()?.role === 'USER'">
             <div class="section-divider"></div>
             
             <div class="profile-section">
                <div class="section-header">
                   <h3>My Saved Addresses</h3>
                   <button mat-stroked-button color="primary" routerLink="/my-addresses">Manage</button>
                </div>
                <div class="address-grid" *ngIf="addresses().length > 0; else noAddresses">
                   <div class="address-card" *ngFor="let addr of addresses() | slice:0:2">
                      <div class="card-tag" *ngIf="addr.isDefault">Default</div>
                      <p class="label">{{addr.label}}</p>
                      <p class="details">{{addr.addressLine}}, {{addr.city}}</p>
                      <p class="details">{{addr.state}} - {{addr.pincode}}</p>
                   </div>
                </div>
                <ng-template #noAddresses>
                   <p class="empty-msg">No addresses saved yet.</p>
                </ng-template>
             </div>

             <div class="section-divider"></div>

             <div class="profile-section">
                <div class="section-header">
                   <h3>My Saved Cards</h3>
                   <button mat-stroked-button color="primary">Manage</button>
                </div>
                <div class="card-grid" *ngIf="cards().length > 0; else noCards">
                   <div class="payment-card" *ngFor="let card of cards() | slice:0:2">
                      <div class="card-brand">{{card.brand}}</div>
                      <p class="card-no">**** **** **** {{card.last4}}</p>
                      <p class="holder">{{card.cardHolderName}}</p>
                   </div>
                </div>
                <ng-template #noCards>
                   <p class="empty-msg">No cards saved yet.</p>
                </ng-template>
             </div>
          </div>
       </div>
    </div>
  `,
   styles: [`
    .profile-container { max-width: 800px; margin: 40px auto; padding: 20px; }
    
    .profile-card { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
    
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 30px; color: white; }
    
    .avatar-area { display: flex; align-items: center; gap: 25px; }
    .avatar-wrapper { position: relative; }
    .avatar { width: 100px; height: 100px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.2); object-fit: cover; background: #fff; }
    .edit-avatar { 
       position: absolute; bottom: 0; right: 0; background: #e63946; color: white; border: none; 
       border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
       cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
       mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    
    .user-info h2 { margin: 0 0 5px; font-size: 24px; }
    .user-info p { margin: 0 0 10px; opacity: 0.8; }
    .role-badge { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; }

    .form-content { padding: 30px; }
    h3 { margin-bottom: 10px; color: #1a1a2e; }
    h4 { margin: 20px 0 10px; color: #444; font-size: 16px; border-bottom: 1px dashed #eee; padding-bottom: 5px; }
    .section-desc { color: #666; font-size: 13px; margin-bottom: 20px; }
    
    .grid-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .three-col { grid-template-columns: 1fr 1fr 1fr; }
    
    .actions { margin-top: 20px; text-align: right; }

    .user-sections, .moderator-sections { padding: 0 0 30px; }
    .section-divider { height: 1px; background: #eee; margin: 0; }
    .profile-section { padding: 0 30px; margin-bottom: 20px; margin-top: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .section-header h3 { margin: 0; border: none; padding: 0; }
    
    .address-grid, .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    
    .address-card { 
       padding: 15px; border: 1px solid #eee; border-radius: 8px; position: relative; 
       background: #fdfdfd; 
       .label { font-weight: 600; font-size: 14px; margin-bottom: 5px; color: #1a1a2e; }
       .details { margin: 0; font-size: 13px; color: #666; }
       .card-tag { 
          position: absolute; top: 10px; right: 10px; background: #e63946; color: white;
          font-size: 10px; padding: 2px 6px; border-radius: 4px;
       }
    }

    .payment-card {
       padding: 15px; border-radius: 8px; background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
       color: white; border: 1px solid rgba(255,255,255,0.1);
       .card-brand { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 10px; }
       .card-no { font-family: monospace; font-size: 15px; margin-bottom: 10px; }
       .holder { font-size: 12px; margin: 0; text-transform: uppercase; }
    }

    .contract-box {
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        margin-top: 20px;

        &.signed {
            background: #e8f5e9;
            border-color: #c8e6c9;
        }
    }

    .signed-status {
        display: flex;
        align-items: center;
        gap: 15px;
        color: #2e7d32;
        mat-icon { font-size: 32px; height: 32px; width: 32px; }
    }

    .contract-text {
        font-size: 13px;
        color: #555;
        line-height: 1.5;
        margin-bottom: 15px;
    }

    .signature-field {
        margin-top: 15px;
    }

    .empty-msg { color: #888; font-style: italic; font-size: 14px; }
    
    @media (max-width: 600px) {
       .grid-row, .address-grid, .card-grid, .three-col { grid-template-columns: 1fr; }
       .avatar-area { flex-direction: column; text-align: center; }
    }
  `]
})
export class ProfilePageComponent {
   profileService = inject(ProfileService);
   authService = inject(AuthService);
   addressService = inject(AddressService);
   cardService = inject(SavedCardService);
   moderatorService = inject(ModeratorService);
   fb = inject(FormBuilder);
   snackBar = inject(MatSnackBar);

   profile = signal<UserProfile | null>(null);
   moderatorProfile = signal<any>(null);
   addresses = signal<Address[]>([]);
   cards = signal<SavedCard[]>([]);
   profileImage = signal<string | null>(null);
   loading = signal(false);

   profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [''],
      phone: [''],
      gender: ['']
   });

   moderatorForm = this.fb.group({
      brandName: ['', Validators.required],
      brandDescription: [''],
      brandLogoUrl: [''],
      warehouseCity: ['', Validators.required],
      warehouseState: ['', Validators.required],
      warehousePincode: ['', Validators.required],
      bankAccountNumber: ['', [Validators.required, Validators.minLength(9)]],
      ifscCode: ['', Validators.required],
      panNumber: ['', Validators.required],
      agreeToTerms: [false],
      signatureUrl: [''],
      isContractSigned: [false]
   });

   constructor() {
      this.loadProfile();
   }

   async loadProfile() {
      try {
         const data = await this.profileService.getProfile();
         this.profile.set(data);
         this.profileImage.set(data.hasProfilePicture ? `${environment.apiUrl}/profile/picture?t=${Date.now()}` : null);
         this.profileForm.patchValue({
            name: data.name,
            email: data.email,
            phone: data.mobile,
            gender: data.gender
         });

         if (data.role === 'USER') {
            const [addrs, savedCards] = await Promise.all([
               this.addressService.getAddresses(),
               this.cardService.getCards()
            ]);
            this.addresses.set(addrs);
            this.cards.set(savedCards);
         } else if (data.role === 'MODERATOR') {
            await this.loadModeratorProfile();
         }
      } catch (err) {
         console.error('Failed to load profile', err);
      }
   }

   async loadModeratorProfile() {
      try {
         const modData = await this.moderatorService.getMyProfile();
         this.moderatorProfile.set(modData);
         this.moderatorForm.patchValue({
            brandName: modData.brandName,
            brandDescription: modData.brandDescription,
            brandLogoUrl: modData.brandLogoUrl,
            warehouseCity: modData.warehouseCity,
            warehouseState: modData.warehouseState,
            warehousePincode: modData.warehousePincode,
            bankAccountNumber: modData.bankAccountNumber,
            ifscCode: modData.ifscCode,
            panNumber: modData.panNumber,
            signatureUrl: modData.signatureUrl,
            isContractSigned: modData.isContractSigned
         });

         if (modData.isContractSigned) {
            this.moderatorForm.get('agreeToTerms')?.disable();
            this.moderatorForm.get('signatureUrl')?.disable();
         }

      } catch (err) {
         console.error('Failed to load moderator profile', err);
      }
   }

   async onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
         try {
            const res = await this.profileService.uploadProfileImage(file);
            this.profileImage.set(res.imageUrl);
            this.snackBar.open('Profile picture updated!', 'Close', { duration: 3000 });
         } catch (err) {
            this.snackBar.open('Failed to upload image', 'Close', { duration: 3000 });
         }
      }
   }

   async saveProfile() {
      if (this.profileForm.invalid) return;

      this.loading.set(true);
      try {
         const updated = await this.profileService.updateProfile(this.profileForm.value as Partial<UserProfile>);
         this.profile.set(updated);
         this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
      } catch (err) {
         this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
      } finally {
         this.loading.set(false);
      }
   }

   async saveModeratorProfile() {
      if (this.moderatorForm.invalid) return;

      this.loading.set(true);
      try {
         const formVal = this.moderatorForm.value;
         // Explicitly set isContractSigned if agreeToTerms is true
         if (formVal.agreeToTerms) {
            formVal.isContractSigned = true;
         }
         delete formVal.agreeToTerms;

         const updated = await this.moderatorService.updateMyProfile(formVal);
         this.moderatorProfile.set(updated);
         this.snackBar.open('Business details updated successfully!', 'Close', { duration: 3000 });

         if (updated.isContractSigned) {
            this.moderatorForm.get('agreeToTerms')?.disable();
            this.moderatorForm.get('signatureUrl')?.disable();
         }

      } catch (err) {
         this.snackBar.open('Failed to update business details', 'Close', { duration: 3000 });
      } finally {
         this.loading.set(false);
      }
   }
}
