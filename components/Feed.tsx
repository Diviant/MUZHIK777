
import React, { useState, useEffect } from 'react';
import { Screen, User, FeedPost } from '../types';
import { db } from '../database';

interface Props {
  navigate: (screen: Screen) => void;
  user: User;
}

type Category = 'NEWS' | 'SCAM' | 'SOS' | 'TRADE' | 'ALL';

const CATEGORIES: { id: Category; label: string; icon: string; color: string; bgColor: string }[] = [
  { id: 'ALL', label: 'ВЕСЬ ЭФИР', icon: '📡', color: 'text-zinc-400', bgColor: 'bg-zinc-800' },
  { id: 'SCAM', label: 'КИДАЛОВО', icon: '⚠️', color: 'text-red-500', bgColor: 'bg-red-950/30' },
  { id: 'SOS', label: 'ПОМОЩЬ', icon: '🚨', color: 'text-yellow-500', bgColor: 'bg-yellow-950/30' },
  { id: 'NEWS', label: 'НОВОСТИ', icon: '📢', color: 'text-blue-500', bgColor: 'bg-blue-950/30' },
  { id: 'TRADE', label: 'СДЕЛКИ', icon: '🤝', color: 'text-[#D4AF37]', bgColor: 'bg-[#D4AF37]/10' },
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
    <div className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto no-scrollbar bg-[#050505] pt-safe">
      {/* HEADER */}
      <header className="flex items-center justify-between py-4 mb-4 sticky top-0 bg-[#050505]/95 backdrop-blur-xl z-50 border-b border-white/10 px-1">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(Screen.HOME)} 
            className="w-11 h-11 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] active-press shadow-xl"
          >
            ←
          </button>
          <div className="flex flex-col text-left">
             <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">ГОРЯЧИЙ ЦЕХ</h2>
             <div className="flex items-center gap-2 mt-1.5">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
                <span className="text-[7px] text-zinc-500 font-black uppercase tracking-[0.3em] mono">DIRECT_FEED_CHANNEL_01</span>
             </div>
          </div>
        </div>
        <button 
          onClick={fetchPosts}
          className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 active:rotate-180 transition-transform duration-500"
        >
          ↻
        </button>
      </header>

      {/* CATEGORIES CHIPS */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6 mb-2">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all whitespace-nowrap active-press ${
              selectedCat === cat.id 
              ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/10' 
              : 'bg-[#121212] border-white/5 text-zinc-500'
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* ИНСТРУКТАЖ БУГРА (RULES) */}
      <div className="bg-[#0f0f0f] border-l-4 border-[#D4AF37] p-5 rounded-2xl mb-6 shadow-xl relative overflow-hidden stagger-item">
        <div className="absolute top-0 right-0 p-2 opacity-[0.03] text-4xl grayscale">👮‍♂️</div>
        <div className="flex flex-col text-left relative z-10">
          <h4 className="text-[9px] text-[#D4AF37] font-black uppercase tracking-[0.2em] mb-2 italic">ИНСТРУКТАЖ ПО ЭФИРУ:</h4>
          <p className="text-[11px] text-zinc-400 font-bold italic leading-relaxed uppercase">
            Мужики, в эфире <span className="text-white">НЕ ГРУБИМ</span> и <span className="text-white">НЕ НЕСЕМ ЧУШЬ</span>. 
            Будь спокоен, за базар отвечай. Хейтеров и провокаторов <span className="text-red-500">БАНЬКА заблокирует автоматически</span>. 
            Уважай братство Цеха.
          </p>
        </div>
      </div>

      {/* NEW POST INPUT AREA */}
      <div className={`relative p-6 rounded-[35px] border transition-colors duration-500 mb-8 overflow-hidden ${
        selectedCat === 'SCAM' ? 'border-red-600/40 bg-red-900/5' : 
        selectedCat === 'SOS' ? 'border-yellow-600/40 bg-yellow-900/5' :
        'bg-[#0f0f0f] border-white/10'
      }`}>
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
         
         <div className="flex items-center justify-between mb-4">
            <span className={`text-[8px] font-black uppercase tracking-[0.4em] italic flex items-center gap-2 ${
              selectedCat === 'SCAM' ? 'text-red-500' : 'text-[#D4AF37]'
            }`}>
               <span className="w-2 h-px bg-current"></span>
               {selectedCat === 'SCAM' ? 'РЕГИСТРАЦИЯ ИНЦИДЕНТА' : 'НОВЫЙ ДОКЛАД В ЭФИР'}
            </span>
            <span className="text-[7px] text-zinc-700 font-mono">CODE: {Math.floor(Math.random() * 9999).toString().padStart(4, '0')}</span>
         </div>

         <textarea 
           value={inputText}
           onChange={e => setInputText(e.target.value)}
           placeholder={
             selectedCat === 'SCAM' ? "КТО КИНУЛ? ГОРОД? ПРИЧИНА?" : 
             selectedCat === 'SOS' ? "ГДЕ ТЫ? ЧТО СЛУЧИЛОСЬ? КАКАЯ ПОМОЩЬ НУЖНА?" :
             "Пиши по делу, мужик..."
           }
           className="w-full bg-transparent p-0 text-white text-[15px] outline-none resize-none font-medium italic min-h-[100px] placeholder:text-zinc-800 leading-relaxed"
         />

         <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
            <div className="flex flex-col">
               <span className="text-[7px] text-zinc-700 font-black uppercase tracking-widest mono">STATUS: READY_TO_SEND</span>
               <span className="text-[7px] text-zinc-800 font-black uppercase tracking-widest mono">LENGTH: {inputText.length}</span>
            </div>
            <button 
              onClick={handlePost}
              disabled={posting || !inputText.trim()}
              className={`px-10 py-4 rounded-2xl font-black uppercase text-[10px] italic transition-all shadow-2xl active-press ${
                inputText.trim() 
                ? (selectedCat === 'SCAM' ? 'bg-red-600 text-white shadow-red-900/40' : 'bg-[#D4AF37] text-black shadow-[#D4AF37]/20') 
                : 'bg-zinc-800 text-zinc-600'
              }`}
            >
              {posting ? 'ОТПРАВКА...' : 'В БАЗУ ЭФИРА'}
            </button>
         </div>
      </div>

      {/* POSTS FEED */}
      <div className="space-y-6 pb-20">
        {loading ? (
          <div className="py-24 text-center">
             <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-[8px] text-zinc-700 font-black uppercase tracking-[0.4em] animate-pulse mono">LINKING_DATA_STREAM...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[45px] opacity-10 flex flex-col items-center">
             <span className="text-6xl mb-6">📡</span>
             <p className="font-black italic uppercase tracking-[0.3em] text-white">КАНАЛ ЧИСТ</p>
             <p className="text-[8px] mt-2 font-bold opacity-50 uppercase tracking-tighter">Сообщений в данной категории не обнаружено</p>
          </div>
        ) : (
          filteredPosts.map((post, i) => {
            const isScam = post.content.includes('[SCAM]');
            const isSos = post.content.includes('[SOS]');
            const isTrade = post.content.includes('[TRADE]');

            let themeStyles = "bg-[#0f0f0f] border-white/10";
            let badge = null;

            if (isScam) {
              themeStyles = "bg-red-950/10 border-red-600/20 shadow-[0_0_30px_rgba(255,0,0,0.05)]";
              badge = { label: "⚠️ КИДАЛОВО", color: "bg-red-600" };
            } else if (isSos) {
              themeStyles = "bg-yellow-950/10 border-yellow-600/20";
              badge = { label: "🚨 SOS ПОМОЩЬ", color: "bg-yellow-600" };
            } else if (isTrade) {
              themeStyles = "bg-[#D4AF37]/5 border-[#D4AF37]/20";
              badge = { label: "🤝 СДЕЛКА", color: "bg-[#D4AF37] text-black" };
            }

            const contentText = post.content
              .replace('[SCAM] ', '').replace('[NEWS] ', '')
              .replace('[SOS] ', '').replace('[TRADE] ', '');

            return (
              <div 
                key={post.id} 
                className={`group rounded-[40px] border p-7 relative shadow-xl transition-all animate-slide-up ${themeStyles}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                 {badge && (
                   <div className={`absolute -top-3 left-10 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] z-10 shadow-lg ${badge.color}`}>
                     {badge.label}
                   </div>
                 )}
                 
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center shadow-inner">
                          {post.authorPhoto ? <img src={post.authorPhoto} className="w-full h-full object-cover" /> : <span className="text-xl gold-text">⚒️</span>}
                       </div>
                       <div className="flex flex-col text-left">
                          <span className="text-[14px] font-black text-white uppercase italic leading-none mb-1.5">{post.authorName}</span>
                          <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mono">
                            {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                       </div>
                    </div>
                    {post.authorId === user.id && (
                      <button 
                        onClick={() => db.deleteFeedPost(post.id).then(fetchPosts)} 
                        className="w-9 h-9 bg-black/40 rounded-full flex items-center justify-center text-zinc-800 hover:text-red-500 transition-all border border-white/5"
                      >
                        ✕
                      </button>
                    )}
                 </div>

                 <div className="text-left">
                    <p className={`text-[15px] leading-relaxed italic whitespace-pre-wrap ${isScam ? 'text-red-100/90 font-bold' : 'text-zinc-300'}`}>
                       {contentText}
                    </p>
                    {post.imageUrl && (
                      <div className="mt-6 rounded-[30px] overflow-hidden border border-white/5 shadow-2xl">
                        <img src={post.imageUrl} className="w-full grayscale hover:grayscale-0 transition-all duration-700" alt="Feed Item" />
                      </div>
                    )}
                 </div>

                 {/* ACTION BAR */}
                 <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                    <div className="flex gap-4">
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/5 text-zinc-600 hover:text-white transition-all active:scale-95">
                         <span className="text-[10px]">💬</span>
                         <span className="text-[8px] font-black uppercase tracking-widest mono">ОТВЕТИТЬ</span>
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/5 text-zinc-600 hover:text-[#D4AF37] transition-all active:scale-95">
                         <span className="text-[10px]">🛡️</span>
                         <span className="text-[8px] font-black uppercase tracking-widest mono">ВЕРЮ</span>
                      </button>
                    </div>
                    
                    <button className="text-zinc-700 hover:text-white transition-colors active:scale-90">
                       <span className="text-lg">⚓</span>
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
