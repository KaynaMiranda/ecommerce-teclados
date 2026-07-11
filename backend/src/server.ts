import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { productsRoutes } from './routes/products.js';
import { categoriesRoutes } from './routes/categories.js';
import { adminRoutes } from './routes/admin.js';

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
});

app.register(productsRoutes, { prefix: '/api/products' });
app.register(categoriesRoutes, { prefix: '/api/categories' });
app.register(adminRoutes, { prefix: '/api/admin' });

app.get('/api/health', async () => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
