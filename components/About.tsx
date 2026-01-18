
import React from 'react';
import { Screen } from '../types';

interface Props {
  navigate: (screen: Screen) => void;
}

const About: React.FC<Props> = ({ navigate }) => {
  return (
    <div className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto no-scrollbar bg-[#050505] pt-safe h-full relative">
      <div className="absolute inset-0 blueprint opacity-10 pointer-events-none"></div>
      
      {/* HEADER */}
      <header className="flex items-center gap-4 py-4 mb-10 sticky top-0 bg-[#050505]/95 backdrop-blur-md z-50 border-b border-white/5">
        <button onClick={() => navigate(Screen.WELCOME)} className="w-11 h-11 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl">
          ←
        </button>
        <div className="flex flex-col text-left">
          <h2 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">АРХИТЕКТУРА ЦЕХА</h2>
          <span className="text-[7px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-1 mono italic">SYSTEM_MANIFESTO_v8.0</span>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="relative mb-16 px-2">
        <div className="absolute -top-20 -left-10 w-80 h-80 bg-[#D4AF37] opacity-[0.05] blur-[120px] rounded-full"></div>
        <h1 className="text-[70px] font-black text-white italic uppercase tracking-tighter leading-[0.8] mb-6">
          ТРУД <br/> <span className="gold-text">БЕЗ ЦЕПЕЙ</span>
        </h1>
        <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.15em] leading-relaxed italic border-l-2 border-[#D4AF37] pl-4">
          Это цифровая крепость. <br/> 
          Здесь мастер — это закон, <br/>
          а слово — это контракт.
        </p>
      </div>

      {/* 1. ECONOMY */}
      <div className="mb-14">
        <div 
          className="p-8 rounded-[45px] border border-[#D4AF37]/40 relative shadow-2xl overflow-hidden"
          style={{ 
            background: 'radial-gradient(circle at 50% -20%, rgba(212, 175, 55, 0.2) 0%, #0a0a0a 85%)' 
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full blueprint opacity-[0.15] pointer-events-none"></div>
          <div className="flex flex-col items-center text-center mb-10 relative z-10">
             <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-3xl flex items-center justify-center mb-6 border border-[#D4AF37]/30 shadow-inner">
                <span className="text-4xl drop-shadow-2xl">🪙</span>
             </div>
             <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">БАЛЛЫ И БРАТСТВО</h2>
             <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-[240px] italic">
                В Цехе нет комиссий. Мы используем баллы влияния для работы внутри системы.
             </p>
          </div>

          <div className="space-y-3 relative z-10">
            {[
              { l: 'ПРИВЕТСТВЕННЫЙ КУШ', v: '+1300 🪙', d: 'Начисляем сразу после входа на развитие.' },
              { l: 'РЕФЕРАЛЬНАЯ СЕТЬ', v: '+50 🪙', d: 'За каждого мужика, кто зашел по твоей ссылке.' },
              { l: 'ПОДНЯТЬ ОБЪЯВЛЕНИЕ', v: '-50 🪙', d: 'Стоимость публикации в общую ленту.' },
              { l: 'PRO-СТАТУС (БЕЗЛИМИТ)', v: '1000 🪙', d: 'Активация всех ИИ-советников навсегда.' }
            ].map((item, i) => (
              <div key={i} className="bg-black/60 border border-white/5 p-5 rounded-[28px] flex items-center justify-between group">
                 <div className="text-left flex-1 pr-4">
                    <h5 className="text-[10px] text-white font-black uppercase italic mb-1">{item.l}</h5>
                    <p className="text-[9px] text-zinc-600 font-medium italic leading-tight uppercase">{item.d}</p>
                 </div>
                 <div className="text-right">
                    <span className="gold-text font-black text-sm italic whitespace-nowrap">{item.v}</span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. PRO MODULE: AI BUGOR */}
      <div className="mb-10 px-2">
         <span className="text-[9px] text-[#D4AF37] font-black uppercase tracking-[0.5em] mb-4 block italic">PRO_MODULE_01 // ENGINEERING</span>
         <div 
          className="p-8 rounded-[50px] border border-[#D4AF37]/30 relative shadow-2xl overflow-hidden"
          style={{ background: 'radial-gradient(circle at 0% 0%, rgba(212, 175, 55, 0.15) 0%, #080808 80%)' }}
         >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl font-black italic">ENG</div>
            <div className="flex items-center gap-5 mb-8 relative z-10">
               <div className="w-16 h-16 bg-[#D4AF37] rounded-[22px] flex items-center justify-center text-black text-3xl shadow-xl shadow-[#D4AF37]/10">🤖</div>
               <div className="flex flex-col text-left">
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">ИИ-БУГОР</h3>
                  <p className="text-[8px] text-[#D4AF37] font-black uppercase tracking-[0.3em] mt-2 italic opacity-60">ТЕХНИЧЕСКИЙ ЭКСПЕРТ</p>
               </div>
            </div>

            <div className="space-y-6 relative z-10">
               {[
                 { t: 'СМЕТЫ И РАСЧЕТЫ', d: 'Считает кубы бетона, тоннаж арматуры и расход смеси по фото или размерам.' },
                 { t: 'ГОСТ И ТЕХНОЛОГИИ', d: 'Знает все нормы. Спроси, какой зазор делать в кладке или марку стали для швеллера.' },
                 { t: 'ПОДБОР ИНСТРУМЕНТА', d: 'Сравнит перфораторы, найдет запчасти и подскажет, где аренда дешевле.' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 group">
                    <div className="w-1 h-auto bg-[#D4AF37]/30 rounded-full"></div>
                    <div className="text-left">
                       <h4 className="text-white font-black text-[11px] uppercase italic mb-1">{item.t}</h4>
                       <p className="text-zinc-500 text-[11px] font-medium leading-relaxed italic uppercase">{item.d}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* 3. PRO MODULE: AGRO_VETERAN (NEW) */}
      <div className="mb-10 px-2">
         <span className="text-[9px] text-green-500 font-black uppercase tracking-[0.5em] mb-4 block italic">PRO_MODULE_05 // AGRO_SYSTEM</span>
         <div 
          className="p-8 rounded-[50px] border border-green-500/30 relative shadow-2xl overflow-hidden"
          style={{ background: 'radial-gradient(circle at 100% 100%, rgba(34, 197, 94, 0.1) 0%, #080808 80%)' }}
         >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl font-black italic text-green-500">AGRO</div>
            <div className="flex items-center gap-5 mb-8 relative z-10">
               <div className="w-16 h-16 bg-green-700 rounded-[22px] flex items-center justify-center text-white text-3xl shadow-xl">🚜</div>
               <div className="flex flex-col text-left">
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">АГРОНОМ</h3>
                  <p className="text-[8px] text-green-500 font-black uppercase tracking-[0.3em] mt-2 italic opacity-60">СОВЕТНИК КФХ</p>
               </div>
            </div>

            <div className="space-y-6 relative z-10">
               {[
                 { t: 'ВЕТЕРИНАРИЯ', d: 'Скинь симптомы скотины — ИИ подскажет диагноз и дозы лекарств по ГОСТу.' },
                 { t: 'РЫНОК КОРМОВ', d: 'Пробивает лучшие цены на зерно, сено и комбикорм в твоем районе через радар.' },
                 { t: 'СУБСИДИИ И ГРАНТЫ', d: 'Как мужику получить помощь от государства? Весь расклад по документам для фермеров.' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 group">
                    <div className="w-1 h-auto bg-green-500/30 rounded-full"></div>
                    <div className="text-left">
                       <h4 className="text-white font-black text-[11px] uppercase italic mb-1">{item.t}</h4>
                       <p className="text-zinc-500 text-[11px] font-medium leading-relaxed italic uppercase">{item.d}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* 4. PRO MODULE: MILITARY ADVISOR */}
      <div className="mb-10 px-2">
         <span className="text-[9px] text-green-600 font-black uppercase tracking-[0.5em] mb-4 block italic">PRO_MODULE_02 // TACTICAL</span>
         <div 
          className="p-8 rounded-[50px] border border-green-600/30 relative shadow-2xl overflow-hidden"
          style={{ background: 'radial-gradient(circle at 100% 0%, rgba(34, 197, 94, 0.1) 0%, #080808 80%)' }}
         >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl font-black italic">MIL</div>
            <div className="flex items-center gap-5 mb-8 relative z-10">
               <div className="w-16 h-16 bg-green-600 rounded-[22px] flex items-center justify-center text-white text-3xl shadow-xl shadow-green-900/20">🪖</div>
               <div className="flex flex-col text-left">
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">СТАРШИНА</h3>
                  <p className="text-[8px] text-green-500 font-black uppercase tracking-[0.3em] mt-2 italic opacity-60">ВОЕННЫЙ СОВЕТНИК</p>
               </div>
            </div>

            <div className="space-y-6 relative z-10">
               {[
                 { t: 'СНАРЯГА И БЫТ', d: 'Распишет честный список вещей на СВО: от термобелья до правильных жгутов.' },
                 { t: 'ТАКТИЧЕСКАЯ МЕДИЦИНА', d: 'Инструкции по самопомощи в «красной зоне» и наполнению аптечки.' },
                 { t: 'БЕЗОПАСНОСТЬ', d: 'Советы по работе с техникой, маскировке и связи в полевых условиях.' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 group">
                    <div className="w-1 h-auto bg-green-600/30 rounded-full"></div>
                    <div className="text-left">
                       <h4 className="text-white font-black text-[11px] uppercase italic mb-1">{item.t}</h4>
                       <p className="text-zinc-500 text-[11px] font-medium leading-relaxed italic uppercase">{item.d}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* 5. PRO MODULE: LEGAL ADVISOR */}
      <div className="mb-10 px-2">
         <span className="text-[9px] text-blue-400 font-black uppercase tracking-[0.5em] mb-4 block italic">PRO_MODULE_04 // LEGAL_SHIELD</span>
         <div 
          className="p-8 rounded-[50px] border border-blue-500/20 relative shadow-2xl overflow-hidden"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.1) 0%, rgba(59, 130, 246, 0.15) 60%, #080808 100%)' }}
         >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl font-black italic text-red-500">LEX</div>
            <div className="flex items-center gap-5 mb-8 relative z-10">
               <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-red-600 rounded-[22px] flex items-center justify-center text-white text-3xl shadow-xl">⚖️</div>
               <div className="flex flex-col text-left">
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">ЮРИСТ</h3>
                  <p className="text-[8px] text-blue-400 font-black uppercase tracking-[0.3em] mt-2 italic opacity-60">ПРАВОВАЯ ЗАЩИТА</p>
               </div>
            </div>

            <div className="space-y-6 relative z-10">
               {[
                 { t: 'РАЗБОР ТЕРОК', d: 'Подскажет, как юридически грамотно прижать заказчика за неуплату или косяки.' },
                 { t: 'ПРОВЕРКА КОНТРАКТОВ', d: 'Скинь фото договора — ИИ найдет скрытые пункты, где тебя пытаются нае**ть.' },
                 { t: 'БАЗА ДЛЯ САМОЗАНЯТЫХ', d: 'Все про налоги, патенты и права работяги в РФ. Твой щит против чиновников.' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 group">
                    <div className="w-1 h-auto bg-blue-500/30 rounded-full"></div>
                    <div className="text-left">
                       <h4 className="text-white font-black text-[11px] uppercase italic mb-1">{item.t}</h4>
                       <p className="text-zinc-500 text-[11px] font-medium leading-relaxed italic uppercase">{item.d}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* 6. PRO MODULE: PSYCHOLOGY */}
      <div className="mb-14 px-2">
         <span className="text-[9px] text-blue-500 font-black uppercase tracking-[0.5em] mb-4 block italic">PRO_MODULE_03 // MENTAL_SUPPORT</span>
         <div 
          className="p-8 rounded-[50px] border border-blue-500/30 relative shadow-2xl overflow-hidden"
          style={{ background: 'radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.1) 0%, #080808 90%)' }}
         >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl font-black italic">PSY</div>
            <div className="flex items-center gap-5 mb-8 relative z-10">
               <div className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-900/20">🚬</div>
               <div className="flex flex-col text-left">
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">ПЕРЕКУР</h3>
                  <p className="text-[8px] text-blue-500 font-black uppercase tracking-[0.3em] mt-2 italic opacity-60">ДУШЕВНЫЙ ПСИХОЛОГ</p>
               </div>
            </div>

            <div className="space-y-6 relative z-10">
               {[
                 { t: 'ПЕРЕЗАГРУЗКА', d: 'Выслушает, когда кипишь на заказчика или устал как собака. Поддержит без лишних соплей.' },
                 { t: 'ТЯГА К ДОМУ', d: 'Поможет справиться с тоской по семье в долгой командировке или на вахте.' },
                 { t: 'МУЖСКОЙ РАЗГОВОР', d: 'Анонимный чат, где можно выплеснуть всё, что не скажешь коллегам или жене.' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 group">
                    <div className="w-1 h-auto bg-blue-600/30 rounded-full"></div>
                    <div className="text-left">
                       <h4 className="text-white font-black text-[11px] uppercase italic mb-1">{item.t}</h4>
                       <p className="text-zinc-500 text-[11px] font-medium leading-relaxed italic uppercase">{item.d}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* FINAL CALL TO ACTION */}
      <div className="mt-10 mb-20 px-2 text-center">
        <div className="p-10 bg-[#111] border border-white/5 rounded-[60px] shadow-2xl relative overflow-hidden group active-press" onClick={() => navigate(Screen.AUTH)}>
           <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
           <span className="text-5xl mb-8 block">⚡</span>
           <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">ТЕРМИНАЛ ЖДЕТ</h3>
           <p className="text-zinc-500 text-xs font-medium italic mb-12 px-4 leading-relaxed uppercase">
             Входи, забирай 1300 баллов и <br/> вооружайся интеллектом Цеха.
           </p>
           <button className="w-full bg-[#D4AF37] text-black font-black py-7 rounded-[35px] uppercase italic tracking-tighter shadow-[0_20px_60px_rgba(212,175,55,0.25)] text-xl">
              ЗАПУСТИТЬ СИСТЕМУ
           </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="py-12 text-center opacity-30">
         <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.8em] mb-4 italic leading-none">ЦЕХ / МУЖИКИ ДЛЯ МУЖИКОВ</p>
         <div className="flex justify-center gap-10 grayscale mt-6">
            <span className="text-sm">⚒️</span>
            <span className="text-sm">🛡️</span>
            <span className="text-sm">⚓</span>
         </div>
         <p className="text-[6px] text-zinc-800 font-black uppercase tracking-[0.4em] mt-8 mono">END_OF_TRANSMISSION</p>
      </div>
    </div>
  );
};

export default About;
