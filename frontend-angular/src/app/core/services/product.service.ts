import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Product, ProductVariant } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/products`;
    private adminUrl = `${environment.apiUrl}/admin/products`;

    async getAllProducts(): Promise<Product[]> {
        try {
            // Backend returns Page<ProductResponse>, need to unwrap 'content'
            // Request large size to get "all" products for client-side filtering
            const response: any = await firstValueFrom(this.http.get<any>(this.apiUrl, {
                params: { page: 0, size: 1000 }
            }));
            return response.content || [];
        } catch (err) {
            console.error('Failed to fetch all products', err);
            return [];
        }
    }

    async getFeatured(): Promise<Product[]> {
        try {
            return await firstValueFrom(this.http.get<Product[]>(`${this.apiUrl}/featured`));
        } catch (err) {
            console.error('Failed to fetch featured products', err);
            return [];
        }
    }

    async getRecommendations(): Promise<Product[]> {
        try {
            return await firstValueFrom(this.http.get<Product[]>(`${this.apiUrl}/recommendations`));
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            return [];
        }
    }

    async searchProducts(q: string): Promise<Product[]> {
        try {
            return await firstValueFrom(this.http.get<Product[]>(`${this.apiUrl}/search`, { params: { q } }));
        } catch (err) {
            console.error('Search failed:', err);
            return [];
        }
    }

    async getSimilar(modelNo: string): Promise<Product[]> {
        try {
            return await firstValueFrom(this.http.get<Product[]>(`${this.apiUrl}/${modelNo}/similar`));
        } catch (err) {
            console.error('Failed to fetch similar products', err);
            return [];
        }
    }

    async updateProduct(id: number, formData: FormData): Promise<Product> {
        try {
            return await firstValueFrom(this.http.put<Product>(`${this.adminUrl}/${id}`, formData));
        } catch (err) {
            console.error('Failed to update product', err);
            throw err;
        }
    }

    async getFlashSales(): Promise<Product[]> {
        try {
            return await firstValueFrom(this.http.get<Product[]>(`${this.apiUrl}/flash-sale`));
        } catch (err) {
            console.error('Failed to fetch flash sales', err);
            return [];
        }
    }


    async getProductByModelNo(modelNo: string): Promise<Product> {
        try {
            return await firstValueFrom(this.http.get<Product>(`${this.apiUrl}/${modelNo}`));
        } catch (err) {
            console.error('Failed to fetch product', err);
            throw err;
        }
    }

    async addProduct(formData: FormData): Promise<Product> {
        try {
            return await firstValueFrom(this.http.post<Product>(this.adminUrl, formData));
        } catch (err) {
            console.error('Failed to add product', err);
            throw err;
        }
    }

    async getReviews(modelNo: string): Promise<any[]> {
        try {
            return await firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/reviews/product/${modelNo}`));
        } catch (err) {
            console.error('Failed to fetch reviews', err);
            return [];
        }
    }

    async submitReview(reviewData: any): Promise<any> {
        try {
            return await firstValueFrom(this.http.post<any>(`${environment.apiUrl}/reviews`, reviewData));
        } catch (err) {
            console.error('Failed to submit review', err);
            throw err;
        }
    }

    async getRandomProducts(limit: number = 10): Promise<Product[]> {
        try {
            return await firstValueFrom(this.http.get<Product[]>(`${this.apiUrl}/random`, { params: { limit } }));
        } catch (err) {
            console.error('Failed to fetch random products', err);
            return [];
        }
    }

    async deleteProduct(modelNo: number): Promise<void> {
        try {
            await firstValueFrom(this.http.delete<void>(`${this.adminUrl}/${modelNo}`));
        } catch (err) {
            console.error('Failed to delete product', err);
            throw err;
        }
    }

    async getProductsPaginated(page: number = 0, size: number = 20): Promise<any> {
        try {
            return await firstValueFrom(this.http.get<any>(this.apiUrl, { params: { page, size } }));
        } catch (err) {
            console.error('Failed to fetch paginated products', err);
            return { content: [], last: true };
        }
    }

    async getModeratorProducts(): Promise<Product[]> {
        try {
            return await firstValueFrom(this.http.get<Product[]>(`${environment.apiUrl}/moderator/products/my`));
        } catch (err) {
            console.error('Failed to fetch moderator products', err);
            return [];
        }
    }

    async updateProductModerator(id: number, formData: FormData): Promise<Product> {
        try {
            return await firstValueFrom(this.http.put<Product>(`${environment.apiUrl}/moderator/products/${id}`, formData));
        } catch (err) {
            console.error('Failed to update product by moderator', err);
            throw err;
        }
    }

    async addProductModerator(formData: FormData): Promise<Product> {
        try {
            return await firstValueFrom(this.http.post<Product>(`${environment.apiUrl}/moderator/products`, formData));
        } catch (err) {
            console.error('Failed to add product by moderator', err);
            throw err;
        }
    }

    async checkDelivery(productId: number, pincode: string): Promise<any> {
        try {
            return await firstValueFrom(this.http.post<any>(`${environment.apiUrl}/delivery/check`, { productId, destinationPincode: pincode }));
        } catch (err) {
            console.error('Delivery check failed:', err);
            throw err;
        }
    }
}

