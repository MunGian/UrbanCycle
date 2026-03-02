-- Create the reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    latitude FLOAT8,
    longitude FLOAT8,
    description TEXT,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    images TEXT[]
);

-- If you already created the table with 'image' column, run this migration:
-- ALTER TABLE public.reports DROP COLUMN IF EXISTS image;
-- ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS images TEXT[];

-- Turn on Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own reports
CREATE POLICY "Users can view their own reports" ON public.reports
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own reports
CREATE POLICY "Users can create their own reports" ON public.reports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create a storage bucket for report images if it doesn't exist
-- Note: You usually create buckets via the Supabase Dashboard, but here is the policy.
-- Assuming bucket name is 'report-images'

-- Policy: Allow authenticated users to upload images to 'report-images' bucket
-- (You need to create the 'report-images' bucket in Storage first)
CREATE POLICY "Authenticated users can upload report images"
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'report-images');

-- Policy: Allow public to view report images (if needed) or authenticated users
CREATE POLICY "Public can view report images"
ON storage.objects FOR SELECT TO public
WITH CHECK (bucket_id = 'report-images');
