-- Create feedback/reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_complaint BOOLEAN GENERATED ALWAYS AS (rating <= 2) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Anyone can view non-anonymous reviews"
  ON public.reviews
  FOR SELECT
  USING (is_anonymous = false OR auth.uid() = customer_id);

CREATE POLICY "Customers can create reviews for purchased services"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.customer_id = auth.uid()
        AND purchases.service_id = reviews.service_id
    )
  );

CREATE POLICY "Customers can update their own reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can delete their own reviews"
  ON public.reviews
  FOR DELETE
  USING (auth.uid() = customer_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_reviews_service_id ON public.reviews(service_id);
CREATE INDEX idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);