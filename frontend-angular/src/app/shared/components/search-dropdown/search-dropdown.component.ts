import { Component, inject, signal, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-search-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './search-dropdown.component.html',
  styleUrls: ['./search-dropdown.component.scss']
})
export class SearchDropdownComponent {
  private productService = inject(ProductService);
  private router = inject(Router);
  protected environment = environment;

  query = signal('');
  results = signal<any[]>([]);
  isOpen = signal(false);
  isLoading = signal(false);
  activeIndex = signal(-1);

  private searchSubject = new Subject<string>();

  @ViewChild('container') container!: ElementRef;

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term.trim()) return of([]);
        this.isLoading.set(true);
        return this.productService.searchProducts(term).then(res => {
          this.isLoading.set(false);
          return res;
        }).catch(() => {
          this.isLoading.set(false);
          return [];
        });
      })
    ).subscribe(results => {
      this.results.set(results.slice(0, 8));
    });
  }

  onInput(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.query.set(term);
    this.isOpen.set(true);
    this.searchSubject.next(term);
  }

  handleClear() {
    this.query.set('');
    this.results.set([]);
    this.isOpen.set(false);
  }

  handleSelect(product: any) {
    this.isOpen.set(false);
    this.query.set('');
    this.router.navigate(['/products', product.modelNo]);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.container && !this.container.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (!this.isOpen() || this.results().length === 0) {
      // If Enter is pressed with a query but no results dropdown, search all products
      if (event.key === 'Enter' && this.query().trim()) {
        event.preventDefault();
        this.viewAllResults();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update(prev => (prev < this.results().length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update(prev => (prev > 0 ? prev - 1 : this.results().length - 1));
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex() >= 0) {
          this.handleSelect(this.results()[this.activeIndex()]);
        } else {
          // No item selected, view all results
          this.viewAllResults();
        }
        break;
      case 'Escape':
        this.isOpen.set(false);
        break;
    }
  }

  viewAllResults() {
    const searchTerm = this.query().trim();
    if (searchTerm) {
      this.isOpen.set(false);
      this.router.navigate(['/products'], { queryParams: { search: searchTerm } });
    }
  }

  formatPrice(price: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  }
}
