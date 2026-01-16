
import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { db } from '../database';
import { getDebugConfig, saveManualConfig, clearManualConfig } from '../lib/supabase';

interface Props {
  navigate: (screen: Screen) => void;
  onRefresh: () => void;
}

const Diagnostic: React.FC<Props> = ({ navigate, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'DB' | 'GIT'>('DB');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  
  const config = getDebugConfig();

  const runTest = async () => {
    setLoading(true);
    try {
      const result = await db.testConnection();
      setTestResult(result);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Fatal Connection Error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    runTest();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.showAlert) {
      tg.showAlert('КОМАНДА СКОПИРОВАНА.\nВставь её в терминал своего компьютера.');
    } else {
      alert('Скопировано!');
    }
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.startsWith('https://') && manualKey.length > 20) {
      saveManualConfig(manualUrl, manualKey);
    } else {
      alert('Данные не валидны.');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 screen-fade overflow-y-auto no-scrollbar bg-[#080808]">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-[#121212] card-border rounded-xl flex items-center justify-center text-[#F5C518]">
          ←
        </button>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">ИНЖЕНЕРНЫЙ ПУЛЬТ</h2>
          <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">Отладка системы и окружения</span>
        </div>
      </header>

      {/* ТАБЫ */}
      <div className="flex gap-2 p-1 bg-[#121212] rounded-2xl mb-6 border border-white/5 shadow-inner">
        <button 
          onClick={() => setActiveTab('DB')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeTab === 'DB' ? 'bg-[#F5C518] text-black' : 'text-zinc-600'}`}
        >
          База Данных
        </button>
        <button 
          onClick={() => setActiveTab('GIT')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeTab === 'GIT' ? 'bg-[#F5C518] text-black' : 'text-zinc-600'}`}
        >
          Ремонт Гита
        </button>
      </div>

      <div className="space-y-6 pb-20">
        {activeTab === 'DB' ? (
          <>
            {/* СТАТУС СОЕДИНЕНИЯ */}
            <section className={`p-5 rounded-3xl border ${testResult?.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} shadow-2xl`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Связь с Supabase</h3>
                <div className={`w-2 h-2 rounded-full ${testResult?.success ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-red-500 shadow-[0_0_10px_red] animate-pulse'}`}></div>
              </div>
              <p className={`text-xs font-black italic uppercase ${testResult?.success ? 'text-green-500' : 'text-red-500'}`}>
                {testResult?.success ? 'УЗЕЛ АКТИВЕН' : 'ОШИБКА ДОСТУПА'}
              </p>
              <p className="text-[9px] text-zinc-600 mt-2 font-mono break-all bg-black/40 p-2 rounded-lg">
                {testResult?.message || 'Сканирование...'}
              </p>
            </section>

            <section className="bg-[#121212] card-border p-6 rounded-3xl border border-white/5 shadow-2xl">
              <h3 className="text-[10px] text-[#F5C518] font-black uppercase tracking-[0.2em] mb-4 italic">Ручная прошивка ключей</h3>
              <form onSubmit={handleSaveManual} className="space-y-4">
                <input 
                  value={manualUrl} 
                  onChange={e => setManualUrl(e.target.value)}
                  placeholder="НОВЫЙ SUPABASE URL" 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-[11px] text-white font-mono outline-none"
                />
                <textarea 
                  value={manualKey} 
                  onChange={e => setManualKey(e.target.value)}
                  placeholder="НОВЫЙ ANON KEY" 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-[10px] text-white font-mono outline-none min-h-[80px]"
                />
                <button type="submit" className="w-full bg-[#F5C518] text-black font-black py-4 rounded-xl uppercase italic shadow-lg">
                  ОБНОВИТЬ КОНФИГ
                </button>
              </form>
            </section>
          </>
        ) : (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-blue-500/10 border border-blue-500/30 p-5 rounded-3xl">
              <h3 className="text-[#60A5FA] text-[10px] font-black uppercase tracking-widest mb-2">ИНСТРУКЦИЯ: СБРОС СТАРОГО АККАУНТА</h3>
              <p className="text-zinc-400 text-[9px] font-bold uppercase leading-relaxed italic">
                Твой Git запомнил старый логин. Выполни эти действия на своем компьютере, чтобы привязать новый аккаунт.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: '1. Сбросить имя (Global)', cmd: 'git config --global --unset-all user.name' },
                { label: '2. Сбросить Email (Global)', cmd: 'git config --global --unset-all user.email' },
                { label: '3. Удалить кэш паролей (Windows)', cmd: 'git credential-manager delete --host=github.com' },
                { label: '4. Перепривязать Repo URL', cmd: 'git remote set-url origin https://github.com/ТВОЙ_ЛОГИН/ТВОЙ_РЕПО.git' },
              ].map((item, i) => (
                <div key={i} className="bg-[#121212] p-4 rounded-2xl border border-white/5 flex flex-col gap-2 shadow-lg">
                  <span className="text-[8px] text-zinc-600 font-black uppercase">{item.label}</span>
                  <div className="flex items-center justify-between bg-black p-3 rounded-xl border border-white/5">
                    <code className="text-[10px] text-[#F5C518] font-mono truncate mr-4">{item.cmd}</code>
                    <button 
                      onClick={() => copyToClipboard(item.cmd)}
                      className="text-white bg-white/5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase hover:bg-white/10 transition-colors"
                    >
                      COPY
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900 p-5 rounded-3xl border border-white/5">
              <h3 className="text-white text-[9px] font-black uppercase tracking-widest mb-3 italic">ЕСЛИ НЕ ПОМОГЛО (СОВЕТ):</h3>
              <p className="text-zinc-500 text-[8px] font-bold uppercase leading-relaxed">
                На Windows: Зайди в "Диспетчер учетных данных" (Credential Manager) -> "Учетные записи Windows" -> Найди github.com и удали его вручную.
              </p>
              <p className="text-zinc-500 text-[8px] font-bold uppercase leading-relaxed mt-2">
                На Mac: Открой Keychain Access, найди github.com и удали.
              </p>
            </div>
          </div>
        )}

        <button 
          onClick={() => {
            if(confirm('ВНИМАНИЕ: Это полностью очистит все локальные данные приложения. Делаем?')) {
              clearManualConfig();
            }
          }}
          className="w-full bg-red-900/20 border border-red-500/30 text-red-500 font-black py-4 rounded-xl uppercase italic text-[10px] tracking-widest"
        >
          ☢️ ЯДЕРНЫЙ СБРОС (LOCALSTORAGE)
        </button>

        <button 
          onClick={() => navigate(Screen.HOME)}
          className="w-full bg-white/5 text-zinc-500 font-black py-4 rounded-xl uppercase italic text-[10px] tracking-widest"
        >
          ВЕРНУТЬСЯ К РАБОТЕ
        </button>
      </div>
    </div>
  );
};

export default Diagnostic;
