
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
  const [tgAvailable, setTgAvailable] = useState(false);

  const handleTelegramAuth = useCallback(async (tgUser: any, startParam?: string) => {
    setLoading(true);
    setTgAuthStatus('СИНХРОНИЗАЦИЯ С TG...');
    
    const creds = getTgCredentials(tgUser.id);
    
    try {
      // 1. Пробуем войти
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
        email: creds.email, 
        password: creds.password 
      });
      
      // 2. Если не вышло (новый юзер), регистрируем
      if (signInError) {
        setTgAuthStatus('СОЗДАНИЕ ПРОФИЛЯ...');
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
          let referredById: string | undefined = undefined;
          if (startParam) {
            const inviter = await db.getUserByReferralCode(startParam);
            if (inviter) {
              referredById = inviter.id;
              await db.updateUserPoints(inviter.id, inviter.points + 50);
            }
          }

          // Сохраняем в профили с бонусом 1300 баллов (welcomeBonusClaimed: false - чтобы App.tsx начислил их при первом входе)
          await db.saveUser({
            id: signUpData.user.id,
            username: tgUser.username || `user_${tgUser.id}`,
            firstName: tgUser.first_name,
            photoUrl: tgUser.photo_url,
            rating: 5.0,
            points: 0, // App.tsx начислит 1300 при старте если welcomeBonusClaimed = false
            isPro: false,
            isAdmin: false,
            isVerified: false,
            welcomeBonusClaimed: false, 
            isReliable: true,
            referralCode: `M${tgUser.id}`,
            referredById: referredById,
            dealsCount: 0,
            isDonor: false,
            level: 'Мужик',
            specialization: []
          });

          // Снова логинимся для получения сессии
          await supabase.auth.signInWithPassword({ 
            email: creds.email, 
            password: creds.password 
          });
        }
      }

      setTgAuthStatus('ДОСТУП РАЗРЕШЕН!');
      setTimeout(() => onSuccess(), 300);
    } catch (err: any) {
      console.error("TG_AUTH_ERR:", err);
      setTgAuthStatus(`ОШИБКА АВТОРИЗАЦИИ`);
      setLoading(false);
      setTimeout(() => setTgAuthStatus(null), 3000);
    }
  }, [onSuccess]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      setTgAvailable(true);
      // Авто-вход через полсекунды, если мы в телеге
      const timer = setTimeout(() => {
        handleTelegramAuth(tg.initDataUnsafe.user, tg.initDataUnsafe.start_param);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [handleTelegramAuth]);

  const triggerManualTgAuth = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      handleTelegramAuth(tg.initDataUnsafe.user, tg.initDataUnsafe.start_param);
    } else {
      alert("Зайди через официального бота @chmuzhikbot для входа по Telegram!");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { first_name: firstName, username: email.split('@')[0] } }
        });
        if (error) throw error;
        if (data.session) onSuccess();
        else {
          alert('Проверь почту для подтверждения');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 screen-fade bg-[#050505] items-center justify-center overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md bg-[#0f0f0f] p-8 rounded-[45px] border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Анимационный фон */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37] opacity-5 blur-[70px] rounded-full"></div>
        
        <div className="text-center mb-10">
          <div className="inline-block border border-[#D4AF37]/20 text-[#D4AF37] text-[8px] font-black px-4 py-1.5 rounded-full uppercase mb-4 tracking-[0.4em] mono">
            SECURITY_GATE_v4.6
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mt-1 leading-none pr-2">
            {tgAuthStatus || (isLogin ? 'ВХОД В ЦЕХ' : 'РЕГИСТРАЦИЯ')}
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] animate-pulse">
              {tgAuthStatus || 'ПОДКЛЮЧЕНИЕ К СИСТЕМЕ...'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* КНОПКА TELEGRAM — ГЛАВНАЯ */}
            <button 
              onClick={triggerManualTgAuth}
              className={`w-full group relative overflow-hidden bg-[#229ED9] text-white font-black py-5 rounded-[22px] uppercase italic tracking-tighter active:scale-95 transition-all shadow-xl flex items-center justify-center gap-4 ${tgAvailable ? 'animate-pulse' : 'opacity-80'}`}
            >
               <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.48.99-.74 3.86-1.68 6.44-2.78 7.72-3.31 3.66-1.51 4.42-1.77 4.92-1.78.11 0 .35.03.5.15.13.1.17.23.18.33 0 .04.01.14 0 .2z"/></svg>
               ВОЙТИ ЧЕРЕЗ TELEGRAM
            </button>

            <div className="flex items-center gap-4 px-2">
               <div className="h-px bg-white/5 flex-1"></div>
               <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">ИЛИ ПО ПОЧТЕ</span>
               <div className="h-px bg-white/5 flex-1"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5 text-left">
                   <label className="text-[8px] text-zinc-700 font-black uppercase tracking-widest ml-1 italic mono">IDENTITY_NAME</label>
                   <input type="text" placeholder="ТВОЕ ИМЯ" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#D4AF37]/30 text-xs font-bold" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
              )}
              
              <div className="space-y-1.5 text-left">
                 <label className="text-[8px] text-zinc-700 font-black uppercase tracking-widest ml-1 italic mono">SYSTEM_EMAIL</label>
                 <input type="email" placeholder="EMAIL" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#D4AF37]/30 text-xs font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-1.5 text-left">
                 <label className="text-[8px] text-zinc-700 font-black uppercase tracking-widest ml-1 italic mono">ACCESS_KEY</label>
                 <input type="password" placeholder="ПАРОЛЬ" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#D4AF37]/30 text-xs font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>

              <button type="submit" className="w-full bg-[#D4AF37] text-black font-black py-5 rounded-[22px] uppercase italic tracking-tighter active:scale-95 transition-all shadow-xl shadow-[#D4AF37]/10 mt-4">
                {isLogin ? 'ПОДКЛЮЧИТЬСЯ К ЦЕХУ' : 'СОЗДАТЬ АККАУНТ'}
              </button>

              <button onClick={onGuest} type="button" className="w-full text-zinc-600 font-black py-4 uppercase italic text-[9px] tracking-[0.3em] active:text-[#D4AF37] transition-colors">
                ПРОДОЛЖИТЬ КАК ГОСТЬ
              </button>

              <button onClick={() => setIsLogin(!isLogin)} type="button" className="w-full mt-4 text-zinc-800 text-[8px] font-black uppercase tracking-widest hover:text-zinc-500 transition-colors">
                {isLogin ? 'НЕТ ПРОФИЛЯ? ЗАРЕГИСТРИРУЙСЯ' : 'УЖЕ ЕСТЬ АККАУНТ? ВОЙДИ'}
              </button>
            </form>
          </div>
        )}
      </div>
      
      <p className="mt-8 text-[8px] text-zinc-800 font-black uppercase tracking-[0.5em] mono italic animate-pulse">
        ENCRYPTED_AUTH_PROTOCOL // MUZHIK_CORE
      </p>
    </div>
  );
};

export default Auth;
