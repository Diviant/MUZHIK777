
import React, { useState } from 'react';
import { Screen, Team, TeamMember, Location, User } from '../types';
import Layout from './Layout';
import WorkshopCard from './WorkshopCard';

interface Props {
  teams: Team[];
  navigate: (screen: Screen) => void;
  onAddTeam: (t: Team) => void;
  location: Location | null;
  onStartChat: (participant: Partial<User>) => void;
}

const Teams: React.FC<Props> = ({ teams, navigate, onAddTeam, location, onStartChat }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: 'Отделка', description: '', equipment: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeam: Team = {
      id: Date.now().toString(),
      name: formData.name,
      leader: 'Мастер',
      category: formData.category,
      memberCount: 1,
      structure: [],
      equipment: formData.equipment.split(',').map(s => s.trim()),
      description: formData.description,
      rating: 5.0,
      cityId: location?.id,
      contact: 'https://t.me/your_tg'
    };
    onAddTeam(newTeam);
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <Layout title="СБОР БРИГАДЫ" onBack={() => setIsCreating(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Название бригады</label>
            <input 
              placeholder="Напр: Монолит-Восток" 
              className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none focus:border-[#F5C518]/40" 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Специализация</label>
            <input 
              placeholder="Бетон, Отделка, Электрика..." 
              className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none focus:border-[#F5C518]/40" 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Опыт и ресурсы</label>
            <textarea 
              placeholder="Опишите объекты, состав команды, наличие своего инструмента..." 
              className="w-full bg-[#121212] card-border rounded-xl p-4 text-white outline-none min-h-[140px] focus:border-[#F5C518]/40" 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>
          
          <button type="submit" className="w-full bg-[#F5C518] text-black font-black py-5 rounded-2xl uppercase italic shadow-2xl active:scale-95 transition-transform border-b-4 border-black/20">
            Заявить о бригаде
          </button>
        </form>
      </Layout>
    );
  }

  const filteredTeams = teams.filter(t => !location || t.cityId === location.id);

  return (
    <Layout title="БРИГАДЫ" onBack={() => navigate(Screen.HOME)} subtitle={location?.name || "По всей России"}>
      <button 
        onClick={() => setIsCreating(true)} 
        className="active-scale w-full bg-[#F5C518] text-black font-black py-4.5 rounded-2xl uppercase italic tracking-tighter shadow-xl mb-6 flex items-center justify-center gap-2"
      >
        <span className="text-xl">⚒️</span>
        ЗАРЕГИСТРИРОВАТЬ СОСТАВ
      </button>

      <div className="space-y-4">
        {filteredTeams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-10">
            <span className="text-6xl mb-4">👥</span>
            <p className="font-black italic uppercase tracking-widest">Бригад пока нет</p>
          </div>
        ) : (
          filteredTeams.map((team) => (
            <WorkshopCard
              key={team.id}
              badge={team.category}
              title={team.name}
              price={`${team.memberCount} ЧЕЛ.`}
              description={team.description}
              footerLeft={
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-white/5">
                    <span className="text-xs text-[#F5C518] font-black italic">{team.leader[0]}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] text-zinc-600 font-black uppercase leading-none mb-1">Бригадир</span>
                    <span className="text-[9px] text-white font-black uppercase italic tracking-tight leading-none">{team.leader}</span>
                  </div>
                </div>
              }
              footerRight={
                <div className="flex gap-2">
                  <button onClick={() => onStartChat({ id: team.authorId || 'sys', firstName: team.leader })} className="bg-white text-black text-[10px] font-black px-5 py-2.5 rounded-xl uppercase italic shadow-md active:scale-90 transition-transform">ЧАТ</button>
                  <a href={team.contact} target="_blank" className="bg-zinc-900 text-zinc-500 text-[10px] font-black px-4 py-2.5 rounded-xl">TG</a>
                </div>
              }
            />
          ))
        )}
      </div>
    </Layout>
  );
};

export default Teams;
