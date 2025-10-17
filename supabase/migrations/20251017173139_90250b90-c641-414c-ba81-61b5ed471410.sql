-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true);

-- Allow anyone to view images (public bucket)
CREATE POLICY "Public access to chat images"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');

-- Allow anyone to upload images
CREATE POLICY "Anyone can upload chat images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own chat images"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-images');