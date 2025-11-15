-- Add payment tracking columns to purchases table
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed')),
ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchases_razorpay_order_id ON public.purchases(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON public.purchases(payment_status);