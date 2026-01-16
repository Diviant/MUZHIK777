
-- Добавляем колонку для реферальной системы
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Индекс для быстрого поиска рефералов
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by_id);
