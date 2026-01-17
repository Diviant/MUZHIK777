
import React, { useState } from 'react';
import { Screen, User } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  navigate: (screen: Screen) => void;
  user: User | null;
}

type SVOTab = 'GEAR' | 'RULES' | 'SPIRIT' | 'HOME' | 'CONSCRIPT';

const SVOCenter: React.FC<Props> = ({ navigate, user }) => {
  const [activeTab, setActiveTab] = useState<SVOTab>('GEAR');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const getAdvice = async (topic: string) => {
    setLoading(true);
    setAdvice(null);
    try {
      // Use process.env.API_KEY directly as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompts = {
        GEAR: "Составь список самого необходимого снаряжения (шмот, медицина, электроника) для СВО. Что брать обязательно, а что - лишний вес. Тон: суровый, практичный.",
        RULES: "Дай неписаные правила выживания и быта на СВО: безопасность, работа с техникой, дисциплина, отношения с товарищами. Тон: опытный старшина.",
        SPIRIT: "Как не выгореть и сохранить голову на СВО? Советы по борьбе со страхом, апатией и психологическим давлением. Тон: батя-наставник.",
        HOME: "Советы по связи с семьей, распределению выплат и подготовке близких к долгому отсутствию. Как решать бытовые вопросы из зоны СВО.",
        CONSCRIPT: "Дай советы призывнику на срочную службу: что брать с собой (разрешенка), как поставить себя в коллективе, как вести себя с офицерами и дедами, как пережить первый месяц и провести год с пользой. Тон: старший брат, прошедший службу."
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompts[activeTab as keyof typeof prompts],
        config: {
          systemInstruction: "Ты - ветеран-наставник, 'Старшина' в экосистеме ЦЕХ. Твоя задача - давать четкие, лаконичные советы мужикам по вопросам военной службы (СВО и срочка). Никакой политики, только выживание, быт, психология и мужская солидарность. Используй армейский сленг, но по делу."
        }
      });

      setAdvice(response.text || "Связь прервалась. Попробуй еще раз.");
    } catch (err) {
      setAdvice("Ошибка связи. Проверь VPN или ключ API.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'GEAR', label: 'СНАРЯГА', icon: '🎒' },
    { id: 'RULES', label: 'УСТАВ', icon: '🪖' },
    { id: 'SPIRIT', label: 'ДУХ', icon: '🛡️' },
    { id: 'HOME', label: 'ТЫЛ', icon: '🏠' },
    { id: 'CONSCRIPT', label: 'СРОЧКА', icon: '🪒' }
  ];

  return (
    <div className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto no-scrollbar bg-[#0D1108] pt-safe h-full relative">
      {/* Tactical Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C2B280 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <header className="flex items-center justify-between py-6 mb-6 sticky top-0 bg-[#0D1108]/90 backdrop-blur-md z-30 border-b border-[#3D4928]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(Screen.HOME)} className="w-11 h-11 bg-[#1A1F14] border border-[#3D4928] rounded-xl flex items-center justify-center text-[#C2B280] active-press">←</button>
          <div className="flex flex-col text-left">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">СЛУЖБА</h2>
            <span className="text-[8px] text-[#C2B280] font-black uppercase tracking-[0.4em] mt-1 mono">MILITARY_ADVISOR_v1.2</span>
          </div>
        </div>
      </header>

      {/* Tabs - Now 5 items, use flex-wrap or smaller gap */}
      <div className="grid grid-cols-5 gap-1.5 mb-8 relative z-10">
        {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => { setActiveTab(t.id as SVOTab); setAdvice(null); }}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${activeTab === t.id ? 'bg-[#3D4928] border-[#C2B280] text-white shadow-lg scale-105' : 'bg-[#1A1F14] border-[#3D4928] text-zinc-500 opacity-60'}`}
          >
            <span className="text-lg">{t.icon}</span>
            <span className="text-[6px] font-black uppercase tracking-widest text-center">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6 relative z-10">
        {!advice && !loading && (
          <div className="bg-[#1A1F14] border border-[#3D4928] p-8 rounded-[40px] text-center animate-in fade-in duration-500 shadow-2xl">
             <div className="w-20 h-20 bg-[#3D4928]/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C2B280]/20">
                <span className="text-4xl">{activeTab === 'CONSCRIPT' ? '🪒' : '🫡'}</span>
             </div>
             <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-3">
               {activeTab === 'CONSCRIPT' ? 'КУРС МОЛОДОГО БОЙЦА' : 'ДОКЛАД СТАРШИНЫ'}
             </h3>
             <p className="text-[10px] text-[#C2B280] font-bold uppercase tracking-widest leading-relaxed mb-10 italic">
               {activeTab === 'CONSCRIPT' 
                 ? "Собрался служить год? Выбирай раздел, раскидаю как не потерять себя и вернуться мужиком."
                 : "Выбирай раздел, мужик. Дам расклад по делу, чтобы голова была на месте, а снаряга не подвела."}
             </p>
             <button 
              onClick={() => getAdvice(activeTab)}
              className="w-full bg-[#C2B280] text-[#0D1108] font-black py-5 rounded-2xl uppercase italic tracking-tighter shadow-xl active:scale-95 transition-all border-b-4 border-[#8E7E4F]"
             >
               ПОЛУЧИТЬ ИНСТРУКТАЖ
             </button>
          </div>
        )}

        {loading && (
          <div className="py-20 text-center flex flex-col items-center">
             <div className="w-16 h-16 border-4 border-[#C2B280]/20 border-t-[#C2B280] rounded-full animate-spin mb-8"></div>
             <p className="text-[9px] text-[#C2B280] font-black uppercase tracking-[0.5em] animate-pulse">ШИФРОВКА_ДАННЫХ...</p>
          </div>
        )}

        {advice && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-[#1A1F14] border-l-4 border-[#C2B280] p-6 rounded-r-[35px] rounded-l-[5px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">{activeTab === 'CONSCRIPT' ? '🪒' : '🪖'}</div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-2 w-2 rounded-full bg-[#C2B280] animate-pulse"></div>
                   <span className="text-[9px] text-[#C2B280] font-black uppercase tracking-widest">ПЕРЕДАЧА_ПРИНЯТА</span>
                </div>
                <div className="text-[#E0E0E0] text-[14px] leading-relaxed italic font-medium whitespace-pre-wrap mb-6">
                   {advice}
                </div>
                <div className="flex gap-2 pt-6 border-t border-[#3D4928]">
                   <button 
                    onClick={() => { navigator.clipboard.writeText(advice); alert('Принято в буфер!'); }}
                    className="flex-1 bg-[#3D4928] text-[#C2B280] py-4 rounded-xl text-[9px] font-black uppercase tracking-widest italic"
                   >
                     📋 В ЗАМЕТКИ
                   </button>
                   <button 
                    onClick={() => setAdvice(null)}
                    className="flex-1 bg-[#1A1F14] border border-[#3D4928] text-zinc-500 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest italic"
                   >
                     ЗАКРЫТЬ
                   </button>
                </div>
             </div>
             
             <div className="mt-8 p-6 bg-red-950/10 border border-red-900/20 rounded-[30px] opacity-60">
                <p className="text-[8px] text-red-500 font-black uppercase italic leading-relaxed text-center tracking-[0.1em]">
                  ВНИМАНИЕ: СОВЕТЫ ИИ НОСЯТ ОЗНАКОМИТЕЛЬНЫЙ ХАРАКТЕР. СЛУШАЙ КОМАНДИРА И СВОЙ ИНСТИНКТ.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SVOCenter;
