-- Create Albums Table
CREATE TABLE IF NOT EXISTS public.albums (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID DEFAULT auth.uid() NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own albums." ON public.albums FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own albums." ON public.albums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own albums." ON public.albums FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own albums." ON public.albums FOR DELETE USING (auth.uid() = user_id);

-- Create Files Table
CREATE TABLE IF NOT EXISTS public.files (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID DEFAULT auth.uid() NOT NULL,
    file_id TEXT NOT NULL,
    tg_message_id BIGINT NOT NULL,
    caption TEXT,
    type TEXT,
    file_size BIGINT,
    thumbnail_file_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own files." ON public.files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own files." ON public.files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own files." ON public.files FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own files." ON public.files FOR DELETE USING (auth.uid() = user_id);

-- Create Junction Table for Files and Albums
CREATE TABLE IF NOT EXISTS public.file_album_links (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    file_id BIGINT NOT NULL,
    album_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_file FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE,
    CONSTRAINT fk_album FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE CASCADE,
    UNIQUE(file_id, album_id)
);
ALTER TABLE public.file_album_links ENABLE ROW LEVEL SECURITY;
-- Policies for junction table are implicitly handled through FKs to RLS-protected tables.
-- We add policies to be explicit and secure.
CREATE POLICY "Users can manage links for their own content." ON public.file_album_links
    FOR ALL
    USING (
        (SELECT user_id FROM public.files WHERE id = file_id) = auth.uid() AND
        (SELECT user_id FROM public.albums WHERE id = album_id) = auth.uid()
    )
    WITH CHECK (
        (SELECT user_id FROM public.files WHERE id = file_id) = auth.uid() AND
        (SELECT user_id FROM public.albums WHERE id = album_id) = auth.uid()
    );

-- Create Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL UNIQUE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
-- This table should not be accessible by users directly, only by service_role key in edge functions.
-- We enable RLS and create no policies to block all access.
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;


-- Create a function to get the database size
CREATE OR REPLACE FUNCTION get_database_size()
RETURNS BIGINT AS $$
  SELECT sum(pg_database_size(datname)) FROM pg_database;
$$ LANGUAGE sql;

-- Create a function to get the user count
CREATE OR REPLACE FUNCTION get_users_count()
RETURNS BIGINT AS $$
  SELECT count(*) FROM auth.users;
$$ LANGUAGE sql SECURITY DEFINER;
