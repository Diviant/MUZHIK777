
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { db } from '../database';
import { Screen, User } from '../types';

interface Props {
  navigate: (screen: Screen) => void;
}

const AdminLogin: React.FC<Props> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const user = await db.getCurrentSessionUser();
      if (user) setCurrentUser(user);
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorDetails(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        const profile = await db.getUser(data.user.id);
        if (profile?.isAdmin) {
          navigate(Screen.ADMIN_VACANCIES);
        } else {
          setErrorDetails(`ДОСТУП ЗАПРЕЩЕН: Твой профиль не имеет флага админа.`);
        }
      }
    } catch (err: any) {
      setErrorDetails('ОШИБКА: ' + (err.message === 'Load failed' ? 'СЕТЕВОЙ СБОЙ / БЛОКИРОВКА' : err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSudoPromote = async () => {
    const code = prompt('ВВЕДИ МАСТЕР-КОД ДОСТУПА (ДЕФОЛТ: 1337)');
    if (code !== '1337') {
      alert('НЕВЕРНЫЙ КОД, МУЖИК');
      return;
    }

    setLoading(true);
    const res = await db.promoteToAdmin();
    if (res.success) {
      alert('ПРАВА ПОЛУЧЕНЫ! ПЕРЕЗАГРУЖАЮ...');
      window.location.reload();
    } else {
      setErrorDetails('SUDO_FAIL: ' + res.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 bg-[#050505] flex flex-col items-center justify-center p-6 screen-fade overflow-y-auto no-scrollbar relative h-full">
      <div className="absolute top-0 left-0 w-full h-full blueprint opacity-20 pointer-events-none"></div>
      
      <button 
        onClick={() => navigate(Screen.HOME)}
        className="absolute top-8 left-6 w-12 h-12 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press z-20 shadow-2xl"
      >
        ←
      </button>

      <div className="w-full max-w-md bg-[#0f0f0f] p-10 rounded-[45px] border border-white/5 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.5em] italic">ADMIN_ACCESS_PROTOCOL</span>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mt-3 leading-none pr-2">ВХОД В ЦЕХ</h1>
        </div>
        
        {currentUser ? (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
             <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#D4AF37] rounded-2xl flex items-center justify-center text-black shadow-lg">
                   {currentUser.photoUrl ? <img src={currentUser.photoUrl} className="w-full h-full object-cover rounded-2xl" /> : <span className="text-2xl">👷‍♂️</span>}
                </div>
                <div className="flex flex-col text-left">
                   <span className="text-xs font-black text-white uppercase italic">{currentUser.firstName}</span>
                   <span className={`text-[8px] font-black uppercase tracking-widest ${currentUser.isAdmin ? 'text-green-500' : 'text-red-500'}`}>
                     STATUS: {currentUser.isAdmin ? 'ADMINISTRATOR' : 'COMMON_USER'}
                   </span>
                </div>
             </div>

             {currentUser.isAdmin ? (
               <button 
                 onClick={() => navigate(Screen.ADMIN_VACANCIES)}
                 className="w-full bg-[#D4AF37] text-black font-black py-5 rounded-2xl uppercase italic tracking-tighter shadow-xl shadow-[#D4AF37]/10 active-press"
               >
                 ВОЙТИ В ПАНЕЛЬ УПРАВЛЕНИЯ
               </button>
             ) : (
               <button 
                 onClick={handleSudoPromote}
                 disabled={loading}
                 className="w-full bg-red-600 text-white font-black py-5 rounded-2xl uppercase italic tracking-tighter shadow-xl shadow-red-900/20 active-press"
               >
                 {loading ? 'АКТИВАЦИЯ...' : 'СТАТЬ АДМИНОМ (SUDO)'}
               </button>
             )}
             
             <button onClick={() => setCurrentUser(null)} className="w-full text-zinc-700 text-[9px] font-black uppercase tracking-widest mt-4 italic">
                ИСПОЛЬЗОВАТЬ ДРУГОЙ ЛОГИН
             </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {errorDetails && (
              <div className="bg-red-900/20 border border-red-500/30 p-5 rounded-3xl mb-4 animate-in zoom-in duration-200">
                 <p className="text-[10px] text-red-500 font-black uppercase italic mb-3 text-left leading-relaxed">{errorDetails}</p>
                 <p className="text-[8px] text-zinc-500 uppercase font-black mb-2 text-left tracking-widest opacity-60">SQL_BYPASS_SCRIPT:</p>
                 <code className="block bg-black p-4 rounded-xl text-[9px] text-green-500 font-mono break-all border border-white/5 text-left leading-relaxed">
                   UPDATE profiles SET is_admin = true WHERE email = '{email || 'katana3@gmail.com'}';
                 </code>
              </div>
            )}
            
            <div className="space-y-1.5 text-left">
               <label className="text-[8px] text-zinc-700 font-black uppercase tracking-widest ml-1 italic mono">SYSTEM_IDENTITY (EMAIL)</label>
               <input 
                type="email" 
                placeholder="EMAIL" 
                className="w-full bg-black border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-[#D4AF37]/30 text-sm font-bold shadow-inner"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5 text-left">
               <label className="text-[8px] text-zinc-700 font-black uppercase tracking-widest ml-1 italic mono">ACCESS_KEY (PASSWORD)</label>
               <input 
                type="password" 
                placeholder="ПАРОЛЬ" 
                className="w-full bg-black border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-[#D4AF37]/30 text-sm font-bold shadow-inner"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black font-black py-5 rounded-[22px] uppercase italic tracking-tighter active:scale-95 transition-all shadow-xl shadow-[#D4AF37]/10 mt-6"
            >
              {loading ? 'AUTH_IN_PROGRESS...' : 'АВТОРИЗАЦИЯ'}
            </button>
            
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button 
                type="button"
                onClick={() => navigate(Screen.DIAGNOSTIC)}
                className="bg-zinc-900 border border-white/5 text-zinc-500 font-black py-4 rounded-2xl uppercase italic text-[9px] active-press"
              >
                ПУЛЬТ
              </button>
              <button 
                type="button"
                onClick={() => navigate(Screen.HOME)}
                className="bg-zinc-800 text-zinc-400 font-black py-4 rounded-2xl uppercase italic text-[9px] active-press"
              >
                ДЕМО-ВХОД
              </button>
            </div>
          </form>
        )}
      </div>
      
      <p className="mt-10 text-[8px] text-zinc-800 font-black uppercase tracking-[0.5em] mono italic animate-pulse">
        SECURE_ENCRYPTION_ENABLED // NODE_MUZHIK_ID
      </p>
    </div>
  );
};

export default AdminLogin;
