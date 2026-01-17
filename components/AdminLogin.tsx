
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from '../database';
import { Screen } from '../types';

interface Props {
  navigate: (screen: Screen) => void;
}

const AdminLogin: React.FC<Props> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorDetails(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      if (data.user) {
        const profile = await db.getUser(data.user.id);
        
        if (!profile) {
           setErrorDetails('ПРОФИЛЬ НЕ НАЙДЕН: Сначала зайди как обычный юзер, чтобы запись создалась.');
           setLoading(false);
           return;
        }

        if (profile.isAdmin) {
          navigate(Screen.ADMIN_VACANCIES);
        } else {
          await supabase.auth.signOut();
          setErrorDetails(`ДОСТУП ЗАПРЕЩЕН: Твой ID (${data.user.id}) не имеет прав администратора.`);
        }
      }
    } catch (err: any) {
      setErrorDetails('Ошибка: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    navigate(Screen.ADMIN_VACANCIES);
  };

  return (
    <div className="flex-1 bg-[#0E0E0E] flex flex-col items-center justify-center p-6 screen-fade overflow-y-auto no-scrollbar">
      <button 
        onClick={() => navigate(Screen.HOME)}
        className="absolute top-6 left-6 w-10 h-10 bg-[#161616] rounded-xl flex items-center justify-center text-zinc-500 active-scale"
      >
        ←
      </button>

      <form onSubmit={handleLogin} className="w-full max-w-md bg-[#161616] p-8 rounded-[32px] border border-white/5 shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-[#F5C518] text-[10px] font-black uppercase tracking-[0.3em]">ADMIN ACCESS</span>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mt-2">ВХОД В ЦЕХ</h1>
        </div>
        
        <div className="space-y-4">
          {!errorDetails && (
            <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl mb-4">
              <p className="text-[9px] text-blue-400 font-bold uppercase italic leading-tight text-center">
                ИСПОЛЬЗУЙ СВОЙ EMAIL И ПАРОЛЬ ОТ АККАУНТА ЦЕХА.
              </p>
            </div>
          )}

          {errorDetails && (
            <div className="bg-red-900/20 border border-red-500/30 p-5 rounded-2xl mb-4 animate-in zoom-in duration-200">
               <p className="text-[10px] text-red-500 font-black uppercase italic mb-3">{errorDetails}</p>
               <p className="text-[8px] text-zinc-500 uppercase font-bold mb-2">Как исправить через SQL Editor:</p>
               <code className="block bg-black p-3 rounded-lg text-[9px] text-green-500 font-mono break-all border border-white/5">
                 UPDATE profiles SET is_admin = true WHERE email = '{email || 'твой@email.com'}';
               </code>
            </div>
          )}
          
          <input 
            type="email" 
            placeholder="EMAIL" 
            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#F5C518] text-sm font-bold"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required={!loading}
          />
          <input 
            type="password" 
            placeholder="ПАРОЛЬ" 
            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#F5C518] text-sm font-bold"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required={!loading}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#F5C518] text-black font-black py-4 rounded-xl uppercase italic tracking-tighter active:scale-95 transition-transform shadow-lg shadow-[#F5C518]/10"
          >
            {loading ? 'ПРОВЕРКА ДОСТУПА...' : 'ВОЙТИ В СИСТЕМУ'}
          </button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-zinc-700 bg-[#161616] px-4">ОТЛАДКА</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button"
              onClick={() => navigate(Screen.DIAGNOSTIC)}
              className="bg-zinc-900 text-zinc-500 font-black py-3 rounded-xl uppercase italic text-[9px] active-scale"
            >
              ПУЛЬТ
            </button>
            <button 
              type="button"
              onClick={handleDemoLogin}
              className="bg-zinc-800 text-zinc-400 font-black py-3 rounded-xl uppercase italic text-[9px] active-scale"
            >
              ДЕМО-ВХОД
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
