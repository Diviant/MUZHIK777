
-- ... (предыдущий код остается)

CREATE TABLE IF NOT EXISTS public.feed_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public feed is viewable by everyone" ON public.feed_posts;
DROP POLICY IF EXISTS "Users can post to feed" ON public.feed_posts;
CREATE POLICY "Public feed is viewable by everyone" ON public.feed_posts FOR SELECT USING (true);
CREATE POLICY "Users can post to feed" ON public.feed_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON public.feed_posts FOR DELETE USING (auth.uid() = author_id);
