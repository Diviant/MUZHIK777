
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

  const handleHardReset = () => {
    if (confirm('☢️ ВНИМАНИЕ: Это удалит все ключи из памяти браузера, вылогинит тебя и очистит кэш. Помогает, если зависли старые данные. Продолжаем?')) {
      clearManualConfig();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 screen-fade overflow-y-auto no-scrollbar bg-[#080808]">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button onClick={() => navigate(Screen.PROFILE)} className="w-10 h-10 bg-[#121212] card-border rounded-xl flex items-center justify-center text-[#F5C518]">
          ←
        </button>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">ИНЖЕНЕРНЫЙ ПУЛЬТ</h2>
          <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">
            STATUS: {config.urlOk && config.keyOk ? 'CONFIGURED' : 'BROKEN'}
          </span>
        </div>
      </header>

      <div className="flex gap-2 p-1 bg-[#121212] rounded-2xl mb-6 border border-white/5">
        <button 
          onClick={() => setActiveTab('SYSTEM')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeTab === 'SYSTEM' ? 'bg-[#F5C518] text-black shadow-lg shadow-[#F5C518]/20' : 'text-zinc-600'}`}
        >
          Диагностика БД
        </button>
        <button 
          onClick={() => setActiveTab('GIT')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeTab === 'GIT' ? 'bg-[#F5C518] text-black shadow-lg shadow-[#F5C518]/20' : 'text-zinc-600'}`}
        >
          Справка Git
        </button>
      </div>

      <div className="space-y-6 pb-24">
        {activeTab === 'SYSTEM' ? (
          <>
            <section className="bg-[#121212] p-5 rounded-3xl border border-white/5 shadow-2xl">
              <h3 className="text-[10px] text-[#F5C518] font-black uppercase tracking-widest italic mb-4">Авто-детект ключей:</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl">
                  <span className="text-[9px] text-zinc-500 font-black uppercase">URL</span>
                  <span className={`text-[10px] font-mono ${config.urlOk ? 'text-green-500' : 'text-red-500'}`}>
                    {config.urlOk ? 'OK (SUPABASE.CO)' : 'НЕ НАЙДЕН'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl">
                  <span className="text-[9px] text-zinc-500 font-black uppercase">ANON_KEY</span>
                  <span className={`text-[10px] font-mono ${config.keyOk ? 'text-green-500' : 'text-red-500'}`}>
                    {config.keyOk ? 'OK (VALID LENGTH)' : 'ОШИБКА ДЛИНЫ'}
                  </span>
                </div>
              </div>
            </section>

            <section className={`p-5 rounded-3xl border ${testResult?.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} shadow-2xl relative`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Тест соединения:</h3>
                {loading && <div className="w-4 h-4 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin"></div>}
              </div>
              <p className={`text-xs font-black italic uppercase ${testResult?.success ? 'text-green-500' : 'text-red-500'}`}>
                {testResult?.success ? 'СОЕДИНЕНИЕ УСТАНОВЛЕНО' : 'ОШИБКА СЕТИ / Failed to fetch'}
              </p>
              {!testResult?.success && (
                <p className="text-[9px] text-zinc-600 mt-2 leading-relaxed bg-black/40 p-2 rounded-lg">
                  {testResult?.message || 'База не отвечает. Проверь URL в настройках Vercel.'}
                </p>
              )}
            </section>

            <section className="bg-[#121212] p-6 rounded-3xl border border-white/5">
              <h3 className="text-[10px] text-[#F5C518] font-black uppercase tracking-widest mb-4 italic">Ручная настройка (Override):</h3>
              <div className="space-y-4">
                <input 
                  value={manualUrl} 
                  onChange={e => setManualUrl(e.target.value)}
                  placeholder="https://xxx.supabase.co" 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-[11px] text-white font-mono outline-none"
                />
                <input 
                  value={manualKey} 
                  onChange={e => setManualKey(e.target.value)}
                  placeholder="ANON_KEY (длинная строка)" 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-[11px] text-white font-mono outline-none"
                />
                <button 
                  onClick={() => saveManualConfig(manualUrl, manualKey)}
                  className="w-full bg-[#F5C518] text-black font-black py-4 rounded-xl uppercase italic shadow-lg active:scale-95"
                >
                  ПРИМЕНИТЬ И ПЕРЕЗАГРУЗИТЬ
                </button>
              </div>
            </section>

            <button 
              onClick={handleHardReset}
              className="w-full bg-red-900/10 border border-red-500/20 text-red-500 font-black py-4 rounded-xl uppercase italic text-[10px] tracking-widest"
            >
              СБРОСИТЬ КЭШ И СЕССИИ
            </button>
          </>
        ) : (
          <div className="bg-[#121212] p-6 rounded-3xl border border-white/5 space-y-4">
             <h3 className="text-[10px] text-[#F5C518] font-black uppercase tracking-widest italic">Полезные команды:</h3>
             <div className="p-4 bg-black rounded-xl border border-white/5">
                <p className="text-[8px] text-zinc-600 uppercase font-black mb-2">Переключить Remote (если Git видит старый проект):</p>
                <code className="text-[10px] text-blue-400 font-mono break-all">git remote set-url origin https://github.com/Diviant/MUZHIK777.git</code>
             </div>
          </div>
        )}

        <button 
          onClick={() => navigate(Screen.HOME)}
          className="w-full bg-white/5 text-zinc-500 font-black py-4 rounded-xl uppercase italic text-[10px]"
        >
          ВЕРНУТЬСЯ В ЦЕХ
        </button>
      </div>
    </div>
  );
};

export default Diagnostic;
