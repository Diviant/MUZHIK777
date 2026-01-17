
import React, { useState, useEffect } from 'react';
import { Screen, Location } from '../types';
import { GoogleGenAI } from '@google/genai';

interface Props {
  navigate: (screen: Screen) => void;
  location: Location | null;
}

type RestTab = 'SAUNA' | 'CAMPING' | 'BEER' | 'SLEEP' | 'KITCHEN' | 'GEAR' | 'DATE';
type DishCategory = 'СУПЫ' | 'ВТОРОЕ' | 'ЗАКУСКИ' | 'НА ПЛИТКЕ';
type GearCategory = 'РОБА' | 'ПЕДАЛИ' | 'ЗАЩИТА' | 'ИНСТРУМ';

interface SavedIntel {
  id: string;
  type: string;
  city: string;
  content: string;
  timestamp: number;
}

const Rest: React.FC<Props> = ({ navigate, location }) => {
  const [activeTab, setActiveTab] = useState<RestTab>('SAUNA');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [city, setCity] = useState(location?.name || '');
  const [savedHistory, setSavedHistory] = useState<SavedIntel[]>([]);
  const [copyStatus, setCopyStatus] = useState(false);

  useEffect(() => {
    const history = localStorage.getItem('muzhik_rest_history');
    if (history) setSavedHistory(JSON.parse(history));
  }, []);

  const handleSave = () => {
    if (!result) return;
    const newItem: SavedIntel = {
      id: Date.now().toString(),
      type: tabs.find(t => t.id === activeTab)?.label || 'ИНФО',
      city: city || 'РФ',
      content: result,
      timestamp: Date.now()
    };
    const updated = [newItem, ...savedHistory.slice(0, 9)];
    setSavedHistory(updated);
    localStorage.setItem('muzhik_rest_history', JSON.stringify(updated));
    
    // Haptic feedback simulation
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleShare = () => {
    if (!result) return;
    const promoLink = "https://t.me/chmuzhikbot?start=PROMO";
    const text = encodeURIComponent(`Смотри, что Бугор нашептал:\n\n${result.substring(0, 500)}...`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(promoLink)}&text=${text}`);
  };

  const handleSearch = async (specificDish?: DishCategory, specificGear?: GearCategory) => {
    if (!city.trim() && !specificDish && !specificGear) return;
    setLoading(true);
    setResult(null);
    setSources([]);

    let query = '';
    
    if (specificDish) {
      query = `Напиши детальный "мужицкий" рецепт из категории "${specificDish}". 
      ОБЯЗАТЕЛЬНО укажи:
      1. ГРАММОВКИ всех ингредиентов.
      2. ВРЕМЯ ГОТОВКИ в минутах.
      3. ПРИМЕРНЫЙ БЮДЖЕТ в рублях на одну порцию.
      4. ПОШАГОВУЮ ИНСТРУКЦИЮ (чтобы даже на плитке в бытовке получилось).
      Стиль: суровый совет от Бугра.`;
    } else if (specificGear) {
      query = `Где в городе ${city} купить категорию шмота: "${specificGear}"? 
      Ищи магазины спецодежды (Восток-Сервис, Техноавиа), рынки и инструментальные базы. 
      Укажи точные адреса и телефоны. 
      Дай батин совет от Бугра: как выбрать качество и не купить картон вместо кожи.`;
    } else {
      const queries = {
        SAUNA: `Найди лучшие бани и сауны в городе ${city}. Точные адреса и телефоны. Совет от Бугра про веник.`,
        CAMPING: `Места для отдыха на природе рядом с городом ${city}. Как доехать, что брать.`,
        BEER: `Где купить нормальное пиво в городе ${city}? Разливайки и крафт. Адреса и закуски.`,
        SLEEP: `Где переночевать в городе ${city}? Хостелы, общаги, отели. Цены и чистота.`,
        KITCHEN: `Где поесть в городе ${city}? Столовые, пельменные. Адреса и телефоны.`,
        GEAR: `Магазины спецодежды и инструмента в городе ${city}. Адреса и телефоны.`,
        DATE: `Куда сводить девушку в городе ${city}, чтоб прилично и не пафосно? Парки, кафе, кино. Адреса.`
      };
      query = queries[activeTab];
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: query,
        config: { tools: [{ googleSearch: {} }] }
      });

      setResult(response.text || 'Данные не найдены.');
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setSources(response.candidates[0].groundingMetadata.groundingChunks);
      }
    } catch (err) {
      setResult('Связь с базой пропала. Попробуй позже.');
    } finally {
      setLoading(false);
    }
  };

  const tabs: {id: RestTab, label: string, icon: string}[] = [
    { id: 'SAUNA', label: 'БАНЬКИ', icon: '🧖‍♂️' },
    { id: 'KITCHEN', label: 'КУХНЯ', icon: '🥘' },
    { id: 'GEAR', label: 'ШМОТ', icon: '🥾' },
    { id: 'DATE', label: 'С ДЕВУШКОЙ', icon: '🌹' },
    { id: 'SLEEP', label: 'НОЧЛЕГ', icon: '🛌' },
    { id: 'CAMPING', label: 'КЕМПИНГ', icon: '⛺' },
    { id: 'BEER', label: 'ПИВНОЙ ГИД', icon: '🍺' }
  ];

  const dishCategories: {id: DishCategory, icon: string}[] = [
    { id: 'СУПЫ', icon: '🥣' },
    { id: 'ВТОРОЕ', icon: '🥩' },
    { id: 'ЗАКУСКИ', icon: '🥒' },
    { id: 'НА ПЛИТКЕ', icon: '🍳' }
  ];

  const gearCategories: {id: GearCategory, label: string, icon: string}[] = [
    { id: 'РОБА', label: 'СПЕЦУХА', icon: '🦺' },
    { id: 'ПЕДАЛИ', label: 'ОБУВЬ', icon: '🥾' },
    { id: 'ЗАЩИТА', label: 'СИЗ', icon: '⛑️' },
    { id: 'ИНСТРУМ', label: 'ИНСТРУМЕНТ', icon: '🛠️' }
  ];

  return (
    <div className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto no-scrollbar bg-[#050505] pt-safe h-full relative">
      <header className="flex items-center justify-between py-4 mb-4 sticky top-0 bg-[#050505] z-50 border-b border-white/10 px-1">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(Screen.HOME)} className="w-11 h-11 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl">←</button>
          <div className="flex flex-col text-left">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">ОТДЫХ В ЦЕХЕ</h2>
            <div className="flex items-center gap-1.5 mt-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
               <span className="text-[7px] text-zinc-500 font-black uppercase tracking-widest italic mono">REST_AND_RECOVER_v1.8</span>
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH CONSOLE */}
      <div className="bg-[#121212] p-6 rounded-[35px] border border-white/5 mb-6 shadow-2xl relative">
         <div className="flex gap-2 p-1 bg-black rounded-2xl mb-6 border border-white/5 overflow-x-auto no-scrollbar">
            {tabs.map(t => (
              <button 
                key={t.id} 
                onClick={() => { setActiveTab(t.id); setResult(null); }}
                className={`flex-none px-5 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === t.id ? 'bg-[#D4AF37] text-black' : 'text-zinc-600'}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
         </div>

         <div className="space-y-4">
            <div className="space-y-1.5 text-left">
               <label className="text-[8px] text-zinc-500 font-black uppercase tracking-widest ml-1 italic mono">ГОРОД_ДИСЛОКАЦИИ</label>
               <input 
                 type="text" 
                 value={city} 
                 onChange={e => setCity(e.target.value)} 
                 placeholder="ГДЕ ИЩЕМ?" 
                 className="w-full h-14 bg-zinc-900 border border-white/10 rounded-2xl px-5 text-white text-xs font-black outline-none focus:border-[#D4AF37] uppercase italic" 
               />
            </div>

            <button 
              onClick={() => handleSearch()} 
              disabled={loading || !city} 
              className={`w-full h-16 rounded-[22px] flex items-center justify-center gap-4 transition-all active:scale-[0.97] shadow-2xl ${loading ? 'bg-zinc-800 text-zinc-600' : 'bg-[#D4AF37] text-black font-black uppercase italic text-xs'}`}
            >
               {loading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'РАЗВЕДАТЬ ОБСТАНОВКУ'}
            </button>
         </div>

         {/* SUB-MENUS */}
         {activeTab === 'KITCHEN' && (
           <div className="mt-8 pt-6 border-t border-white/5">
              <h3 className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-4 italic text-left">ЧЕГО ИЗВОЛИМ? (РЕЦЕПТ ОТ БУГРА)</h3>
              <div className="grid grid-cols-2 gap-3">
                 {dishCategories.map(cat => (
                   <button key={cat.id} onClick={() => handleSearch(cat.id)} disabled={loading} className="flex flex-col items-center justify-center bg-black/40 border border-white/5 p-4 rounded-2xl active-press transition-all">
                     <span className="text-2xl mb-2">{cat.icon}</span>
                     <span className="text-[9px] font-black uppercase text-zinc-400 italic">{cat.id}</span>
                   </button>
                 ))}
              </div>
           </div>
         )}

         {activeTab === 'GEAR' && (
           <div className="mt-8 pt-6 border-t border-white/5">
              <h3 className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-4 italic text-left">ЧТО ИЩЕМ ПО СНАРЯГЕ?</h3>
              <div className="grid grid-cols-2 gap-3">
                 {gearCategories.map(cat => (
                   <button key={cat.id} onClick={() => handleSearch(undefined, cat.id)} disabled={loading} className="flex flex-col items-center justify-center bg-black/40 border border-white/5 p-4 rounded-2xl active-press transition-all">
                     <span className="text-2xl mb-2">{cat.icon}</span>
                     <span className="text-[9px] font-black uppercase text-zinc-400 italic">{cat.label}</span>
                   </button>
                 ))}
              </div>
           </div>
         )}
      </div>

      {/* RESULTS */}
      <div className="space-y-6">
        {result && (
          <div className="flex flex-col gap-4 animate-slide-up">
            <div className="bg-[#1a1305] p-6 rounded-[35px] border-l-4 border-[#D4AF37] shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">👷‍♂️</div>
               <div className="flex flex-col text-left relative z-10">
                  <span className="bg-[#D4AF37] text-black text-[8px] font-black px-3 py-1 rounded-full uppercase italic w-fit mb-4">ИНСТРУКТАЖ БУГРА</span>
                  <div className="text-white text-[13px] leading-relaxed italic font-medium whitespace-pre-wrap mb-6">
                    {result}
                  </div>

                  {/* ACTION BAR */}
                  <div className="flex gap-2 pt-4 border-t border-white/5">
                     <button onClick={handleCopy} className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase transition-all ${copyStatus ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                       {copyStatus ? 'ГОТОВО ✓' : '📋 КОПИРОВАТЬ'}
                     </button>
                     <button onClick={handleShare} className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase">🔗 ПОДЕЛИТЬСЯ</button>
                     <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-[#D4AF37] text-black text-[8px] font-black uppercase">💾 В БАЗУ</button>
                  </div>
               </div>
            </div>

            {sources.length > 0 && (
              <div className="space-y-3">
                 <h4 className="text-[10px] text-zinc-700 font-black uppercase tracking-widest ml-4 mb-2 italic">ТОЧКИ НА КАРТЕ:</h4>
                 {sources.map((s, i) => (
                   s.web && (
                     <a key={i} href={s.web.uri} target="_blank" rel="noopener noreferrer" className="block bg-[#121212] p-5 rounded-[25px] border border-white/5 text-left active-press shadow-xl transition-all">
                        <span className="text-white text-[11px] font-black uppercase italic block truncate mb-1">{s.web.title}</span>
                        <span className="text-zinc-700 text-[8px] truncate block mono uppercase tracking-tight">{s.web.uri}</span>
                     </a>
                   )
                 ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORY SECTION */}
        {savedHistory.length > 0 && !result && !loading && (
           <div className="mt-10 animate-slide-up">
              <h4 className="text-[10px] text-zinc-700 font-black uppercase tracking-widest ml-4 mb-4 italic">СОХРАНЕННАЯ РАЗВЕДКА:</h4>
              <div className="space-y-3">
                 {savedHistory.map((item) => (
                   <button key={item.id} onClick={() => { setResult(item.content); setCity(item.city); }} className="w-full bg-[#121212] p-5 rounded-[25px] border border-white/5 text-left active-press">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[#D4AF37] text-[9px] font-black uppercase italic">{item.type} — {item.city}</span>
                         <span className="text-zinc-800 text-[8px] mono uppercase">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-zinc-500 text-[10px] italic truncate">{item.content.substring(0, 100)}...</p>
                   </button>
                 ))}
                 <button onClick={() => { localStorage.removeItem('muzhik_rest_history'); setSavedHistory([]); }} className="w-full py-4 text-zinc-800 text-[8px] font-black uppercase italic">ОЧИСТИТЬ АРХИВ</button>
              </div>
           </div>
        )}

        {loading && (
          <div className="py-20 text-center flex flex-col items-center">
             <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-6"></div>
             <p className="text-[8px] text-zinc-700 font-black uppercase tracking-[0.4em] animate-pulse mono">LINKING_LOCAL_SENSORS...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rest;
