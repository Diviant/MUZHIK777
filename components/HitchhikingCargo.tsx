
import React, { useState } from 'react';
import { Screen, HitchhikingCargo, Location, User } from '../types';
import Layout from './Layout';
import WorkshopCard from './WorkshopCard';

interface Props {
  cargo: HitchhikingCargo[];
  navigate: (screen: Screen) => void;
  onAddCargo: (c: HitchhikingCargo) => void;
  location: Location | null;
  onStartChat: (participant: Partial<User>) => void;
}

const HitchhikingCargoScreen: React.FC<Props> = ({ cargo, navigate, onAddCargo, location, onStartChat }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '', routeFrom: '', routeTo: '', cargoType: 'Запчасти', weight: '', price: '', departureDate: '', description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCargo({ ...formData, id: Date.now().toString(), contact: 'https://t.me/your_tg', authorId: 'system' } as HitchhikingCargo);
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <Layout title="ОТПРАВИТЬ ГРУЗ" onBack={() => setIsCreating(false)}>
        <div className="bg-red-900/10 border border-red-500/20 p-5 rounded-2xl mb-6">
          <p className="text-[10px] text-red-500 font-black uppercase italic leading-tight text-center">
            ⚠️ ВНИМАНИЕ: ЗАПРЕЩЕНО ПЕРЕДАВАТЬ ОРУЖИЕ, НАРКОТИКИ И КОНТРАБАНДУ. <br/> 
            ВОДИТЕЛЬ ОБЯЗАН ОСМОТРЕТЬ ГРУЗ ПРИ ПРИЕМКЕ!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Что везем?" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none focus:border-[#D4AF37]/30" onChange={e => setFormData({...formData, title: e.target.value})} required />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Откуда" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none focus:border-[#D4AF37]/30" onChange={e => setFormData({...formData, routeFrom: e.target.value})} required />
            <input placeholder="Куда" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none focus:border-[#D4AF37]/30" onChange={e => setFormData({...formData, routeTo: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Вес (кг)" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none focus:border-[#D4AF37]/30" onChange={e => setFormData({...formData, weight: e.target.value})} />
            <input placeholder="Цена (₽)" className="w-full bg-[#121212] card-border rounded-xl p-4 text-[#D4AF37] font-black outline-none focus:border-[#D4AF37]/30" onChange={e => setFormData({...formData, price: e.target.value})} required />
          </div>
          <textarea placeholder="Описание груза и упаковки..." className="w-full bg-[#121212] card-border rounded-xl p-4 text-white outline-none min-h-[100px] focus:border-[#D4AF37]/30" onChange={e => setFormData({...formData, description: e.target.value})} />
          <button type="submit" className="w-full bg-[#D4AF37] text-black font-black py-5 rounded-2xl uppercase italic shadow-xl active:scale-95 transition-transform">
            ОПУБЛИКОВАТЬ ЗАЯВКУ
          </button>
        </form>
      </Layout>
    );
  }

  return (
    <Layout title="ПОПУТНЫЙ ГРУЗ" onBack={() => navigate(Screen.HOME)}>
      {/* ИНСТРУКТАЖ БУГРА */}
      <div className="bg-[#121212] border-l-4 border-red-600 p-5 rounded-2xl mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10 text-3xl">👮‍♂️</div>
        <h4 className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-2 italic">ИНСТРУКТАЖ ПО БЕЗОПАСНОСТИ:</h4>
        <p className="text-[11px] text-zinc-400 font-medium italic leading-relaxed">
          Мужики, в дороге всякое бывает. Если берешь груз — <span className="text-white font-black">СМОТРИ, ЧТО ВНУТРИ</span>. 
          Если там "запретка" (наркота, волыны, ворованное) — отвечать будешь ТЫ. Не стесняйся вскрывать коробки. 
          В Цехе крыс нет, но бдительность — твой щит.
        </p>
      </div>

      <button 
        onClick={() => setIsCreating(true)} 
        className="active-scale w-full bg-gradient-to-r from-[#D4AF37] to-[#9A7D0A] text-black font-black py-4.5 rounded-2xl uppercase italic tracking-tighter shadow-xl mb-8 flex items-center justify-center gap-2"
      >
        <span className="text-xl">📦</span>
        ПЕРЕДАТЬ ГРУЗ
      </button>

      <div className="space-y-4 pb-20">
        {cargo.length === 0 ? (
          <div className="text-center py-20 opacity-30 font-black italic uppercase">Грузов в поиске нет</div>
        ) : (
          cargo.map((item) => (
            <WorkshopCard
              key={item.id}
              badge={`${item.cargoType} • ${item.weight} кг`}
              title={item.title}
              price={item.price}
              description={item.description}
              footerLeft={
                <div className="flex flex-col">
                  <span className="text-[7px] text-zinc-600 font-black uppercase leading-none mb-1">МАРШРУТ</span>
                  <span className="text-[10px] text-white font-black uppercase italic truncate">{item.routeFrom} → {item.routeTo}</span>
                </div>
              }
              footerRight={
                <div className="flex gap-2">
                  <button onClick={() => onStartChat({ id: item.authorId || 'sys', firstName: 'Отправитель' })} className="bg-white text-black text-[10px] font-black px-4 py-2 rounded-xl uppercase italic shadow-md active:scale-90 transition-transform">ЧАТ</button>
                  <a href={item.contact} target="_blank" className="bg-zinc-900 text-zinc-500 text-[10px] font-black px-3 py-2 rounded-xl">TG</a>
                </div>
              }
            />
          ))
        )}
      </div>
    </Layout>
  );
};

export default HitchhikingCargoScreen;
