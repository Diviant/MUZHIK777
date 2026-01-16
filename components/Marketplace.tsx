
import React, { useState } from 'react';
import { Screen, MarketItem, Location, User } from '../types';
import Layout from './Layout';
import WorkshopCard from './WorkshopCard';

interface Props {
  items: MarketItem[];
  user: User;
  navigate: (screen: Screen) => void;
  onAddItem: (item: MarketItem) => void;
  location: Location | null;
  onStartChat: (participant: Partial<User>) => void;
}

const Marketplace: React.FC<Props> = ({ items, user, navigate, onAddItem, location, onStartChat }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'SELL' | 'BUY'>('ALL');
  const [formData, setFormData] = useState<Partial<MarketItem>>({
    type: 'SELL',
    category: 'Инструмент',
    condition: 'Б/У'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem({
      ...formData as MarketItem,
      id: Date.now().toString(),
      authorId: user.id,
      contact: `https://t.me/${user.username}`,
      cityId: location?.id
    });
    setIsCreating(false);
  };

  const filteredItems = items.filter(i => {
    const locMatch = !location || i.cityId === location.id;
    const typeMatch = filter === 'ALL' || i.type === filter;
    return locMatch && typeMatch;
  });

  if (isCreating) {
    return (
      <Layout title="ПОДАТЬ ОБЪЯВЛЕНИЕ" onBack={() => setIsCreating(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#121212] rounded-2xl border border-white/5 shadow-inner">
             <button type="button" onClick={() => setFormData({...formData, type: 'SELL'})} className={`py-4 rounded-xl text-[10px] font-black uppercase italic transition-all ${formData.type === 'SELL' ? 'bg-[#F5C518] text-black shadow-lg shadow-[#F5C518]/20 scale-[1.02]' : 'text-zinc-600'}`}>ПРОДАЮ</button>
             <button type="button" onClick={() => setFormData({...formData, type: 'BUY'})} className={`py-4 rounded-xl text-[10px] font-black uppercase italic transition-all ${formData.type === 'BUY' ? 'bg-[#F5C518] text-black shadow-lg shadow-[#F5C518]/20 scale-[1.02]' : 'text-zinc-600'}`}>КУПЛЮ</button>
          </div>
          
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Что за товар?</label>
            <input placeholder="Название (например: Перфоратор Bosch)" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none focus:border-[#F5C518]/40 transition-colors" onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>

          <div className="space-y-1">
            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Цена вопроса</label>
            <input placeholder="Сумма в ₽" className="w-full bg-[#121212] card-border rounded-xl p-4 text-[#F5C518] font-black outline-none focus:border-[#F5C518]/40" onChange={e => setFormData({...formData, price: e.target.value})} required />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Категория</label>
              <select className="w-full bg-[#121212] card-border rounded-xl p-4 text-white outline-none text-xs font-bold appearance-none" onChange={e => setFormData({...formData, category: e.target.value})}>
                 <option>Инструмент</option>
                 <option>Материалы</option>
                 <option>Запчасти</option>
                 <option>Спецодежда</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Состояние</label>
              <select className="w-full bg-[#121212] card-border rounded-xl p-4 text-white outline-none text-xs font-bold appearance-none" onChange={e => setFormData({...formData, condition: e.target.value})}>
                 <option>Новое</option>
                 <option>Б/У</option>
                 <option>На запчасти</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Подробности</label>
            <textarea placeholder="Опиши косяки, где забрать, есть ли торг..." className="w-full bg-[#121212] card-border rounded-xl p-4 text-white outline-none min-h-[120px] focus:border-[#F5C518]/40" onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          
          <button type="submit" className="w-full bg-[#F5C518] text-black font-black py-5 rounded-2xl uppercase italic shadow-2xl active:scale-95 transition-transform border-b-4 border-black/20 mt-4">
            Выставить на базар
          </button>
        </form>
      </Layout>
    );
  }

  return (
    <Layout title="БАРАХОЛКА" onBack={() => navigate(Screen.HOME)} subtitle={location?.name || "Вся Россия"}>
      <button onClick={() => setIsCreating(true)} className="active-scale w-full bg-white text-black font-black py-4.5 rounded-2xl uppercase italic tracking-tighter shadow-xl mb-6 flex items-center justify-center gap-2">
        <span className="text-xl">💰</span>
        ПРОДАТЬ / КУПИТЬ
      </button>

      <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
        {[
          {id: 'ALL', label: 'Всё'},
          {id: 'SELL', label: 'Продажа'},
          {id: 'BUY', label: 'Покупка'}
        ].map(t => (
          <button key={t.id} onClick={() => setFilter(t.id as any)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === t.id ? 'bg-[#F5C518] text-black scale-105' : 'bg-[#121212] text-zinc-600 border border-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-10">
            <span className="text-6xl mb-4">🛒</span>
            <p className="font-black italic uppercase tracking-widest">Базар пуст</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <WorkshopCard
              key={item.id}
              badge={`${item.type === 'SELL' ? 'ПРОДАМ' : 'КУПЛЮ'} • ${item.category}`}
              title={item.title}
              price={item.price}
              description={item.description}
              details={item.condition}
              footerRight={
                <div className="flex gap-2">
                  <button onClick={() => onStartChat({ id: item.authorId, firstName: 'Продавец' })} className="bg-white text-black text-[10px] font-black px-5 py-2.5 rounded-xl uppercase italic shadow-lg active:scale-90 transition-transform">ЧАТ</button>
                  <a href={item.contact} target="_blank" className="bg-zinc-900 text-zinc-500 text-[10px] font-black px-4 py-2.5 rounded-xl flex items-center justify-center">TG</a>
                </div>
              }
            />
          ))
        )}
      </div>
    </Layout>
  );
};

export default Marketplace;
