import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, ProductVariant } from '../../../core/models/models';

const COLOR_MAP: { [key: string]: string } = {
  'red': '#FF0000', 'green': '#00FF00', 'blue': '#0000FF', 'black': '#000000',
  'white': '#FFFFFF', 'yellow': '#FFFF00', 'orange': '#FFA500', 'purple': '#800080',
  'pink': '#FFC0CB', 'brown': '#A52A2A', 'gray': '#808080', 'grey': '#808080',
  'tan': '#D2B48C', 'beige': '#F5F5DC', 'navy': '#000080', 'olive': '#808000',
  'maroon': '#800000', 'mustard': '#FFDB58', 'burgundy': '#800020', 'camel': '#C19A6B',
  'teal': '#008080', 'cyan': '#00FFFF', 'magenta': '#FF00FF', 'silver': '#C0C0C0',
  'gold': '#FFD700', 'coral': '#FF7F50', 'crimson': '#DC143C', 'khaki': '#F0E68C',
  'lavender': '#E6E6FA', 'peach': '#FFDAB9'
};

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterModule
  ],
  template: `
    <div class="page-container">
      <div class="content-wrapper">
        <div class="header-section">
          <h1>Edit Product & Variants</h1>
          <button mat-stroked-button color="primary" [routerLink]="getDashboardLink()">
            <mat-icon>arrow_back</mat-icon> Dashboard
          </button>
        </div>

        <div class="form-card">
           <div *ngIf="success()" class="success-overlay">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h2>Product Updated Successfully</h2>
              <p>Redirecting to inventory...</p>
           </div>

           <div *ngIf="errorMessage()" class="error-alert">
              {{ errorMessage() }}
           </div>

           <div *ngIf="loadingData(); else formContent" class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading product details...</p>
           </div>

           <ng-template #formContent>
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

              <!-- Color Groups -->
              <div formArrayName="colorGroups">
                <div *ngFor="let group of colorGroups.controls; let groupIndex=index" [formGroupName]="groupIndex" class="color-group-section" [style.border-left]="'4px solid ' + group.get('colorHex')?.value">
                  <div class="group-header">
                     <h3 class="section-title">Color Variant Group #{{groupIndex + 1}}: {{group.get('color')?.value}}</h3>
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
                       <input matInput formControlName="colorHex" type="color" style="height: 40px; cursor: pointer;">
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

                  <!-- Images for this color group -->
                  <div class="images-section">
                    <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Images for this color (Up to 5):</p>
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
                <button mat-stroked-button color="primary" type="button" (click)="addColorGroup()">
                  <mat-icon>add</mat-icon> Add Another Color
                </button>
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

              <div class="form-actions">
                <button mat-button type="button" [routerLink]="getDashboardLink()">Cancel</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="productForm.invalid || loading()" class="submit-btn" style="background-color: var(--primary); color: white;">
                  <mat-spinner diameter="20" *ngIf="loading(); else btnText" style="display:inline-block; margin-right: 8px"></mat-spinner>
                  <ng-template #btnText>Save Changes</ng-template>
                </button>
              </div>

             </form>
           </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { min-height: 100vh; background: var(--background); padding: 32px; font-family: 'Roboto', sans-serif; color: var(--text-main); }
    .content-wrapper { max-width: 1000px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin: 0; }
    .form-card { background: var(--surface); border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); overflow: hidden; }
    .form-section { padding: 24px; border-bottom: 1px solid var(--border); }
    .color-group-section { padding: 24px; border-bottom: 1px solid var(--border); background: rgba(var(--primary-rgb), 0.02); margin-bottom: 16px; }
    .group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-title { font-size: 1rem; font-weight: 600; color: var(--text-main); margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 16px; }
    @media(max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
    .dynamic-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
    .full-width { width: 100%; }
    .images-section { margin-top: 24px; }
    .images-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px; }
    .image-box { border: 1px dashed var(--border); border-radius: 8px; background: var(--surface-low); aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: all 0.2s; }
    .image-box:hover { border-color: var(--primary); background: var(--surface-elevated); }
    .image-box.has-image { border-style: solid; padding: 0; border: 1px solid var(--border); }
    .preview-img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
    .delete-btn { position: absolute; top: 4px; right: 4px; background: rgba(0, 0, 0, 0.7); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid var(--border); color: #ef4444; }
    .delete-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .upload-icon { font-size: 24px; width: 24px; height: 24px; margin-bottom: 4px; color: var(--text-muted); }
    .upload-label { font-size: 0.75rem; color: var(--text-muted); }
    .add-group-action { padding: 24px; text-align: center; border-bottom: 1px solid var(--border); }
    .form-actions { padding: 24px; background: var(--surface-low); border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }
    .submit-btn { padding: 0 48px; height: 48px; font-weight: 600; font-size: 15px; }
    .error-alert { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px 16px; border-radius: 6px; margin: 24px; border: 1px solid #ef4444; font-size: 0.875rem; }
    .success-overlay { text-align: center; padding: 48px; color: var(--text-main); }
    .success-icon { font-size: 48px; width: 48px; height: 48px; color: #10b981; margin-bottom: 16px; }
    .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; color: var(--text-secondary); gap: 16px; }
    ::ng-deep .mat-mdc-form-field-flex { border-radius: 4px !important; }
    ::ng-deep .mat-mdc-input-element { caret-color: var(--primary) !important; }
  `]
})
export class EditProductComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  modelNo!: string;
  loadingData = signal(true);

  getDashboardLink() {
    const role = this.authService.primaryRole();
    return role === 'MODERATOR' ? '/moderator/dashboard' : '/admin/dashboard';
  }

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
  groupExistingUrls: string[][] = [];

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
      FOOTWEAR: [
        { value: 'BOOTS', label: 'Boots' }, { value: 'CASUAL', label: 'Casual' },
        { value: 'FORMALSHOES', label: 'Formal Shoes' }, { value: 'SLIDERS', label: 'Sliders/Flip Flops' },
        { value: 'SPORTSSHOES', label: 'Sports Shoes' }
      ],
      TOPWEAR: [
        { value: 'JACKETS', label: 'Jackets' }, { value: 'SHIRTS', label: 'Shirts' },
        { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts/Hoodies' }, { value: 'T_SHIRTS', label: 'T-Shirts' }
      ],
      BOTTOMWEAR: [
        { value: 'JEANS', label: 'Jeans' }, { value: 'TROUSERS', label: 'Trousers' }, { value: 'SHORTS', label: 'Shorts' }
      ]
    },
    WOMEN: {
      FOOTWEAR: [
        { value: 'CASUAL_SHOES', label: 'Casual Shoes' }, { value: 'SLIDERS_FLIP_FLOPS', label: 'Sliders/Flip Flops' },
        { value: 'SPORTSSHOES', label: 'Sports Shoes' }
      ],
      TOPWEAR: [
        { value: 'JACKETS', label: 'Jackets' }, { value: 'TOPS_T_SHIRTS', label: 'Tops/T-Shirts' },
        { value: 'DRESSES', label: 'Dresses' }, { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts/Hoodies' }
      ]
    },
    KIDS: {
      BOYS: [
        { value: 'CASUAL', label: 'Casual' }, { value: 'SPORTSSHOES', label: 'Sports Shoes' },
        { value: 'T_SHIRTS', label: 'T-Shirts' }, { value: 'SHIRTS', label: 'Shirts' },
        { value: 'JEANS', label: 'Jeans' }, { value: 'TROUSERS', label: 'Trousers' },
        { value: 'SHORTS', label: 'Shorts' }, { value: 'JACKETS', label: 'Jackets' },
        { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts' }
      ],
      GIRLS: [
        { value: 'CASUAL_SHOES', label: 'Casual Shoes' }, { value: 'SCHOOL_SHOES', label: 'School Shoes' },
        { value: 'TOPS_T_SHIRTS', label: 'Tops/T-Shirts' }, { value: 'DRESSES', label: 'Dresses' },
        { value: 'JEANS', label: 'Jeans' }, { value: 'TROUSERS', label: 'Trousers' },
        { value: 'SHORTS', label: 'Shorts' }, { value: 'JACKETS', label: 'Jackets' },
        { value: 'SWEATSHIRTS_HOODIES', label: 'Sweatshirts' }
      ]
    },
    ELECTRONICS: { ELECTRONICS: [{ value: 'SMARTPHONES', label: 'Smartphones' }, { value: 'LAPTOPS', label: 'Laptops' }, { value: 'SMARTWATCHES', label: 'Smartwatches' }, { value: 'HEADPHONES', label: 'Headphones' }] },
    HOME_KITCHEN: { HOME: [{ value: 'KITCHEN_APPLIANCES', label: 'Kitchen Appliances' }, { value: 'HOME_DECOR', label: 'Home Decor' }, { value: 'BEDDING', label: 'Bedding' }] },
    BEAUTY: { BEAUTY: [{ value: 'SKINCARE', label: 'Skincare' }, { value: 'MAKEUP', label: 'Makeup' }, { value: 'HAIRCARE', label: 'Haircare' }] },
    ACCESSORIES: { ACCESSORIES: [{ value: 'WATCHES', label: 'Watches' }, { value: 'SUNGLASSES', label: 'Sunglasses' }, { value: 'BELTS', label: 'Belts' }, { value: 'WALLETS', label: 'Wallets' }] },
    JEWELLERY: { JEWELLERY: [{ value: 'NECKLACES', label: 'Necklaces' }, { value: 'EARRINGS', label: 'Earrings' }, { value: 'RINGS', label: 'Rings' }] },
    BAGS_FOOTWEAR: { ACCESSORIES: [{ value: 'BACKPACKS', label: 'Backpacks' }, { value: 'HANDBAGS', label: 'Handbags' }, { value: 'TRAVEL_LUGGAGE', label: 'Travel Luggage' }] }
  };

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
      sizes: [[] as string[], Validators.required],
      existingVariantIds: [new Map<string, number>()]
    });
    this.colorGroups.push(group);
    this.groupImages.push(new Array(6).fill(null));
    this.groupPreviews.push(new Array(6).fill(null));
    this.groupExistingUrls.push(new Array(6).fill(''));
  }

  removeColorGroup(index: number) {
    this.colorGroups.removeAt(index);
    this.groupImages.splice(index, 1);
    this.groupPreviews.splice(index, 1);
    this.groupExistingUrls.splice(index, 1);
  }

  async ngOnInit() {
    this.modelNo = this.route.snapshot.paramMap.get('modelNo')!;
    if (this.modelNo) {
      await this.loadProduct(this.modelNo);
    } else {
      this.addColorGroup();
    }
  }

  async loadProduct(modelNo: string) {
    try {
      const product = await this.productService.getProductByModelNo(modelNo);
      this.patchForm(product);
      this.loadingData.set(false);
    } catch (err) {
      this.errorMessage.set('Failed to load product details.');
      this.loadingData.set(false);
    }
  }

  patchForm(product: Product) {
    this.productForm.patchValue({
      name: product.name,
      brandName: product.brandName,
      description: product.description,
      price: String(product.price),
      category: product.category,
      subCategory: product.subCategory,
      productGroup: product.productGroup,
      manufacturer: product.manufacturer,
      packer: product.packer,
      importer: product.importer,
      itemWeight: product.itemWeight,
      itemDimensions: product.itemDimensions,
      netQuantity: product.netQuantity,
      genericName: product.genericName
    });

    if ((product as any).aboutItems) {
      this.aboutItems.clear();
      (product as any).aboutItems.forEach((item: string) => this.addAboutItem(item));
    }

    this.updateAvailableSizes();

    const colorMap = new Map<string, ProductVariant[]>();
    product.variants.forEach(v => {
      if (!colorMap.has(v.color)) colorMap.set(v.color, []);
      colorMap.get(v.color)!.push(v);
    });

    this.colorGroups.clear();
    this.groupImages = [];
    this.groupPreviews = [];
    this.groupExistingUrls = [];

    colorMap.forEach((variants, color) => {
      const first = variants[0];
      const variantIdsMap = new Map<string, number>();
      variants.forEach(v => variantIdsMap.set(v.size, v.id));

      const group = this.fb.group({
        color: [color, Validators.required],
        colorHex: [first.colorHex || '#000000'],
        styleCode: [first.styleCode || ''],
        quantity: [String(first.quantity), [Validators.required, Validators.min(0)]],
        sizes: [variants.map(v => v.size), Validators.required],
        existingVariantIds: [variantIdsMap]
      });
      this.colorGroups.push(group);

      const imgsArr = new Array(6).fill(null);
      const prevsArr = new Array(6).fill(null);
      const exArr = new Array(6).fill('');

      if (first.images) {
        first.images.forEach((img: any, idx: number) => {
          if (idx < 5) {
            prevsArr[idx + 1] = img.imageUrl;
            exArr[idx + 1] = img.imageUrl;
          }
        });
      }
      this.groupImages.push(imgsArr);
      this.groupPreviews.push(prevsArr);
      this.groupExistingUrls.push(exArr);
    });

    if (this.colorGroups.length === 0) this.addColorGroup();
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
      this.availableSizes = cat === 'KIDS' ? ['2Y', '3Y', '4Y', '5Y', '6Y'] : ['S', 'M', 'L', 'XL', 'Free Size'];
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
    if (file && file.size <= 5 * 1024 * 1024) {
      this.groupImages[groupIndex][imageIndex] = file;
      this.groupPreviews[groupIndex][imageIndex] = URL.createObjectURL(file);
    }
  }

  removeImage(groupIndex: number, imageIndex: number) {
    this.groupImages[groupIndex][imageIndex] = null;
    this.groupPreviews[groupIndex][imageIndex] = null;
    this.groupExistingUrls[groupIndex][imageIndex] = '';
  }

  getPreview(groupIndex: number, imageIndex: number): string | null {
    return this.groupPreviews[groupIndex]?.[imageIndex] || null;
  }

  async onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.errorMessage.set('Please fill all required fields correctly.');
      window.scrollTo(0, 0);
      return;
    }

    this.loading.set(true);
    const val = this.productForm.value;
    const variants: any[] = [];
    const filesSet = new Set<File>();

    val.colorGroups?.forEach((group: any, idx: number) => {
      (group.sizes as string[]).forEach(size => {
        const variant: any = {
          id: group.existingVariantIds?.get?.(size) || null,
          color: group.color,
          colorHex: group.colorHex,
          size: size,
          price: Number(val.price),
          quantity: Number(group.quantity),
          styleCode: group.styleCode,
          sku: (group.styleCode || val.name) + '-' + group.color + '-' + size,
          images: []
        };

        [1, 2, 3, 4, 5].forEach(i => {
          const file = this.groupImages[idx][i];
          const exUrl = this.groupExistingUrls[idx][i];
          if (file) {
            variant.images.push({ imageUrl: file.name, isPrimary: i === 1, imageType: 'ver' });
            filesSet.add(file);
          } else if (exUrl) {
            variant.images.push({ imageUrl: exUrl, isPrimary: i === 1, imageType: 'ver' });
          }
        });
        variants.push(variant);
      });
    });

    const productDto = { ...val, price: Number(val.price), variants, aboutItems: (val.aboutItems as string[]).map(s => ({ aboutItem: s })) };
    const formData = new FormData();
    formData.append('product', JSON.stringify(productDto));
    filesSet.forEach(f => formData.append('files', f));

    try {
      await this.productService.updateProductModerator(Number(this.modelNo), formData);
      this.success.set(true);
      setTimeout(() => this.router.navigate([this.getDashboardLink().replace('dashboard', 'products')]), 1500);
    } catch (err) {
      this.errorMessage.set('Update failed. Please try again.');
      this.loading.set(false);
    }
  }
}
