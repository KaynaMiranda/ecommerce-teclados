import { FastifyInstance } from 'fastify';
import { supabase } from '../supabase.js';

// OTP configuration
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 60;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function otpRoutes(app: FastifyInstance) {

  // Send OTP
  app.post('/send', async (request, reply) => {
    const { order_id, phone } = request.body as { order_id: string; phone: string };

    if (!phone) {
      return reply.status(400).send({ error: 'Phone number is required' });
    }

    // Check if there's a recent OTP sent (cooldown)
    const { data: recentOtp } = await supabase
      .from('otp_logs')
      .select('sent_at')
      .eq('order_id', order_id)
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();

    if (recentOtp) {
      const secondsSinceLastOtp = (Date.now() - new Date(recentOtp.sent_at).getTime()) / 1000;
      if (secondsSinceLastOtp < RESEND_COOLDOWN_SECONDS) {
        return reply.status(429).send({
          error: `Aguarde ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastOtp)} segundos para reenviar`,
        });
      }
    }

    // Generate and store OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const { error } = await supabase.from('otp_logs').insert({
      order_id,
      phone,
      code,
      attempts: 0,
      verified: false,
    });

    if (error) return reply.status(500).send({ error: error.message });

    // Update order with OTP info
    await supabase
      .from('orders')
      .update({ otp_code: code, otp_expires_at: expiresAt })
      .eq('id', order_id);

    // TODO: Send via WhatsApp API
    // For now, just log the OTP (replace with actual WhatsApp API call)
    console.log(`OTP for order ${order_id}: ${code}`);

    return { success: true, message: 'OTP enviado via WhatsApp' };
  });

  // Verify OTP
  app.post('/verify', async (request, reply) => {
    const { order_id, code } = request.body as { order_id: string; code: string };

    // Get latest OTP for this order
    const { data: otpLog, error: fetchError } = await supabase
      .from('otp_logs')
      .select('*')
      .eq('order_id', order_id)
      .eq('verified', false)
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpLog) {
      return reply.status(404).send({ error: 'OTP não encontrado' });
    }

    // Check expiry
    const otpSentTime = new Date(otpLog.sent_at).getTime();
    const now = Date.now();
    if (now - otpSentTime > OTP_EXPIRY_MINUTES * 60 * 1000) {
      return reply.status(400).send({ error: 'OTP expirado. Solicite um novo código.' });
    }

    // Check max attempts
    if (otpLog.attempts >= MAX_ATTEMPTS) {
      return reply.status(400).send({ error: 'Número máximo de tentativas excedido. Solicite um novo código.' });
    }

    // Increment attempts
    await supabase
      .from('otp_logs')
      .update({ attempts: otpLog.attempts + 1 })
      .eq('id', otpLog.id);

    // Verify code
    if (otpLog.code !== code) {
      return reply.status(400).send({ error: `Código inválido. ${MAX_ATTEMPTS - otpLog.attempts - 1} tentativas restantes.` });
    }

    // Mark as verified
    await supabase
      .from('otp_logs')
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq('id', otpLog.id);

    // Update order as OTP verified
    await supabase
      .from('orders')
      .update({ otp_verified: true, status: 'confirmed' })
      .eq('id', order_id);

    return { success: true, message: 'OTP verificado com sucesso' };
  });
}
