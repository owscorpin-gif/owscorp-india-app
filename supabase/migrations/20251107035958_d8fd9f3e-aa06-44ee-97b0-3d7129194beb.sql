-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  price DECIMAL(10, 2) NOT NULL,
  pricing_tiers JSONB DEFAULT '[]',
  preview_images TEXT[] DEFAULT '{}',
  demo_video_url TEXT,
  app_file_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for services
CREATE POLICY "Anyone can view published services" 
ON public.services 
FOR SELECT 
USING (status = 'published' OR auth.uid() = developer_id);

CREATE POLICY "Developers can create their own services" 
ON public.services 
FOR INSERT 
WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Developers can update their own services" 
ON public.services 
FOR UPDATE 
USING (auth.uid() = developer_id);

CREATE POLICY "Developers can delete their own services" 
ON public.services 
FOR DELETE 
USING (auth.uid() = developer_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for service files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('service-files', 'service-files', false, 104857600, ARRAY['application/zip', 'application/x-zip-compressed', 'application/octet-stream']),
  ('service-images', 'service-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('service-videos', 'service-videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime']);

-- Storage policies for service-files bucket
CREATE POLICY "Authenticated users can upload their own service files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'service-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Developers can view their own service files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'service-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Developers can update their own service files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'service-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Developers can delete their own service files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'service-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for service-images bucket (public)
CREATE POLICY "Anyone can view service images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'service-images');

CREATE POLICY "Authenticated users can upload service images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Developers can update their own service images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Developers can delete their own service images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for service-videos bucket (public)
CREATE POLICY "Anyone can view service videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'service-videos');

CREATE POLICY "Authenticated users can upload service videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'service-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Developers can update their own service videos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'service-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Developers can delete their own service videos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'service-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);