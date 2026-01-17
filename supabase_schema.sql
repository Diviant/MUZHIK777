
-- Добавляем колонку для реферальной системы (уже была, фиксируем)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Таблица для Журнала Вахты
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

-- Таблица для Заметок
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_vakhta_user ON public.vakhta_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON public.notes(user_id);

-- Включаем RLS
ALTER TABLE public.vakhta_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Политики безопасности (только владелец видит и правит свои данные)
CREATE POLICY "Users can manage their own vakhta entries" 
ON public.vakhta_entries FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notes" 
ON public.notes FOR ALL 
USING (auth.uid() = user_id);
