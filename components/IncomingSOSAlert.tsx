
import React, { useState } from 'react';
import { SOSSignal, SOSScenario } from '../types';
import { db } from '../database';

interface Props {
  signal: SOSSignal;
  userLat: number;
  userLng: number;
  onResolve: () => void;
}

const SCENARIO_LABELS: Record<SOSScenario, string> = {
  ACCIDENT: 'ДТП',
  INJURY: 'ТРАВМА',
  STUCK: 'ЗАСТРЯЛ',
  THREAT: 'УГРОЗА',
  OTHER: 'ПОМОЩЬ'
};

const SCENARIO_ICONS: Record<SOSScenario, string> = {
  ACCIDENT: '🚗',
  INJURY: '🏗️',
  STUCK: '❄️',
  THREAT: '⚠️',
  OTHER: '🆘'
};

// Функция расчета расстояния (Haversine formula)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // км
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

const IncomingSOSAlert: React.FC<Props> = ({ signal, userLat, userLng, onResolve }) => {
  const [loading, setLoading] = useState(false);
  const distance = getDistance(userLat, userLng, signal.lat, signal.lng);

  const handleHelp = async () => {
    setLoading(true);
    await db.updateSOSStatus(signal.id, 'HELPING');
    setLoading(false);
    onResolve();
    alert(`Мужик, ты красава! Мы передали ${signal.userName}, что помощь в пути.`);
  };

  const handleResolved = async () => {
    setLoading(true);
    await db.updateSOSStatus(signal.id, 'RESOLVED');
    setLoading(false);
    onResolve();
  };

  return (
    <div className="w-full bg-red-950/30 border border-red-600/40 rounded-[35px] p-6 shadow-2xl animate-pulse-subtle relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl italic font-black">SOS</div>
      
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(220,38,38,0.4)]">
          {SCENARIO_ICONS[signal.scenario]}
        </div>
        <div className="flex flex-col text-left">
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">
            {SCENARIO_LABELS[signal.scenario]} • {signal.userName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[9px] text-red-500 font-black uppercase tracking-widest bg-red-600/10 px-2 py-0.5 rounded">
               {signal.status === 'SENT' ? 'НУЖНА ПОМОЩЬ' : 'В ПРОЦЕССЕ'}
             </span>
             <span className="text-[9px] text-zinc-500 font-black uppercase mono tracking-tighter">
               РАССТОЯНИЕ: {distance} км
             </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 relative z-10 mt-6">
        {signal.status === 'SENT' ? (
          <button 
            onClick={handleHelp}
            disabled={loading}
            className="flex-1 bg-white text-black font-black py-4 rounded-2xl uppercase italic text-[11px] tracking-widest shadow-xl active:scale-95 transition-all"
          >
            {loading ? 'СИГНАЛ...' : 'Я МОГУ ПОМОЧЬ'}
          </button>
        ) : (
          <button 
            onClick={handleResolved}
            disabled={loading}
            className="flex-1 bg-green-600 text-white font-black py-4 rounded-2xl uppercase italic text-[11px] tracking-widest shadow-xl active:scale-95 transition-all"
          >
            {loading ? '...' : 'ВОПРОС ЗАКРЫТ'}
          </button>
        )}
        <a 
          href={`https://www.google.com/maps?q=${signal.lat},${signal.lng}`}
          target="_blank"
          className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-xl shadow-lg active:scale-95 transition-all"
        >
          📍
        </a>
      </div>
    </div>
  );
};

export default IncomingSOSAlert;
