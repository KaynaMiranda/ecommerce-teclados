import { FastifyInstance } from 'fastify';
import { supabase } from '../supabase.js';

export async function adminRoutes(app: FastifyInstance) {

  app.get('/dashboard', async (request, reply) => {
    const { user_id } = request.query as { user_id: string };

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user_id)
      .single();

    if (!profile?.is_admin) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    const [productsCount, ordersResult, revenueResult] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total'),
    ]);

    const totalRevenue = revenueResult.data?.reduce(
      (sum, order) => sum + Number(order.total),
      0
    ) ?? 0;

    return {
      productsCount: productsCount.count ?? 0,
      ordersCount: ordersResult.count ?? 0,
      totalRevenue,
    };
  });

  app.get('/products', async (request, reply) => {
    const { user_id } = request.query as { user_id: string };

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user_id)
      .single();

    if (!profile?.is_admin) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), variations:product_variations(*)')
      .order('created_at', { ascending: false });

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return data;
  });

  app.post('/products', async (request, reply) => {
    const { user_id, ...productData } = request.body as any;

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user_id)
      .single();

    if (!profile?.is_admin) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        price: productData.price,
        category_id: productData.category_id,
        image_url: productData.image_url,
      })
      .select()
      .single();

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return data;
  });

  app.put('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { user_id, ...productData } = request.body as any;

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user_id)
      .single();

    if (!profile?.is_admin) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        price: productData.price,
        category_id: productData.category_id,
        image_url: productData.image_url,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return data;
  });

  app.delete('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { user_id } = request.query as { user_id: string };

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user_id)
      .single();

    if (!profile?.is_admin) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return { success: true };
  });

  app.get('/orders', async (request, reply) => {
    const { user_id } = request.query as { user_id: string };

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user_id)
      .single();

    if (!profile?.is_admin) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, profile:profiles(full_name, user:User(email))')
      .order('created_at', { ascending: false });

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return data;
  });

  app.patch('/orders/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { user_id, status } = request.body as { user_id: string; status: string };

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user_id)
      .single();

    if (!profile?.is_admin) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return { success: true };
  });

  app.get('/categories', async (request, reply) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return data;
  });
}
