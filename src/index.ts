import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { connectDB } from './db';
import { productRoutes } from './routes/product.routes';

await connectDB();

const app = new Elysia()
    .use(cors({
        origin: 'http://localhost:4200', 
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }))
    .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString()}))
    .use(productRoutes)
    .listen(process.env.PORT ?? 3000);

console.log(`Backend is running on http://localhost:${app.server?.port}`);