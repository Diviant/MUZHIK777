
import React, { useState } from 'react';
import { Screen, Job, Location, User } from '../types';
import { ECONOMY } from '../constants';
import Layout from './Layout';
import WorkshopCard from './WorkshopCard';

interface Props {
  jobs: Job[];
  user: User | null;
  navigate: (screen: Screen) => void;
  onAddJob: (j: Job) => void;
  onUpdateUser: (fields: Partial<User>) => void;
  location: Location | null;
  onStartChat: (participant: Partial<User>) => void;
}

const Jobs: React.FC<Props> = ({ jobs, user, navigate, onAddJob, onUpdateUser, location, onStartChat }) => {
  const [filter, setFilter] = useState('Все');
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: '', salary: '', region: '', description: '', isVahta: false, housing: true });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    onAddJob({ ...formData, id: Date.now().toString(), authorId: user.id, contact: `https://t.me/${user.username}`, region: location?.name || 'РФ' });
    onUpdateUser({ points: user.points - ECONOMY.AD_POST_COST });
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <Layout title="НОВАЯ ВАКАНСИЯ" onBack={() => setIsCreating(false)}>
        <form onSubmit={handleAdd} className="space-y-4">
          <input placeholder="Должность" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none" onChange={e => setFormData({...formData, title: e.target.value})} required />
          <input placeholder="Зарплата" className="w-full bg-[#121212] card-border rounded-xl p-4 text-[#F5C518] font-black outline-none" onChange={e => setFormData({...formData, salary: e.target.value})} required />
          <textarea placeholder="Описание" className="w-full bg-[#121212] card-border rounded-xl p-4 text-white outline-none min-h-[100px]" onChange={e => setFormData({...formData, description: e.target.value})} />
          <button type="submit" className="w-full bg-[#F5C518] text-black font-black py-5 rounded-2xl uppercase italic shadow-xl">Разместить за {ECONOMY.AD_POST_COST} 🪙</button>
        </form>
      </Layout>
    );
  }

  return (
    <Layout title="ВАКАНСИИ" onBack={() => navigate(Screen.HOME)}>
      <button onClick={() => setIsCreating(true)} className="w-full border border-dashed border-[#F5C518]/30 bg-[#F5C518]/5 text-white font-black py-4 rounded-2xl uppercase italic mb-6 shadow-sm">
        Добавить вакансию ({ECONOMY.AD_POST_COST} 🪙)
      </button>

      <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
        {['Все', 'Вахта', 'С жильем'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-[#F5C518] text-black' : 'bg-[#121212] text-zinc-500 border border-zinc-800'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <WorkshopCard
            key={job.id}
            badge={job.isVahta ? "ВАХТА" : "МЕСТНАЯ"}
            title={job.title}
            price={job.salary}
            details={job.region}
            description={job.description}
            footerRight={
              <div className="flex gap-2">
                <button onClick={() => onStartChat({ id: job.authorId, firstName: 'Работодатель' })} className="bg-[#F5C518] text-black text-[10px] font-black px-5 py-2.5 rounded-xl uppercase italic">ЧАТ</button>
                <a href={job.contact} className="bg-zinc-800 text-zinc-400 text-[10px] font-black px-4 py-2.5 rounded-xl uppercase">TG</a>
              </div>
            }
          />
        ))}
      </div>
    </Layout>
  );
};

export default Jobs;
