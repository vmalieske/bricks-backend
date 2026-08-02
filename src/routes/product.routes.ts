import { Elysia, NotFoundError } from 'elysia';
import { Product } from '../models/product.model';
import type { ProductUpdate } from '../models/product.types';

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
  });
