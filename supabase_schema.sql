
-- ==========================================
-- ЦЕХ: ГЕНЕРАЛЬНАЯ СТРУКТУРА БАЗЫ ДАННЫХ
-- ==========================================

-- 1. ТАБЛИЦЫ (Создаем, если нет)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    first_name TEXT,
    photo_url TEXT,
    rating NUMERIC DEFAULT 5.0,
    points INTEGER DEFAULT 100,
    is_pro BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_reliable BOOLEAN DEFAULT true,
    is_banned BOOLEAN DEFAULT false,
    referral_code TEXT UNIQUE,
    referred_by_id UUID REFERENCES public.profiles(id),
    deals_count INTEGER DEFAULT 0,
    is_donor BOOLEAN DEFAULT false,
    level TEXT DEFAULT 'Мужик',
    specialization TEXT[] DEFAULT '{}',
    telegram_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    salary TEXT,
    region TEXT,
    city_id TEXT,
    description TEXT,
    contact TEXT,
    is_vahta BOOLEAN DEFAULT false,
    housing BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.market_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('SELL', 'BUY')),
    category TEXT,
    title TEXT NOT NULL,
    price TEXT,
    condition TEXT,
    description TEXT,
    contact TEXT,
    city_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT,
    title TEXT NOT NULL,
    description TEXT,
    price TEXT,
    author TEXT,
    contact TEXT,
    city_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vakhta_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_salary NUMERIC DEFAULT 0,
    advances NUMERIC DEFAULT 0,
    travel_expenses NUMERIC DEFAULT 0,
    food_expenses NUMERIC DEFAULT 0,
    sent_home NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    leader TEXT,
    category TEXT,
    member_count INTEGER DEFAULT 1,
    structure JSONB DEFAULT '[]',
    equipment TEXT[] DEFAULT '{}',
    description TEXT,
    rating NUMERIC DEFAULT 5.0,
    city_id TEXT,
    contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.machinery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT,
    model TEXT,
    rate TEXT,
    city_id TEXT,
    description TEXT,
    contact TEXT,
    includes_operator BOOLEAN DEFAULT true,
    includes_fuel BOOLEAN DEFAULT true,
    specs TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cargo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    route_from TEXT,
    route_to TEXT,
    cargo_type TEXT,
    weight TEXT,
    price TEXT,
    departure_date TEXT,
    description TEXT,
    contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. ВКЛЮЧАЕМ RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vakhta_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machinery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargo ENABLE ROW LEVEL SECURITY;

-- 3. ПОЛИТИКИ (Сначала удаляем старые, чтобы не было ошибок)

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Vacancies
DROP POLICY IF EXISTS "Public data is viewable by everyone" ON public.vacancies;
DROP POLICY IF EXISTS "Authors can manage own vacancies" ON public.vacancies;
CREATE POLICY "Public data is viewable by everyone" ON public.vacancies FOR SELECT USING (true);
CREATE POLICY "Authors can manage own vacancies" ON public.vacancies FOR ALL USING (auth.uid() = author_id);

-- Marketplace
DROP POLICY IF EXISTS "Public items are viewable by everyone" ON public.market_items;
DROP POLICY IF EXISTS "Authors can manage own market items" ON public.market_items;
CREATE POLICY "Public items are viewable by everyone" ON public.market_items FOR SELECT USING (true);
CREATE POLICY "Authors can manage own market items" ON public.market_items FOR ALL USING (auth.uid() = author_id);

-- Services
DROP POLICY IF EXISTS "Public services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Authors can manage own services" ON public.services;
CREATE POLICY "Public services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY "Authors can manage own services" ON public.services FOR ALL USING (auth.uid() = author_id);

-- Private Data (Vakhta & Notes)
DROP POLICY IF EXISTS "Vakhta entries are private" ON public.vakhta_entries;
DROP POLICY IF EXISTS "Notes are private" ON public.notes;
CREATE POLICY "Vakhta entries are private" ON public.vakhta_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Notes are private" ON public.notes FOR ALL USING (auth.uid() = user_id);

-- Teams, Machinery, Cargo
DROP POLICY IF EXISTS "Public teams are viewable" ON public.teams;
DROP POLICY IF EXISTS "Public machinery are viewable" ON public.machinery;
DROP POLICY IF EXISTS "Public cargo are viewable" ON public.cargo;
CREATE POLICY "Public teams are viewable" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public machinery are viewable" ON public.machinery FOR SELECT USING (true);
CREATE POLICY "Public cargo are viewable" ON public.cargo FOR SELECT USING (true);

-- 4. АВТОМАТИЗАЦИЯ ПРОФИЛЯ (Триггер)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, username, referral_code)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'first_name', 'Мужик'), 
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substring(new.id::text from 1 for 5)), 
    'M' || substring(new.id::text from 1 for 8)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Удаляем триггер, если он был, и создаем заново
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
