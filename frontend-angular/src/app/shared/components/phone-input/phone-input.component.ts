import { Component, Input, forwardRef, signal, computed, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';



export interface Country {
    code: string;
    name: string;
    dial: string;
    flag: string;
}

@Component({
    selector: 'app-phone-input',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PhoneInputComponent),
            multi: true
        }
    ],
    templateUrl: './phone-input.component.html',
    styleUrls: ['./phone-input.component.scss']
})
export class PhoneInputComponent implements ControlValueAccessor {
    @Input() name = 'phone';
    @Input() error = '';
    @Input() defaultCountry = 'IN'; // Changed default to India for this context

    countries: Country[] = [
        { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
        { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
        { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
        { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
        { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪' },
        { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
        { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
        { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
        { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
        { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
        { code: 'ES', name: 'Spain (España)', dial: '+34', flag: '🇪🇸' },
        { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
        { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
        { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
        { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩' },
        { code: 'AF', name: 'Afghanistan (افغانستان)', dial: '+93', flag: '🇦🇫' },
        { code: 'AL', name: 'Albania (Shqipëri)', dial: '+355', flag: '🇦🇱' },
        { code: 'DZ', name: 'Algeria (الجزائر)', dial: '+213', flag: '🇩🇿' },
        { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
    ];

    @ViewChild('dropdownRef') dropdownRef!: ElementRef;

    isOpen = signal(false);
    searchTerm = signal('');
    selectedCountry = signal<Country>(this.countries.find(c => c.code === this.defaultCountry) || this.countries[0]);
    value = '';

    filteredCountries = computed(() => {
        const term = this.searchTerm().toLowerCase();
        return this.countries.filter(c =>
            c.name.toLowerCase().includes(term) || c.dial.includes(term)
        );
    });

    // ControlValueAccessor methods
    onChange: any = () => { };
    onTouched: any = () => { };

    writeValue(val: string): void {
        this.value = val || '';
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    @HostListener('document:mousedown', ['$event'])
    handleClickOutside(event: MouseEvent) {
        if (this.dropdownRef && !this.dropdownRef.nativeElement.contains(event.target)) {
            this.closeDropdown();
        }
    }

    toggleDropdown() {
        this.isOpen.update(v => !v);
        if (!this.isOpen()) {
            this.searchTerm.set('');
        }
    }

    closeDropdown() {
        this.isOpen.set(false);
        this.searchTerm.set('');
    }

    handleCountrySelect(country: Country) {
        this.selectedCountry.set(country);
        this.closeDropdown();
        this.notifyChange();
    }

    handlePhoneChange(e: Event) {
        const input = e.target as HTMLInputElement;
        this.value = input.value.replace(/\D/g, '');
        this.notifyChange();
    }

    private notifyChange() {
        this.onChange(this.value);
        this.onTouched();
        // Also emit a detailed event if needed
    }
}
