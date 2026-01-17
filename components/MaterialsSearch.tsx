
import React, { useState } from 'react';
import { Screen, Location } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  navigate: (screen: Screen) => void;
  location: Location | null;
}

const MaterialsSearch: React.FC<Props> = ({ navigate, location }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setSources([]);

    try {
      // Use process.env.API_KEY directly as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Проведи жесткий анализ рынка для: ${query} в регионе ${location?.name || 'Россия'}. 
        Формат ответа (ОБЯЗАТЕЛЬНО ИСПОЛЬЗУЙ ЗАГОЛОВКИ):
        1. [БАЗАР] — Коротко: средняя цена за единицу, тренд (растет/падает).
        2. [ВЕРДИКТ БУГРА] — Твой экспертный совет: как не лохануться при приемке, какие бренды сейчас "фуфло", а какие "сталь".
        3. [ГДЕ ТАРИТЬСЯ] — Список из 3-4 конкретных баз или сетей с их фишками.
        Стиль: Профессиональный прораб, суровый, честный.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      setResult(response.text || 'Ничего не найдено.');
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setSources(response.candidates[0].groundingMetadata.groundingChunks);
      }
    } catch (err: any) {
      console.error("SUPPLY_API_ERROR:", err);
      setResult(`Ошибка: ${err.message || 'Сбой связи'}`);
    } finally {
      setLoading(false);
    }
  };

  // Парсинг результата на блоки для красоты
  const renderFormattedResult = () => {
    if (!result) return null;

    const sections = result.split(/\[(.*?)\]/);
    const elements: React.ReactNode[] = [];

    for (let i = 1; i < sections.length; i += 2) {
      const title = sections[i];
      const content = sections[i + 1];

      if (title === 'БАЗАР') {
        elements.push(
          <div key={title} className="bg-zinc-900/60 border border-white/5 p-6 rounded-[30px] mb-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📈</span>
              <h4 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">АНАЛИЗ_РЫНКА</h4>
            </div>
            <p className="text-white text-[15px] font-bold italic leading-relaxed">{content.trim()}</p>
          </div>
        );
      } else if (title === 'ВЕРДИКТ БУГРА') {
        elements.push(
          <div key={title} className="bg-[#D4AF37]/5 border border-[#D4AF37]/30 p-6 rounded-[35px] mb-4 shadow-[0_0_30px_rgba(212,175,55,0.05)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl">👑</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center text-black">
                <span className="text-lg">🏗️</span>
              </div>
              <h4 className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest italic">ВЕРДИКТ БУГРА</h4>
            </div>
            <p className="text-[#FFF5D1] text-[14px] italic leading-relaxed font-medium whitespace-pre-wrap">{content.trim()}</p>
          </div>
        );
      } else if (title === 'ГДЕ ТАРИТЬСЯ') {
        elements.push(
          <div key={title} className="bg-black/40 border border-white/5 p-6 rounded-[30px] mb-6">
            <h4 className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-4 ml-1">ТОЧКИ_СБЫТА:</h4>
            <div className="text-zinc-400 text-[13px] leading-relaxed whitespace-pre-wrap italic">{content.trim()}</div>
          </div>
        );
      }
    }

    if (elements.length === 0) {
      return <div className="text-zinc-300 whitespace-pre-wrap p-6 bg-[#0f0f0f] rounded-[30px] italic">{result}</div>;
    }

    return elements;
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto no-scrollbar bg-[#050505] pt-safe h-full relative">
      <header className="flex items-center justify-between py-6 mb-4 sticky top-0 bg-[#050505]/95 backdrop-blur-md z-30 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(Screen.HOME)} className="w-11 h-11 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press">←</button>
          <div className="flex flex-col text-left">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">СНАБЖЕНЕЦ</h2>
            <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-1 italic mono">SUPPLY_RADAR_v4.2</span>
          </div>
        </div>
      </header>

      {/* SEARCH BOX */}
      <div className="bg-[#121212] p-2 rounded-[35px] border border-white/10 flex items-center gap-2 mb-8 shadow-2xl relative group focus-within:border-[#D4AF37]/30 transition-all">
         <input 
           type="text" 
           value={query}
           onChange={e => setQuery(e.target.value)}
           onKeyPress={e => e.key === 'Enter' && handleSearch()}
           placeholder="Что пробить? (Арматура, газоблок...)"
           className="flex-1 bg-transparent px-6 text-white text-[15px] outline-none font-bold h-14 placeholder:text-zinc-800"
         />
         <button 
           onClick={handleSearch}
           disabled={loading}
           className={`w-14 h-14 rounded-[28px] flex items-center justify-center transition-all ${query.trim() ? 'bg-[#D4AF37] text-black' : 'bg-zinc-900 text-zinc-600'}`}
         >
            {loading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <span className="text-xl italic font-black tracking-tighter">GO</span>}
         </button>
      </div>

      {loading && (
        <div className="py-20 text-center flex flex-col items-center">
           <div className="relative w-24 h-24 mb-10">
              <div className="absolute inset-0 border-4 border-[#D4AF37]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-2 border-[#D4AF37]/40 border-b-transparent rounded-full animate-spin-slow"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-2xl animate-pulse">📡</span>
              </div>
           </div>
           <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.5em] animate-pulse">СКАН_ПРОМЗОН_И_СКЛАДОВ...</p>
        </div>
      )}

      {result && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
           {renderFormattedResult()}

           {sources.length > 0 && (
             <div className="space-y-3 mt-6">
                <div className="flex items-center gap-4 px-4 mb-4">
                  <div className="h-px bg-white/5 flex-1"></div>
                  <h4 className="text-[8px] text-zinc-700 font-black uppercase tracking-[0.4em] italic">ПРОВЕРЕННЫЕ_ИСТОЧНИКИ</h4>
                  <div className="h-px bg-white/5 flex-1"></div>
                </div>
                {sources.map((s, i) => (
                  s.web && (
                    <a key={i} href={s.web.uri} target="_blank" rel="noopener noreferrer" className="block bg-[#0f0f0f] p-5 rounded-[25px] border border-white/5 text-left active-press hover:border-[#D4AF37]/20 transition-all">
                       <span className="text-white text-[12px] font-black uppercase italic block truncate mb-1">{s.web.title}</span>
                       <span className="text-[#D4AF37] text-[8px] truncate block mono uppercase opacity-50">{s.web.uri}</span>
                    </a>
                  )
                ))}
             </div>
           )}
        </div>
      )}

      {!result && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20 border-2 border-dashed border-white/5 rounded-[45px]">
           <span className="text-6xl mb-6">🔩</span>
           <p className="font-black italic uppercase tracking-[0.3em] text-white">РАДАР ЧИСТ</p>
           <p className="text-[8px] mt-2 font-bold uppercase tracking-widest text-center px-10 leading-relaxed">
             Вбей название материала, и Бугор <br/> пробьет по своим каналам
           </p>
        </div>
      )}
    </div>
  );
};

export default MaterialsSearch;
