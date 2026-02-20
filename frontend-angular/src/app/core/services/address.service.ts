import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Address {
    id?: number;
    label: string;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AddressService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/addresses`;

    async getAddresses(): Promise<Address[]> {
        return firstValueFrom(this.http.get<Address[]>(this.apiUrl));
    }

    async addAddress(address: Address): Promise<Address> {
        return firstValueFrom(this.http.post<Address>(this.apiUrl, address));
    }

    async updateAddress(id: number, address: Address): Promise<Address> {
        return firstValueFrom(this.http.put<Address>(`${this.apiUrl}/${id}`, address));
    }

    async deleteAddress(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    }

    async setDefault(id: number): Promise<void> {
        return firstValueFrom(this.http.put<void>(`${this.apiUrl}/${id}/default`, {}));
    }
}
