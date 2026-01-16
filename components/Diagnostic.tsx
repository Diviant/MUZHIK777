
import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { db } from '../database';
import { getDebugConfig, saveManualConfig, clearManualConfig } from '../lib/supabase';

interface Props {
  navigate: (screen: Screen) => void;
  onRefresh: () => void;
}

const Diagnostic: React.FC<Props> = ({ navigate, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'DB' | 'GIT'>('GIT');
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
    if (activeTab === 'DB') runTest();
  }, [activeTab]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    alert('СКОПИРОВАНО!\nТеперь вставь это в терминал (CMD/Terminal) на компе.');
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.startsWith('https://') && manualKey.length > 20) {
      saveManualConfig(manualUrl, manualKey);
    } else {
      alert('Ошибка: Данные не похожи на ключи Supabase.');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 screen-fade overflow-y-auto no-scrollbar bg-[#080808]">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-[#121212] card-border rounded-xl flex items-center justify-center text-[#F5C518]">
          ←
        </button>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">РЕМОНТНЫЙ ЦЕХ</h2>
          <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">Отладка Git и Базы Данных</span>
        </div>
      </header>

      {/* ТАБЫ */}
      <div className="flex gap-2 p-1 bg-[#121212] rounded-2xl mb-6 border border-white/5 shadow-inner">
        <button 
          onClick={() => setActiveTab('GIT')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeTab === 'GIT' ? 'bg-[#F5C518] text-black shadow-lg shadow-[#F5C518]/20' : 'text-zinc-600'}`}
        >
          Ремонт Git
        </button>
        <button 
          onClick={() => setActiveTab('DB')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all ${activeTab === 'DB' ? 'bg-[#F5C518] text-black shadow-lg shadow-[#F5C518]/20' : 'text-zinc-600'}`}
        >
          База Данных
        </button>
      </div>

      <div className="space-y-6 pb-24">
        {activeTab === 'GIT' ? (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-3xl">
              <h3 className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-2 italic">⚠️ ВНИМАНИЕ: ПРОБЛЕМА С АККАУНТОМ</h3>
              <p className="text-zinc-400 text-[9px] font-bold uppercase leading-relaxed italic">
                Если Git выдает старый аккаунт — твоя система запомнила пароль. Обычный unset не поможет. Выполни шаги ниже:
              </p>
            </div>

            <div className="space-y-4">
              {/* ШАГ 1 */}
              <div className="bg-[#121212] p-5 rounded-2xl border border-white/5 shadow-xl">
                <span className="text-[8px] text-zinc-600 font-black uppercase block mb-3">ШАГ 1: Проверка текущего адреса</span>
                <div className="flex items-center justify-between bg-black p-3 rounded-xl border border-white/5 mb-2">
                  <code className="text-[10px] text-[#F5C518] font-mono">git remote -v</code>
                  <button onClick={() => copyToClipboard('git remote -v')} className="text-white/40 text-[9px] font-black uppercase">COPY</button>
                </div>
                <p className="text-[8px] text-zinc-500 uppercase">Если в ссылке видишь старое_имя@github.com — это и есть проблема.</p>
              </div>

              {/* ШАГ 2 */}
              <div className="bg-[#121212] p-5 rounded-2xl border border-white/5 shadow-xl">
                <span className="text-[8px] text-zinc-600 font-black uppercase block mb-3">ШАГ 2: Смена URL на чистый (без имени)</span>
                <div className="flex items-center justify-between bg-black p-3 rounded-xl border border-white/5 mb-2">
                  <code className="text-[10px] text-[#F5C518] font-mono">git remote set-url origin https://github.com/НОВЫЙ_ЛОГИН/РЕПО.git</code>
                  <button onClick={() => copyToClipboard('git remote set-url origin https://github.com/USER/REPO.git')} className="text-white/40 text-[9px] font-black uppercase">COPY</button>
                </div>
                <p className="text-[8px] text-zinc-500 uppercase">Замени USER/REPO на свои данные. Это принудительно обновит путь.</p>
              </div>

              {/* ШАГ 3 */}
              <div className="bg-[#121212] p-5 rounded-2xl border border-white/5 shadow-xl">
                <span className="text-[8px] text-zinc-600 font-black uppercase block mb-3">ШАГ 3: Полная очистка системных паролей</span>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-black p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                    <span className="text-[7px] text-zinc-700 font-black">WINDOWS (CMD):</span>
                    <div className="flex justify-between items-center">
                      <code className="text-[9px] text-white font-mono">git credential-manager delete --host=github.com</code>
                      <button onClick={() => copyToClipboard('git credential-manager delete --host=github.com')} className="text-[#F5C518] text-[8px] font-black">COPY</button>
                    </div>
                  </div>
                  <div className="bg-black p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                    <span className="text-[7px] text-zinc-700 font-black">MACOS (TERMINAL):</span>
                    <code className="text-[9px] text-zinc-500 italic">Удали Github через 'Keychain Access' вручную.</code>
                  </div>
                </div>
              </div>

              {/* ШАГ 4 */}
              <div className="bg-[#121212] p-5 rounded-2xl border border-white/5 shadow-xl">
                <span className="text-[8px] text-zinc-600 font-black uppercase block mb-3">ШАГ 4: Сброс автора (User Identity)</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-black p-3 rounded-xl border border-white/5">
                    <code className="text-[9px] text-zinc-400 font-mono">git config --global --unset-all user.name</code>
                    <button onClick={() => copyToClipboard('git config --global --unset-all user.name')} className="text-white/40 text-[8px]">COPY</button>
                  </div>
                  <div className="flex items-center justify-between bg-black p-3 rounded-xl border border-white/5">
                    <code className="text-[9px] text-zinc-400 font-mono">git config --global --unset-all user.email</code>
                    <button onClick={() => copyToClipboard('git config --global --unset-all user.email')} className="text-white/40 text-[8px]">COPY</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5C518]/5 border border-[#F5C518]/20 text-center">
              <p className="text-[10px] text-[#F5C518] font-black uppercase italic">
                ПОСЛЕ ЭТОГО ПРИ PUSH ОН СПРОСИТ НОВЫЙ ЛОГИН
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* СТАТУС СОЕДИНЕНИЯ */}
            <section className={`p-5 rounded-3xl border ${testResult?.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} shadow-2xl`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Связь с Supabase</h3>
                <div className={`w-2 h-2 rounded-full ${testResult?.success ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-red-500 shadow-[0_0_10px_red] animate-pulse'}`}></div>
              </div>
              <p className={`text-xs font-black italic uppercase ${testResult?.success ? 'text-green-500' : 'text-red-500'}`}>
                {testResult?.success ? 'ОБЪЕКТ НА СВЯЗИ' : 'ОШИБКА ДОСТУПА'}
              </p>
              <p className="text-[9px] text-zinc-600 mt-2 font-mono break-all bg-black/40 p-2 rounded-lg">
                {testResult?.message || 'Ожидание пинга...'}
              </p>
              <button onClick={runTest} className="mt-4 text-[8px] font-black text-[#F5C518] uppercase border-b border-[#F5C518]">Перепроверить</button>
            </section>

            <section className="bg-[#121212] card-border p-6 rounded-3xl border border-white/5 shadow-2xl">
              <h3 className="text-[10px] text-[#F5C518] font-black uppercase tracking-[0.2em] mb-4 italic">Обновление узла (Supabase)</h3>
              <form onSubmit={handleSaveManual} className="space-y-4">
                <input 
                  value={manualUrl} 
                  onChange={e => setManualUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co" 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-[11px] text-white font-mono outline-none"
                />
                <textarea 
                  value={manualKey} 
                  onChange={e => setManualKey(e.target.value)}
                  placeholder="ANON_KEY (длинная строка)" 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-[10px] text-white font-mono outline-none min-h-[80px]"
                />
                <button type="submit" className="w-full bg-[#F5C518] text-black font-black py-4 rounded-xl uppercase italic shadow-lg">
                  СОХРАНИТЬ КЛЮЧИ
                </button>
              </form>
            </section>
          </>
        )}

        <div className="space-y-3">
          <button 
            onClick={() => {
              if(confirm('Внимание: это полностью очистит настройки приложения и выйдет из аккаунта. Продолжить?')) {
                clearManualConfig();
              }
            }}
            className="w-full bg-red-900/10 border border-red-500/20 text-red-500 font-black py-4 rounded-xl uppercase italic text-[10px] tracking-widest shadow-xl"
          >
            ☢️ СБРОСИТЬ ВСЁ (WIPE LOCAL)
          </button>

          <button 
            onClick={() => navigate(Screen.HOME)}
            className="w-full bg-white/5 text-zinc-500 font-black py-4 rounded-xl uppercase italic text-[10px] tracking-widest"
          >
            ВЕРНУТЬСЯ В ЦЕХ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;
