import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { AddressService, Address } from '../../../core/services/address.service';

@Component({
    selector: 'app-saved-addresses',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatMenuModule],
    template: `
    <div class="page-container">
      <div class="header">
        <div>
          <h2>Saved Addresses</h2>
          <p>Manage your delivery addresses</p>
        </div>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Add New Address
        </button>
      </div>

      <div *ngIf="loading()" class="loading-state">
        <div class="spinner"></div>
      </div>

      <div *ngIf="!loading() && addresses().length === 0" class="empty-state">
        <mat-icon class="large-icon">location_off</mat-icon>
        <h3>No saved addresses</h3>
        <p>Add an address for faster checkout</p>
      </div>

      <div class="grid">
        <div *ngFor="let addr of addresses()" class="address-card" [class.default]="addr.isDefault">
          <div class="card-header">
             <span class="label-badge">
                <mat-icon class="label-icon">{{ getIcon(addr.label) }}</mat-icon>
                {{ addr.label }}
             </span>
             <span *ngIf="addr.isDefault" class="default-badge">Default</span>
             
             <button mat-icon-button [matMenuTriggerFor]="menu" class="opts-btn"><mat-icon>more_horiz</mat-icon></button>
             <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="editAddress(addr)"><mat-icon>edit</mat-icon> Edit</button>
                <button mat-menu-item *ngIf="!addr.isDefault" (click)="setAsDefault(addr.id!)"><mat-icon>check</mat-icon> Set Default</button>
                <button mat-menu-item (click)="deleteAddress(addr.id!)" class="text-danger"><mat-icon>delete</mat-icon> Delete</button>
             </mat-menu>
          </div>

          <h3>{{addr.fullName}}</h3>
          <p class="addr-text">
            {{addr.addressLine}}<br>
            {{addr.city}}, {{addr.state}} - {{addr.pincode}}
          </p>
          <p class="phone"><mat-icon>phone</mat-icon> {{addr.phone}}</p>
        </div>
      </div>

      <!-- Modal Overlay (Inline for simplicity or use MatDialog) -->
      <div *ngIf="showForm()" class="modal-overlay" (click)="closeForm()">
        <div class="modal-content" (click)="$event.stopPropagation()">
           <h3>{{ editingId ? 'Edit Address' : 'Add New Address' }}</h3>
           
           <form [formGroup]="addressForm" (ngSubmit)="onSubmit()">
              <div class="form-grid">
                 <div class="btn-group">
                   <button type="button" *ngFor="let l of ['Home','Work','Other']" 
                     [class.active]="addressForm.get('label')?.value === l"
                     (click)="addressForm.patchValue({label: l})">{{l}}</button>
                 </div>

                 <input formControlName="fullName" placeholder="Full Name">
                 <input formControlName="phone" placeholder="Phone Number">
                 <textarea formControlName="addressLine" placeholder="Address Area / Street"></textarea>
                 <input formControlName="city" placeholder="City">
                 <input formControlName="state" placeholder="State">
                 <input formControlName="pincode" placeholder="Pincode">
                 
                 <label class="checkbox-row">
                    <input type="checkbox" formControlName="isDefault">
                    Set as default address
                 </label>
              </div>

              <div class="modal-actions">
                <button type="button" mat-button (click)="closeForm()">Cancel</button>
                <button type="submit" mat-raised-button color="primary" [disabled]="addressForm.invalid">Save Address</button>
              </div>
           </form>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-container { max-width: 1000px; margin: 100px auto 40px; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    h2 { margin: 0; font-weight: 700; color: #1a1a2e; }
    p { margin: 0; color: #64748b; }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .address-card { 
      background: white; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; 
      position: relative; transition: all 0.2s;
    }
    .address-card.default { border: 2px solid #e63946; background: #fff5f5; }
    
    .card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
    .label-badge { 
      display: flex; align-items: center; gap: 5px; background: #f1f5f9; 
      padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: 600;
    }
    .label-icon { font-size: 16px; width: 16px; height: 16px; }
    .default-badge { background: #e63946; color: white; font-size: 12px; padding: 2px 8px; border-radius: 4px; }
    .opts-btn { margin-left: auto; }
    
    .phone { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 14px; margin-top: 10px; }
    .phone mat-icon { font-size: 16px; width: 16px; height: 16px; }

    /* Modal */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-content { background: white; padding: 30px; border-radius: 16px; width: 500px; max-width: 90%; }
    .form-grid { display: grid; gap: 15px; margin: 20px 0; }
    input, textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none; }
    input:focus, textarea:focus { border-color: #e63946; }
    
    .btn-group { display: flex; gap: 10px; }
    .btn-group button { 
      flex: 1; padding: 8px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;
    }
    .btn-group button.active { background: #e63946; color: white; border-color: #e63946; }
    
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
    .text-danger { color: #d32f2f; }
  `]
})
export class SavedAddressesComponent {
    private addressService = inject(AddressService);
    private fb = inject(FormBuilder);

    addresses = signal<Address[]>([]);
    loading = signal(true);
    showForm = signal(false);
    editingId: number | null = null;

    addressForm = this.fb.group({
        label: ['Home', Validators.required],
        fullName: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
        addressLine: ['', [Validators.required, Validators.minLength(10)]],
        city: ['', Validators.required],
        state: ['', Validators.required],
        pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
        isDefault: [false]
    });

    constructor() {
        this.refresh();
    }

    getIcon(label: string) {
        if (label === 'Home') return 'home';
        if (label === 'Work') return 'work';
        return 'place';
    }

    async refresh() {
        try {
            this.loading.set(true);
            const data = await this.addressService.getAddresses();
            this.addresses.set(data);
        } finally {
            this.loading.set(false);
        }
    }

    openForm() {
        this.editingId = null;
        this.addressForm.reset({ label: 'Home', isDefault: false });
        this.showForm.set(true);
    }

    editAddress(addr: Address) {
        this.editingId = addr.id!;
        this.addressForm.patchValue(addr);
        this.showForm.set(true);
    }

    closeForm() {
        this.showForm.set(false);
    }

    async onSubmit() {
        if (this.addressForm.invalid) return;

        const val = this.addressForm.value as Address;

        try {
            if (this.editingId) {
                await this.addressService.updateAddress(this.editingId, val);
            } else {
                await this.addressService.addAddress(val);
            }
            this.closeForm();
            this.refresh();
        } catch (err) {
            console.error('Save failed', err);
        }
    }

    async deleteAddress(id: number) {
        if (confirm('Are you sure?')) {
            await this.addressService.deleteAddress(id);
            this.refresh();
        }
    }

    async setAsDefault(id: number) {
        await this.addressService.setDefault(id);
        this.refresh();
    }
}
