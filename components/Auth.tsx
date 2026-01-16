
import React, { useState, useEffect } from 'react';
import { supabase, getTgCredentials } from '../lib/supabase';
import { Screen } from '../types';
import { db } from '../database';

interface Props {
  onSuccess: () => void;
  navigate: (screen: Screen) => void;
}

const Auth: React.FC<Props> = ({ onSuccess, navigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [tgAuthStatus, setTgAuthStatus] = useState<string | null>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const timer = setTimeout(() => {
      if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        handleTelegramAuth(tg.initDataUnsafe.user, tg.initDataUnsafe.start_param);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleTelegramAuth = async (tgUser: any, startParam?: string) => {
    setLoading(true);
    setTgAuthStatus('СИНХРОНИЗАЦИЯ...');
    
    const creds = getTgCredentials(tgUser.id);
    
    try {
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
        email: creds.email, 
        password: creds.password 
      });
      
      if (signInError) {
        setTgAuthStatus('РЕГИСТРАЦИЯ В ЦЕХЕ...');
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
        
        setTgAuthStatus('СОЗДАНИЕ ПРОФИЛЯ...');
        if (signUpData.user) {
          // Проверяем пригласителя по start_param
          let referredById: string | undefined = undefined;
          if (startParam) {
            const inviter = await db.getUserByReferralCode(startParam);
            if (inviter) {
              referredById = inviter.id;
              // Начисляем бонус пригласителю
              await db.updateUserPoints(inviter.id, inviter.points + 50);
            }
          }

          await db.saveUser({
            id: signUpData.user.id,
            username: tgUser.username || `user_${tgUser.id}`,
            firstName: tgUser.first_name,
            photoUrl: tgUser.photo_url,
            rating: 5.0,
            points: 100, // Начальный капитал
            isPro: false,
            isAdmin: false,
            isVerified: false,
            isReliable: true,
            referralCode: `M${tgUser.id}`,
            referredById: referredById,
            dealsCount: 0,
            isDonor: false,
            level: 'Мужик',
            specialization: []
          }, tgUser.id);

          setTgAuthStatus('АВТОРИЗАЦИЯ...');
          await supabase.auth.signInWithPassword({ 
            email: creds.email, 
            password: creds.password 
          });
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Сессия не установлена.");

      setTgAuthStatus('ГОТОВО!');
      setTimeout(() => onSuccess(), 300);
    } catch (err: any) {
      console.error('Telegram Auth Error:', err);
      setTgAuthStatus(`ОШИБКА: ${err.message || 'СБОЙ'}`);
      setLoading(false);
      setTimeout(() => setTgAuthStatus(null), 3000);
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
          alert('Проверь почту');
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
    <div className="flex-1 flex flex-col p-6 screen-fade bg-[#0E0E0E] items-center justify-center">
      <div className="w-full max-w-md bg-[#161616] p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F5C518] opacity-5 blur-[60px] rounded-full"></div>
        
        <div className="text-center mb-8">
          <span className="text-[#F5C518] text-[10px] font-black uppercase tracking-[0.3em]">ЦЕХ • АВТОРИЗАЦИЯ</span>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mt-2 leading-none">
            {tgAuthStatus || (isLogin ? 'ВХОД В СИСТЕМУ' : 'РЕГИСТРАЦИЯ')}
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-12 h-12 border-4 border-[#F5C518] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest animate-pulse">
              {tgAuthStatus || 'Инициализация...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <input type="text" placeholder="Как тебя звать?" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#F5C518] text-sm" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            )}
            <input type="email" placeholder="Email" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#F5C518] text-sm" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Пароль" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#F5C518] text-sm" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="w-full bg-[#F5C518] text-black font-black py-4 rounded-xl uppercase italic tracking-tighter active:scale-95 transition-transform shadow-lg shadow-[#F5C518]/20 mt-4">
              {isLogin ? 'ВОЙТИ В ЦЕХ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
            </button>
            <button onClick={() => setIsLogin(!isLogin)} type="button" className="w-full mt-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-[#F5C518] transition-colors">
              {isLogin ? 'НЕТ АККАУНТА? ЗАПИШИСЬ В ЦЕХ' : 'УЖЕ СВОЙ? ВОЙДИ'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
