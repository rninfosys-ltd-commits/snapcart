import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-edit-product-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule
    ],
    templateUrl: './edit-product-modal.component.html',
    styleUrls: ['./edit-product-modal.component.scss']
})
export class EditProductModalComponent {
    protected environment = environment;
    formData: any = {
        modelNo: '',
        name: '',
        brandName: '',
        color: '',
        styleCode: '',
        colorHex: '',
        category: '',
        subCategory: '',
        price: 0,
        img1: '',
        img2: '',
        img3: '',
        img4: '',
        img5: '',
    };

    categories = ['MEN', 'WOMEN', 'KIDS', 'ELECTRONICS', 'HOME_KITCHEN', 'BEAUTY', 'ACCESSORIES', 'JEWELLERY', 'BAGS_FOOTWEAR'];
    subCategories = [
        'BOOTS', 'CASUAL', 'FORMALSHOES', 'SLIDERS', 'SPORTSSHOES',
        'SMARTPHONES', 'LAPTOPS', 'SMARTWATCHES', 'HEADPHONES',
        'KITCHEN_APPLIANCES', 'HOME_DECOR', 'BEDDING',
        'SKINCARE', 'MAKEUP', 'HAIRCARE',
        'WATCHES', 'SUNGLASSES', 'BELTS', 'WALLETS',
        'NECKLACES', 'EARRINGS', 'RINGS',
        'BACKPACKS', 'HANDBAGS', 'TRAVEL_LUGGAGE'
    ];

    constructor(
        public dialogRef: MatDialogRef<EditProductModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        if (data) {
            this.formData = { ...data };
        }
    }

    onSave() {
        this.dialogRef.close(this.formData);
    }

    onCancel() {
        this.dialogRef.close();
    }
}
