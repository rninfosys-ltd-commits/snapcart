import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';

const COLOR_MAP: { [key: string]: string } = {
  'red': '#FF0000', 'green': '#00FF00', 'blue': '#0000FF', 'black': '#000000', 'white': '#FFFFFF', 'yellow': '#FFFF00',
  'orange': '#FFA500', 'purple': '#800080', 'pink': '#FFC0CB', 'brown': '#A52A2A', 'gray': '#808080', 'grey': '#808080',
  'tan': '#D2B48C', 'beige': '#F5F5DC', 'navy': '#000080', 'olive': '#808000', 'maroon': '#800000', 'mustard': '#FFDB58',
  'burgundy': '#800020', 'camel': '#C19A6B', 'teal': '#008080', 'cyan': '#00FFFF', 'magenta': '#FF00FF', 'silver': '#C0C0C0',
  'gold': '#FFD700', 'coral': '#FF7F50', 'crimson': '#DC143C', 'khaki': '#F0E68C', 'lavender': '#E6E6FA', 'peach': '#FFDAB9'
};

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterModule
  ],
  template: `
    <div class="page-container">
      <div class="content-wrapper">
        <div class="header-section">
          <h1>Add New Product & Variants</h1>
          <button mat-stroked-button color="primary" [routerLink]="getDashboardLink()">
            <mat-icon>arrow_back</mat-icon> Dashboard
          </button>
        </div>

        <div class="form-card">
           <div *ngIf="success()" class="success-overlay">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h2>Product & Variants Added Successfully</h2>
              <p>Redirecting to inventory...</p>
           </div>

           <div *ngIf="errorMessage()" class="error-alert">
              {{ errorMessage() }}
           </div>

          <form [formGroup]="productForm" (ngSubmit)="onSubmit()" *ngIf="!success()">
            
            <div class="form-section">
              <h3 class="section-title">Common Information</h3>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Product Name</mat-label>
                  <input matInput formControlName="name" placeholder="Ex: Classic Leather Loafers">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Brand Name</mat-label>
                  <input matInput formControlName="brandName" placeholder="Ex: RedTape">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Category</mat-label>
                  <mat-select formControlName="category" (selectionChange)="onCategoryChange()">
                    <mat-option *ngFor="let cat of categories" [value]="cat">{{cat}}</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Product Group</mat-label>
                  <mat-select formControlName="productGroup" (selectionChange)="onGroupChange()">
                    <mat-option *ngFor="let group of getProductGroups()" [value]="group">{{group}}</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Sub Category</mat-label>
                  <mat-select formControlName="subCategory">
                    <mat-option *ngFor="let sub of getSubCategories()" [value]="sub.value">{{sub.label}}</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Base Price (₹)</mat-label>
                  <input matInput type="number" formControlName="price">
                </mat-form-field>
              </div>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>
            </div>

            <div formArrayName="colorGroups">
              <div *ngFor="let group of colorGroups.controls; let groupIndex=index" [formGroupName]="groupIndex" class="color-group-section" [style.border-left]="'6px solid ' + group.get('colorHex')?.value">
                <div class="group-header">
                   <h3 class="section-title">Color Variant Group #{{groupIndex + 1}}</h3>
                   <button mat-icon-button color="warn" type="button" (click)="removeColorGroup(groupIndex)" *ngIf="colorGroups.length > 1">
                      <mat-icon>delete</mat-icon>
                   </button>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                     <mat-label>Color Name</mat-label>
                     <input matInput formControlName="color" placeholder="Ex: Brown">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                     <mat-label>Color Hex</mat-label>
                     <input matInput formControlName="colorHex" type="color" style="height: 48px; cursor: pointer;">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Style Code (SKU Prefix)</mat-label>
                    <input matInput formControlName="styleCode" placeholder="Ex: RDT-LFR-01">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Quantity (Per Size)</mat-label>
                    <input matInput type="number" formControlName="quantity">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Sizes</mat-label>
                    <mat-select formControlName="sizes" multiple>
                      <mat-option *ngFor="let size of availableSizes" [value]="size">{{size}}</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="images-section">
                  <p class="section-hint">Upload up to 5 images for this color. Image 1 is the main variant image.</p>
                  <div class="images-grid">
                    <div class="image-box" *ngFor="let i of [1,2,3,4,5]" 
                         [class.has-image]="getPreview(groupIndex, i)"
                         (click)="fileInput.click()">
                      
                      <input #fileInput type="file" (change)="onFileSelected($event, groupIndex, i)" style="display:none" accept="image/*">
                      
                      <ng-container *ngIf="getPreview(groupIndex, i); else uploadPlaceholder">
                        <img [src]="getPreview(groupIndex, i)" class="preview-img">
                        <button type="button" class="delete-btn" (click)="$event.stopPropagation(); removeImage(groupIndex, i)">
                          <mat-icon>close</mat-icon>
                        </button>
                      </ng-container>

                      <ng-template #uploadPlaceholder>
                         <mat-icon class="upload-icon">add_photo_alternate</mat-icon>
                         <span class="upload-label">{{ i === 1 ? 'Main' : 'Image ' + i }}</span>
                      </ng-template>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="add-group-action">
              <button mat-stroked-button color="primary" type="button" (click)="addColorGroup()" class="add-color-btn">
                <mat-icon>add_circle_outline</mat-icon> Add Another Color Variant
              </button>
            </div>

            <div class="form-section">
              <h3 class="section-title">About Item</h3>
              <div formArrayName="aboutItems">
                <div *ngFor="let item of aboutItems.controls; let i=index" class="dynamic-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Point {{i + 1}}</mat-label>
                    <input matInput [formControlName]="i">
                  </mat-form-field>
                  <button mat-icon-button color="warn" type="button" (click)="removeAboutItem(i)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
                <button mat-stroked-button type="button" (click)="addAboutItem()">
                  <mat-icon>add</mat-icon> Add Bullet Point
                </button>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">Additional Info</h3>
              <div class="form-row">
                <mat-form-field appearance="outline"><mat-label>Manufacturer</mat-label><input matInput formControlName="manufacturer"></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Packer</mat-label><input matInput formControlName="packer"></mat-form-field>
              </div>
               <div class="form-row">
                <mat-form-field appearance="outline"><mat-label>Importer</mat-label><input matInput formControlName="importer"></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Item Weight</mat-label><input matInput formControlName="itemWeight"></mat-form-field>
              </div>
               <div class="form-row">
                <mat-form-field appearance="outline"><mat-label>Item Dimensions</mat-label><input matInput formControlName="itemDimensions"></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Net Quantity</mat-label><input matInput formControlName="netQuantity"></mat-form-field>
              </div>
               <div class="form-row">
                <mat-form-field appearance="outline"><mat-label>Generic Name</mat-label><input matInput formControlName="genericName"></mat-form-field>
              </div>
            </div>

            <div class="form-actions">
              <button mat-button type="button" [routerLink]="getDashboardLink()">Cancel</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="loading()" class="submit-btn">
                <mat-spinner diameter="20" *ngIf="loading(); else btnText" style="display:inline-block; margin-right: 8px"></mat-spinner>
                <ng-template #btnText>Create Product & Variants</ng-template>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { min-height: 100vh; background: var(--background); padding: 32px; font-family: 'Roboto', sans-serif; }
    .content-wrapper { max-width: 1000px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin: 0; }
    .form-card { background: var(--surface); border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); overflow: hidden; }
    .form-section { padding: 24px; border-bottom: 1px solid var(--border); }
    .color-group-section { padding: 24px; border-bottom: 1px solid var(--border); background: rgba(var(--primary-rgb), 0.03); position: relative; }
    .group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-title { font-size: 0.9rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 16px; }
    .dynamic-row { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
    .full-width { width: 100%; }
    .section-hint { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
    .images-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; }
    .image-box { border: 2px dashed var(--border); border-radius: 8px; background: var(--surface-low); aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: all 0.2s; }
    .image-box:hover { border-color: var(--primary); background: var(--surface-elevated); }
    .image-box.has-image { border-style: solid; border: 1px solid var(--border); padding: 0; }
    .preview-img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
    .delete-btn { position: absolute; top: 6px; right: 6px; background: rgba(0, 0, 0, 0.7); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: #ff4444; border: none; }
    .upload-icon { font-size: 28px; width: 28px; height: 28px; color: var(--text-muted); margin-bottom: 4px; }
    .upload-label { font-size: 11px; font-weight: 500; color: var(--text-muted); }
    .add-group-action { padding: 32px; text-align: center; border-bottom: 1px solid var(--border); }
    .add-color-btn { height: 48px; padding: 0 24px; font-weight: 600; }
    .form-actions { padding: 24px; background: var(--surface-low); display: flex; justify-content: flex-end; gap: 16px; }
    .submit-btn { padding: 0 40px; height: 48px; font-weight: 600; font-size: 15px; background: var(--primary) !important; color: white !important; }
    .error-alert { background: #fef2f2; border: 1px solid #fee2e2; color: #b91c1c; padding: 12px 16px; margin: 24px; border-radius: 8px; font-size: 14px; }
    .success-overlay { padding: 60px; text-align: center; }
    .success-icon { font-size: 64px; width: 64px; height: 64px; color: #10b981; margin-bottom: 16px; }
  `]
})
export class AddProductComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  productForm = this.fb.group({
    name: ['', Validators.required],
    brandName: ['', Validators.required],
    price: ['', [Validators.required, Validators.min(1)]],
    category: ['', Validators.required],
    productGroup: ['', Validators.required],
    subCategory: ['', Validators.required],
    description: ['', Validators.required],
    aboutItems: this.fb.array([]),
    manufacturer: [''],
    packer: [''],
    importer: [''],
    itemWeight: [''],
    itemDimensions: [''],
    netQuantity: [''],
    genericName: [''],
    colorGroups: this.fb.array([])
  });

  loading = signal(false);
  success = signal(false);
  errorMessage = signal('');

  groupImages: (File | null)[][] = [];
  groupPreviews: (string | null)[][] = [];

  categories = ['MEN', 'WOMEN', 'KIDS', 'ELECTRONICS', 'HOME_KITCHEN', 'BEAUTY', 'ACCESSORIES', 'JEWELLERY', 'BAGS_FOOTWEAR'];
  sizesMap: any = {
    FOOTWEAR: ['5', '6', '7', '8', '9', '10', '11', '12'],
    TOPWEAR: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    BOTTOMWEAR: ['28', '30', '32', '34', '36', '38', '40', '42'],
    BOYS: ['2Y', '4Y', '6Y', '8Y', '10Y', '12Y', '14Y'],
    GIRLS: ['2Y', '4Y', '6Y', '8Y', '10Y', '12Y', '14Y'],
    ELECTRONICS: ['Standard', '64GB', '128GB', '256GB', '512GB', '1TB'],
    HOME: ['Standard', 'Small', 'Medium', 'Large', 'Pack of 2', 'Pack of 4'],
    BEAUTY: ['50ml', '100ml', '200ml', '500ml', 'Standard'],
    ACCESSORIES: ['S', 'M', 'L', 'Free Size', 'Adjustable'],
    JEWELLERY: ['Standard', '6', '7', '8', '9', '16 inch', '18 inch', '20 inch']
  };
  availableSizes: string[] = [];

  fullStructure: any = {
    MEN: {
      FOOTWEAR: [{ value: 'BOOTS', label: 'Boots' }, { value: 'CASUAL', label: 'Casual' }, { value: 'FORMALSHOES', label: 'Formal Shoes' }, { value: 'SLIDERS', label: 'Sliders/Flip Flops' }, { value: 'SPORTSSHOES', label: 'Sports Shoes' }],
      TOPWEAR: [{ value: 'JACKETS', label: 'Jackets' }, { value: 'SHIRTS', label: 'Shirts' }, { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts/Hoodies' }, { value: 'T_SHIRTS', label: 'T-Shirts' }],
      BOTTOMWEAR: [{ value: 'JEANS', label: 'Jeans' }, { value: 'TROUSERS', label: 'Trousers' }, { value: 'SHORTS', label: 'Shorts' }]
    },
    WOMEN: {
      FOOTWEAR: [{ value: 'CASUAL_SHOES', label: 'Casual Shoes' }, { value: 'SLIDERS_FLIP_FLOPS', label: 'Sliders/Flip Flops' }, { value: 'SPORTSSHOES', label: 'Sports Shoes' }],
      TOPWEAR: [{ value: 'JACKETS', label: 'Jackets' }, { value: 'TOPS_T_SHIRTS', label: 'Tops/T-Shirts' }, { value: 'DRESSES', label: 'Dresses' }, { value: 'SWEATSHIRTS_HOODIES', label: 'SWEATSHIRTS/HOODIES' }]
    },
    KIDS: {
      BOYS: [{ value: 'CASUAL', label: 'Casual' }, { value: 'SPORTSSHOES', label: 'Sports Shoes' }, { value: 'T_SHIRTS', label: 'T-Shirts' }, { value: 'SHIRTS', label: 'Shirts' }, { value: 'JEANS', label: 'Jeans' }, { value: 'TROUSERS', label: 'Trousers' }, { value: 'SHORTS', label: 'Shorts' }, { value: 'JACKETS', label: 'Jackets' }, { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts' }],
      GIRLS: [{ value: 'CASUAL_SHOES', label: 'Casual Shoes' }, { value: 'SCHOOL_SHOES', label: 'School Shoes' }, { value: 'TOPS_T_SHIRTS', label: 'Tops/T-Shirts' }, { value: 'DRESSES', label: 'Dresses' }, { value: 'JEANS', label: 'Jeans' }, { value: 'TROUSERS', label: 'Trousers' }, { value: 'SHORTS', label: 'Shorts' }, { value: 'JACKETS', label: 'Jackets' }, { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts' }]
    },
    ELECTRONICS: { ELECTRONICS: [{ value: 'SMARTPHONES', label: 'Smartphones' }, { value: 'LAPTOPS', label: 'Laptops' }, { value: 'SMARTWATCHES', label: 'Smartwatches' }, { value: 'HEADPHONES', label: 'Headphones' }] },
    HOME_KITCHEN: { HOME: [{ value: 'KITCHEN_APPLIANCES', label: 'Kitchen Appliances' }, { value: 'HOME_DECOR', label: 'Home Decor' }, { value: 'BEDDING', label: 'Bedding' }] },
    BEAUTY: { BEAUTY: [{ value: 'SKINCARE', label: 'Skincare' }, { value: 'MAKEUP', label: 'Makeup' }, { value: 'HAIRCARE', label: 'Haircare' }] },
    ACCESSORIES: { ACCESSORIES: [{ value: 'WATCHES', label: 'Watches' }, { value: 'SUNGLASSES', label: 'Sunglasses' }, { value: 'BELTS', label: 'Belts' }, { value: 'WALLETS', label: 'Wallets' }] },
    JEWELLERY: { JEWELLERY: [{ value: 'NECKLACES', label: 'Necklaces' }, { value: 'EARRINGS', label: 'Earrings' }, { value: 'RINGS', label: 'Rings' }] },
    BAGS_FOOTWEAR: { ACCESSORIES: [{ value: 'BACKPACKS', label: 'Backpacks' }, { value: 'HANDBAGS', label: 'Handbags' }, { value: 'TRAVEL_LUGGAGE', label: 'Travel Luggage' }] }
  };

  getDashboardLink() {
    return this.authService.primaryRole() === 'MODERATOR' ? '/moderator/dashboard' : '/admin/dashboard';
  }

  get aboutItems() { return this.productForm.get('aboutItems') as FormArray; }
  addAboutItem(value: string = '') { this.aboutItems.push(this.fb.control(value)); }
  removeAboutItem(index: number) { this.aboutItems.removeAt(index); }

  get colorGroups() { return this.productForm.get('colorGroups') as FormArray; }

  addColorGroup() {
    const group = this.fb.group({
      color: ['', Validators.required],
      colorHex: ['#000000'],
      styleCode: [''],
      quantity: ['0', [Validators.required, Validators.min(0)]],
      sizes: [[] as string[], Validators.required]
    });

    if (this.colorGroups.length === 0) {
      group.get('color')?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(name => this.onFirstColorChange(name, group));
    }

    this.colorGroups.push(group);
    this.groupImages.push(new Array(6).fill(null));
    this.groupPreviews.push(new Array(6).fill(null));
  }

  removeColorGroup(index: number) {
    this.colorGroups.removeAt(index);
    this.groupImages.splice(index, 1);
    this.groupPreviews.splice(index, 1);
  }

  ngOnInit() {
    this.addAboutItem();
    this.addColorGroup();
  }

  onFirstColorChange(name: string | null, group: any) {
    if (name) {
      const lower = name.toLowerCase().trim();
      if (COLOR_MAP[lower]) group.get('colorHex')?.setValue(COLOR_MAP[lower], { emitEvent: false });
    }
  }

  onCategoryChange() {
    this.productForm.patchValue({ productGroup: '', subCategory: '' });
    this.availableSizes = [];
  }

  onGroupChange() {
    this.productForm.patchValue({ subCategory: '' });
    this.updateAvailableSizes();
  }

  updateAvailableSizes() {
    const group = this.productForm.get('productGroup')?.value;
    if (group && this.sizesMap[group]) {
      this.availableSizes = this.sizesMap[group];
    } else {
      const cat = this.productForm.get('category')?.value;
      this.availableSizes = cat === 'KIDS' ? ['2Y', '4Y', '6Y', '8L'] : ['S', 'M', 'L', 'XL'];
    }
  }

  getProductGroups() {
    const cat = this.productForm.get('category')?.value;
    return cat ? Object.keys(this.fullStructure[cat] || {}) : [];
  }

  getSubCategories() {
    const cat = this.productForm.get('category')?.value;
    const group = this.productForm.get('productGroup')?.value;
    return (cat && group) ? this.fullStructure[cat][group] || [] : [];
  }

  onFileSelected(event: any, groupIndex: number, imageIndex: number) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Max size is 5MB.');
        return;
      }
      this.groupImages[groupIndex][imageIndex] = file;
      this.groupPreviews[groupIndex][imageIndex] = URL.createObjectURL(file);
      if (groupIndex === 0 && imageIndex === 1 && !this.colorGroups.at(0).get('color')?.value) {
        this.analyzeImageForColor(file);
      }
    }
  }

  async analyzeImageForColor(file: File) {
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise(r => img.onload = r);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 100; canvas.height = 100;
      ctx.drawImage(img, img.width / 4, img.height / 4, img.width / 2, img.height / 2, 0, 0, 100, 100);
      const data = ctx.getImageData(0, 0, 100, 100).data;
      let r = 0, g = 0, b = 0, c = 0;
      for (let i = 0; i < data.length; i += 4) {
        const br = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (br > 20 && br < 235) { r += data[i]; g += data[i + 1]; b += data[i + 2]; c++; }
      }
      if (c > 0) {
        const hex = this.rgbToHex(Math.floor(r / c), Math.floor(g / c), Math.floor(b / c));
        const group = this.colorGroups.at(0);
        group.get('colorHex')?.setValue(hex);
        group.get('color')?.setValue(this.findNearestColor(Math.floor(r / c), Math.floor(g / c), Math.floor(b / c)), { emitEvent: false });
      }
    } catch (e) { }
  }

  private rgbToHex(r: number, g: number, b: number) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  private findNearestColor(r: number, g: number, b: number) {
    let min = Infinity, res = 'Custom';
    for (const [name, hex] of Object.entries(COLOR_MAP)) {
      const entryR = parseInt(hex.slice(1, 3), 16), entryG = parseInt(hex.slice(3, 5), 16), entryB = parseInt(hex.slice(5, 7), 16);
      const d = Math.sqrt(Math.pow(r - entryR, 2) + Math.pow(g - entryG, 2) + Math.pow(b - entryB, 2));
      if (d < min) { min = d; res = name.charAt(0).toUpperCase() + name.slice(1); }
    }
    return res;
  }

  removeImage(gi: number, ii: number) {
    this.groupImages[gi][ii] = null;
    this.groupPreviews[gi][ii] = null;
  }

  getPreview(gi: number, ii: number) {
    return this.groupPreviews[gi]?.[ii] || null;
  }

  async onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();

      const invalidControls: string[] = [];
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        if (control?.invalid) invalidControls.push(key);
      });

      // Check color groups
      const groups = this.productForm.get('colorGroups') as FormArray;
      groups.controls.forEach((g: any, index) => {
        if (g.invalid) {
          if (g.get('color')?.invalid) invalidControls.push(`Variant ${index + 1} Color`);
          if (g.get('quantity')?.invalid) invalidControls.push(`Variant ${index + 1} Quantity`);
          if (g.get('sizes')?.invalid) invalidControls.push(`Variant ${index + 1} Sizes`);
        }
      });

      this.errorMessage.set(`Please fill all required fields: ${invalidControls.join(', ')}`);
      window.scrollTo(0, 0);
      return;
    }
    if (!this.groupImages[0][1]) {
      this.errorMessage.set('Main Image for first color is required.');
      window.scrollTo(0, 0);
      return;
    }

    this.loading.set(true);
    // ... rest of submit logic
    const val = this.productForm.value;
    const variants: any[] = [];
    const filesSet = new Set<File>();

    val.colorGroups?.forEach((g: any, idx: number) => {
      (g.sizes as string[]).forEach(s => {
        const v: any = {
          color: g.color, colorHex: g.colorHex, size: s,
          price: Number(val.price), quantity: Number(g.quantity),
          styleCode: g.styleCode,
          sku: (g.styleCode || val.name) + '-' + g.color + '-' + s,
          images: []
        };
        [1, 2, 3, 4, 5].forEach(i => {
          const f = this.groupImages[idx][i];
          if (f) {
            v.images.push({ imageUrl: f.name, isPrimary: i === 1, imageType: 'ver' });
            filesSet.add(f);
          }
        });
        variants.push(v);
      });
    });

    const dto = { ...val, price: Number(val.price), variants, aboutItems: (val.aboutItems as string[]).map(s => ({ aboutItem: s })) };
    const fd = new FormData();
    fd.append('product', JSON.stringify(dto));
    filesSet.forEach(file => fd.append('files', file));

    try {
      if (this.authService.primaryRole() === 'MODERATOR') {
        await this.productService.addProductModerator(fd);
      } else {
        await this.productService.addProduct(fd);
      }
      this.success.set(true);
      setTimeout(() => this.router.navigate([this.getDashboardLink().replace('dashboard', 'products')]), 1500);
    } catch (err) {
      this.errorMessage.set('Failed to create product. Please try again.');
      this.loading.set(false);
    }
  }
}
