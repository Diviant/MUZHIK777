
import React from 'react';
import { Screen } from '../types';

interface Props {
  navigate: (screen: Screen) => void;
}

const SOSRules: React.FC<Props> = ({ navigate }) => {
  return (
    <div className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto no-scrollbar bg-[#050505] pt-safe h-full relative">
      {/* Red Alert Background Accent */}
      <div className="absolute top-0 left-0 w-full h-80 bg-red-900 opacity-[0.03] blur-[100px] pointer-events-none"></div>
      
      <header className="flex items-center gap-4 py-4 mb-10 sticky top-0 bg-[#050505]/95 backdrop-blur-md z-50 border-b border-red-950/30">
        <button onClick={() => navigate(Screen.HOME)} className="w-11 h-11 bg-zinc-900 border border-red-600/20 rounded-2xl flex items-center justify-center text-red-600 active-press">
          ←
        </button>
        <div className="flex flex-col text-left">
          <h2 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none pr-4">УСТАВ SOS-КНОПКИ</h2>
          <span className="text-[7px] text-red-900 font-black uppercase tracking-[0.4em] mt-1 mono italic">EMERGENCY_PROTOCOL_v1.0</span>
        </div>
      </header>

      {/* 1. ТЕХНИЧЕСКОЕ ЗАДАНИЕ (НАЗНАЧЕНИЕ) */}
      <section className="mb-12 px-2 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-1.5 h-10 bg-red-600 rounded-full"></div>
           <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">ТЕХНИЧЕСКИЙ <br/> РЕГЛАМЕНТ</h3>
        </div>
        
        <div className="space-y-8">
           <div className="bg-zinc-900/40 p-6 rounded-[35px] border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-4xl italic font-black">PROC</div>
              <h4 className="text-[9px] text-red-600 font-black uppercase tracking-[0.3em] mb-4 italic">01. НАЗНАЧЕНИЕ СИСТЕМЫ</h4>
              <p className="text-zinc-400 text-xs font-medium leading-relaxed italic uppercase">
                Передача сигнала помощи в ситуациях угрозы жизни: ДТП, Травмы на объекте, Застревание в пути, Прямая угроза.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-3">
              {[
                { i: '🚗', l: 'ДТП', d: 'Аварии на трассе' },
                { i: '🏗️', l: 'ТРАВМА', d: 'Объектный риск' },
                { i: '❄️', l: 'ЗАСТРЯЛ', d: 'Снег/Бездорожье' },
                { i: '⚠️', l: 'УГРОЗА', d: 'Принуждение' }
              ].map((item, idx) => (
                <div key={idx} className="bg-black border border-white/5 p-5 rounded-[30px] flex flex-col items-center text-center">
                   <span className="text-2xl mb-2">{item.i}</span>
                   <span className="text-[10px] font-black text-white uppercase italic">{item.l}</span>
                   <span className="text-[7px] text-zinc-600 font-bold uppercase mt-1 tracking-widest">{item.d}</span>
                </div>
              ))}
           </div>

           <div className="bg-zinc-900/40 p-6 rounded-[35px] border border-white/5">
              <h4 className="text-[9px] text-red-600 font-black uppercase tracking-[0.3em] mb-4 italic">02. ПЕРЕДАВАЕМЫЕ ДАННЫЕ</h4>
              <ul className="space-y-3 font-mono text-[9px] text-zinc-500 uppercase">
                 <li className="flex items-center gap-3">
                    <span className="text-red-900">●</span> <span>ID_USER & IDENTITY_LOG</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <span className="text-red-900">●</span> <span>GPS_COORDINATES (PRECISION_MAP)</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <span className="text-red-900">●</span> <span>TIMESTAMP_UTC</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <span className="text-red-900">●</span> <span>SCENARIO_CODE</span>
                 </li>
              </ul>
           </div>
        </div>
      </section>

      {/* 2. ЮРИДИЧЕСКОЕ ОПИСАНИЕ */}
      <section className="mb-12 px-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-6">
           <div className="w-1.5 h-10 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
           <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">ЮРИДИЧЕСКИЙ <br/> ЩИТ</h3>
        </div>

        <div className="space-y-6">
           <div className="p-7 bg-[#111] border-l-4 border-blue-600 rounded-r-[35px] shadow-xl">
              <p className="text-[#D4D4D8] text-[13px] leading-relaxed italic font-medium">
                «SOS — функция оповещения доверенных лиц и пользователей рядом. <br/> 
                <span className="text-white font-black">Приложение не является экстренной службой.</span> <br/> 
                В случае угрозы жизни немедленно обращайтесь в 112.»
              </p>
           </div>

           <div className="bg-zinc-900/20 border border-white/5 p-6 rounded-[35px] space-y-5">
              <div className="flex flex-col gap-1">
                 <h5 className="text-[10px] font-black text-white uppercase italic">ПРАВОВОЙ СТАТУС</h5>
                 <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                   Функция является информационно-уведомительным инструментом. Мы не гарантируем отклик или оказание физической помощи.
                 </p>
              </div>

              <div className="flex flex-col gap-1">
                 <h5 className="text-[10px] font-black text-white uppercase italic">ОТВЕТСТВЕННОСТЬ ПОЛЬЗОВАТЕЛЯ</h5>
                 <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                   Злоупотребление (ложный вызов) ведет к блокировке аккаунта. Ты подтверждаешь достоверность данных.
                 </p>
              </div>

              <div className="flex flex-col gap-1">
                 <h5 className="text-[10px] font-black text-white uppercase italic">ПЕРСОНАЛЬНЫЕ ДАННЫЕ</h5>
                 <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                   Активация SOS дает согласие на временную передачу геолокации и контактов пользователям в радиусе охвата.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <div className="mt-10 mb-20 px-2 text-center">
         <button 
           onClick={() => navigate(Screen.HOME)}
           className="w-full bg-white text-black font-black py-6 rounded-[30px] uppercase italic tracking-tighter shadow-2xl active-press text-lg"
         >
            Я ОЗНАКОМЛЕН И ПОДТВЕРЖДАЮ
         </button>
         <p className="text-[7px] text-zinc-800 font-black uppercase tracking-[0.6em] mt-8 mono italic">CORE_PROTOCOL_SIGNED</p>
      </div>
    </div>
  );
};

export default SOSRules;
