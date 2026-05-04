import mongoose, { Schema } from 'mongoose';
import type { 
  IProduct,
  Money,
  ProductImage,
  ShopInfo,
  WishlistData,
  OwnershipData,
} from './product.types';
import { 
  AVAILABILITY_STATUS, 
  BRICK_FORMATS, 
  CONDITIONS, 
  PRODUCT_STATUS, 
  STORAGE_TYPES, 
} from './product.types';

// Sub Schema
const MoneySchema = new Schema<Money>(
    {
        amount: { type: Number, required: true },
        currency: { type: String, required: true, default: 'EUR' },
    },
    { _id: false }
);

const OwnershipDataSchema = new Schema<OwnershipData>(
    {
        purchasePrice: { type: MoneySchema },
        purchaseDate: { type: Date },
        location: { type: String },
        condition: {
            type: String,
            enum: CONDITIONS,
        },
    },
    { _id: false }
);

const ProductImageShema = new Schema<ProductImage>(
    {
        type: { type: String, enum: STORAGE_TYPES, required: true },
        url: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
    },
    { _id: false }
);

const ShopInfoSchema = new Schema<ShopInfo>(
    {
        name: { type: String, required: true },
        productUrl: { type: String },
    },
    { _id: false }
);

const WishlistDataSchema = new Schema<WishlistData>(
    {
        priceAtAdding: { type: MoneySchema },
        currentPrice: { type: MoneySchema },
        availabilityStatus: {
            type: String,
            enum: AVAILABILITY_STATUS,
        },
        lastCheckedAt: { type: Date }
    },
    { _id: false }
);

// Main Schema
const ProductSchema = new Schema<IProduct>(
    {
        title: { type: String, required: true, trim: true },
        productNumber: { type: String, trim: true },
        brand: { type: String, trim: true },
        brickFormat: {
            type: String,
            enum: BRICK_FORMATS,
            required: true,
        },
        brickCount: { type: Number, required: true, min: 1 },
        productMeasurements: { type: String },

        status: {
            type: String,
            enum: PRODUCT_STATUS,
            required: true,
            default: 'wishlist',
        },

        shop: { type: ShopInfoSchema },
        images: { type: [ProductImageShema], default: [] },

        wishlistData: { type: WishlistDataSchema },
        ownershipData: { type: OwnershipDataSchema },

        notes: { type: String },
    },
    {
        timestamps: true,
    }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);