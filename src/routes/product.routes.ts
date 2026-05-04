import { Elysia, NotFoundError } from 'elysia';
import { Product } from '../models/product.model';
import type { IProduct } from '../models/product.types';

export const productRoutes = new Elysia({ prefix: '/products' })

    .get('/', async () => {
        const products = await Product.find().sort({ createdAt: -1 });
        return products;
    })

  .get('/:id', async ({ params }) => {
    const product = await Product.findById(params.id);
    if (!product) throw new NotFoundError();
    return product;
  })

  .post('/', async ({ body }) => {
    const product = new Product(body);
    return product.save();
  })

  .put('/:id', async ({ params, body }) => {
    const updateBody = body as IProduct;
    const product = await Product.findByIdAndUpdate(
        params.id,
        { $set: updateBody },
        { new: true, runValidators: true }
    );
    if(!product) throw new NotFoundError();
    return product;
  })

  .delete('/:id', async ({ params }) => {
    const product = await Product.findByIdAndDelete(params.id);
    if(!product) throw new NotFoundError();
    return { message: 'Product deleted', id: params.id };
  });