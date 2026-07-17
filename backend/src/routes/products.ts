import { FastifyInstance } from 'fastify';
import { supabase } from '../supabase.js';

export async function productsRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const { category, search } = request.query as { category?: string; search?: string };

    let query = supabase
      .from('products')
      .select('*, category:categories(name, slug), variations:product_variations(id, name, sku, price_override, stock_quantity, attributes)')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category_id', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,laboratory.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.get('/search', async (request, reply) => {
    const { q } = request.query as { q?: string };

    if (!q) return reply.status(400).send({ error: 'Query parameter "q" is required' });

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(name, slug), variations:product_variations(id, name, sku, price_override, stock_quantity, attributes)')
      .eq('active', true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,laboratory.ilike.%${q}%`);

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), variations:product_variations(*)')
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (error || !data) return reply.status(404).send({ error: 'Product not found' });
    return data;
  });

  // =============================================
  // SHIPPING CALCULATION (Haversine)
  // =============================================

  app.post('/calculate-shipping', async (request, reply) => {
    const { zip_code, latitude, longitude } = request.body as {
      zip_code?: string;
      latitude?: number;
      longitude?: number;
    };

    let lat = latitude;
    let lng = longitude;

    // If only zip_code provided, we'd need geocoding (Google Maps API)
    // For now, require lat/lng directly
    if (!lat || !lng) {
      return reply.status(400).send({ error: 'Latitude and longitude are required' });
    }

    // Get all active zones
    const { data: zones, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('active', true)
      .order('radius_km', { ascending: true });

    if (error) return reply.status(500).send({ error: error.message });

    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in km

    function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    // Find the smallest zone that covers the distance
    let matchedZone = null;
    for (const zone of zones || []) {
      const distance = haversine(lat, lng, zone.center_lat, zone.center_lng);
      if (distance <= zone.radius_km) {
        matchedZone = zone;
        break;
      }
    }

    if (!matchedZone) {
      return { available: false, error: 'Fora da área de entrega' };
    }

    return {
      available: true,
      zone_id: matchedZone.id,
      zone_name: matchedZone.name,
      shipping_fee: matchedZone.shipping_fee,
      estimated_delivery_minutes: matchedZone.estimated_delivery_minutes,
    };
  });
}
