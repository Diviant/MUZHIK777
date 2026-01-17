
import React, { useState, useEffect } from 'react';
import { Screen, Location } from '../types';
import { GoogleGenAI } from '@google/genai';

interface Props {
  navigate: (screen: Screen) => void;
  location: Location | null;
}

type RestTab = 'SAUNA' | 'CAMPING' | 'BEER' | 'SLEEP' | 'KITCHEN' | 'GEAR' | 'DATE' | 'PSYCHOLOGY';
type Mood = 'ANGRY' | 'TIRED' | 'SUCCESS' | 'LONELY';

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
  
  // Для психолога
  const [psychInput, setPsychInput] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

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

  const handlePsychologyTalk = async () => {
    if (!psychInput.trim() || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const moodLabels = {
        ANGRY: 'в ярости (кипит)',
        TIRED: 'выгорел (сил нет)',
        SUCCESS: 'доволен собой (красава)',
        LONELY: 'тоскует по дому'
      };

      const prompt = `Мужик обратился к тебе за "душевным перекуром". Его настрой: ${selectedMood ? moodLabels[selectedMood] : 'обычный'}. 
      Он говорит: "${psychInput}".
      Твоя роль: Бугор, который стал для него батей или старшим братом. 
      Стиль: Суровый, но поддерживающий. Никаких "клинических" терминов. Используй строительные метафоры (крепкий фундамент, арматура души, не давай трещину). 
      Цель: Дать ему выговориться и поддержать так, чтобы он пошел дальше работать со светлой головой.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setResult(response.text || 'Бугор молча затянулся и кивнул. Попробуй еще раз.');
      setPsychInput('');
    } catch (err: any) {
      setResult('Связь оборвалась. Посиди в тишине минутку.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (specificDish?: any, specificGear?: any) => {
    if (!city.trim() && !specificDish && !specificGear) return;
    setLoading(true);
    setResult(null);
    setSources([]);

    let query = '';
    const queries = {
      SAUNA: `Лучшие бани и сауны в городе ${city}. Точные адреса и телефоны. Совет от Бугра про веник.`,
      CAMPING: `Места для отдыха на природе рядом с городом ${city}. Как доехать.`,
      BEER: `Где купить нормальное пиво в городе ${city}? Адреса и закуски.`,
      SLEEP: `Где переночевать в городе ${city}? Хостелы, общаги. Цены.`,
      KITCHEN: `Где поесть в городе ${city}? Столовые, пельменные.`,
      GEAR: `Спецодежда и инструмент в городе ${city}. Адреса.`,
      DATE: `Куда сводить девушку в городе ${city}, чтоб прилично и не пафосно?`,
      PSYCHOLOGY: '' // Отдельный метод
    };
    query = queries[activeTab];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: { tools: [{ googleSearch: {} }] }
      });

      setResult(response.text || 'Ничего не нашел, мужик.');
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setSources(response.candidates[0].groundingMetadata.groundingChunks);
      }
    } catch (err: any) {
      setResult(`Сбой связи: ${err.message || 'Ошибка доступа'}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs: {id: RestTab, label: string, icon: string}[] = [
    { id: 'PSYCHOLOGY', label: 'ПЕРЕКУР', icon: '🚬' },
    { id: 'SAUNA', label: 'БАНЬКИ', icon: '🧖‍♂️' },
    { id: 'KITCHEN', label: 'КУХНЯ', icon: '🥘' },
    { id: 'GEAR', label: 'ШМОТ', icon: '🥾' },
    { id: 'DATE', label: 'С ДЕВУШКОЙ', icon: '🌹' },
    { id: 'SLEEP', label: 'НОЧЛЕГ', icon: '🛌' },
    { id: 'BEER', label: 'ПИВНОЙ ГИД', icon: '🍺' }
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
               <span className="text-[7px] text-zinc-500 font-black uppercase tracking-widest italic mono">RELAX_CORE_v2.1</span>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-[#121212] p-6 rounded-[35px] border border-white/5 mb-6 shadow-2xl relative">
         <div className="flex gap-2 p-1 bg-black rounded-2xl mb-6 border border-white/5 overflow-x-auto no-scrollbar">
            {tabs.map(t => (
              <button 
                key={t.id} 
                onClick={() => { setActiveTab(t.id); setResult(null); }}
                className={`flex-none px-5 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === t.id ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-zinc-600'}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
         </div>

         {activeTab === 'PSYCHOLOGY' ? (
           <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-left">
                 <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2">ДУШЕВНЫЙ ПЕРЕКУР</h3>
                 <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                   Бугор готов выслушать. Выбирай настрой и выплескивай всё как есть. <br/> <span className="text-red-900">АНОНИМНО. ТОЛЬКО ДЛЯ ТЕБЯ.</span>
                 </p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                 {[
                   { id: 'ANGRY', icon: '😤', label: 'КИПЛЮ' },
                   { id: 'TIRED', icon: '🔋', label: 'СДОХ' },
                   { id: 'SUCCESS', icon: '🏆', label: 'КРАСАВА' },
                   { id: 'LONELY', icon: '🏠', label: 'ТОСКУЮ' }
                 ].map(m => (
                   <button 
                    key={m.id}
                    onClick={() => setSelectedMood(m.id as Mood)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${selectedMood === m.id ? 'bg-[#D4AF37]/10 border-[#D4AF37] scale-105' : 'bg-black/40 border-white/5 grayscale opacity-50'}`}
                   >
                     <span className="text-xl">{m.icon}</span>
                     <span className="text-[7px] font-black text-zinc-400 uppercase">{m.label}</span>
                   </button>
                 ))}
              </div>

              <div className="relative">
                <textarea 
                  value={psychInput}
                  onChange={e => setPsychInput(e.target.value)}
                  placeholder="Что на душе, мужик?"
                  className="w-full bg-black border border-white/10 rounded-3xl p-5 text-white text-sm italic font-medium min-h-[120px] outline-none focus:border-[#D4AF37]/30 transition-all placeholder:text-zinc-800"
                />
                <button 
                  onClick={handlePsychologyTalk}
                  disabled={loading || !psychInput.trim()}
                  className={`absolute bottom-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${psychInput.trim() ? 'bg-[#D4AF37] text-black shadow-xl' : 'bg-zinc-900 text-zinc-700'}`}
                >
                  {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : '🚬'}
                </button>
              </div>
           </div>
         ) : (
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
         )}
      </div>

      <div className="space-y-6">
        {result && (
          <div className="flex flex-col gap-4 animate-slide-up">
            <div className={`p-6 rounded-[35px] border-l-4 shadow-xl relative overflow-hidden group ${activeTab === 'PSYCHOLOGY' ? 'bg-[#0a0a0a] border-zinc-700' : 'bg-[#1a1305] border-[#D4AF37]'}`}>
               <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">{activeTab === 'PSYCHOLOGY' ? '🌫️' : '👷‍♂️'}</div>
               <div className="flex flex-col text-left relative z-10">
                  <span className={`${activeTab === 'PSYCHOLOGY' ? 'bg-zinc-800 text-zinc-400' : 'bg-[#D4AF37] text-black'} text-[8px] font-black px-3 py-1 rounded-full uppercase italic w-fit mb-4`}>
                    {activeTab === 'PSYCHOLOGY' ? 'БУГОР ВЫСЛУШАЛ' : 'ИНСТРУКТАЖ БУГРА'}
                  </span>
                  <div className="text-white text-[13px] leading-relaxed italic font-medium whitespace-pre-wrap mb-6">
                    {result}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-white/5">
                     <button onClick={handleCopy} className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase transition-all ${copyStatus ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                       {copyStatus ? 'ГОТОВО ✓' : '📋 КОПИРОВАТЬ'}
                     </button>
                     {activeTab !== 'PSYCHOLOGY' && <button onClick={handleShare} className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase">🔗 ПОДЕЛИТЬСЯ</button>}
                     <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-[#D4AF37] text-black text-[8px] font-black uppercase">💾 В БАЗУ</button>
                  </div>
               </div>
            </div>

            {sources.length > 0 && activeTab !== 'PSYCHOLOGY' && (
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
      </div>
    </div>
  );
};

export default Rest;
