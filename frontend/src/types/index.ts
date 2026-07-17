export type UserRole = 'admin' | 'attendant' | 'manager' | 'b2c_client' | 'b2b_client';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'pix' | 'credit_card' | 'boleto';
export type OrderType = 'b2c' | 'b2b';
export type ClientType = 'drogaria' | 'clinica' | 'distribuidora';
export type StockMovementType = 'in' | 'out' | 'adjustment';
export type DriverType = 'own' | 'ifood' | 'rappi' | 'other';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_admin: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
  laboratory?: string;
  anvisa_code?: string;
  controlled: boolean;
  requires_prescription: boolean;
  active: boolean;
  created_at: string;
  category?: Category;
  variations?: ProductVariation[];
}

export interface ProductVariation {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price_override?: number;
  stock_quantity: number;
  attributes: Record<string, string>;
  active: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  variation?: ProductVariation;
  quantity: number;
}

export interface B2BClient {
  id: string;
  user_id?: string;
  cnpj: string;
  company_name: string;
  trade_name?: string;
  client_type: ClientType;
  phone?: string;
  email?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  latitude?: number;
  longitude?: number;
  credit_limit: number;
  active: boolean;
  created_at: string;
  user?: Profile;
}

export interface B2BClientProduct {
  id: string;
  b2b_client_id: string;
  product_id: string;
  variation_id?: string;
  custom_price: number;
  min_quantity: number;
  volume_discount_percent: number;
  created_at: string;
  product?: Product;
  variation?: ProductVariation;
}

export interface DeliveryZone {
  id: string;
  name: string;
  radius_km: number;
  center_lat: number;
  center_lng: number;
  shipping_fee: number;
  estimated_delivery_minutes: number;
  active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: number;
  user_id: string;
  b2b_client_id?: string;
  order_type: OrderType;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_id?: string;
  payment_confirmed_at?: string;
  otp_code?: string;
  otp_verified: boolean;
  otp_expires_at?: string;
  delivery_zone_id?: string;
  shipping_address_id?: string;
  shipping_address_snapshot?: Record<string, unknown>;
  delivery_schedule_id?: string;
  prescription_url?: string;
  delivery_notes?: string;
  assigned_driver_id?: string;
  ready_at?: string;
  delivered_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  profile?: Profile;
  b2b_client?: B2BClient;
  delivery_zone?: DeliveryZone;
  delivery_schedule?: { name: string; start_time: string; end_time: string };
  driver?: Driver;
  assignment?: DeliveryAssignment;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variation_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
  variation?: ProductVariation;
}

export interface OtpLog {
  id: string;
  order_id: string;
  phone: string;
  code: string;
  attempts: number;
  verified: boolean;
  sent_at: string;
  verified_at?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  driver_type: DriverType;
  vehicle_type?: string;
  plate?: string;
  active: boolean;
  created_at: string;
}

export interface DeliveryAssignment {
  id: string;
  order_id: string;
  driver_id: string;
  status: 'assigned' | 'picked_up' | 'delivered';
  assigned_at: string;
  picked_up_at?: string;
  delivered_at?: string;
  notes?: string;
  driver?: Driver;
  order?: Order;
}

export interface ZipCoordinate {
  zip_code: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
}
