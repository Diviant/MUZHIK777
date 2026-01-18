
import React, { useState, useEffect, useRef } from 'react';
import { User, SOSScenario } from '../types';
import { db } from '../database';

interface Props {
  user: User;
  onClose: () => void;
}

const SCENARIOS: { id: SOSScenario; icon: string; label: string }[] = [
  { id: 'ACCIDENT', icon: '🚗', label: 'ДТП' },
  { id: 'INJURY', icon: '🏗️', label: 'ТРАВМА' },
  { id: 'STUCK', icon: '❄️', label: 'ЗАСТРЯЛ' },
  { id: 'THREAT', icon: '⚠️', label: 'УГРОЗА' },
  { id: 'OTHER', icon: '❓', label: 'ДРУГОЕ' },
];

const SOSOverlay: React.FC<Props> = ({ user, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [step, setStep] = useState<'TIMER' | 'SCENARIO' | 'DETAILS' | 'SENT'>('TIMER');
  const [selectedScenario, setSelectedScenario] = useState<SOSScenario | null>(null);
  const [textDetails, setTextDetails] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [voiceUrl, setVoiceUrl] = useState<string | undefined>(undefined);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step === 'TIMER') {
      if (timeLeft === 0) {
        setStep('SCENARIO');
        return;
      }
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      setRecTime(0);

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceUrl(reader.result as string);
          handleFinalSend(undefined, reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      recTimerRef.current = setInterval(() => {
        setRecTime(prev => {
          if (prev >= 5) {
            stopRecording();
            return 5;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      alert('Нет доступа к микрофону, мужик!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    }
  };

  const handleScenarioSelect = (scenario: SOSScenario) => {
    setSelectedScenario(scenario);
    setStep('DETAILS');
  };

  const handleFinalSend = async (msg?: string, voice?: string) => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await db.sendSOS(user.id, user.firstName, {
        scenario: selectedScenario || 'OTHER',
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        timestamp: Date.now(),
        message: msg || textDetails,
        voiceUrl: voice || voiceUrl
      });
      setStep('SENT');
      if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
    }, () => {
      alert('Без GPS тебя не найдут! Включи геолокацию.');
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-red-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 overflow-y-auto no-scrollbar">
      {step === 'TIMER' && (
        <div className="text-center animate-in zoom-in duration-300">
           <div className="w-40 h-40 rounded-full border-8 border-red-600 flex items-center justify-center mb-10 relative">
              <div className="absolute inset-0 border-8 border-red-400 rounded-full animate-ping opacity-20"></div>
              <span className="text-6xl font-black text-white italic">{timeLeft}</span>
           </div>
           <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">СИГНАЛ SOS</h2>
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mb-12 italic">ОЖИДАНИЕ {timeLeft} СЕК...</p>
           
           <button onClick={() => setStep('SCENARIO')} className="w-full bg-white text-black font-black py-5 rounded-[25px] uppercase italic tracking-tighter shadow-2xl active:scale-95 transition-all mb-4">
             ВЫБРАТЬ СИТУАЦИЮ
           </button>
           <button onClick={onClose} className="text-zinc-700 font-black uppercase text-[10px] tracking-widest italic">ОТМЕНА</button>
        </div>
      )}

      {step === 'SCENARIO' && (
        <div className="w-full max-w-sm animate-in slide-in-from-bottom-10 duration-500">
           <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8 text-center leading-tight">ЧТО СЛУЧИЛОСЬ, <br/> МУЖИК?</h2>
           <div className="space-y-3">
              {SCENARIOS.map(s => (
                <button 
                  key={s.id}
                  onClick={() => handleScenarioSelect(s.id)}
                  className="w-full p-6 bg-white/5 border border-white/10 rounded-[35px] flex items-center gap-6 active-press transition-all hover:bg-white/10"
                >
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-lg font-black text-white uppercase italic">{s.label}</span>
                </button>
              ))}
           </div>
        </div>
      )}

      {step === 'DETAILS' && (
        <div className="w-full max-w-sm animate-in fade-in duration-300 text-center">
           <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-4xl">{SCENARIOS.find(s => s.id === selectedScenario)?.icon}</span>
           </div>
           <h2 className="text-2xl font-black text-white uppercase italic mb-8 tracking-tighter">ВНЕСИ КОНКРЕТИКУ</h2>
           
           <div className="space-y-4">
              <button 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`w-full p-8 rounded-[40px] border flex flex-col items-center justify-center gap-3 transition-all active:scale-95 ${isRecording ? 'bg-red-600 border-white animate-pulse shadow-[0_0_40px_red]' : 'bg-white/5 border-red-600/30'}`}
              >
                 <span className="text-4xl">{isRecording ? '🛑' : '🎙️'}</span>
                 <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">
                   {isRecording ? `ЗАПИСЬ: 0:0${recTime}` : 'ЗАЖМИ: ГОЛОС (5 СЕК)'}
                 </span>
              </button>

              <div className="relative">
                <input 
                  type="text"
                  value={textDetails}
                  onChange={e => setTextDetails(e.target.value)}
                  placeholder="ИЛИ НАПИШИ ПАРУ СЛОВ..."
                  className="w-full h-16 bg-black border border-white/10 rounded-[25px] px-6 text-white text-xs font-bold outline-none focus:border-red-600/40 text-center uppercase"
                />
              </div>

              <button 
                onClick={() => handleFinalSend()}
                className="w-full bg-red-600 text-white font-black py-5 rounded-[25px] uppercase italic shadow-2xl active-press"
              >
                ОТПРАВИТЬ СИГНАЛ
              </button>
           </div>
           
           <button onClick={() => setStep('SCENARIO')} className="mt-8 text-zinc-600 font-black uppercase text-[9px] tracking-widest italic">НАЗАД</button>
        </div>
      )}

      {step === 'SENT' && (
        <div className="text-center animate-in zoom-in duration-500">
           <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(22,163,74,0.5)]">
              <span className="text-5xl">✓</span>
           </div>
           <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">СИГНАЛ УШЕЛ</h2>
           <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest mb-12 italic max-w-[240px] mx-auto leading-relaxed">
             Твои координаты и подробности отправлены мужикам в эфир. Держись, помощь летит.
           </p>
           
           <div className="flex flex-col gap-4">
              <a href="tel:112" className="w-full bg-white text-black font-black py-6 rounded-[30px] uppercase italic shadow-2xl flex items-center justify-center gap-4 text-xl">
                📞 ВЫЗОВ 112
              </a>
              <button onClick={onClose} className="w-full bg-zinc-900 border border-white/10 text-white font-black py-5 rounded-[25px] uppercase italic text-xs">
                ЗАКРЫТЬ ТЕРМИНАЛ
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SOSOverlay;
