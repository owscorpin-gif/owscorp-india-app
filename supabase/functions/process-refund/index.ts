import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!razorpayKeyId || !razorpayKeySecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables not configured');
    }

    const { purchaseId, reason } = await req.json();

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get purchase details
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      throw new Error('Purchase not found');
    }

    if (!purchase.razorpay_payment_id) {
      throw new Error('No payment ID found for this purchase');
    }

    // Create refund in Razorpay
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const refundResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${purchase.razorpay_payment_id}/refund`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(purchase.amount * 100), // Amount in paise
          notes: { reason }
        })
      }
    );

    if (!refundResponse.ok) {
      const error = await refundResponse.json();
      throw new Error(`Razorpay refund failed: ${error.error?.description || 'Unknown error'}`);
    }

    const refundData = await refundResponse.json();

    // Create refund record
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert({
        purchase_id: purchaseId,
        razorpay_refund_id: refundData.id,
        amount: purchase.amount,
        currency: purchase.currency,
        reason,
        status: 'processing'
      })
      .select()
      .single();

    if (refundError) {
      throw refundError;
    }

    console.log('Refund initiated:', refund.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        refund: refund,
        message: 'Refund initiated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-refund function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});