
import React, { useState } from 'react';
import { Screen, Hitchhiker, Location, User } from '../types';
import Layout from './Layout';
import WorkshopCard from './WorkshopCard';

interface Props {
  hitchhikers: Hitchhiker[];
  navigate: (screen: Screen) => void;
  onAddHitchhiker: (h: Hitchhiker) => void;
  location: Location | null;
  onStartChat: (participant: Partial<User>) => void;
}

const Hitchhikers: React.FC<Props> = ({ hitchhikers, navigate, onAddHitchhiker, location, onStartChat }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Hitchhiker>>({
    routeFrom: '',
    routeTo: '',
    price: '',
    carModel: '',
    seats: 1,
    description: '',
    canTakeCargo: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddHitchhiker({
      ...formData as Hitchhiker,
      id: Date.now().toString(),
      authorId: 'user-id',
      name: 'Водитель',
      contact: 'https://t.me/driver_tg',
      departureDate: new Date().toISOString().split('T')[0]
    });
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <Layout title="ДОБАВИТЬ ПОЕЗДКУ" onBack={() => setIsCreating(false)}>
        <form onSubmit={handleSubmit} className="space-y-4 pb-20">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Откуда</label>
              <input 
                placeholder="ГОРОД А" 
                className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none focus:border-[#D4AF37]/40" 
                onChange={e => setFormData({...formData, routeFrom: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Куда</label>
              <input 
                placeholder="ГОРОД Б" 
                className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none focus:border-[#D4AF37]/40" 
                onChange={e => setFormData({...formData, routeTo: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Автомобиль</label>
            <input 
              placeholder="МАРКА / МОДЕЛЬ" 
              className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none focus:border-[#D4AF37]/40" 
              onChange={e => setFormData({...formData, carModel: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Свободно мест</label>
              <input 
                type="number"
                placeholder="1" 
                className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none focus:border-[#D4AF37]/40" 
                onChange={e => setFormData({...formData, seats: Number(e.target.value)})} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Цена с человека</label>
              <input 
                placeholder="₽" 
                className="w-full bg-[#121212] card-border rounded-xl p-4 gold-text font-black outline-none focus:border-[#D4AF37]/40" 
                onChange={e => setFormData({...formData, price: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <button 
              type="button"
              onClick={() => setFormData({...formData, canTakeCargo: !formData.canTakeCargo})}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${formData.canTakeCargo ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/5 bg-zinc-900 text-zinc-500'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">📦 ЗАБЕРУ ПОПУТНЫЙ ГРУЗ</span>
              <div className={`w-5 h-5 rounded flex items-center justify-center border ${formData.canTakeCargo ? 'bg-[#D4AF37] border-none text-black' : 'border-white/20 text-transparent'}`}>✓</div>
            </button>
            
            {formData.canTakeCargo && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl animate-in fade-in zoom-in duration-200">
                <p className="text-[9px] text-red-500 font-bold uppercase italic leading-tight text-center">
                  ⚠️ ПРИНИМАЯ ГРУЗ, ТЫ ОБЯЗАН ПРОВЕРИТЬ СОДЕРЖИМОЕ. <br/> ЦЕХ НЕ НЕСЕТ ОТВЕТСТВЕННОСТИ ЗА ТВОЙ БАГАЖНИК!
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Комментарий</label>
            <textarea 
              placeholder="Опиши время выезда, багажник, остановки..." 
              className="w-full bg-[#121212] card-border rounded-xl p-4 text-white outline-none min-h-[100px] focus:border-[#D4AF37]/40" 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <button type="submit" className="w-full bg-[#D4AF37] text-black font-black py-5 rounded-2xl uppercase italic shadow-2xl active:scale-95 transition-transform">
            ОПУБЛИКОВАТЬ ПОЕЗДКУ
          </button>
        </form>
      </Layout>
    );
  }

  return (
    <Layout title="ПОПУТЧИКИ" onBack={() => navigate(Screen.HOME)} subtitle="Дорожное братство">
      <button 
        onClick={() => setIsCreating(true)} 
        className="active-scale w-full bg-gradient-to-r from-[#D4AF37] to-[#9A7D0A] text-black font-black py-4.5 rounded-2xl uppercase italic tracking-tighter shadow-xl mb-6 flex items-center justify-center gap-2"
      >
        <span className="text-xl">🚗</span>
        Я ВОДИТЕЛЬ (ЕСТЬ МЕСТА)
      </button>

      <div className="space-y-4 pb-20">
        {hitchhikers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-10">
            <span className="text-6xl mb-4">🛣️</span>
            <p className="font-black italic uppercase tracking-widest">Машин пока нет</p>
          </div>
        ) : (
          hitchhikers.map((item) => (
            <WorkshopCard
              key={item.id}
              badge={item.carModel || 'ПОЕЗДКА'}
              title={`${item.routeFrom} → ${item.routeTo}`}
              price={item.price}
              description={item.description}
              footerLeft={
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-black">💺 МЕСТ: {item.seats}</span>
                    {item.canTakeCargo && <span className="text-[8px] bg-blue-900/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-900/20 font-black">📦 БЕРУ ГРУЗ</span>}
                  </div>
                  <span className="text-[8px] text-zinc-600 font-bold uppercase mono">{item.departureDate}</span>
                </div>
              }
              footerRight={
                <div className="flex gap-2">
                  <button onClick={() => onStartChat({ id: item.authorId, firstName: item.name })} className="bg-white text-black text-[10px] font-black px-5 py-2.5 rounded-xl uppercase italic shadow-md active:scale-90 transition-transform">ЧАТ</button>
                  <a href={item.contact} target="_blank" className="bg-zinc-900 text-zinc-500 text-[10px] font-black px-4 py-2.5 rounded-xl">TG</a>
                </div>
              }
            />
          ))
        )}
      </div>
    </Layout>
  );
};

export default Hitchhikers;
