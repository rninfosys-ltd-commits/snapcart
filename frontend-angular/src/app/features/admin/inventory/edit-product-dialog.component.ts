import { Component, inject, signal, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../../core/services/product.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="edit-dialog-container">
      <div class="dialog-header">
        <h2>{{ data ? 'Edit' : 'Add' }} Product</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div *ngIf="errorMessage()" class="error-alert">
        {{ errorMessage() }}
      </div>

      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        
        <div class="form-section">
          <h3 class="section-title">Basic Information</h3>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Product Name</mat-label>
              <input matInput formControlName="name">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Color</mat-label>
              <input matInput formControlName="color">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Quantity</mat-label>
              <input matInput type="number" formControlName="quantity">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Price (₹)</mat-label>
              <input matInput type="number" formControlName="price">
            </mat-form-field>
          </div>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>
        </div>

        <div class="form-section">
          <h3 class="section-title">Categorization & Sizes</h3>
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
              <mat-label>Sizes</mat-label>
              <mat-select formControlName="sizes" multiple>
                <mat-option *ngFor="let size of availableSizes" [value]="size">{{size}}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">About Item (Bullet Points)</h3>
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
              <mat-icon>add</mat-icon> Add Point
            </button>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Additional Information</h3>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Manufacturer</mat-label>
              <input matInput formControlName="manufacturer">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Packer</mat-label>
              <input matInput formControlName="packer">
            </mat-form-field>
          </div>
           <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Importer</mat-label>
              <input matInput formControlName="importer">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Item Weight</mat-label>
              <input matInput formControlName="itemWeight">
            </mat-form-field>
          </div>
           <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Item Dimensions</mat-label>
              <input matInput formControlName="itemDimensions">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Net Quantity</mat-label>
              <input matInput formControlName="netQuantity">
            </mat-form-field>
          </div>
           <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Generic Name</mat-label>
              <input matInput formControlName="genericName">
            </mat-form-field>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Product Images</h3>
          <p class="subtitle">Click to replace. Existing images shown.</p>
          
          <div class="images-grid">
            <div class="image-box" *ngFor="let i of [1,2,3,4,5]" 
                 [class.has-image]="previews['image'+i]"
                 (click)="fileInput.click()">
              
              <input #fileInput type="file" (change)="onFileSelected($event, 'image'+i)" style="display:none" accept="image/*">
              
              <ng-container *ngIf="previews['image'+i]; else uploadPlaceholder">
                <img [src]="previews['image'+i]" class="preview-img">
                <div class="overlay">
                  <mat-icon>edit</mat-icon>
                </div>
              </ng-container>

              <ng-template #uploadPlaceholder>
                 <mat-icon class="upload-icon">add_photo_alternate</mat-icon>
                 <span class="upload-label">{{ i === 1 ? 'Main' : 'Image ' + i }}</span>
              </ng-template>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="close()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="productForm.invalid || loading()" class="submit-btn">
            <mat-spinner diameter="20" *ngIf="loading(); else btnText" style="display:inline-block; margin-right: 8px"></mat-spinner>
            <ng-template #btnText>Save Changes</ng-template>
          </button>
        </div>

      </form>
    </div>
  `,
  styles: [`
    .edit-dialog-container {
      background: var(--surface);
      color: var(--text-main);
      padding: 0;
      max-height: 90vh;
      overflow-y: auto;
      font-family: 'Inter', sans-serif;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      background: var(--surface-elevated);
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: var(--shadow-sm);
    }

    h2 { margin: 0; font-size: 1.35rem; font-weight: 700; color: var(--text-main); }

    form { padding: 24px; }

    .form-section {
      padding-bottom: 32px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 32px;
    }
    .form-section:last-of-type { border-bottom: none; }

    .section-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--primary);
      margin: 0 0 20px 0;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px; margin-top: -12px; }

    .form-row { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 20px; 
      margin-bottom: 20px;
    }
    .dynamic-row {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .full-width { width: 100%; }

    /* Theme-Aware Material Overrides */
    ::ng-deep .edit-dialog-container .mat-mdc-form-field-flex { 
      background-color: var(--input-background) !important; 
      border: 1px solid var(--input-border) !important; 
      border-radius: 8px !important; 
      transition: all 0.2s ease;
    }
    ::ng-deep .edit-dialog-container .mat-focused .mat-mdc-form-field-flex {
      border-color: var(--primary) !important;
      box-shadow: 0 0 0 3px var(--focus-ring);
    }
    ::ng-deep .edit-dialog-container .mdc-text-field--filled:not(.mdc-text-field--disabled) { background-color: transparent !important; }
    ::ng-deep .edit-dialog-container .mat-mdc-input-element { color: var(--input-text) !important; caret-color: var(--primary) !important; }
    ::ng-deep .edit-dialog-container .mat-mdc-form-field-label { color: var(--text-secondary) !important; }
    ::ng-deep .edit-dialog-container .mat-mdc-select-value { color: var(--text-main) !important; }
    ::ng-deep .edit-dialog-container .mat-mdc-select-arrow { color: var(--text-muted) !important; }
    ::ng-deep .edit-dialog-container .mat-mdc-form-field-underline { display: none !important; }
    ::ng-deep .edit-dialog-container .mat-mdc-form-field-focus-overlay { display: none !important; }

    /* Image Grid */
    .images-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); 
      gap: 16px; 
    }
    
    .image-box {
      border: 2px dashed var(--border);
      border-radius: 12px;
      background: var(--input-background);
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.3s ease;
      overflow: hidden;
    }
    
    .image-box:hover { border-color: var(--primary); background: var(--hover-overlay); }
    
    .preview-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
    .image-box:hover .preview-img { transform: scale(1.05); }
    
    .overlay {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(2px);
    }
    .image-box:hover .overlay { opacity: 1; }
    .overlay mat-icon { color: white; font-size: 28px; width: 28px; height: 28px; }

    .upload-icon { font-size: 32px; width: 32px; height: 32px; margin-bottom: 8px; color: var(--text-muted); }
    .upload-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }

    .error-alert { 
      background: var(--error-bg); 
      color: var(--error-text); 
      padding: 14px 20px; 
      border-radius: 8px; 
      margin: 20px 24px 0; 
      border: 1px solid var(--error-border); 
      font-size: 0.9rem; 
      font-weight: 500;
    }

    .form-actions {
      padding: 0 24px 32px;
      display: flex;
      justify-content: flex-end;
      gap: 16px;
    }

    .submit-btn {
      padding: 0 32px !important;
      height: 48px !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
    }
  `]
})
export class EditProductDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private dialogRef = inject(MatDialogRef<EditProductDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  productForm = this.fb.group({
    name: ['', Validators.required],
    color: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(1)]],
    category: ['', Validators.required],
    productGroup: ['', Validators.required],
    subCategory: ['', Validators.required],
    description: ['', Validators.required],
    sizes: [[] as string[]],
    aboutItems: this.fb.array([]),
    manufacturer: [''],
    packer: [''],
    importer: [''],
    itemWeight: [''],
    itemDimensions: [''],
    netQuantity: [''],
    genericName: ['']
  });

  loading = signal(false);
  errorMessage = signal('');

  images: { [key: string]: File | null } = {};
  previews: { [key: string]: string | null } = {};

  categories = ['MEN', 'WOMEN', 'KIDS', 'ELECTRONICS', 'HOME_KITCHEN', 'BEAUTY', 'ACCESSORIES', 'JEWELLERY', 'BAGS_FOOTWEAR'];

  // Sizes Map
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

  // Refined structure: Category -> Group -> SubCategory[]
  fullStructure: any = {
    MEN: {
      FOOTWEAR: [
        { value: 'BOOTS', label: 'Boots' },
        { value: 'CASUAL', label: 'Casual' },
        { value: 'FORMALSHOES', label: 'Formal Shoes' },
        { value: 'SLIDERS', label: 'Sliders/Flip Flops' },
        { value: 'SPORTSSHOES', label: 'Sports Shoes' }
      ],
      TOPWEAR: [
        { value: 'JACKETS', label: 'Jackets' },
        { value: 'SHIRTS', label: 'Shirts' },
        { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts/Hoodies' },
        { value: 'T_SHIRTS', label: 'T-Shirts' }
      ],
      BOTTOMWEAR: [
        { value: 'JEANS', label: 'Jeans' },
        { value: 'TROUSERS', label: 'Trousers' },
        { value: 'SHORTS', label: 'Shorts' }
      ]
    },
    WOMEN: {
      FOOTWEAR: [
        { value: 'CASUAL_SHOES', label: 'Casual Shoes' },
        { value: 'SLIDERS_FLIP_FLOPS', label: 'Sliders/Flip Flops' },
        { value: 'SPORTSSHOES', label: 'Sports Shoes' }
      ],
      TOPWEAR: [
        { value: 'JACKETS', label: 'Jackets' },
        { value: 'TOPS_T_SHIRTS', label: 'Tops/T-Shirts' },
        { value: 'DRESSES', label: 'Dresses' },
        { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts/Hoodies' }
      ]
    },
    KIDS: {
      BOYS: [
        { value: 'CASUAL', label: 'Casual' },
        { value: 'SPORTSSHOES', label: 'Sports Shoes' },
        { value: 'T_SHIRTS', label: 'T-Shirts' },
        { value: 'SHIRTS', label: 'Shirts' },
        { value: 'JEANS', label: 'Jeans' },
        { value: 'TROUSERS', label: 'Trousers' },
        { value: 'SHORTS', label: 'Shorts' },
        { value: 'JACKETS', label: 'Jackets' },
        { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts' }
      ],
      GIRLS: [
        { value: 'CASUAL_SHOES', label: 'Casual Shoes' },
        { value: 'SCHOOL_SHOES', label: 'School Shoes' },
        { value: 'TOPS_T_SHIRTS', label: 'Tops/T-Shirts' },
        { value: 'DRESSES', label: 'Dresses' },
        { value: 'JEANS', label: 'Jeans' },
        { value: 'TROUSERS', label: 'Trousers' },
        { value: 'SHORTS', label: 'Shorts' },
        { value: 'JACKETS', label: 'Jackets' },
        { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts' }
      ]
    },
    ELECTRONICS: {
      ELECTRONICS: [
        { value: 'SMARTPHONES', label: 'Smartphones' },
        { value: 'LAPTOPS', label: 'Laptops' },
        { value: 'SMARTWATCHES', label: 'Smartwatches' },
        { value: 'HEADPHONES', label: 'Headphones' }
      ]
    },
    HOME_KITCHEN: {
      HOME: [
        { value: 'KITCHEN_APPLIANCES', label: 'Kitchen Appliances' },
        { value: 'HOME_DECOR', label: 'Home Decor' },
        { value: 'BEDDING', label: 'Bedding' }
      ]
    },
    BEAUTY: {
      BEAUTY: [
        { value: 'SKINCARE', label: 'Skincare' },
        { value: 'MAKEUP', label: 'Makeup' },
        { value: 'HAIRCARE', label: 'Haircare' }
      ]
    },
    ACCESSORIES: {
      ACCESSORIES: [
        { value: 'WATCHES', label: 'Watches' },
        { value: 'SUNGLASSES', label: 'Sunglasses' },
        { value: 'BELTS', label: 'Belts' },
        { value: 'WALLETS', label: 'Wallets' }
      ]
    },
    JEWELLERY: {
      JEWELLERY: [
        { value: 'NECKLACES', label: 'Necklaces' },
        { value: 'EARRINGS', label: 'Earrings' },
        { value: 'RINGS', label: 'Rings' }
      ]
    },
    BAGS_FOOTWEAR: {
      ACCESSORIES: [
        { value: 'BACKPACKS', label: 'Backpacks' },
        { value: 'HANDBAGS', label: 'Handbags' },
        { value: 'TRAVEL_LUGGAGE', label: 'Travel Luggage' }
      ]
    }
  };

  get aboutItems() {
    return this.productForm.get('aboutItems') as FormArray;
  }

  addAboutItem(value: string = '') {
    this.aboutItems.push(this.fb.control(value));
  }

  removeAboutItem(index: number) {
    this.aboutItems.removeAt(index);
  }

  ngOnInit() {
    if (this.data) {
      this.productForm.patchValue({
        name: this.data.name,
        color: this.data.color,
        quantity: this.data.quantity,
        price: this.data.price,
        category: this.data.category,
        productGroup: this.data.productGroup,
        subCategory: this.data.subCategory,
        description: this.data.description,
        sizes: this.data.sizes || [],
        manufacturer: this.data.manufacturer,
        packer: this.data.packer,
        importer: this.data.importer,
        itemWeight: this.data.itemWeight,
        itemDimensions: this.data.itemDimensions,
        netQuantity: this.data.netQuantity,
        genericName: this.data.genericName
      });

      // Populate aboutItems
      if (this.data.aboutItems) {
        this.data.aboutItems.forEach((item: any) => {
          const value = typeof item === 'string' ? item : item.aboutItem;
          this.addAboutItem(value);
        });
      }

      this.updateAvailableSizes();

      // Load existing images from backend endpoint
      for (let i = 1; i <= 5; i++) {
        const hasType = this.data['image' + i + 'Type'];
        const modelNo = this.data.modelNo || this.data.id;
        // Always show image 1 if it exists or is the main image (backend handles it)
        if (hasType || i === 1) {
          this.previews['image' + i] = `${environment.apiUrl}/images/product/${modelNo}/${i}`;
        }
      }
    } else {
      // Add one empty about item by default
      this.addAboutItem();
    }
  }

  onCategoryChange() {
    this.productForm.get('productGroup')?.setValue('');
    this.productForm.get('subCategory')?.setValue('');
    this.availableSizes = [];
  }

  onGroupChange() {
    this.productForm.get('subCategory')?.setValue('');
    this.updateAvailableSizes();
  }

  updateAvailableSizes() {
    const group = this.productForm.get('productGroup')?.value;
    // Map backend group names to sizes
    // KIDS grouping is slightly different in structure (Category=KIDS, Group=BOYS/GIRLS) 
    // vs Adults (Category=MEN, Group=FOOTWEAR)
    // My sizesMap keys handle this (FOOTWEAR, TOPWEAR, BOYS, GIRLS)

    if (group && this.sizesMap[group]) {
      this.availableSizes = this.sizesMap[group];
    } else {
      // Fallback or specific logic
      // e.g. if I add accessories later
      this.availableSizes = [];
    }
  }

  getProductGroups() {
    const cat = this.productForm.get('category')?.value;
    return cat ? Object.keys(this.fullStructure[cat] || {}) : [];
  }

  getSubCategories() {
    const cat = this.productForm.get('category')?.value;
    const group = this.productForm.get('productGroup')?.value;
    if (cat && group && this.fullStructure[cat] && this.fullStructure[cat][group]) {
      return this.fullStructure[cat][group];
    }
    return [];
  }

  onFileSelected(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('Image size must be less than 5MB');
        return;
      }
      this.images[key] = file;
      this.previews[key] = URL.createObjectURL(file);
      this.errorMessage.set(''); // Clear error on valid selection
    }
  }

  close() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.loading.set(true);
    const formData = new FormData();
    const val = this.productForm.value;

    formData.append('name', val.name!);
    formData.append('color', val.color!);
    formData.append('quantity', val.quantity!.toString());
    formData.append('price', val.price!.toString());
    formData.append('category', val.category!);
    formData.append('productGroup', val.productGroup!);
    formData.append('subCategory', val.subCategory!);
    formData.append('description', val.description!);

    // Additional Info
    formData.append('manufacturer', val.manufacturer || '');
    formData.append('packer', val.packer || '');
    formData.append('importer', val.importer || '');
    formData.append('itemWeight', val.itemWeight || '');
    formData.append('itemDimensions', val.itemDimensions || '');
    formData.append('netQuantity', val.netQuantity || '');
    formData.append('genericName', val.genericName || '');

    // Lists logic
    // Spring Boot expects lists as repeated params: sizes=S&sizes=M
    if (val.sizes && val.sizes.length > 0) {
      // Note: If passing as JSON blob, we'd do JSON.stringify. 
      // But standard FormData typically handles repeated keys or needs explicit indexing depending on backend parser.
      // Spring @RequestParam List<String> works with repeated keys.
      // However, if using @ModelAttribute, it might need indices like sizes[0], sizes[1].
      // Let's try repeated keys first.
      val.sizes.forEach((s: string) => formData.append('sizes', s));
    }

    if (val.aboutItems && val.aboutItems.length > 0) {
      // Filter empty
      const items = val.aboutItems.filter((i: any) => i && i.trim().length > 0);
      items.forEach((item: any) => formData.append('aboutItems', item));
    }

    // Append new images
    Object.keys(this.images).forEach(key => {
      if (this.images[key]) {
        formData.append(key, this.images[key]!);
      }
    });

    const promise = this.data
      ? this.productService.updateProduct(this.data.modelNo || this.data.id, formData)
      : this.productService.addProduct(formData);

    promise.then(() => {
      this.dialogRef.close(true);
    }).catch(err => {
      this.errorMessage.set('Failed to save product. Please try again.');
      this.loading.set(false);
    });
  }
}
