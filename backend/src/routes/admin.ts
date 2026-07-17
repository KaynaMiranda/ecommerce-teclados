import { FastifyInstance } from 'fastify';
import { supabase } from '../supabase.js';

async function checkAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('role, is_admin')
    .eq('user_id', userId)
    .single();
  return data?.role === 'admin' || data?.is_admin === true;
}

export async function adminRoutes(app: FastifyInstance) {

  // =============================================
  // DASHBOARD
  // =============================================

  app.get('/dashboard', async (request, reply) => {
    const { user_id } = request.query as { user_id: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const [ordersToday, revenueToday, ordersPending, totalProducts, lowStock] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayStr),
      supabase.from('orders').select('total').gte('created_at', todayStr).eq('status', 'delivered'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase.from('product_variations').select('*, product:products(name)').lt('stock_quantity', 10).eq('active', true),
    ]);

    const totalRevenueToday = revenueToday.data?.reduce(
      (sum, order) => sum + Number(order.total), 0
    ) ?? 0;

    return {
      ordersToday: ordersToday.count ?? 0,
      revenueToday: totalRevenueToday,
      ordersPending: ordersPending.count ?? 0,
      totalProducts: totalProducts.count ?? 0,
      lowStock: lowStock.data ?? [],
    };
  });

  // =============================================
  // PRODUCTS
  // =============================================

  app.get('/products', async (request, reply) => {
    const { user_id } = request.query as { user_id: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), variations:product_variations(*)')
      .order('created_at', { ascending: false });

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.post('/products', async (request, reply) => {
    const { user_id, ...productData } = request.body as any;
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        price: productData.price,
        category_id: productData.category_id,
        image_url: productData.image_url,
        laboratory: productData.laboratory,
        anvisa_code: productData.anvisa_code,
        controlled: productData.controlled ?? false,
        requires_prescription: productData.requires_prescription ?? false,
      })
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.put('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { user_id, ...productData } = request.body as any;
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        price: productData.price,
        category_id: productData.category_id,
        image_url: productData.image_url,
        laboratory: productData.laboratory,
        anvisa_code: productData.anvisa_code,
        controlled: productData.controlled,
        requires_prescription: productData.requires_prescription,
        active: productData.active,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.delete('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { user_id } = request.query as { user_id: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return reply.status(500).send({ error: error.message });
    return { success: true };
  });

  // =============================================
  // ORDERS
  // =============================================

  app.get('/orders', async (request, reply) => {
    const { user_id, status, order_type } = request.query as { user_id: string; status?: string; order_type?: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    let query = supabase
      .from('orders')
      .select(`
        *,
        profile:profiles(full_name, phone),
        b2b_client:b2b_clients(company_name, trade_name),
        items:order_items(*, product:products(name), variation:product_variations(name)),
        delivery_schedule:delivery_schedules(name, start_time, end_time),
        delivery_zone:delivery_zones(name)
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (order_type) query = query.eq('order_type', order_type);

    const { data, error } = await query;
    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.patch('/orders/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { user_id, status } = request.body as { user_id: string; status: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    // Validate status flow
    const allowedTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['out_for_delivery', 'cancelled'],
      out_for_delivery: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    const { data: currentOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();

    if (!currentOrder) return reply.status(404).send({ error: 'Pedido não encontrado' });

    const allowed = allowedTransitions[currentOrder.status] || [];
    if (!allowed.includes(status)) {
      return reply.status(400).send({
        error: `Não é possível mudar de "${currentOrder.status}" para "${status}"`,
      });
    }

    const updateData: Record<string, unknown> = { status };
    if (status === 'delivered') {
      updateData.payment_confirmed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (error) return reply.status(500).send({ error: error.message });
    return { success: true };
  });

  // =============================================
  // STOCK
  // =============================================

  app.get('/stock', async (request, reply) => {
    const { user_id } = request.query as { user_id: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { data, error } = await supabase
      .from('stock_movements')
      .select('*, product:products(name), variation:product_variations(name, sku)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.post('/stock/adjust', async (request, reply) => {
    const { user_id, product_id, variation_id, quantity, reason } = request.body as {
      user_id: string; product_id: string; variation_id: string; quantity: number; reason: string;
    };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { data: variation } = await supabase
      .from('product_variations')
      .select('stock_quantity')
      .eq('id', variation_id)
      .single();

    if (!variation) return reply.status(404).send({ error: 'Variação não encontrada' });

    const newQuantity = variation.stock_quantity + quantity;

    const { error: updateError } = await supabase
      .from('product_variations')
      .update({ stock_quantity: newQuantity })
      .eq('id', variation_id);

    if (updateError) return reply.status(500).send({ error: updateError.message });

    await supabase.from('stock_movements').insert({
      product_id,
      variation_id,
      type: quantity > 0 ? 'in' : 'adjustment',
      quantity: Math.abs(quantity),
      reason: reason || 'Ajuste manual',
    });

    return { success: true, new_quantity: newQuantity };
  });

  // =============================================
  // CATEGORIES
  // =============================================

  app.get('/categories', async (_request, reply) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  // =============================================
  // B2B CLIENTS
  // =============================================

  app.get('/b2b-clients', async (request, reply) => {
    const { user_id } = request.query as { user_id: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { data, error } = await supabase
      .from('b2b_clients')
      .select('*')
      .order('company_name', { ascending: true });

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.post('/b2b-clients', async (request, reply) => {
    const { user_id, ...clientData } = request.body as any;
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { data, error } = await supabase
      .from('b2b_clients')
      .insert(clientData)
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.put('/b2b-clients/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { user_id, ...clientData } = request.body as any;
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { data, error } = await supabase
      .from('b2b_clients')
      .update(clientData)
      .eq('id', id)
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.delete('/b2b-clients/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { user_id } = request.query as { user_id: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { error } = await supabase.from('b2b_clients').delete().eq('id', id);
    if (error) return reply.status(500).send({ error: error.message });
    return { success: true };
  });

  // =============================================
  // DELIVERY ZONES
  // =============================================

  app.get('/delivery-zones', async (request, reply) => {
    const { user_id } = request.query as { user_id: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .order('radius_km', { ascending: true });

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.post('/delivery-zones', async (request, reply) => {
    const { user_id, ...zoneData } = request.body as any;
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { data, error } = await supabase
      .from('delivery_zones')
      .insert(zoneData)
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.put('/delivery-zones/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { user_id, ...zoneData } = request.body as any;
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { data, error } = await supabase
      .from('delivery_zones')
      .update(zoneData)
      .eq('id', id)
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.delete('/delivery-zones/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { user_id } = request.query as { user_id: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { error } = await supabase.from('delivery_zones').delete().eq('id', id);
    if (error) return reply.status(500).send({ error: error.message });
    return { success: true };
  });

  // =============================================
  // STAFF
  // =============================================

  app.get('/staff', async (request, reply) => {
    const { user_id } = request.query as { user_id: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'manager', 'attendant'])
      .order('full_name', { ascending: true });

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.post('/staff', async (request, reply) => {
    const { user_id, email, role } = request.body as { user_id: string; email: string; role: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role },
    });

    if (error) return reply.status(500).send({ error: error.message });
    return { user: data.user };
  });

  app.patch('/staff/:staffUserId', async (request, reply) => {
    const { staffUserId } = request.params as { staffUserId: string };
    const { user_id, role } = request.body as { user_id: string; role: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('user_id', staffUserId);

    if (error) return reply.status(500).send({ error: error.message });
    return { success: true };
  });

  app.delete('/staff/:staffUserId', async (request, reply) => {
    const { staffUserId } = request.params as { staffUserId: string };
    const { user_id } = request.query as { user_id: string };
    if (!(await checkAdmin(user_id))) return reply.status(403).send({ error: 'Access denied' });

    const { error } = await supabase.auth.admin.deleteUser(staffUserId);
    if (error) return reply.status(500).send({ error: error.message });
    return { success: true };
  });
}
