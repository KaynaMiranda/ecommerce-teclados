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
  // VIA CEP - Buscar endereço por CEP
  // =============================================

  app.get('/cep/:zip_code', async (request, reply) => {
    const { zip_code } = request.params as { zip_code: string };
    const cleanZip = zip_code.replace(/\D/g, '');

    if (cleanZip.length !== 8) {
      return reply.status(400).send({ error: 'CEP inválido' });
    }

    // Check our local table first
    const { data: local } = await supabase
      .from('zip_coordinates')
      .select('*')
      .eq('zip_code', cleanZip)
      .single();

    if (local) {
      return {
        zip_code: cleanZip,
        street: '',
        neighborhood: '',
        city: local.city,
        state: local.state,
        latitude: local.latitude,
        longitude: local.longitude,
      };
    }

    // Fallback to ViaCEP API
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
      const data = await response.json() as Record<string, string>;

      if (data.erro) {
        return reply.status(404).send({ error: 'CEP não encontrado' });
      }

      return {
        zip_code: cleanZip,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
        latitude: null,
        longitude: null,
      };
    } catch {
      return reply.status(500).send({ error: 'Erro ao consultar CEP' });
    }
  });

  // =============================================
  // SHIPPING CALCULATION (Haversine + Geocoding)
  // =============================================

  async function geocodeZip(zipCode: string): Promise<{ lat: number; lng: number } | null> {
    // 1. Check local zip_coordinates table
    const { data: local } = await supabase
      .from('zip_coordinates')
      .select('latitude, longitude')
      .eq('zip_code', zipCode)
      .single();

    if (local) {
      return { lat: Number(local.latitude), lng: Number(local.longitude) };
    }

    // 2. Get city/state from ViaCEP, then geocode with Nominatim
    try {
      const viaCepResp = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
      const viaCepData = await viaCepResp.json() as Record<string, string>;

      if (viaCepData.erro || !viaCepData.localidade) return null;

      const city = viaCepData.localidade;
      const state = viaCepData.uf;
      const query = `${city}, ${state}, Brazil`;

      const nominatimResp = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'FarmaPlus/1.0' } }
      );
      const nominatimData = await nominatimResp.json() as Array<{ lat: string; lon: string }>;

      if (nominatimData.length > 0) {
        const coords = {
          lat: parseFloat(nominatimData[0].lat),
          lng: parseFloat(nominatimData[0].lon),
        };

        // Cache in zip_coordinates for next time
        await supabase.from('zip_coordinates').insert({
          zip_code: zipCode,
          latitude: coords.lat,
          longitude: coords.lng,
          city,
          state,
        });

        return coords;
      }
    } catch {
      // Ignore errors
    }

    return null;
  }

  app.post('/calculate-shipping', async (request, reply) => {
    const { zip_code, latitude, longitude } = request.body as {
      zip_code?: string;
      latitude?: number;
      longitude?: number;
    };

    let lat = latitude;
    let lng = longitude;

    // If only zip_code provided, geocode it
    if ((!lat || !lng) && zip_code) {
      const cleanZip = zip_code.replace(/\D/g, '');
      const coords = await geocodeZip(cleanZip);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      }
    }

    if (!lat || !lng) {
      return reply.status(400).send({ error: 'Não foi possível localizar este CEP. Verifique o CEP informado.' });
    }

    // Get all active zones
    const { data: zones, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('active', true)
      .order('radius_km', { ascending: true });

    if (error) return reply.status(500).send({ error: error.message });

    // Haversine formula
    const R = 6371;

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

    let matchedZone = null;
    let distance = 0;

    for (const zone of zones || []) {
      distance = haversine(lat, lng, zone.center_lat, zone.center_lng);
      if (distance <= zone.radius_km) {
        matchedZone = zone;
        break;
      }
    }

    if (!matchedZone) {
      return {
        available: false,
        error: 'Fora da área de entrega',
        distance_km: Math.round(distance * 10) / 10,
      };
    }

    return {
      available: true,
      zone_id: matchedZone.id,
      zone_name: matchedZone.name,
      shipping_fee: Number(matchedZone.shipping_fee),
      estimated_delivery_minutes: matchedZone.estimated_delivery_minutes,
      distance_km: Math.round(distance * 10) / 10,
    };
  });
}
