
import React, { useEffect, useState } from 'react';
import { db } from '../database';
import { Screen, User, Job, ServiceRequest, Team, AutoService, HeavyMachinery, HitchhikingCargo } from '../types';

interface Props {
  navigate: (screen: Screen) => void;
  onStartChat: (participant: Partial<User>) => void;
}

type AdminTab = 'JOBS' | 'SERVICES' | 'TEAMS' | 'AUTO' | 'MACHINERY' | 'USERS' | 'CARGO';

const AdminVacancies: React.FC<Props> = ({ navigate, onStartChat }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('JOBS');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userAds, setUserAds] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [formData, setFormData] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    let result: any[] = [];
    switch (activeTab) {
      case 'JOBS': result = await db.getJobs(); break;
      case 'SERVICES': result = await db.getServices(); break;
      case 'CARGO': result = await db.getCargo(); break;
      case 'TEAMS': result = await db.getTeams(); break;
      case 'AUTO': result = await db.getAutoServices(); break;
      case 'MACHINERY': result = await db.getMachinery(); break;
      case 'USERS': result = await db.getAllUsers(); break;
    }
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    setIsAdding(false);
    setFormData({});
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (!confirm('Мужик, ты уверен, что хочешь это удалить? Безвозвратно!')) return;
    switch (activeTab) {
      case 'JOBS': await db.deleteJob(id); break;
      case 'SERVICES': await db.deleteService(id); break;
      case 'CARGO': await db.deleteCargo(id); break;
      case 'TEAMS': await db.deleteTeam(id); break;
      case 'AUTO': await db.deleteAutoService(id); break;
      case 'MACHINERY': await db.deleteMachinery(id); break;
    }
    fetchData();
  };

  const handleUpdatePoints = async (userId: string, current: number) => {
    const amount = prompt('Сколько баллов начислить/отнять?', '0');
    if (amount === null) return;
    const next = current + parseInt(amount);
    if (isNaN(next)) return alert('Пиши цифрами, мужик!');
    setLoading(true);
    await db.updateUserPoints(userId, next);
    fetchData();
  };

  const handleToggleBan = async (user: User) => {
    const action = user.isBanned ? 'РАЗБАНИТЬ' : 'ЗАБАНИТЬ';
    if (!confirm(`Точно хочешь ${action} мужика ${user.firstName}?`)) return;
    setLoading(true);
    await db.toggleUserBan(user.id, !user.isBanned);
    fetchData();
    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...user, isBanned: !user.isBanned });
    }
  };

  const handleShowUserDetails = async (user: User) => {
    setSelectedUser(user);
    setDetailsLoading(true);
    const ads = await db.getUserAds(user.id);
    setUserAds(ads);
    setDetailsLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      switch (activeTab) {
        case 'JOBS': await db.addJob({ ...formData, id: '', authorId: 'system', isVahta: !!formData.isVahta, housing: !!formData.housing }); break;
        case 'SERVICES': await db.addService({ ...formData, id: '', authorId: 'system', author: formData.author || 'Администратор' }); break;
        case 'TEAMS': await db.addTeam({ ...formData, id: '', authorId: 'system', structure: [], equipment: [], rating: 5.0 }); break;
        case 'AUTO': await db.addAutoService({ ...formData, id: '', authorId: 'system', rating: 5.0, features: [] }); break;
        case 'MACHINERY': await db.addMachinery({ ...formData, id: '', authorId: 'system', specs: [], includesOperator: !!formData.includesOperator, includesFuel: !!formData.includesFuel }); break;
        case 'CARGO': await db.addCargo({ ...formData, id: '', authorId: 'system' }); break;
      }
      setIsAdding(false);
      fetchData();
    } catch (err) { alert('Ошибка при добавлении'); } finally { setLoading(false); }
  };

  const tabs: {id: AdminTab, label: string, icon: string}[] = [
    { id: 'JOBS', label: 'Работа', icon: '💼' },
    { id: 'SERVICES', label: 'Заказы', icon: '🔧' },
    { id: 'CARGO', label: 'Груз', icon: '📦' },
    { id: 'TEAMS', label: 'Бригады', icon: '👥' },
    { id: 'AUTO', label: 'СТО', icon: '🚗' },
    { id: 'MACHINERY', label: 'Техника', icon: '🚜' },
    { id: 'USERS', label: 'Мужики', icon: '👤' },
  ];

  const filteredData = data.filter(item => {
    if (!search) return true;
    const str = (item.title || item.name || item.firstName || item.username || '').toLowerCase();
    return str.includes(search.toLowerCase());
  });

  return (
    <div className="flex-1 bg-[#0E0E0E] text-white flex flex-col h-full screen-fade overflow-hidden relative">
      <header className="p-6 border-b border-white/5 bg-[#161616] flex items-center justify-between">
        <div className="flex flex-col items-start">
          <button onClick={() => navigate(Screen.PROFILE)} className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">← Назад</button>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">АДМИН-ЦЕХ</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(Screen.DIAGNOSTIC)}
            className="w-10 h-10 bg-zinc-800 text-zinc-400 rounded-xl flex items-center justify-center active-scale border border-white/5"
            title="Сканер системы"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </button>
          {activeTab !== 'USERS' && (
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className={`px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${isAdding ? 'bg-zinc-800 text-zinc-500' : 'bg-[#F5C518] text-black shadow-lg shadow-[#F5C518]/20'}`}
            >
              {isAdding ? 'ОТМЕНА' : '+ ДОБАВИТЬ'}
            </button>
          )}
        </div>
      </header>

      <div className="flex overflow-x-auto no-scrollbar bg-black/40 border-b border-white/5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[90px] py-4 px-2 flex flex-col items-center gap-1 transition-all border-b-2 ${activeTab === tab.id ? 'border-[#F5C518] bg-[#F5C518]/5' : 'border-transparent text-zinc-600'}`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="px-6 py-4 bg-black/20">
        <input 
          placeholder="Поиск..."
          className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] font-black uppercase italic outline-none focus:border-[#F5C518]/30"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-32">
        {isAdding ? (
          <form onSubmit={handleAdd} className="space-y-5">
             <div className="bg-[#161616] card-border rounded-3xl p-6 space-y-4">
                <h3 className="text-[#F5C518] font-black uppercase italic text-sm mb-4">НОВАЯ ЗАПИСЬ: {activeTab}</h3>
                <div className="space-y-3">
                   <input placeholder="Название" className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-bold outline-none" onChange={e => setFormData({...formData, title: e.target.value, name: e.target.value})} required />
                   {activeTab === 'CARGO' && (
                     <>
                        <input placeholder="Откуда" className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-bold outline-none" onChange={e => setFormData({...formData, routeFrom: e.target.value})} required />
                        <input placeholder="Куда" className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-bold outline-none" onChange={e => setFormData({...formData, routeTo: e.target.value})} required />
                     </>
                   )}
                   <input placeholder="Цена/ЗП" className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-bold outline-none" onChange={e => setFormData({...formData, salary: e.target.value, price: e.target.value, rate: e.target.value})} required />
                   <textarea placeholder="Описание" className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-medium outline-none min-h-[100px]" onChange={e => setFormData({...formData, description: e.target.value})} />
                   <input placeholder="Контакт (TG)" className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-bold outline-none" onChange={e => setFormData({...formData, contact: e.target.value})} required />
                </div>
                <button type="submit" className="w-full bg-[#F5C518] text-black font-black py-4 rounded-2xl uppercase italic tracking-tighter shadow-lg shadow-[#F5C518]/10">
                   ОПУБЛИКОВАТЬ В ЦЕХ
                </button>
             </div>
          </form>
        ) : (
          <div className="space-y-3">
            {loading ? (
              <div className="py-20 text-center opacity-20 font-black uppercase italic">Синхронизация...</div>
            ) : filteredData.length === 0 ? (
              <div className="py-20 text-center opacity-10 font-black uppercase italic">Тут пусто, мужик</div>
            ) : filteredData.map((item, i) => (
              <div 
                key={item.id} 
                onClick={() => activeTab === 'USERS' && handleShowUserDetails(item)}
                className={`bg-[#161616] card-border p-5 rounded-2xl flex items-center justify-between group animate-in fade-in slide-in-from-right-4 duration-300 ${activeTab === 'USERS' ? 'cursor-pointer active:scale-[0.98]' : ''}`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex flex-col items-start min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[11px] font-black uppercase italic text-white truncate max-w-[140px] ${item.isBanned ? 'line-through opacity-40' : ''}`}>
                      {item.title || item.name || item.firstName || item.username}
                    </span>
                    {item.isPro && <span className="bg-[#F5C518] text-black text-[6px] px-1 rounded font-black">PRO</span>}
                    {item.isBanned && <span className="bg-red-600 text-white text-[6px] px-1 rounded font-black">BAN</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest">{item.routeFrom ? `${item.routeFrom} → ${item.routeTo}` : (item.region || item.address || item.username || 'РФ')}</span>
                    <span className="text-[8px] text-[#F5C518] font-black italic">
                      {item.salary || item.price || item.rate || `${item.points} 🪙`}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                   {activeTab === 'USERS' ? (
                      <button 
                        onClick={() => handleUpdatePoints(item.id, item.points)}
                        className="w-8 h-8 flex items-center justify-center bg-[#F5C518]/10 text-[#F5C518] rounded-lg active:scale-95 transition-all"
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2M12 20A8 8 0 1 1 20 12A8 8 0 0 1 12 20M13 7H11V11H7V13H11V17H13V13H17V11H13V7Z"/></svg>
                      </button>
                   ) : (
                     <button 
                       onClick={() => handleDelete(item.id)}
                       className="w-8 h-8 flex items-center justify-center bg-red-900/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                     >
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/80 animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-[#161616] rounded-t-[40px] border-t border-white/10 p-8 pb-12 animate-in slide-in-from-bottom-20 duration-500 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 shadow-inner">
                       {selectedUser.photoUrl ? <img src={selectedUser.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>}
                    </div>
                    <div>
                       <h2 className="text-xl font-black uppercase italic tracking-tighter text-white leading-none mb-1">{selectedUser.firstName}</h2>
                       <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-none mb-2">@{selectedUser.username}</p>
                       <div className="flex gap-2">
                          {selectedUser.isPro && <span className="bg-[#F5C518] text-black text-[7px] px-1.5 py-0.5 rounded font-black italic">PRO</span>}
                          {selectedUser.isDonor && <span className="bg-blue-600 text-white text-[7px] px-1.5 py-0.5 rounded font-black italic uppercase">ДОНОР 💎</span>}
                          {selectedUser.isBanned && <span className="bg-red-600 text-white text-[7px] px-1.5 py-0.5 rounded font-black italic uppercase">ЗАБАНЕН</span>}
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedUser(null)} className="w-10 h-10 flex items-center justify-center text-zinc-600 bg-white/5 rounded-full active:scale-90 transition-all">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                 <button 
                   onClick={() => handleToggleBan(selectedUser)}
                   className={`py-4 rounded-2xl font-black uppercase italic text-xs tracking-tighter transition-all shadow-lg ${selectedUser.isBanned ? 'bg-green-600 text-white' : 'bg-red-600/20 text-red-500 border border-red-500/20'}`}
                 >
                    {selectedUser.isBanned ? 'РАЗБАНИТЬ МУЖИКА' : 'ЗАБАНИТЬ МУЖИКА'}
                 </button>
                 <button 
                   onClick={() => { onStartChat(selectedUser); setSelectedUser(null); }}
                   className="bg-white text-black py-4 rounded-2xl font-black uppercase italic text-xs tracking-tighter shadow-lg active-scale"
                 >
                    НАПИСАТЬ ЕМУ
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar bg-black/20 rounded-3xl p-4 border border-white/5">
                 <h4 className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-3 sticky top-0 bg-[#161616]/80 backdrop-blur-sm py-1">ОБЪЯВЛЕНИЯ МУЖИКА ({userAds.length})</h4>
                 <div className="space-y-2">
                    {detailsLoading ? (
                      <div className="py-10 text-center text-xs italic opacity-20 animate-pulse font-black uppercase">Сбор данных...</div>
                    ) : userAds.length === 0 ? (
                      <div className="py-10 text-center text-xs italic opacity-20 font-black uppercase">Объявлений пока нет</div>
                    ) : userAds.map(ad => (
                      <div key={ad.id} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex justify-between items-center group">
                         <div className="min-w-0 pr-4">
                            <span className="text-[7px] text-[#F5C518] font-black uppercase italic mr-2 block mb-1 opacity-60">{ad.type}</span>
                            <span className="text-[11px] font-black text-white uppercase italic truncate block">{ad.title}</span>
                         </div>
                         <button onClick={() => handleDelete(ad.id)} className="w-8 h-8 flex items-center justify-center text-red-500 opacity-40 hover:opacity-100 transition-all bg-red-500/5 rounded-lg">✕</button>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="p-6 bg-gradient-to-t from-black to-transparent pointer-events-none fixed bottom-0 left-0 right-0">
        <p className="text-[8px] text-zinc-700 text-center font-black uppercase tracking-[0.4em]">ADMIN TERMINAL v2.4</p>
      </div>
    </div>
  );
};

export default AdminVacancies;
