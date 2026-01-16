
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      if (data.user) {
        // Проверяем роль в базе через наш MuzhikDatabase
        const profile = await db.getUser(data.user.id);
        if (profile?.isAdmin) {
          navigate(Screen.ADMIN_VACANCIES);
        } else {
          await supabase.auth.signOut();
          alert('ДОСТУП ЗАПРЕЩЕН: У тебя нет прав администратора в Цехе.');
        }
      }
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // В деривативе просто идем в админку для демонстрации UI
    navigate(Screen.ADMIN_VACANCIES);
  };

  return (
    <div className="flex-1 bg-[#0E0E0E] flex flex-col items-center justify-center p-6 screen-fade">
      <button 
        onClick={() => navigate(Screen.PROFILE)}
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
          <div className="bg-red-900/10 border border-red-500/20 p-3 rounded-xl mb-4">
            <p className="text-[9px] text-zinc-400 font-bold uppercase italic leading-tight text-center">
              Только для администраторов с правами `is_admin = true` в профиле.
            </p>
          </div>
          
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#F5C518] text-sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required={!loading}
          />
          <input 
            type="password" 
            placeholder="Пароль" 
            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#F5C518] text-sm"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required={!loading}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#F5C518] text-black font-black py-4 rounded-xl uppercase italic tracking-tighter active:scale-95 transition-transform shadow-lg shadow-[#F5C518]/10"
          >
            {loading ? 'ПРОВЕРКА РОЛИ...' : 'ВОЙТИ В АДМИНКУ'}
          </button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-zinc-700 bg-[#161616] px-4">ИЛИ ТЕСТ</div>
          </div>

          <button 
            type="button"
            onClick={handleDemoLogin}
            className="w-full bg-zinc-800 text-zinc-400 font-black py-3 rounded-xl uppercase italic tracking-widest text-[10px] active:scale-95 transition-transform"
          >
            ДЕМО-ПРОСМОТР (БЕЗ ПРАВ)
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
