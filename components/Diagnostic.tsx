
import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { db } from '../database';
import { getDebugConfig, saveManualConfig, clearManualConfig } from '../lib/supabase';

interface Props {
  navigate: (screen: Screen) => void;
  onRefresh: () => void;
}

const Diagnostic: React.FC<Props> = ({ navigate, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'GIT'>('SYSTEM');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  
  const config = getDebugConfig();

  const runTest = async () => {
    setLoading(true);
    const result = await db.testConnection();
    setTestResult(result);
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'SYSTEM') runTest();
  }, [activeTab]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('СКОПИРОВАНО. Вставь в терминал.');
  };

  return (
    <div className="flex-1 flex flex-col p-6 screen-fade overflow-y-auto no-scrollbar bg-[#080808]">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-[#121212] card-border rounded-xl flex items-center justify-center text-[#F5C518]">
          ←
        </button>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">ИНЖЕНЕРНЫЙ ПУЛЬТ</h2>
          <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">v2.8.0 / {config.isManual ? 'MANUAL' : 'ENV'} MODE</span>
        </div>
      </header>

      {/* ТАБЫ */}
      <div className="flex gap-2 p-1 bg-[#121212] rounded-2xl mb-6 border border-white/5">
        <button 
          onClick={() => setActiveTab('SYSTEM')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeTab === 'SYSTEM' ? 'bg-[#F5C518] text-black shadow-lg shadow-[#F5C518]/20' : 'text-zinc-600'}`}
        >
          Система / БД
        </button>
        <button 
          onClick={() => setActiveTab('GIT')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeTab === 'GIT' ? 'bg-[#F5C518] text-black shadow-lg shadow-[#F5C518]/20' : 'text-zinc-600'}`}
        >
          Git Ремонт
        </button>
      </div>

      <div className="space-y-6 pb-24">
        {activeTab === 'SYSTEM' ? (
          <>
            {/* МОНИТОРИНГ ENV */}
            <section className="bg-[#121212] p-5 rounded-3xl border border-white/5 shadow-2xl">
              <h3 className="text-[10px] text-[#F5C518] font-black uppercase tracking-widest mb-4 italic">Environment Scan:</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-zinc-500 font-black uppercase">SUPABASE URL</span>
                  <span className={`text-[10px] font-mono ${config.urlOk ? 'text-green-500' : 'text-red-500'}`}>{config.urlOk ? 'DETECTED' : 'NOT FOUND'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-zinc-500 font-black uppercase">ANON KEY</span>
                  <span className={`text-[10px] font-mono ${config.keyOk ? 'text-green-500' : 'text-red-500'}`}>{config.keyOk ? 'OK' : 'INVALID'}</span>
                </div>
              </div>
            </section>

            {/* СТАТУС СОЕДИНЕНИЯ */}
            <section className={`p-5 rounded-3xl border ${testResult?.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} shadow-2xl relative overflow-hidden`}>
              {loading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10 font-black italic text-xs uppercase text-[#F5C518]">Ping...</div>}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Connection:</h3>
                <div className={`w-2 h-2 rounded-full ${testResult?.success ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-red-500 shadow-[0_0_10px_red] animate-pulse'}`}></div>
              </div>
              <p className={`text-xs font-black italic uppercase ${testResult?.success ? 'text-green-500' : 'text-red-500'}`}>
                {testResult?.success ? 'ОБЪЕКТ НА СВЯЗИ' : 'ОШИБКА АВТОРИЗАЦИИ'}
              </p>
              <p className="text-[9px] text-zinc-600 mt-2 font-mono break-all bg-black/40 p-2 rounded-lg">
                {testResult?.message || 'Ожидание сигнала...'}
              </p>
            </section>

            {/* РУЧНАЯ ПРОШИВКА */}
            <section className="bg-[#121212] card-border p-6 rounded-3xl border border-white/5 shadow-2xl">
              <h3 className="text-[10px] text-[#F5C518] font-black uppercase tracking-widest mb-4 italic">Force Key Override:</h3>
              <div className="space-y-4">
                <input 
                  value={manualUrl} 
                  onChange={e => setManualUrl(e.target.value)}
                  placeholder="https://xxx.supabase.co" 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-[11px] text-white font-mono outline-none"
                />
                <textarea 
                  value={manualKey} 
                  onChange={e => setManualKey(e.target.value)}
                  placeholder="ANON_KEY" 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-[10px] text-white font-mono outline-none min-h-[80px]"
                />
                <button 
                  onClick={() => saveManualConfig(manualUrl, manualKey)}
                  className="w-full bg-[#F5C518] text-black font-black py-4 rounded-xl uppercase italic shadow-lg active:scale-95 transition-transform"
                >
                  ОБНОВИТЬ УЗЕЛ
                </button>
              </div>
            </section>
          </>
        ) : (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-blue-500/10 border border-blue-500/30 p-5 rounded-3xl">
              <h3 className="text-[#60A5FA] text-[10px] font-black uppercase tracking-widest mb-2 italic">Git Account Recovery:</h3>
              <p className="text-zinc-400 text-[9px] font-bold uppercase italic leading-relaxed">
                Если Vercel или Git видят старый аккаунт, выполни эти команды в терминале на компьютере:
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: '1. Сбросить данные автора', cmd: 'git config --global --unset-all user.name && git config --global --unset-all user.email' },
                { label: '2. Ссылка на новый репозиторий', cmd: `git remote set-url origin https://github.com/Diviant/MUZHIK777.git` },
                { label: '3. Очистить пароли (Windows)', cmd: 'git credential-manager delete --host=github.com' },
              ].map((item, i) => (
                <div key={i} className="bg-[#121212] p-4 rounded-2xl border border-white/5 shadow-xl">
                  <span className="text-[8px] text-zinc-600 font-black uppercase block mb-2">{item.label}</span>
                  <div className="flex items-center justify-between bg-black p-3 rounded-xl border border-white/5">
                    <code className="text-[10px] text-[#F5C518] font-mono truncate mr-4">{item.cmd}</code>
                    <button onClick={() => copyToClipboard(item.cmd)} className="text-white/40 text-[9px] font-black uppercase">COPY</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={() => {
            if(confirm('☢️ ВНИМАНИЕ: Это сотрет все настройки, сессии и локальные данные. Уверен?')) {
              clearManualConfig();
            }
          }}
          className="w-full bg-red-900/10 border border-red-500/20 text-red-500 font-black py-4 rounded-xl uppercase italic text-[10px] tracking-[0.2em] shadow-xl"
        >
          ПОЛНАЯ ЗАЧИСТКА (HARD RESET)
        </button>

        <button 
          onClick={() => navigate(Screen.HOME)}
          className="w-full bg-white/5 text-zinc-500 font-black py-4 rounded-xl uppercase italic text-[10px] tracking-widest"
        >
          ВЕРНУТЬСЯ К ПАНЕЛИ
        </button>
      </div>
    </div>
  );
};

export default Diagnostic;
