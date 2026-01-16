
'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function VacanciesAdmin() {
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchVacancies();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push('/admin/login');
  };

  const fetchVacancies = async () => {
    const { data, error } = await supabase
      .from('vacancies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setVacancies(data);
    setLoading(false);
  };

  const deleteVacancy = async (id: string) => {
    if (!confirm('Точно удалить?')) return;
    const { error } = await supabase.from('vacancies').delete().eq('id', id);
    if (!error) fetchVacancies();
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          title: values[0],
          salary: values[1],
          region: values[2],
          contact: values[3],
          is_vahta: values[4]?.trim().toLowerCase() === 'true',
          description: values[5]
        };
      }).filter(v => v.title);

      const res = await fetch('/api/vacancies/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert('Загружено!');
        fetchVacancies();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white p-6 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Управление вакансиями</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Всего в базе: {vacancies.length}</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <label className="flex-1 md:flex-none cursor-pointer bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center">
            Загрузить CSV
            <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </label>
          <button 
            onClick={() => alert('Форма добавления в разработке')}
            className="flex-1 md:flex-none bg-[#F5C518] text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest italic"
          >
            + Добавить вручную
          </button>
        </div>
      </header>

      <div className="bg-[#161616] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/50 border-b border-white/5">
              <th className="p-5 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Должность / Регион</th>
              <th className="p-5 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Зарплата</th>
              <th className="p-5 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Тип</th>
              <th className="p-5 text-[10px] font-black uppercase text-zinc-500 tracking-widest text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-20 text-center font-black uppercase opacity-20 italic">Загрузка данных...</td></tr>
            ) : vacancies.map(v => (
              <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-5">
                  <div className="font-black uppercase italic text-white">{v.title}</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{v.region}</div>
                </td>
                <td className="p-5 font-black text-[#F5C518] italic">{v.salary}</td>
                <td className="p-5">
                  <span className={`text-[8px] font-black px-2 py-1 rounded uppercase italic ${v.is_vahta ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'}`}>
                    {v.is_vahta ? 'ВАХТА' : 'МЕСТНАЯ'}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => deleteVacancy(v.id)}
                    className="text-red-500 hover:text-red-400 p-2 transition-colors"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
