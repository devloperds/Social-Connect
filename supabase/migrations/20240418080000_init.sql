-- Initialize users table
CREATE TABLE public.users (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    email varchar UNIQUE NOT NULL,
    username varchar(30) UNIQUE NOT NULL CHECK (char_length(username) >= 3),
    password_hash varchar NOT NULL,
    first_name varchar,
    last_name varchar,
    bio varchar(160),
    avatar_url varchar,
    website varchar,
    location varchar,
    posts_count int DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login timestamp with time zone
);

-- Initialize posts table
CREATE TABLE public.posts (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    content varchar(280),
    author_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    image_url varchar,
    is_active boolean DEFAULT true,
    like_count int DEFAULT 0,
    comment_count int DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initialize follows table
CREATE TABLE public.follows (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(follower_id, following_id)
);

-- Initialize likes table
CREATE TABLE public.likes (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id)
);

-- Initialize comments table
CREATE TABLE public.comments (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content varchar(500) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Storage buckets creation
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/jpg']),
  ('post-images', 'post-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Policies for Storage
CREATE POLICY "Avatar Images Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar Images Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Post Images Access" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "Post Images Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-images');
