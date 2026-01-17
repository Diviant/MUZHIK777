
import React from 'react';
import { Screen } from '../types';

interface Props {
  navigate: (screen: Screen) => void;
}

const About: React.FC<Props> = ({ navigate }) => {
  const sections = [
    {
      title: "ЧТО ТАКОЕ ЦЕХ?",
      content: "Это цифровая артель для тех, кто работает руками и головой. Мы убрали жадных посредников, скрытые комиссии и бесполезных менеджеров. Здесь только прямая связь: Мужик — Мужику.",
      icon: "🏗️"
    },
    {
      title: "ДЛЯ КОГО ЭТО?",
      content: "Для вахтовиков на крайнем севере, для мастеров-одиночек, для бригад, строящих города, для водителей в рейсах и для парней, несущих службу. Если ты приносишь пользу — ты в Цехе.",
      icon: "👷‍♂️"
    },
    {
      title: "БЕЗ КОМИССИЙ",
      content: "Весь доход — твой. Мы не берем процент со сделок. Приложение живет за счет внутренней экономики баллов и поддержки сообщества. Работаешь честно — растешь в рейтинге.",
      icon: "💰"
    },
    {
      title: "БРАТСТВО И SOS",
      content: "Цех — это не только работа. Кнопка SOS связывает тебя с мужиками поблизости в экстренной ситуации. В дороге, на объекте или в поле — ты не один.",
      icon: "🚨"
    },
    {
      title: "ИНСТРУМЕНТЫ (PRO)",
      content: "Внутри встроен ИИ-Бугор для смет, тактический советник для службы, калькуляторы материалов и логистика билетов. Всё, что нужно спецу в одном терминале.",
      icon: "🛡️"
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-6 pb-32 overflow-y-auto no-scrollbar bg-[#050505] pt-safe h-full relative">
      <div className="absolute inset-0 blueprint opacity-20 pointer-events-none"></div>
      
      <header className="flex items-center gap-4 py-4 mb-8 sticky top-0 bg-[#050505]/90 backdrop-blur-md z-50 border-b border-white/5">
        <button onClick={() => navigate(Screen.WELCOME)} className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center text-[#D4AF37] active-press">
          ←
        </button>
        <div className="flex flex-col text-left">
          <h2 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">МАНИФЕСТ ЦЕХА</h2>
          <span className="text-[7px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-1 mono italic">ESTABLISHED_2024</span>
        </div>
      </header>

      <div className="relative mb-12">
        <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-[0.9] pr-4">
          ТРУД <br/> <span className="gold-text">БЕЗ ЦЕПЕЙ</span>
        </h1>
        <div className="h-1 w-20 bg-[#D4AF37] mt-6"></div>
      </div>

      <div className="space-y-8 relative z-10">
        {sections.map((s, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 shrink-0 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-xl">
                {s.icon}
              </div>
              <div className="flex flex-col text-left">
                <h3 className="text-sm font-black text-[#D4AF37] uppercase italic tracking-widest mb-2">{s.title}</h3>
                <p className="text-zinc-400 text-[13px] leading-relaxed font-medium italic opacity-90">
                  {s.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-zinc-900/40 border border-[#D4AF37]/20 rounded-[40px] text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full blueprint opacity-10 pointer-events-none"></div>
        <p className="text-white text-xs font-black uppercase italic leading-relaxed tracking-tight relative z-10">
          «В ЦЕХЕ СЛОВО МУЖИКА КРЕПЧЕ ЛЮБОГО КОНТРАКТА. МЫ СТРОИМ БУДУЩЕЕ СВОИМИ РУКАМИ.»
        </p>
        <div className="mt-6 text-[8px] text-[#D4AF37] font-black uppercase tracking-[0.5em] italic opacity-60">— СОВЕТ БУГРОВ</div>
      </div>

      <button 
        onClick={() => navigate(Screen.AUTH)}
        className="w-full mt-10 bg-[#D4AF37] text-black font-black py-5 rounded-[25px] uppercase italic tracking-tighter shadow-xl active:scale-95 transition-all"
      >
        ПРИСОЕДИНИТЬСЯ К БРАТСТВУ
      </button>
      
      <div className="py-10 text-center opacity-10">
         <span className="text-[7px] text-zinc-500 font-black uppercase tracking-[1em] mono">CORE_VERSION_FINAL_v4.6</span>
      </div>
    </div>
  );
};

export default About;
