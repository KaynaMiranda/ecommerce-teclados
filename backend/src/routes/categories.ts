import { FastifyInstance } from 'fastify';
import { supabase } from '../supabase.js';

export async function categoriesRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return [];
    }

    return data;
  });
}
