export interface ProductImage {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
    imageType?: string;
}

export interface ProductVariant {
    id: number;
    sku: string;
    color: string;
    colorHex: string;
    size: string;
    styleCode: string;
    price: number;
    quantity: number;
    images: ProductImage[];
    salePrice?: number;
    saleEndTime?: string; // ISO date string
}

export interface Product {
    id: number;
    modelNo: number; // Using modelNo as ID for routing
    name: string;
    brandName: string;
    description: string;
    price: number; // Base price (lowest variant or default)
    salePrice?: number;
    saleEndTime?: string;
    discountPercentage?: number;

    category: string;
    subCategory: string;
    productGroup: string;

    isSingleBrand?: boolean;
    moderatorId?: number;

    // Additional Info
    styleCode?: string;
    material?: string;
    careInstructions?: string;
    origin?: string;
    manufacturer?: string;
    packer?: string;
    importer?: string;
    itemWeight?: string;
    itemDimensions?: string;
    netQuantity?: string;
    genericName?: string;

    // Stats
    averageRating: number;
    reviewCount: number;

    // Policies
    isReturnable?: boolean;
    isReplaceable?: boolean;

    // Client-side helper for display
    primaryImage?: string;

    // Variants
    variants: ProductVariant[];
    aboutItems?: string[];
}

export interface ProductAboutItem {
    id?: number;
    aboutItem: string;
}

export interface CartItem {
    id?: number; // Backend CartItem ID
    variantId: number;
    productModelNo: number;
    productName: string;
    productImage?: string;

    color: string;
    colorHex: string;
    size: string;

    quantity: number;
    price: number; // Unit price at time of adding
    totalPrice: number;
}

export interface Cart {
    items: CartItem[];
    totalAmount: number;
    totalItems?: number;
}

export interface Address {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface OrderItem {
    id?: number;
    variantId: number;
    productModelNo: number;
    productName: string;
    productImage?: string;

    color: string;
    size: string;

    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    orderDate: string; // ISO date string
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: Address;
    items: OrderItem[];
    invoiceUrl?: string; // If we expose a direct URL
    currentLocation?: string;
    trackingHistory?: {
        status: string;
        city: string;
        state: string;
        description: string;
        timestamp: string;
    }[];
}

export interface WishlistItem {
    id: number; // WishlistItem ID
    product: Product; // The full product, frontend might need to select variant
    addedAt: string;
}

export interface Wishlist {
    id: number;
    items: WishlistItem[];
}

export interface User {
    id: number;
    username: string; // email
    email: string;
    name: string;
    roles: string[];
}

export interface Review {
    id: number;
    rating: number;
    comment: string;
    image?: string; // Base64 or URL
    user: {
        id: number;
        name: string;
    };
    createdAt: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}
