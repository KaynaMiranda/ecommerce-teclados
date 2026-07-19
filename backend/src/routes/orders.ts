import { FastifyInstance } from 'fastify';
import { supabase } from '../supabase.js';

export async function ordersRoutes(app: FastifyInstance) {

  // Create order (B2C)
  app.post('/', async (request, reply) => {
    const { user_id, items, shipping_address, payment_method, shipping_fee, delivery_schedule_id, delivery_method, delivery_notes, prescription_url } = request.body as {
      user_id: string;
      items: Array<{ product_id: string; variation_id?: string; quantity: number; unit_price: number }>;
      shipping_address: Record<string, unknown>;
      payment_method: string;
      shipping_fee: number;
      delivery_schedule_id?: string;
      delivery_method?: string;
      delivery_notes?: string;
      prescription_url?: string;
    };

    if (!items?.length) {
      return reply.status(400).send({ error: 'Items are required' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (!profile) return reply.status(404).send({ error: 'User not found' });

    // Check for pending orders (block if has undelivered order)
    const { data: pendingOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', profile.id)
      .not('status', 'in', '(delivered,cancelled)');

    if (pendingOrders && pendingOrders.length > 0) {
      return reply.status(400).send({ error: 'Você já tem um pedido em andamento. Aguarde a entrega antes de fazer um novo pedido.' });
    }

    // Check minimum order value
    const { data: setting } = await supabase
      .from('pharmacy_settings')
      .select('value')
      .eq('key', 'min_order_value')
      .single();

    const minValue = parseFloat(setting?.value || '25');
    const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    if (subtotal < minValue) {
      return reply.status(400).send({ error: `Valor mínimo para entrega: R$ ${minValue.toFixed(2)}` });
    }

    // Validate stock for all items
    for (const item of items) {
      if (item.variation_id) {
        const { data: variation } = await supabase
          .from('product_variations')
          .select('stock_quantity, name')
          .eq('id', item.variation_id)
          .single();

        if (!variation) {
          return reply.status(400).send({ error: `Variação não encontrada` });
        }
        if (variation.stock_quantity < item.quantity) {
          return reply.status(400).send({ error: `Estoque insuficiente para ${variation.name}. Disponível: ${variation.stock_quantity}` });
        }
      }
    }

    // Check if any item requires prescription and validate
    const { data: products } = await supabase
      .from('products')
      .select('id, requires_prescription, name')
      .in('id', items.map(i => i.product_id));

    const prescriptionRequired = products?.filter(p => p.requires_prescription);
    if (prescriptionRequired && prescriptionRequired.length > 0 && !prescription_url) {
      return reply.status(400).send({
        error: `Os seguintes medicamentos requerem receita: ${prescriptionRequired.map(p => p.name).join(', ')}. Envie a receita antes de finalizar.`,
        prescription_required: true,
      });
    }

    // Calculate totals
    const shippingFee = shipping_fee || 0;
    const pixDiscount = payment_method === 'pix' ? subtotal * 0.05 : 0;
    const total = subtotal + shippingFee - pixDiscount;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: profile.id,
        order_type: 'b2c',
        subtotal,
        shipping_fee: shippingFee,
        discount: pixDiscount,
        total,
        payment_method,
        shipping_address_snapshot: shipping_address,
        delivery_schedule_id,
        delivery_method: delivery_method || 'own',
        delivery_notes,
        prescription_url,
      })
      .select()
      .single();

    if (orderError) return reply.status(500).send({ error: orderError.message });

    // Create order items + deduct stock
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      variation_id: item.variation_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) return reply.status(500).send({ error: itemsError.message });

    // Deduct stock for each item
    for (const item of items) {
      if (item.variation_id) {
        // Reduce stock
        const { data: variation } = await supabase
          .from('product_variations')
          .select('stock_quantity')
          .eq('id', item.variation_id)
          .single();

        if (variation) {
          await supabase
            .from('product_variations')
            .update({ stock_quantity: Math.max(0, variation.stock_quantity - item.quantity) })
            .eq('id', item.variation_id);
        }

        // Log stock movement
        await supabase.from('stock_movements').insert({
          product_id: item.product_id,
          variation_id: item.variation_id,
          type: 'out',
          quantity: item.quantity,
          reason: `Pedido #${order.order_number}`,
          order_id: order.id,
        });
      }
    }

    return { order_id: order.id, order_number: order.order_number };
  });

  // Get user orders
  app.get('/', async (request, reply) => {
    const { user_id } = request.query as { user_id: string };

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (!profile) return reply.status(404).send({ error: 'User not found' });

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*, product:products(name, image_url), variation:product_variations(name)),
        delivery_schedule:delivery_schedules(name, start_time, end_time)
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  // Get single order
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { user_id } = request.query as { user_id: string };

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (!profile) return reply.status(404).send({ error: 'User not found' });

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*, product:products(name, image_url, laboratory, requires_prescription), variation:product_variations(name)),
        delivery_zone:delivery_zones(name, estimated_delivery_minutes, shipping_fee),
        delivery_schedule:delivery_schedules(name, start_time, end_time)
      `)
      .eq('id', id)
      .eq('user_id', profile.id)
      .single();

    if (error || !data) return reply.status(404).send({ error: 'Order not found' });
    return data;
  });

  // Cancel order (only if pending)
  app.post('/:id/cancel', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { user_id } = request.body as { user_id: string };

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (!profile) return reply.status(404).send({ error: 'User not found' });

    // Check order belongs to user and is cancellable
    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .eq('user_id', profile.id)
      .single();

    if (!order) return reply.status(404).send({ error: 'Pedido não encontrado' });

    if (!['pending', 'confirmed'].includes(order.status)) {
      return reply.status(400).send({ error: 'Este pedido não pode mais ser cancelado' });
    }

    // Get order items to restore stock
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('variation_id, product_id, quantity')
      .eq('order_id', id);

    // Cancel order
    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', id);

    // Restore stock
    if (orderItems) {
      for (const item of orderItems) {
        if (item.variation_id) {
          await supabase
            .from('product_variations')
            .select('stock_quantity')
            .eq('id', item.variation_id)
            .single()
            .then(({ data }) => {
              if (data) {
                supabase
                  .from('product_variations')
                  .update({ stock_quantity: data.stock_quantity + item.quantity })
                  .eq('id', item.variation_id);
              }
            });

          // Log stock movement
          await supabase.from('stock_movements').insert({
            product_id: item.product_id,
            variation_id: item.variation_id,
            type: 'in',
            quantity: item.quantity,
            reason: `Cancelamento do pedido`,
            order_id: id,
          });
        }
      }
    }

    return { success: true };
  });

  // Get delivery schedules
  app.get('/schedules/available', async (_request, reply) => {
    const { data, error } = await supabase
      .from('delivery_schedules')
      .select('*')
      .eq('active', true)
      .order('start_time', { ascending: true });

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });
}
