-- Add currency support to purchases table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS currency text DEFAULT 'INR';

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  invoice_number text UNIQUE NOT NULL,
  customer_id uuid NOT NULL,
  service_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  tax_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  invoice_date timestamp with time zone DEFAULT now(),
  due_date timestamp with time zone,
  status text DEFAULT 'paid',
  invoice_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  razorpay_refund_id text,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  reason text,
  status text DEFAULT 'pending',
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create webhook_events table for logging
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  razorpay_event_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view their own refunds" ON refunds;
DROP POLICY IF EXISTS "Users can create refund requests" ON refunds;

-- RLS policies for invoices
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = customer_id);

-- RLS policies for refunds
CREATE POLICY "Users can view their own refunds"
  ON refunds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM purchases
      WHERE purchases.id = refunds.purchase_id
      AND purchases.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create refund requests"
  ON refunds FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM purchases
      WHERE purchases.id = refunds.purchase_id
      AND purchases.customer_id = auth.uid()
    )
  );

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  invoice_num text;
BEGIN
  SELECT COUNT(*) + 1 INTO next_num FROM invoices;
  invoice_num := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(next_num::text, 5, '0');
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice after purchase
CREATE OR REPLACE FUNCTION create_invoice_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'success' THEN
    INSERT INTO invoices (
      purchase_id,
      invoice_number,
      customer_id,
      service_id,
      amount,
      currency,
      total_amount
    )
    VALUES (
      NEW.id,
      generate_invoice_number(),
      NEW.customer_id,
      NEW.service_id,
      NEW.amount,
      NEW.currency,
      NEW.amount
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_invoice ON purchases;

CREATE TRIGGER trigger_create_invoice
  AFTER INSERT OR UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION create_invoice_after_purchase();