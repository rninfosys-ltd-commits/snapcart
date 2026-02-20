import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-product-image-gallery',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
    <div class="gallery-container">
      <button mat-icon-button class="close-btn" (click)="close()">
        <mat-icon>close</mat-icon>
      </button>

      <div class="thumbnails">
        <div *ngFor="let img of images" 
             class="thumb-box" 
             [class.active]="currentImage() === img"
             (click)="currentImage.set(img)">
          <img [src]="img" class="thumb-img">
        </div>
      </div>

      <div class="main-stage">
        <img [src]="currentImage()" class="main-img">
      </div>
    </div>
  `,
    styles: [`
    .gallery-container { display: flex; height: 80vh; max-height: 800px; padding: 20px; gap: 20px; position: relative; }
    .close-btn { position: absolute; top: 10px; right: 10px; z-index: 10; }

    .thumbnails { 
      width: 100px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; 
      padding-right: 5px;
    }
    .thumb-box { 
      width: 80px; height: 80px; border: 2px solid transparent; border-radius: 8px; 
      cursor: pointer; overflow: hidden; opacity: 0.7; transition: all 0.2s;
    }
    .thumb-box.active { border-color: #e63946; opacity: 1; }
    .thumb-img { width: 100%; height: 100%; object-fit: cover; }

    .main-stage { flex-grow: 1; display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 8px; }
    .main-img { max-width: 100%; max-height: 100%; object-fit: contain; }

    @media (max-width: 768px) {
      .gallery-container { flex-direction: column-reverse; }
      .thumbnails { flex-direction: row; width: 100%; height: 100px; overflow-x: auto; }
    }
  `]
})
export class ProductImageGalleryComponent {
    images: string[] = [];
    currentImage = signal<string>('');

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { images: string[] },
        private dialogRef: MatDialogRef<ProductImageGalleryComponent>
    ) {
        this.images = data.images.filter(img => img); // Filter empty
        if (this.images.length > 0) {
            this.currentImage.set(this.images[0]);
        }
    }

    close() {
        this.dialogRef.close();
    }
}
