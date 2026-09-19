import { Elysia, NotFoundError } from 'elysia';

import { Product } from '../models/product.model';
import type { ProductUpdate } from '../models/product.types';
import { scraperService } from '../scraper/scraper.service';

export const productRoutes = new Elysia({ prefix: '/products' })

  .get('/', async () => {
    const products = await Product.find().sort({ createdAt: -1 });
    return products.map((p) => ({ ...p.toObject(), _id: p._id.toString() }));
  })

  .get('/owned', async () => {
    const products = await Product.find({ status: 'owned' }).sort({ createdAt: -1 });
    return products.map((p) => ({ ...p.toObject(), _id: p._id.toString() }));
  })

  .get('/wishlist', async () => {
    const products = await Product.find({ status: 'wishlist' }).sort({ createdAt: -1 });
    return products.map((p) => ({ ...p.toObject(), _id: p._id.toString() }));
  })

  .get('/:id', async ({ params }) => {
    const product = await Product.findById(params.id);
    if (!product) throw new NotFoundError();
    return { ...product.toObject(), _id: product._id.toString() };
  })

  .post('/', async ({ body }) => {
    const product = new Product(body);
    const saved = await product.save();

    return {
      ...saved.toObject(),
      _id: saved._id.toString(),
    };
  })

  .put('/:id', async ({ params, body }) => {
    const product = await Product.findByIdAndUpdate(
      params.id,
      { $set: body as ProductUpdate },
      { returnDocument: 'after', runValidators: true },
    );
    if (!product) throw new NotFoundError();
    return { ...product.toObject(), _id: product._id.toString() };
  })

  .delete('/:id', async ({ params }) => {
    const product = await Product.findByIdAndDelete(params.id);
    if (!product) throw new NotFoundError();
    return { message: 'Product deleted', id: params.id };
  })

  .post('/wishlist/update-prices', async () => {
    const wishlistProducts = await Product.find({
      status: 'wishlist',
      'shop.productUrl': { $exists: true, $ne: '' },
    });

    const scrapable = wishlistProducts.filter((product) =>
      scraperService.canHandle(product.shop!.productUrl!),
    );

    let updated = 0;
    let skipped = wishlistProducts.length - scrapable.length;

    async function batchProcess<T>(items: T[], batchSize: number, fn: (item: T) => Promise<void>) {
      for (let index = 0; index < items.length; index += batchSize) {
        const batch = items.slice(index, index + batchSize);
        await Promise.all(batch.map(fn));
      }
    }

    await batchProcess(scrapable, 3, async (product) => {
      try {
        const result = await scraperService.scrape(product.shop!.productUrl!);
        if (!result.price) return;

        await Product.findByIdAndUpdate(product._id, {
          $set: {
            wishlistData: {
              ...product.wishlistData,
              currentPrice: {
                amount: result.price.amount,
                currency: result.price.currency,
              },
              lastCheckedAt: new Date(),
            },
          },
        });
        updated++;
      } catch {
        skipped++;
      }
    });
    return { updated, skipped };
  })

  .post('/:id/update-price', async ({ params, status }) => {
    const product = await Product.findById(params.id);
    if (!product) throw new NotFoundError();

    const shopUrl = product.shop?.productUrl;
    if (!shopUrl || !scraperService.canHandle(shopUrl)) {
      return status(400, { message: 'No scrapeable shop URL found' });
    }

    try {
      const result = await scraperService.scrape(shopUrl);
      if (!result.price) return status(400, { message: 'No price found' });

      const updated = await Product.findByIdAndUpdate(
        params.id,
        {
          $set: {
            wishlistData: {
              ...product.wishlistData,
              currentPrice: {
                amount: result.price.amount,
                currency: result.price.currency,
              },
              lastCheckedAt: new Date(),
            },
          },
        },
        { returnDocument: 'after', runValidators: true },
      );

      return { ...updated!.toObject(), _id: updated!._id.toString() };
    } catch {
      return status(500, { message: 'Error while updating price' });
    }
  });
