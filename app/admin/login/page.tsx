
'use client';
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      router.push('/admin/vacancies');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-[#161616] p-8 rounded-[32px] border border-white/5 shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-[#F5C518] text-[10px] font-black uppercase tracking-[0.3em]">ADMIN ACCESS</span>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mt-2">ВХОД В ЦЕХ</h1>
        </div>
        
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#F5C518]"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Пароль" 
            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#F5C518]"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#F5C518] text-black font-black py-4 rounded-xl uppercase italic tracking-tighter active:scale-95 transition-transform"
          >
            {loading ? 'ЗАГРУЗКА...' : 'ВОЙТИ'}
          </button>
        </div>
      </form>
    </div>
  );
}
