import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AddressService, Address } from '../../../core/services/address.service';
import { SavedCardService, SavedCard } from '../../../core/services/saved-card.service';
import { CouponService } from '../../../core/services/coupon.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentModalComponent } from '../../../shared/components/payment-modal/payment-modal.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, FormsModule,
    MatStepperModule, MatButtonModule, MatInputModule, MatIconModule, MatRadioModule, MatCheckboxModule, MatProgressSpinnerModule,
    PaymentModalComponent
  ],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss'
})
export class CheckoutPage {
  cart = inject(CartService);
  orderService = inject(OrderService);
  addressService = inject(AddressService);
  cardService = inject(SavedCardService);
  couponService = inject(CouponService);
  auth = inject(AuthService);
  fb = inject(FormBuilder);
  router = inject(Router);
  protected environment = environment;

  shippingForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    pincode: ['', Validators.required],
    saveAddress: [false]
  });

  paymentForm = this.fb.group({
    cardHolderName: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]], // MM/YY
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    saveCard: [false]
  });

  savedAddresses = signal<Address[]>([]);
  selectedAddressId = signal<number | null>(null);

  savedCards = signal<SavedCard[]>([]);
  selectedCardId = signal<number | null>(null);

  paymentMethod = 'card'; // 'card', 'qr', 'saved-card'
  placingOrder = signal(false);
  orderPlaced = signal(false);
  orderId = signal<number | null>(null);

  showPaymentModal = false; // Controls modal visibility

  discount = signal(0);
  couponMsg = signal('');
  couponValid = signal(false);
  appliedCouponId = signal<number | null>(null);

  availableCoupons = signal<any[]>([]);
  isEligibleForFirstOrder = signal(false);

  constructor() {
    this.loadAddresses();
    this.loadCards();
    this.loadCoupons();
    this.checkFirstOrderEligibility();
    const u = this.auth.user();
    if (u) {
      this.shippingForm.patchValue({ fullName: u.name, email: u.email });
    }
  }

  async checkFirstOrderEligibility() {
    if (this.auth.isLoggedIn()) {
      const isFirst = await this.orderService.checkFirstOrder();
      this.isEligibleForFirstOrder.set(isFirst);
      if (isFirst) {
        // Automatically add it to available coupons if not already fetched
        setTimeout(() => {
          const current = this.availableCoupons();
          if (!current.find(c => c.code === 'WELCOME20')) {
            this.availableCoupons.set([
              { code: 'WELCOME20', discountAmount: 0, minOrderAmount: 0, description: '20% Off Your First Order' },
              ...current
            ]);
          }
        }, 500);
      }
    }
  }

  async loadAddresses() {
    try {
      this.savedAddresses.set(await this.addressService.getAddresses());
    } catch (e) { console.error('Error loading addresses', e); }
  }

  async loadCards() {
    try {
      this.savedCards.set(await this.cardService.getCards());
    } catch (e) { console.error('Error loading cards', e); }
  }

  async loadCoupons() {
    try {
      const coupons = await this.couponService.getAvailableCoupons();
      if (coupons && coupons.length > 0) {
        this.availableCoupons.set(coupons);
      } else {
        this.availableCoupons.set([
          { code: 'WELCOME500', discountAmount: 500, minOrderAmount: 1500 },
          { code: 'SAVE200', discountAmount: 200, minOrderAmount: 1000 }
        ]);
      }
    } catch (err) {
      console.error('Failed to load coupons', err);
      this.availableCoupons.set([
        { code: 'WELCOME500', discountAmount: 500, minOrderAmount: 1500 },
        { code: 'SAVE200', discountAmount: 200, minOrderAmount: 1000 }
      ]);
    }
  }

  selectAddress(addr: Address) {
    this.selectedAddressId.set(addr.id!);
    this.shippingForm.patchValue({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.addressLine,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
  }

  clearAddress() {
    this.selectedAddressId.set(null);
    this.shippingForm.reset({
      fullName: this.auth.user()?.name,
      email: this.auth.user()?.email,
      saveAddress: false
    });
  }

  selectCard(card: SavedCard) {
    this.selectedCardId.set(card.id!);
    this.paymentMethod = 'saved-card';
  }

  addNewCard() {
    this.selectedCardId.set(null);
    this.paymentMethod = 'card';
    this.paymentForm.reset({ saveCard: false });
  }

  onPaymentMethodChange(method: string) {
    this.paymentMethod = method;
  }

  async applyCoupon(code: string) {
    if (!code) return;
    const res = await this.couponService.validateCoupon(code, this.cart.totalAmount());
    if (res.valid) {
      const discountVal = res.discount || res.discountAmount || 0;
      this.discount.set(discountVal);
      this.appliedCouponId.set(res.couponId || res.id);
      this.couponMsg.set(`Coupon applied! Saved ${this.formatCurrency(discountVal)}`);
      this.couponValid.set(true);
    } else {
      this.discount.set(0);
      this.appliedCouponId.set(null);
      this.couponMsg.set(res.message || 'Invalid Coupon');
      this.couponValid.set(false);
    }
  }

  finalTotal = computed(() => {
    const total = this.cart.totalAmount();
    const shipping = total > 500 ? 0 : 50;
    return Math.max(0, total + shipping - this.discount());
  });

  async placeOrder() {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      return;
    }

    if (this.paymentMethod === 'card' && this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.placingOrder.set(true);

    try {
      // 1. Save Address if checked
      if (!this.selectedAddressId() && this.shippingForm.value.saveAddress) {
        const addrData: any = {
          fullName: this.shippingForm.value.fullName,
          phone: this.shippingForm.value.phone,
          addressLine: this.shippingForm.value.address,
          city: this.shippingForm.value.city,
          state: this.shippingForm.value.state,
          pincode: this.shippingForm.value.pincode,
          country: 'India',
          label: 'Home',
          isDefault: false
        };
        await this.addressService.addAddress(addrData);
      }

      // 2. Save Card if checked
      if (this.paymentMethod === 'card' && this.paymentForm.value.saveCard) {
        const cardData: any = {
          cardHolderName: this.paymentForm.value.cardHolderName,
          last4: this.paymentForm.value.cardNumber?.slice(-4),
          expiry: this.paymentForm.value.expiry,
          brand: 'Visa'
        };
        await this.cardService.saveCard(cardData);
      }

      const orderData = {
        items: this.cart.cartItems().map((item: any) => ({
          variantId: item.variantId,
          productModelNo: item.productModelNo || item.product.modelNo,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size
        })),
        totalAmount: this.finalTotal(),
        shippingAddress: this.shippingForm.value,
        paymentMethod: this.paymentMethod === 'saved-card' ? 'card' : this.paymentMethod,
        discount: this.discount(),
        couponId: this.appliedCouponId()
      };

      const res = await this.orderService.placeOrder(orderData);

      this.orderId.set(res.id);

      if (this.paymentMethod === 'upi') {
        // Show QR Modal (UPI)
        this.showPaymentModal = true;
        // Don't clear cart yet, wait for payment
      } else {
        // Non-QR Order Placed
        this.orderPlaced.set(true);
        this.cart.clearCart();
      }

    } catch (err) {
      console.error('Order failed', err);
      alert('Failed to place order');
    } finally {
      this.placingOrder.set(false);
    }
  }

  onPaymentCompleted() {
    this.showPaymentModal = false;
    this.orderPlaced.set(true);
    this.cart.clearCart();
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    // If they close without paying, what happens? 
    // Order is created but unpaid. Redirect to order history or show success state?
    // Let's show success state but note it's pending payment
    this.orderPlaced.set(true);
    this.cart.clearCart();
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }
}
