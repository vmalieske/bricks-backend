import Elysia from 'elysia';
import { stringify } from 'csv-stringify/sync';
import { Product } from '../models/product.model';
import type { HydratedDocument } from 'mongoose';
import type { IProduct } from '../models/product.types';

const CSV_HEADERS = [
  'Titel',
  'Produktnummer',
  'Marke',
  'Brick Format',
  'Teileanzahl',
  'Maße',
  'Status',
  'Zustand',
  'Kaufpreis',
  'Kaufdatum',
  'Lagerort',
  'Aktueller Preis',
  'Verfügbarkeit',
  'Shop Name',
  'Shop URL',
  'Notizen',
];

const productToCsvRow = (product: HydratedDocument<IProduct>) => [
  product.title ?? '',
  product.productNumber ?? '',
  product.brand ?? '',
  product.brickFormat ?? '',
  product.brickCount ?? '',
  product.productMeasurements ?? '',
  product.status ?? '',
  product.ownershipData?.condition ?? '',
  product.ownershipData?.purchasePrice?.amount ?? '',
  product.ownershipData?.purchaseDate
    ? new Date(product.ownershipData.purchaseDate).toLocaleDateString('de-DE')
    : '',
  product.ownershipData?.location ?? '',
  product.wishlistData?.currentPrice?.amount ?? '',
  product.wishlistData?.availabilityStatus ?? '',
  product.shop?.name ?? '',
  product.shop?.productUrl ?? '',
  product.notes ?? '',
];

const buildCsv = (products: HydratedDocument<IProduct>[]) => {
  return stringify([CSV_HEADERS, ...products.map(productToCsvRow)], {
    delimiter: ';',
    quoted: true,
    quoted_empty: false,
  });
};

const csvResponse = (csv: string, filename: string) => {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};

export const exportRoutes = new Elysia({ prefix: '/export' })

  .get('/csv', async () => {
    const products = await Product.find().sort({ createdAt: -1 });
    const csv = buildCsv(products);
    return csvResponse(csv, 'bricks-all.csv');
  })

  .get('/csv/owned', async () => {
    const products = await Product.find({ status: 'owned' }).sort({ createdAt: -1 });
    const csv = buildCsv(products);
    return csvResponse(csv, 'bricks-owned.csv');
  })

  .get('/csv/wishlist', async () => {
    const products = await Product.find({ status: 'wishlist' }).sort({ createdAt: -1 });
    const csv = buildCsv(products);
    return csvResponse(csv, 'bricks-wishlist.csv');
  });
