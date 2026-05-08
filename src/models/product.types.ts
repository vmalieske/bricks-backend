import type { Document } from 'mongoose';

//Enums
export const AVAILABILITY_STATUS = ['available', 'out_of_stock', 'coming_soon', 'discontinued'] as const;
export type AvailabilityStatus = typeof AVAILABILITY_STATUS[number];

export const BRICK_FORMATS = ['standard', 'diamond', 'mini', 'special'] as const;
export type BrickFormat = typeof BRICK_FORMATS[number];

export const CONDITIONS = ['new', 'assembled', 'lent', 'stored'] as const;
export type Condition = typeof CONDITIONS[number];

export const PRODUCT_STATUS = ['wishlist', 'owned', 'sold'] as const;
export type ProductStatus = typeof PRODUCT_STATUS[number];

export const STORAGE_TYPES = ['external', 'local'] as const;
export type StorageType = typeof STORAGE_TYPES[number];

//Main Interface
export interface IProduct extends Document {
    title: string;
    productNumber?: string;
    brand?: string;
    brickFormat: BrickFormat;
    brickCount: number;
    productMeasurements?: string;

    status: ProductStatus;

    shop?: ShopInfo;
    images?: ProductImage[];

    wishlistData?: WishlistData;
    ownershipData?: OwnershipData;

    notes?: string;

    createdAt: Date;
    updatedAt: Date;
}

export type ProductUpdate = Partial<Omit<IProduct, keyof Document | 'createdAt' | 'updatedAt'>>;


//Sub Interfaces
export interface Money {
    amount: number;
    currency: string;
}

export interface OwnershipData {
    purchasePrice?: Money;
    purchaseDate?: Date;
    location?: string;
    condition?: Condition;
}

export interface ProductImage {
    type: 'external' | 'local';
    url: string;
    isPrimary?: boolean;
}

export interface ShopInfo {
    name: string;
    productUrl?: string;
}

export interface WishlistData {
    priceAtAdding?: Money;
    currentPrice?: Money;
    availabilityStatus?: AvailabilityStatus;
    lastCheckedAt?: Date;
}