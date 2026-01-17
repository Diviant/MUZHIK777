
import React, { useState } from 'react';
import { Screen } from '../types';
import { db } from '../database';
import { getDebugConfig, saveManualConfig, clearManualConfig, getGeminiKey } from '../lib/supabase';
import { GoogleGenAI } from '@google/genai';

interface Props {
  navigate: (screen: Screen) => void;
  onRefresh: () => void;
}

const Diagnostic: React.FC<Props> = ({ navigate, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'AI' | 'ENV_LOG'>('SYSTEM');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [elevating, setElevating] = useState(false);
  
  const [mUrl, setMUrl] = useState('');
  const [mKey, setMKey] = useState('');
  const [mGKey, setMGKey] = useState(localStorage.getItem('MUZHIK_PROFILE_GEMINI_KEY') || '');

  const config = getDebugConfig();

  const runTest = async () => {
    setLoading(true);
    const result = await db.testConnection();
    setTestResult(result);
    setLoading(false);
  };

  const handleElevate = async () => {
    setElevating(true);
    const res = await db.promoteToAdmin();
    setTestResult({ success: res.success, message: res.message });
    setElevating(false);
  };

  const testAi = async () => {
    const key = getGeminiKey();
    if (!key) {
      setAiTestResult("ОШИБКА: КЛЮЧ НЕ НАЙДЕН");
      return;
    }
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Say "OK" if you hear me',
      });
      setAiTestResult(`СВЯЗЬ: ${response.text || 'ОТВЕТ ПУСТОЙ'}`);
    } catch (e: any) {
      console.error("AI_TEST_ERROR:", e);
      if (e.message?.includes('leaked')) {
        setAiTestResult("❌ КЛЮЧ ЗАБЛОКИРОВАН (УТЕЧКА).");
      } else if (e.message?.includes('fetch') || e.message?.includes('403')) {
        setAiTestResult("🚫 БЛОКИРОВКА РЕГИОНА. ВКЛЮЧИ VPN!");
      } else {
        setAiTestResult(`СБОЙ: ${e.message || 'НЕИЗВЕСТНАЯ ОШИБКА'}`);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = () => {
    saveManualConfig(mUrl, mKey, mGKey);
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 screen-fade overflow-y-auto no-scrollbar bg-[#050505] pt-safe">
      <header className="flex items-center gap-4 py-4 mb-6 px-1">
        <button onClick={() => navigate(Screen.HOME)} className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl">
          ←
        </button>
        <div className="flex flex-col text-left">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">ИНЖЕНЕРНЫЙ ПУЛЬТ</h2>
          <span className={`text-[9px] font-black uppercase tracking-widest mt-1 mono ${config.urlOk ? 'text-green-500' : 'text-red-500'}`}>
            DB_STATUS: {config.urlOk ? 'STABLE' : 'DISCONNECTED'}
          </span>
        </div>
      </header>

      <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-2xl mb-8 border border-white/5 w-full">
        <button onClick={() => setActiveTab('SYSTEM')} className={`flex-1 py-3.5 rounded-xl text-[9px] font-black uppercase italic transition-all ${activeTab === 'SYSTEM' ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-zinc-600'}`}>БАЗА</button>
        <button onClick={() => setActiveTab('AI')} className={`flex-1 py-3.5 rounded-xl text-[9px] font-black uppercase italic transition-all ${activeTab === 'AI' ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-zinc-600'}`}>AI_КЛЮЧ</button>
        <button onClick={() => setActiveTab('ENV_LOG')} className={`flex-1 py-3.5 rounded-xl text-[9px] font-black uppercase italic transition-all ${activeTab === 'ENV_LOG' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}>ENV</button>
      </div>

      <div className="space-y-6 pb-32 w-full">
        {activeTab === 'SYSTEM' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="bg-zinc-900/40 p-5 rounded-[30px] border border-white/5 shadow-2xl">
              <h3 className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest italic mb-6 ml-1">КОНФИГУРАЦИЯ SUPABASE:</h3>
              <div className="space-y-5">
                 <div className="space-y-1.5 text-left">
                    <label className="text-[8px] text-zinc-700 font-black uppercase tracking-widest ml-1">SUPABASE_URL</label>
                    <input value={mUrl} onChange={e => setMUrl(e.target.value)} placeholder={config.url} className="w-full h-14 bg-black border border-white/10 rounded-2xl px-5 text-white text-[11px] font-mono outline-none focus:border-[#D4AF37]/30" />
                 </div>
                 <div className="space-y-1.5 text-left">
                    <label className="text-[8px] text-zinc-700 font-black uppercase tracking-widest ml-1">ANON_KEY (S-ID)</label>
                    <input value={mKey} onChange={e => setMKey(e.target.value)} placeholder="Вставьте ключ для смены базы..." className="w-full h-14 bg-black border border-white/10 rounded-2xl px-5 text-white text-[11px] font-mono outline-none focus:border-[#D4AF37]/30" />
                 </div>
              </div>
              <button onClick={handleSave} className="w-full mt-8 bg-zinc-800 text-white font-black py-5 rounded-2xl uppercase italic text-[12px] shadow-xl active-press">
                ОБНОВИТЬ_КОНФИГ
              </button>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={runTest} disabled={loading} className="h-16 bg-zinc-900 border border-white/10 rounded-[25px] flex items-center justify-center gap-4 active-press">
                {loading ? <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div> : <span className="text-[10px] font-black text-white uppercase italic">ТЕСТ_БАЗЫ</span>}
              </button>
              <button onClick={() => navigate(Screen.ADMIN_LOGIN)} className="h-16 bg-[#D4AF37] border border-white/10 rounded-[25px] flex items-center justify-center active-press shadow-lg shadow-[#D4AF37]/10">
                <span className="text-[10px] font-black text-black uppercase italic">АДМИНКА →</span>
              </button>
            </div>

            <button onClick={handleElevate} disabled={elevating} className="w-full h-16 bg-red-950/20 border border-red-500/30 rounded-[25px] flex items-center justify-center gap-4 active-press overflow-hidden relative">
              <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
              {elevating ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div> : <span className="text-[10px] font-black text-red-500 uppercase italic tracking-widest">⚠️ ПОЛУЧИТЬ_ПРАВА_АДМИНА</span>}
            </button>

            {testResult && (
              <div className={`p-6 rounded-[25px] border animate-in zoom-in duration-200 ${testResult.success ? 'bg-green-950/20 border-green-500/30 text-green-400' : 'bg-red-950/20 border-red-500/30 text-red-400'}`}>
                 <p className="text-[10px] font-black italic text-center uppercase tracking-tight leading-relaxed">{testResult.message}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'AI' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="bg-zinc-900/40 p-5 rounded-[30px] border border-white/5 shadow-2xl">
               <h3 className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest italic mb-4 ml-1">ЛИЧНЫЙ КЛЮЧ GEMINI:</h3>
               <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-2xl mb-6">
                  <p className="text-[10px] text-red-400 font-black uppercase italic leading-relaxed">
                    МУЖИК, ВАЖНО: Если ты в РФ, ИИ работает ТОЛЬКО через VPN. Google блокирует прямые запросы.
                  </p>
               </div>
               <p className="text-[11px] text-zinc-500 italic mb-6 leading-relaxed px-1">
                 1. Создай ключ на <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[#D4AF37] underline">Google AI Studio</a>. <br/>
                 2. Вставь его ниже и нажми Сохранить.
               </p>
               <input 
                 value={mGKey} 
                 onChange={e => setMGKey(e.target.value)} 
                 placeholder="AIza..." 
                 className="w-full h-16 bg-black border border-white/10 rounded-2xl px-5 text-white text-[12px] font-mono outline-none focus:border-[#D4AF37]/40 mb-4" 
               />
               <div className="grid grid-cols-2 gap-2">
                 <button onClick={handleSave} className="bg-[#D4AF37] text-black font-black py-4 rounded-xl uppercase italic text-[10px] active-press">
                   СОХРАНИТЬ
                 </button>
                 <button onClick={testAi} disabled={aiLoading} className="bg-zinc-800 text-white font-black py-4 rounded-xl uppercase italic text-[10px] active-press">
                   {aiLoading ? '...' : 'ТЕСТ_СВЯЗИ'}
                 </button>
               </div>
               {aiTestResult && (
                 <div className="mt-4 p-4 bg-black rounded-xl border border-white/10">
                   <p className="text-[9px] font-mono text-zinc-400 break-all text-center">{aiTestResult}</p>
                 </div>
               )}
            </section>
          </div>
        )}

        {activeTab === 'ENV_LOG' && (
          <section className="bg-black border border-white/5 p-5 rounded-[30px] text-left shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
             <h3 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-6 italic ml-1">ENV_DETECTION_MATRIX:</h3>
             <div className="space-y-4 font-mono text-[10px]">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                   <span className="text-zinc-700 uppercase">Source: VITE_META</span>
                   <span className={config.sources.vite_url ? "text-green-500 font-black" : "text-red-900"}>{config.sources.vite_url ? "DETECTED" : "NULL"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                   <span className="text-zinc-700 uppercase">Source: PROFILE_AI</span>
                   <span className={config.sources.profile_ai_key ? "text-[#D4AF37] font-black" : "text-zinc-800"}>{config.sources.profile_ai_key ? "ACTIVE" : "NONE"}</span>
                </div>
             </div>
          </section>
        )}

        <button 
          onClick={clearManualConfig}
          className="w-full py-6 text-zinc-800 font-black rounded-2xl uppercase italic text-[11px] tracking-[0.5em] active-press border border-white/5 bg-zinc-900/10 hover:text-zinc-600 transition-colors"
        >
          СБРОС_КОНФИГУРАЦИИ
        </button>
      </div>
    </div>
  );
};

export default Diagnostic;
