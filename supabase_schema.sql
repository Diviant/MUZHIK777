
-- ==========================================
-- 1. ТАБЛИЦА ПРОФИЛЕЙ И АВТО-РЕГИСТРАЦИЯ
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    first_name TEXT,
    photo_url TEXT,
    rating DECIMAL DEFAULT 5.0,
    points INTEGER DEFAULT 100,
    is_pro BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    welcome_bonus_claimed BOOLEAN DEFAULT false, -- Новое поле
    is_reliable BOOLEAN DEFAULT true,
    is_banned BOOLEAN DEFAULT false,
    referral_code TEXT UNIQUE,
    referred_by_id UUID REFERENCES public.profiles(id),
    deals_count INTEGER DEFAULT 0,
    is_donor BOOLEAN DEFAULT false,
    level TEXT DEFAULT 'Мужик',
    specialization TEXT[] DEFAULT '{}',
    portfolio_images TEXT[] DEFAULT '{}',
    trusted_contacts TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Если таблица уже существует, докатываем колонку
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='welcome_bonus_claimed') THEN
    ALTER TABLE public.profiles ADD COLUMN welcome_bonus_claimed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Функция для автоматического создания профиля при регистрации в Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, photo_url, referral_code)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'first_name', 'Мужик'),
    new.raw_user_meta_data->>'photo_url',
    'M' || substr(new.id::text, 1, 8)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер: срабатывает сразу после записи в auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ... остальная часть файла остается без изменений ...
