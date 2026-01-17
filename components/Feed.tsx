
import React, { useState, useEffect } from 'react';
import { Screen, User, FeedPost } from '../types';
import { db } from '../database';

interface Props {
  navigate: (screen: Screen) => void;
  user: User;
}

type Category = 'NEWS' | 'SCAM' | 'SOS' | 'TRADE' | 'ALL';

const CATEGORIES: { id: Category; label: string; icon: string; color: string }[] = [
  { id: 'ALL', label: 'ВЕСЬ ЭФИР', icon: '📡', color: 'text-zinc-500' },
  { id: 'SCAM', label: 'КИДАЛОВО', icon: '⚠️', color: 'text-red-500' },
  { id: 'NEWS', label: 'НОВОСТИ', icon: '📢', color: 'text-blue-500' },
  { id: 'SOS', label: 'НУЖНА ПОМОЩЬ', icon: '🚨', color: 'text-yellow-500' },
  { id: 'TRADE', label: 'СДЕЛКИ', icon: '🤝', color: 'text-[#D4AF37]' },
];

const Feed: React.FC<Props> = ({ navigate, user }) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [selectedCat, setSelectedCat] = useState<Category>('ALL');
  const [posting, setPosting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    const data = await db.getFeedPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!inputText.trim() || posting) return;
    setPosting(true);
    
    // Авто-тег в зависимости от категории
    const tag = selectedCat !== 'ALL' ? `[${selectedCat}] ` : '';
    await db.addFeedPost(user.id, tag + inputText);
    
    setInputText('');
    await fetchPosts();
    setPosting(false);
  };

  const filteredPosts = posts.filter(p => {
    if (selectedCat === 'ALL') return true;
    return p.content.includes(`[${selectedCat}]`);
  });

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar z-10">
      <header className="flex items-center justify-between py-6 mb-4 sticky top-0 bg-[#050505]/90 backdrop-blur-xl z-50 px-2 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(Screen.HOME)} className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press shadow-lg">←</button>
          <div className="flex flex-col text-left">
             <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">ГОРЯЧИЙ ЦЕХ</h2>
             <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em] mono">OPEN_CHANNEL_01</span>
             </div>
          </div>
        </div>
      </header>

      {/* CATEGORIES */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6 mb-2">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl border transition-all whitespace-nowrap active-press ${selectedCat === cat.id ? 'bg-[#D4AF37] border-[#D4AF37] text-black scale-105 shadow-xl shadow-[#D4AF37]/10' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest italic">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[35px] mb-10 shadow-inner backdrop-blur-sm">
         <div className="flex items-center gap-3 mb-4">
            <span className="text-[9px] gold-text font-black uppercase tracking-[0.3em] italic">НОВЫЙ ДОКЛАД В ЭФИР</span>
            <div className="h-[1px] flex-1 bg-white/5"></div>
         </div>
         <textarea 
           value={inputText}
           onChange={e => setInputText(e.target.value)}
           placeholder={selectedCat === 'SCAM' ? "ОПИШИ КТО КИНУЛ, ГОРОД, СУММУ..." : "Пиши по делу, мужик..."}
           className="w-full bg-transparent p-0 text-white text-[16px] outline-none resize-none font-medium italic min-h-[90px] placeholder:text-zinc-800"
         />
         <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-2 opacity-30">
               <span className="text-[8px] text-zinc-500 font-black uppercase mono tracking-widest">BYTES: {inputText.length}</span>
            </div>
            <button 
              onClick={handlePost}
              disabled={posting || !inputText.trim()}
              className={`px-10 py-4 rounded-2xl font-black uppercase text-[11px] italic transition-all shadow-2xl ${inputText.trim() ? 'bg-[#D4AF37] text-black shadow-[#D4AF37]/20 active:scale-95' : 'bg-zinc-800 text-zinc-600'}`}
            >
              {posting ? 'В ПЕЧАТЬ...' : 'В БАЗУ ЭФИРА'}
            </button>
         </div>
      </div>

      {/* FORUM FEED */}
      <div className="space-y-8 pb-40">
        {loading ? (
          <div className="py-20 text-center opacity-20 font-black uppercase italic animate-pulse mono">SYNCING_DATA_STREAM...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center opacity-10 font-black uppercase italic mono">EMPTY_LOG_FILE</div>
        ) : (
          filteredPosts.map((post, i) => {
            const isScam = post.content.includes('[SCAM]');
            const isNews = post.content.includes('[NEWS]');
            const isSos = post.content.includes('[SOS]');
            const isTrade = post.content.includes('[TRADE]');

            let themeClass = "border-white/5 bg-zinc-900/40";
            let badgeText = "";
            let badgeColor = "bg-zinc-800";

            if (isScam) { themeClass = "border-red-600/30 bg-red-900/5 shadow-[0_0_30px_rgba(255,0,0,0.05)]"; badgeText = "⚠️ КИДАЛОВО"; badgeColor = "bg-red-600 shadow-[0_0_10px_red]"; }
            else if (isNews) { themeClass = "border-blue-600/30 bg-blue-900/5"; badgeText = "📢 НОВОСТИ"; badgeColor = "bg-blue-600"; }
            else if (isSos) { themeClass = "border-yellow-600/30 bg-yellow-900/5"; badgeText = "🚨 SOS"; badgeColor = "bg-yellow-600"; }
            else if (isTrade) { themeClass = "border-[#D4AF37]/30 bg-[#D4AF37]/5"; badgeText = "🤝 СДЕЛКА"; badgeColor = "bg-[#D4AF37] text-black"; }

            const cleanContent = post.content
              .replace('[SCAM] ', '').replace('[NEWS] ', '')
              .replace('[SOS] ', '').replace('[TRADE] ', '');

            return (
              <div 
                key={post.id} 
                className={`group rounded-[40px] border p-7 relative shadow-2xl transition-all stagger-item ${themeClass}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                 {badgeText && (
                   <div className={`absolute -top-3 left-10 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.3em] z-10 ${badgeColor}`}>
                     {badgeText}
                   </div>
                 )}
                 
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-black rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center shadow-inner">
                          {post.authorPhoto ? <img src={post.authorPhoto} className="w-full h-full object-cover" /> : <span className="text-xl gold-text">⚒️</span>}
                       </div>
                       <div className="flex flex-col text-left">
                          <span className="text-[14px] font-black text-white uppercase italic leading-none mb-1.5">{post.authorName}</span>
                          <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest mono">{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(post.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                    {post.authorId === user.id && (
                      <button onClick={() => db.deleteFeedPost(post.id).then(fetchPosts)} className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-zinc-800 hover:text-red-500 transition-all active:scale-90 border border-white/5">✕</button>
                    )}
                 </div>

                 <div className="relative text-left">
                    <p className={`text-[16px] leading-[1.6] italic whitespace-pre-wrap ${isScam ? 'text-red-100 font-bold' : 'text-zinc-300'}`}>
                       {cleanContent}
                    </p>
                    {post.imageUrl && (
                      <div className="mt-6 rounded-[30px] overflow-hidden border border-white/5 shadow-2xl">
                        <img src={post.imageUrl} className="w-full grayscale hover:grayscale-0 transition-all duration-700" alt="Post" />
                      </div>
                    )}
                 </div>

                 {/* INTERACTIONS */}
                 <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                    <div className="flex gap-6">
                      <button className="flex items-center gap-2.5 text-zinc-700 hover:text-white transition-all group/btn active:scale-95">
                         <span className="text-xs group-hover/btn:rotate-12 transition-transform">⚔️</span>
                         <span className="text-[9px] font-black uppercase tracking-widest mono italic">ОТВЕТИТЬ</span>
                      </button>
                      <button className="flex items-center gap-2.5 text-zinc-700 hover:text-white transition-all group/btn active:scale-95">
                         <span className="text-xs group-hover/btn:scale-110 transition-transform">🛡️</span>
                         <span className="text-[9px] font-black uppercase tracking-widest mono italic">ДОВЕРЯЮ</span>
                      </button>
                    </div>
                    
                    <button className="flex items-center gap-2.5 text-zinc-700 hover:text-[#D4AF37] transition-all active:scale-95">
                       <span className="text-xs">⚓</span>
                       <span className="text-[9px] font-black uppercase tracking-widest mono italic">ПОДЕЛИТЬСЯ</span>
                    </button>
                 </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Feed;
