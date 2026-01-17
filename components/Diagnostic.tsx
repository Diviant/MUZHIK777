
import React, { useState } from 'react';
import { Screen } from '../types';
import { db } from '../database';
import { getDebugConfig, saveManualConfig, clearManualConfig } from '../lib/supabase';

interface Props {
  navigate: (screen: Screen) => void;
  onRefresh: () => void;
}

const Diagnostic: React.FC<Props> = ({ navigate, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'ENV_LOG'>('SYSTEM');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [mUrl, setMUrl] = useState('');
  const [mKey, setMKey] = useState('');

  const config = getDebugConfig();

  const runTest = async () => {
    setLoading(true);
    const result = await db.testConnection();
    setTestResult(result);
    setLoading(false);
  };

  const handleSave = () => {
    saveManualConfig(mUrl, mKey);
  };

  return (
    <div className="flex-1 flex flex-col p-6 screen-fade overflow-y-auto no-scrollbar bg-[#050505] pt-safe">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button onClick={() => navigate(Screen.HOME)} className="w-11 h-11 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl">
          ←
        </button>
        <div className="flex flex-col text-left">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">ИНЖЕНЕРНЫЙ ПУЛЬТ</h2>
          <span className={`text-[8px] font-black uppercase tracking-widest mt-1 mono ${config.urlOk ? 'text-green-500' : 'text-red-500'}`}>
            DB_STATUS: {config.urlOk ? 'STABLE' : 'DISCONNECTED'}
          </span>
        </div>
      </header>

      <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-2xl mb-8 border border-white/5 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('SYSTEM')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase italic transition-all ${activeTab === 'SYSTEM' ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-zinc-600'}`}>БАЗА_ДАННЫХ</button>
        <button onClick={() => setActiveTab('ENV_LOG')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase italic transition-all ${activeTab === 'ENV_LOG' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}>ENV_LOG</button>
      </div>

      <div className="space-y-6 pb-32">
        {activeTab === 'SYSTEM' && (
          <div className="space-y-4">
            <section className="bg-zinc-900/40 p-6 rounded-[35px] border border-white/5 shadow-2xl">
              <h3 className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest italic mb-6">ПАРАМЕТРЫ СОЕДИНЕНИЯ:</h3>
              <div className="space-y-4">
                 <div className="space-y-1 text-left">
                    <label className="text-[7px] text-zinc-700 font-black uppercase tracking-widest ml-1">SUPABASE_URL</label>
                    <input value={mUrl} onChange={e => setMUrl(e.target.value)} placeholder={config.url} className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-white text-[10px] font-mono outline-none" />
                 </div>
                 <div className="space-y-1 text-left">
                    <label className="text-[7px] text-zinc-700 font-black uppercase tracking-widest ml-1">ANON_KEY (S-ID)</label>
                    <input value={mKey} onChange={e => setMKey(e.target.value)} placeholder="Вставьте новый ключ для смены базы..." className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-white text-[10px] font-mono outline-none" />
                 </div>
              </div>
              <button onClick={handleSave} className="w-full mt-6 bg-[#D4AF37] text-black font-black py-4 rounded-xl uppercase italic text-[11px]">СОХРАНИТЬ_И_ПЕРЕЗАГРУЗИТЬ</button>
            </section>

            <button onClick={runTest} disabled={loading} className="w-full h-16 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center gap-4 active-press">
              {loading ? <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div> : <span className="text-xs font-black text-white uppercase italic">ПРОВЕРИТЬ_КОННЕКТ</span>}
            </button>

            {testResult && (
              <div className={`p-6 rounded-[30px] border ${testResult.success ? 'bg-green-950/20 border-green-500/30 text-green-400' : 'bg-red-950/20 border-red-500/30 text-red-400'}`}>
                 <p className="text-[11px] font-medium italic">{testResult.message}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ENV_LOG' && (
          <section className="bg-black border border-white/5 p-6 rounded-[35px] text-left">
             <h3 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-6 italic">ENV_DETECTION_MATRIX:</h3>
             <div className="space-y-3 font-mono text-[9px]">
                <div className="flex justify-between border-b border-white/5 pb-2">
                   <span className="text-zinc-700 uppercase">Source: VITE_META</span>
                   <span className={config.sources.vite_url ? "text-green-500" : "text-red-900"}>{config.sources.vite_url ? "DETECTED" : "NULL"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                   <span className="text-zinc-700 uppercase">Source: PROCESS_ENV</span>
                   <span className={config.sources.proc_key ? "text-green-500" : "text-red-900"}>{config.sources.proc_key ? "DETECTED" : "NULL"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                   <span className="text-zinc-700 uppercase">Source: LOCAL_OVERRIDE</span>
                   <span className={config.sources.local_override ? "text-[#D4AF37]" : "text-zinc-800"}>{config.sources.local_override ? "ACTIVE" : "NONE"}</span>
                </div>
             </div>
             <div className="mt-8 p-4 bg-zinc-900/50 rounded-xl">
                <p className="text-[8px] text-zinc-600 leading-relaxed uppercase">
                  * На Vercel ключи без префикса VITE_ часто недоступны в браузере. Используй ручной ввод, если ENV_LOG показывает NULL.
                </p>
             </div>
          </section>
        )}

        <button 
          onClick={() => navigate(Screen.HOME)} 
          className="w-full py-5 text-zinc-800 font-black rounded-2xl uppercase italic text-[10px] tracking-[0.4em] active-press border border-white/5"
        >
          ЗАКРЫТЬ_КРАН
        </button>
      </div>
    </div>
  );
};

export default Diagnostic;
