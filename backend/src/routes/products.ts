import { FastifyInstance } from 'fastify';
import { supabase } from '../supabase.js';

export async function productsRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const { category } = request.query as { category?: string };

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category_id', category);
    }

    const { data, error } = await query;

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return data;
  });

  app.get('/search', async (request, reply) => {
    const { q } = request.query as { q?: string };

    if (!q) {
      return reply.status(400).send({ error: 'Query parameter "q" is required' });
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`);

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return data;
  });

  app.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return reply.status(404).send({ error: 'Product not found' });
    }

    const { data: variations } = await supabase
      .from('product_variations')
      .select('*')
      .eq('product_id', data.id);

    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('id', data.category_id)
      .single();

    return { ...data, variations: variations || [], category };
  });
}
