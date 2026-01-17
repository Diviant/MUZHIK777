
import React, { useState, useEffect } from 'react';
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
        setTgAuthStatus('РЕГИСТРАЦИЯ...');
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

          await db.saveUser({
            id: signUpData.user.id,
            username: tgUser.username || `user_${tgUser.id}`,
            firstName: tgUser.first_name,
            photoUrl: tgUser.photo_url,
            rating: 5.0,
            points: 100,
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
          });

          await supabase.auth.signInWithPassword({ 
            email: creds.email, 
            password: creds.password 
          });
        }
      }

      setTgAuthStatus('ГОТОВО!');
      setTimeout(() => onSuccess(), 300);
    } catch (err: any) {
      setTgAuthStatus(`ОШИБКА`);
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
    <div className="flex-1 flex flex-col p-6 screen-fade bg-[#080808] items-center justify-center">
      <div className="w-full max-w-md bg-[#111]/50 p-10 rounded-[45px] diamond-edge shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37] opacity-5 blur-[70px] rounded-full"></div>
        
        <div className="text-center mb-10">
          <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em]">ЦЕХ • ДОСТУП</span>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mt-3 leading-none">
            {tgAuthStatus || (isLogin ? 'ВХОД' : 'РЕГИСТРАЦИЯ')}
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-12 h-12 border-[0.5px] border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest animate-pulse">
              {tgAuthStatus || 'Загрузка данных...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <input type="text" placeholder="ИМЯ" className="w-full bg-black border-[0.5px] border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#D4AF37]/30 text-xs font-bold" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            )}
            <input type="email" placeholder="EMAIL" className="w-full bg-black border-[0.5px] border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#D4AF37]/30 text-xs font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="ПАРОЛЬ" className="w-full bg-black border-[0.5px] border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#D4AF37]/30 text-xs font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="w-full bg-gradient-to-r from-[#D4AF37] to-[#9A7D0A] text-black font-black py-5 rounded-2xl uppercase italic tracking-tighter active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/10 mt-6">
              {isLogin ? 'ВОЙТИ В ЦЕХ' : 'ГОТОВО'}
            </button>
            <button onClick={onGuest} type="button" className="w-full bg-white/5 text-zinc-500 font-black py-4 rounded-2xl uppercase italic text-[10px] tracking-widest border-[0.5px] border-white/5 mt-2">
              ПРОДОЛЖИТЬ КАК ГОСТЬ
            </button>
            <button onClick={() => setIsLogin(!isLogin)} type="button" className="w-full mt-8 text-zinc-700 text-[9px] font-black uppercase tracking-widest hover:text-[#D4AF37] transition-colors">
              {isLogin ? 'СОЗДАТЬ НОВЫЙ АККАУНТ' : 'УЖЕ ЕСТЬ ПРОФИЛЬ'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
