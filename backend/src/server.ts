import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { productsRoutes } from './routes/products.js';
import { categoriesRoutes } from './routes/categories.js';
import { adminRoutes } from './routes/admin.js';
import { ordersRoutes } from './routes/orders.js';
import { otpRoutes } from './routes/otp.js';

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
});

app.register(productsRoutes, { prefix: '/api/products' });
app.register(categoriesRoutes, { prefix: '/api/categories' });
app.register(adminRoutes, { prefix: '/api/admin' });
app.register(ordersRoutes, { prefix: '/api/orders' });
app.register(otpRoutes, { prefix: '/api/otp' });

app.get('/api/health', async () => {
  return { status: 'ok', service: 'farma-plus' };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Farma+ API running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
