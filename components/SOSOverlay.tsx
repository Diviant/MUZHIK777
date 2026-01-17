
import React, { useState, useEffect, useRef } from 'react';
import { User, SOSScenario } from '../types';
import { db } from '../database';

interface Props {
  user: User;
  onClose: () => void;
}

const SOS_SCENARIOS: { id: SOSScenario; label: string; icon: string }[] = [
  { id: 'ACCIDENT', label: 'ДТП', icon: '🚗' },
  { id: 'INJURY', label: 'ТРАВМА', icon: '🏗️' },
  { id: 'STUCK', label: 'ЗАСТРЯЛ', icon: '❄️' },
  { id: 'THREAT', label: 'УГРОЗА', icon: '⚠️' },
  { id: 'OTHER', label: 'ДРУГОЕ', icon: '❓' },
];

const SOSOverlay: React.FC<Props> = ({ user, onClose }) => {
  const [step, setStep] = useState<'TIMER' | 'SCENARIO' | 'SUCCESS'>('TIMER');
  const [timeLeft, setTimeLeft] = useState(5);
  const [sentScenario, setSentScenario] = useState<SOSScenario | null>(null);
  // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to resolve "Cannot find namespace 'NodeJS'" in browser environment
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Вибрация при активации (если поддерживается)
  useEffect(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 500]);
    }
  }, []);

  useEffect(() => {
    if (step === 'TIMER') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const handleAutoSOS = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sendSignal('OTHER');
  };

  const sendSignal = async (scenario: SOSScenario) => {
    setSentScenario(scenario);
    setStep('SUCCESS');
    
    // Получаем геолокацию
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await db.sendSOS(user.id, user.firstName, {
        scenario,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        timestamp: Date.now()
      });
    }, async () => {
      // Даже если нет GPS, шлем сигнал без координат
      await db.sendSOS(user.id, user.firstName, {
        scenario,
        lat: 0,
        lng: 0,
        timestamp: Date.now()
      });
    });

    // Авто-закрытие через 3 сек после успеха
    setTimeout(onClose, 3000);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none"></div>
      
      {step === 'TIMER' && (
        <div className="text-center animate-in zoom-in duration-300">
           <div className="w-40 h-40 rounded-full border-8 border-red-600 flex items-center justify-center mb-10 relative">
              <div className="absolute inset-0 border-8 border-red-400 rounded-full animate-ping opacity-20"></div>
              <span className="text-6xl font-black text-white italic">{timeLeft}</span>
           </div>
           <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">СИГНАЛ SOS</h2>
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mb-12 italic">ОТПРАВКА ЧЕРЕЗ {timeLeft} СЕК...</p>
           
           <button 
             onClick={() => setStep('SCENARIO')}
             className="w-full bg-white text-black font-black py-5 rounded-[25px] uppercase italic tracking-tighter shadow-2xl active:scale-95 transition-all mb-4"
           >
             ВЫБРАТЬ СИТУАЦИЮ
           </button>
           
           <button 
             onClick={onClose}
             className="text-zinc-700 font-black uppercase text-[10px] tracking-widest italic"
           >
             ОТМЕНА (Я В ПОРЯДКЕ)
           </button>
        </div>
      )}

      {step === 'SCENARIO' && (
        <div className="w-full max-w-sm animate-in slide-in-from-bottom-10 duration-500">
           <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8 text-center">ЧТО СЛУЧИЛОСЬ?</h2>
           <div className="grid grid-cols-2 gap-4">
              {SOS_SCENARIOS.map(s => (
                <button 
                  key={s.id}
                  onClick={() => sendSignal(s.id)}
                  className="bg-zinc-900/80 border border-white/5 p-8 rounded-[35px] flex flex-col items-center justify-center active:bg-red-600 transition-all group"
                >
                   <span className="text-4xl mb-4 group-active:scale-125 transition-transform">{s.icon}</span>
                   <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest group-active:text-white">{s.label}</span>
                </button>
              ))}
           </div>
           <button 
             onClick={onClose}
             className="w-full mt-12 text-zinc-700 font-black uppercase text-[10px] tracking-widest italic"
           >
             ЗАКРЫТЬ
           </button>
        </div>
      )}

      {step === 'SUCCESS' && (
        <div className="text-center animate-in zoom-in duration-300">
           <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(22,163,74,0.4)]">
              <span className="text-5xl text-white">✓</span>
           </div>
           <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">СИГНАЛ ОТПРАВЛЕН</h2>
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-10 px-6 italic">
              Твои координаты и статус переданы в Цех. Помощь скоро будет. <br/> Если можешь — позвони 112.
           </p>
           <a 
             href="tel:112"
             className="inline-block bg-red-600 text-white font-black px-10 py-5 rounded-[22px] uppercase italic tracking-widest shadow-xl shadow-red-900/40"
           >
              ПОЗВОНИТЬ 112
           </a>
        </div>
      )}
    </div>
  );
};

export default SOSOverlay;
