import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import type { Product } from '../types';

interface DeliverySchedule {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

export function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [shippingError, setShippingError] = useState('');
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [schedules, setSchedules] = useState<DeliverySchedule[]>([]);
  const [prescriptionRequired, setPrescriptionRequired] = useState<Product[]>([]);
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [minOrderValue, setMinOrderValue] = useState(25);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const subtotal = getTotal();
  const pixDiscount = payment_method_calc();
  const total = subtotal - pixDiscount + (shippingFee || 0);

  function payment_method_calc() {
    return paymentMethod === 'pix' ? subtotal * 0.05 : 0;
  }

  useEffect(() => {
    loadSchedules();
    checkPrescription();
    loadMinValue();
  }, []);

  useEffect(() => {
    const zipClean = address.zip_code.replace(/\D/g, '');
    if (zipClean.length === 8) {
      fetchCEP(zipClean);
    }
  }, [address.zip_code]);

  async function fetchCEP(zipClean: string) {
    try {
      const { data } = await api.get(`/api/products/cep/${zipClean}`);
      if (data) {
        setAddress(prev => ({
          ...prev,
          street: data.street || prev.street,
          neighborhood: data.neighborhood || prev.neighborhood,
          city: data.city || prev.city,
          state: data.state || prev.state,
        }));
      }
    } catch {
      // ignore — user can fill manually
    }
  }

  async function loadSchedules() {
    try {
      const { data } = await api.get('/api/orders/schedules/available');
      setSchedules(data);
      if (data.length > 0) setSelectedSchedule(data[0].id);
    } catch {}
  }

  async function loadMinValue() {
    try {
      const { data } = await api.get('/api/admin/dashboard', { params: { user_id: 'public' } }).catch(() => ({ data: null }));
      // Use default if can't fetch
      if (data?.minOrderValue) setMinOrderValue(data.minOrderValue);
    } catch {}
  }

  function checkPrescription() {
    const required = items
      .filter(item => item.product.requires_prescription)
      .map(item => item.product);
    const unique = [...new Map(required.map(p => [p.id, p])).values()];
    setPrescriptionRequired(unique);
  }

  function formatPhone(value: string) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length > 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    if (numbers.length > 2) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return numbers;
  }

  function formatCEP(value: string) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length > 5) return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    return numbers;
  }

  async function handleShippingCalc() {
    const zipClean = address.zip_code.replace(/\D/g, '');
    if (zipClean.length !== 8) {
      setShippingError('CEP deve ter 8 dígitos');
      setShippingFee(null);
      return;
    }
    setCalculatingShipping(true);
    setShippingError('');
    try {
      const { data } = await api.post('/api/products/calculate-shipping', { zip_code: address.zip_code });
      if (data.available) {
        setShippingFee(data.shipping_fee);
        setShippingError('');
      } else {
        setShippingFee(null);
        setShippingError('Fora da área de entrega');
      }
    } catch {
      setShippingFee(null);
      setShippingError('Erro ao calcular frete');
    } finally {
      setCalculatingShipping(false);
    }
  }

  function validate(): string | null {
    const phoneClean = address.phone.replace(/\D/g, '');
    const zipClean = address.zip_code.replace(/\D/g, '');

    if (!address.street.trim()) return 'Informe o endereço';
    if (!address.number.trim()) return 'Informe o número';
    if (!address.neighborhood.trim()) return 'Informe o bairro';
    if (!address.city.trim()) return 'Informe a cidade';
    if (!address.state.trim()) return 'Informe a UF';
    if (zipClean.length !== 8) return 'CEP inválido';
    if (phoneClean.length < 10) return 'Telefone inválido';
    if (shippingFee === null) return 'Calcule o frete antes de continuar';
    if (!selectedSchedule) return 'Selecione um horário de entrega';
    if (subtotal < minOrderValue) return `Valor mínimo para entrega: R$ ${minOrderValue.toFixed(2)}`;
    if (prescriptionRequired.length > 0 && !prescriptionUrl) return 'Envie a receita para os medicamentos controlados';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/api/orders', {
        user_id: user.id,
        items: items.map(item => ({
          product_id: item.product.id,
          variation_id: item.variation?.id,
          quantity: item.quantity,
          unit_price: item.variation?.price_override ?? item.product.price,
        })),
        shipping_address: {
          ...address,
          zip_code: address.zip_code.replace(/\D/g, ''),
          phone: address.phone.replace(/\D/g, ''),
        },
        payment_method: paymentMethod,
        shipping_fee: shippingFee,
        delivery_schedule_id: selectedSchedule,
        delivery_notes: deliveryNotes,
        prescription_url: prescriptionUrl || undefined,
      });

      clearCart();
      navigate('/pedido-confirmado', { state: { orderId: data.order_id, orderNumber: data.order_number } });
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erro ao criar pedido';
      if (err?.response?.data?.prescription_required) {
        setError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) { navigate('/carrinho'); return null; }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">⚠️ {error}</div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Contato e Endereço</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
            <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: formatPhone(e.target.value)})}
              className="w-full border rounded-lg px-3 py-2" placeholder="(11) 99999-9999" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
            <div className="flex gap-2">
              <input type="text" value={address.zip_code} onChange={e => setAddress({...address, zip_code: formatCEP(e.target.value)})}
                className="flex-1 border rounded-lg px-3 py-2" placeholder="00000-000" required />
              <button type="button" onClick={handleShippingCalc} disabled={calculatingShipping}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50">
                {calculatingShipping ? '...' : 'Calcular'}
              </button>
            </div>
            {shippingError && <p className="text-sm text-red-600 mt-1">{shippingError}</p>}
            {shippingFee !== null && <p className="text-sm text-green-600 mt-1">Frete: R$ {shippingFee.toFixed(2)}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
              <input type="text" value={address.street} onChange={e => setAddress({...address, street: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
              <input type="text" value={address.number} onChange={e => setAddress({...address, number: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
            <input type="text" value={address.complement} onChange={e => setAddress({...address, complement: e.target.value})}
              className="w-full border rounded-lg px-3 py-2" placeholder="Apto, Bloco, etc." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
            <input type="text" value={address.neighborhood} onChange={e => setAddress({...address, neighborhood: e.target.value})}
              className="w-full border rounded-lg px-3 py-2" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
              <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UF *</label>
              <input type="text" value={address.state} onChange={e => setAddress({...address, state: e.target.value.toUpperCase()})}
                className="w-full border rounded-lg px-3 py-2" maxLength={2} required />
            </div>
          </div>

          {/* Delivery Schedule */}
          <h2 className="text-lg font-semibold mt-6">Horário de Entrega</h2>
          <div className="grid grid-cols-3 gap-2">
            {schedules.map(s => (
              <button key={s.id} type="button" onClick={() => setSelectedSchedule(s.id)}
                className={`p-3 border rounded-lg text-center text-sm transition-colors ${
                  selectedSchedule === s.id ? 'border-green-600 bg-green-50 text-green-700' : 'hover:bg-gray-50'
                }`}>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">{s.start_time?.slice(0,5)} - {s.end_time?.slice(0,5)}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações de entrega</label>
            <textarea value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value)}
              className="w-full border rounded-lg px-3 py-2" rows={2}
              placeholder="Ex: portão azul, interfone 32..." />
          </div>

          {/* Prescription */}
          {prescriptionRequired.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-medium text-orange-800 mb-2">⚕️ Receita Obrigatória</h3>
              <p className="text-sm text-orange-700 mb-2">
                Envie a receita para: {prescriptionRequired.map(p => p.name).join(', ')}
              </p>
              <input type="text" value={prescriptionUrl} onChange={e => setPrescriptionUrl(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="URL da receita (Google Drive, Imgur, etc.)" />
            </div>
          )}

          {/* Payment */}
          <h2 className="text-lg font-semibold mt-6">Pagamento</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" value="pix" checked={paymentMethod === 'pix'}
                onChange={e => setPaymentMethod(e.target.value as 'pix')} />
              <div>
                <span className="font-medium">PIX</span>
                <span className="text-sm text-green-600 ml-2">-5% de desconto</span>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'}
                onChange={e => setPaymentMethod(e.target.value as 'credit_card')} />
              <span className="font-medium">Cartão de Crédito</span>
            </label>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white border rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.variation?.id}`} className="flex justify-between text-sm">
                  <span className="text-gray-600 flex-1 pr-2">
                    {item.product.name} {item.variation?.name && `- ${item.variation.name}`} x{item.quantity}
                    {item.product.requires_prescription && <span className="text-orange-500 ml-1">⚕️</span>}
                  </span>
                  <span className="whitespace-nowrap">R$ {((item.variation?.price_override ?? item.product.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {subtotal < minOrderValue && (
              <p className="text-sm text-orange-600 mb-2">⚠️ Mínimo: R$ {minOrderValue.toFixed(2)}</p>
            )}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Frete</span>
                <span>{shippingFee !== null ? `R$ ${shippingFee.toFixed(2)}` : <span className="text-gray-400">Calcule acima</span>}</span>
              </div>
              {pixDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto PIX (5%)</span>
                  <span>- R$ {pixDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Processando...' : 'Confirmar Pedido'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">Confirmação via WhatsApp</p>
          </div>
        </div>
      </form>
    </div>
  );
}
