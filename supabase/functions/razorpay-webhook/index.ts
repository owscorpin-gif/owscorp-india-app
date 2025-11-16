import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { createHmac } from "https://deno.land/std@0.152.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!razorpayKeySecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables not configured');
    }

    const signature = req.headers.get('x-razorpay-signature');
    const body = await req.text();
    
    // Verify webhook signature
    const expectedSignature = createHmac('sha256', razorpayKeySecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const event = JSON.parse(body);
    console.log('Webhook event received:', event.event);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log webhook event
    await supabase.from('webhook_events').insert({
      event_type: event.event,
      payload: event,
      razorpay_event_id: event.event
    });

    // Handle different event types
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      
      // Update purchase status
      await supabase
        .from('purchases')
        .update({ 
          payment_status: 'success',
          razorpay_payment_id: payment.id 
        })
        .eq('razorpay_order_id', payment.order_id);

      console.log('Payment captured:', payment.id);
    } else if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      
      await supabase
        .from('purchases')
        .update({ payment_status: 'failed' })
        .eq('razorpay_order_id', payment.order_id);

      console.log('Payment failed:', payment.id);
    } else if (event.event === 'refund.processed') {
      const refund = event.payload.refund.entity;
      
      // Update refund status
      await supabase
        .from('refunds')
        .update({ 
          status: 'completed',
          razorpay_refund_id: refund.id,
          processed_at: new Date().toISOString()
        })
        .eq('razorpay_refund_id', refund.id);

      console.log('Refund processed:', refund.id);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in razorpay-webhook function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});