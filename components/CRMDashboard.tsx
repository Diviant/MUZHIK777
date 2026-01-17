
import React, { useState } from 'react';
import { Screen, User, CRMProject } from '../types';
import Layout from './Layout';

interface Props {
  user: User;
  navigate: (screen: Screen) => void;
}

type CRMTool = 'TABEL' | 'REPORT' | 'ESTIMATE' | 'PLANS' | null;

const CRMDashboard: React.FC<Props> = ({ user, navigate }) => {
  const [projects, setProjects] = useState<CRMProject[]>([
    { id: '1', name: 'ЖК "Северный"', address: 'ул. Полевая, 12', workersCount: 8, status: 'ACTIVE', budget: '1.2M ₽', lastPhoto: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=400' },
    { id: '2', name: 'Фундамент Дача', address: 'СНТ Ромашка', workersCount: 3, status: 'DONE', budget: '450k ₽' }
  ]);

  const [activeProject, setActiveProject] = useState<CRMProject | null>(null);
  const [activeTool, setActiveTool] = useState<CRMTool>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // States for tools
  const [todayWorkers, setTodayWorkers] = useState(0);
  const [tasks, setTasks] = useState<{id: string, text: string, done: boolean}[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [reportPhoto, setReportPhoto] = useState('');
  const [newProj, setNewProj] = useState({ name: '', address: '', budget: '' });

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const p: CRMProject = {
      id: Date.now().toString(),
      name: newProj.name,
      address: newProj.address,
      budget: newProj.budget,
      workersCount: 0,
      status: 'ACTIVE'
    };
    setProjects([p, ...projects]);
    setIsCreating(false);
    setNewProj({ name: '', address: '', budget: '' });
  };

  const handleToolOpen = (tool: CRMTool) => {
    if (tool === 'TABEL' && activeProject) setTodayWorkers(activeProject.workersCount);
    setActiveTool(tool);
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    setTasks([{ id: Date.now().toString(), text: newTaskText, done: false }, ...tasks]);
    setNewTaskText('');
  };

  if (isCreating) {
    return (
      <Layout title="НОВЫЙ ОБЪЕКТ" onBack={() => setIsCreating(false)}>
        <form onSubmit={handleAddProject} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Название объекта</label>
            <input 
              value={newProj.name}
              onChange={e => setNewProj({...newProj, name: e.target.value})}
              placeholder="ЖК / ОФИС / ЧАСТНЫЙ ДОМ" 
              className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none focus:border-[#D4AF37]/40" 
              required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Адрес</label>
            <input 
              value={newProj.address}
              onChange={e => setNewProj({...newProj, address: e.target.value})}
              placeholder="УЛИЦА, НОМЕР..." 
              className="w-full bg-[#121212] card-border rounded-xl p-4 text-white font-bold outline-none focus:border-[#D4AF37]/40" 
              required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">Бюджет (₽)</label>
            <input 
              value={newProj.budget}
              onChange={e => setNewProj({...newProj, budget: e.target.value})}
              placeholder="1 000 000" 
              className="w-full bg-[#121212] card-border rounded-xl p-4 gold-text font-black outline-none focus:border-[#D4AF37]/40" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-[#D4AF37] text-black font-black py-5 rounded-2xl uppercase italic shadow-2xl mt-4">
            ВНЕСТИ В РЕЕСТР
          </button>
        </form>
      </Layout>
    );
  }

  if (activeProject) {
    return (
      <Layout title={activeProject.name} onBack={() => setActiveProject(null)}>
        <div className="space-y-6 pb-20">
          {/* PROJECT SUMMARY CARD - GRADIENT BACKGROUND, NO OVERFLOW-HIDDEN */}
          <div 
            className="p-8 rounded-[40px] border border-[#D4AF37]/20 shadow-2xl relative"
            style={{ 
              background: 'radial-gradient(circle at 50% -10%, rgba(212, 175, 55, 0.1) 0%, #121212 60%)' 
            }}
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-[#D4AF37]/30"></div>
             
             <div className="flex justify-between items-center mb-8 relative z-10">
                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">Статус Объекта</span>
                <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase italic shadow-xl ${activeProject.status === 'ACTIVE' ? 'bg-[#D4AF37] text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                  {activeProject.status === 'ACTIVE' ? 'В РАБОТЕ' : 'ЗАВЕРШЕН'}
                </span>
             </div>
             
             <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-black/40 p-6 rounded-[25px] border border-white/5 flex flex-col items-center">
                   <span className="text-[7px] text-zinc-700 font-black uppercase block mb-1 tracking-widest">В БРИГАДЕ</span>
                   <span className="text-xl font-black text-white italic leading-none">{activeProject.workersCount} чел.</span>
                </div>
                <div className="bg-black/40 p-6 rounded-[25px] border border-white/5 flex flex-col items-center">
                   <span className="text-[7px] text-zinc-700 font-black uppercase block mb-1 tracking-widest">БЮДЖЕТ</span>
                   <span className="text-xl font-black gold-text italic leading-none">{activeProject.budget}</span>
                </div>
             </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-2 gap-4">
             {['TABEL', 'REPORT', 'ESTIMATE', 'PLANS'].map((tool) => (
               <button 
                  key={tool}
                  onClick={() => handleToolOpen(tool as CRMTool)}
                  className={`p-6 rounded-[30px] border flex flex-col items-center gap-3 active-press transition-all ${activeTool === tool ? 'bg-[#D4AF37] border-none text-black' : 'bg-[#111] border-white/5 text-zinc-500'}`}
               >
                  <span className="text-3xl">{tool === 'TABEL' ? '📝' : tool === 'REPORT' ? '📷' : tool === 'ESTIMATE' ? '📊' : '📋'}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">{tool}</span>
               </button>
             ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="МОЯ СТРОЙКА" subtitle="Мини-CRM Терминал">
      <button 
        onClick={() => setIsCreating(true)}
        className="w-full bg-gradient-to-r from-[#D4AF37] to-[#9A7D0A] text-black font-black py-7 rounded-[40px] uppercase italic tracking-tighter shadow-2xl mb-10"
      >
         ДОБАВИТЬ ОБЪЕКТ
      </button>

      <div className="space-y-5">
        {projects.map(p => (
          <button 
            key={p.id}
            onClick={() => setActiveProject(p)}
            className="w-full bg-[#121212] p-8 rounded-[45px] border border-white/5 flex flex-col items-start active:bg-[#181818] transition-all relative"
          >
            <div className="flex justify-between w-full mb-4 pr-10">
               <div className="flex flex-col items-start">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">{p.name}</h3>
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">{p.address}</p>
               </div>
               <span className={`text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${p.status === 'ACTIVE' ? 'border-[#D4AF37]/30 text-[#D4AF37]' : 'text-zinc-600'}`}>
                 {p.status}
               </span>
            </div>
            
            <div className="w-full h-[1px] bg-white/5 my-5"></div>
            
            <div className="flex items-center gap-10">
               <div className="flex flex-col items-start">
                  <span className="text-[8px] text-zinc-800 font-black uppercase mb-1.5 mono">ЛЮДИ</span>
                  <span className="text-lg font-black text-white italic leading-none">{p.workersCount || 0}</span>
               </div>
               <div className="flex flex-col items-start">
                  <span className="text-[8px] text-zinc-800 font-black uppercase mb-1.5 mono">БЮДЖЕТ</span>
                  <span className="text-lg font-black gold-text italic leading-none">{p.budget}</span>
               </div>
            </div>
          </button>
        ))}
      </div>
    </Layout>
  );
};

export default CRMDashboard;
