
import React, { useState, useEffect, useCallback } from 'react';
import { supabase, getTgCredentials } from '../lib/supabase';
import { Screen } from '../types';
import { db } from '../database';

interface Props {
  onSuccess: () => void;
  onGuest: () => void;
  navigate: (screen: Screen) => void;
}

const Auth: React.FC<Props> = ({ onSuccess, onGuest, navigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [tgAuthStatus, setTgAuthStatus] = useState<string | null>(null);

  const handleTelegramAuth = useCallback(async (tgUser: any, startParam?: string) => {
    if (loading) return;
    setLoading(true);
    setTgAuthStatus('СИНХРОНИЗАЦИЯ С TG...');
    
    const creds = getTgCredentials(tgUser.id);
    
    try {
      // 1. Пытаемся войти
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
        email: creds.email, 
        password: creds.password 
      });
      
      if (signInError) {
        // 2. Если не вошли - регистрируем
        setTgAuthStatus('СОЗДАНИЕ УЗЛА...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: creds.email,
          password: creds.password,
          options: {
            data: {
              first_name: tgUser.first_name,
              username: tgUser.username || `user_${tgUser.id}`,
              photo_url: tgUser.photo_url
            }
          }
        });

        if (signUpError) throw signUpError;
        
        if (signUpData.user) {
          // Принудительно создаем профиль, не дожидаясь триггера БД
          await db.saveUser({
            id: signUpData.user.id,
            username: tgUser.username || `user_${tgUser.id}`,
            firstName: tgUser.first_name,
            photoUrl: tgUser.photo_url,
            rating: 5.0,
            points: 0,
            isPro: false,
            isAdmin: false,
            isVerified: false,
            welcomeBonusClaimed: false, 
            isReliable: true,
            referralCode: `M${tgUser.id}`,
            dealsCount: 0,
            isDonor: false,
            level: 'Мужик',
            specialization: []
          });
          
          // Повторный вход для сессии
          await supabase.auth.signInWithPassword({ email: creds.email, password: creds.password });
        }
      }

      setTgAuthStatus('ДОСТУП ОТКРЫТ');
      setTimeout(() => onSuccess(), 500);
    } catch (err: any) {
      console.error("TG_AUTH_CRITICAL_FAIL:", err);
      setTgAuthStatus(`ОШИБКА РЕГИСТРАЦИИ`);
      setLoading(false);
    }
  }, [onSuccess, loading]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      const timer = setTimeout(() => {
        handleTelegramAuth(tg.initDataUnsafe.user, tg.initDataUnsafe.start_param);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [handleTelegramAuth]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { first_name: firstName } }
        });
        if (error) throw error;
        alert('Проверь почту, мужик!');
        setIsLogin(true);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-[#050505] items-center justify-center pt-safe">
      <div className="w-full max-w-md bg-[#0f0f0f] p-10 rounded-[45px] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-10">
          <div className="inline-block border border-[#D4AF37]/20 text-[#D4AF37] text-[8px] font-black px-4 py-2 rounded-full uppercase mb-6 tracking-[0.4em] mono">
            TERMINAL_GATE_v4.6
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
            {tgAuthStatus || (isLogin ? 'ВХОД В ЦЕХ' : 'РЕГИСТРАЦИЯ')}
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-14 h-14 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-8"></div>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] animate-pulse">
              {tgAuthStatus || 'ИДЕТ АВТОРИЗАЦИЯ...'}
            </p>
            <button 
              onClick={onGuest}
              className="mt-12 text-[10px] text-zinc-700 font-black uppercase tracking-[0.3em] hover:text-[#D4AF37] transition-colors"
            >
              СБРОСИТЬ И ВОЙТИ ГОСТЕМ
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <button 
              onClick={() => {
                const tg = (window as any).Telegram?.WebApp;
                if (tg?.initDataUnsafe?.user) handleTelegramAuth(tg.initDataUnsafe.user);
                else alert("Зайди через бота @chmuzhikbot!");
              }}
              className="w-full bg-[#229ED9] text-white font-black py-5 rounded-[22px] uppercase italic tracking-tighter active:scale-95 transition-all shadow-xl flex items-center justify-center gap-4"
            >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.48.99-.74 3.86-1.68 6.44-2.78 7.72-3.31 3.66-1.51 4.42-1.77 4.92-1.78.11 0 .35.03.5.15.13.1.17.23.18.33 0 .04.01.14 0 .2z"/></svg>
               ВОЙТИ ЧЕРЕЗ TELEGRAM
            </button>

            <div className="flex items-center gap-4 opacity-20">
               <div className="h-px bg-white flex-1"></div>
               <span className="text-[8px] font-black">ИЛИ</span>
               <div className="h-px bg-white flex-1"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <input type="text" placeholder="ИМЯ" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white font-bold" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              )}
              <input type="email" placeholder="EMAIL" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
              <input type="password" placeholder="ПАРОЛЬ" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="submit" className="w-full bg-[#D4AF37] text-black font-black py-5 rounded-[22px] uppercase italic shadow-xl shadow-[#D4AF37]/10">
                {isLogin ? 'ВХОД В СИСТЕМУ' : 'СОЗДАТЬ АККАУНТ'}
              </button>
              
              <div className="flex flex-col gap-4 mt-6">
                <button onClick={() => setIsLogin(!isLogin)} type="button" className="w-full text-zinc-600 text-[8px] font-black uppercase tracking-widest">
                  {isLogin ? 'НЕТ ПРОФИЛЯ? РЕГИСТРАЦИЯ' : 'ЕСТЬ АККАУНТ? ВОЙДИ'}
                </button>
                
                <div className="h-px bg-white/5 w-12 mx-auto"></div>
                
                <button 
                  onClick={onGuest}
                  type="button"
                  className="w-full text-[#D4AF37] font-black uppercase italic text-[11px] tracking-[0.2em] active-press py-2"
                >
                  ПРОДОЛЖИТЬ КАК ГОСТЬ (BYPASS)
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
