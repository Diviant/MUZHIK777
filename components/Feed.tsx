
import React, { useState, useEffect } from 'react';
import { Screen, User, FeedPost } from '../types';
import { db } from '../database';

interface Props {
  navigate: (screen: Screen) => void;
  user: User;
}

const Feed: React.FC<Props> = ({ navigate, user }) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
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
    await db.addFeedPost(user.id, inputText);
    setInputText('');
    await fetchPosts();
    setPosting(false);
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Удалить пост?')) return;
    await db.deleteFeedPost(id);
    await fetchPosts();
  };

  return (
    <div className="flex-1 flex flex-col p-5 pb-32 overflow-y-auto no-scrollbar bg-[#080808]">
      <header className="flex items-center justify-between py-4 mb-6 sticky top-0 bg-[#080808]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(Screen.HOME)} className="w-10 h-10 bg-[#121212] rounded-xl flex items-center justify-center text-[#F5C518]">←</button>
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">ГОРЯЧИЙ ЦЕХ</h2>
        </div>
        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
      </header>

      {/* Поле ввода */}
      <div className="bg-[#121212] p-4 rounded-[28px] border border-white/5 mb-8 shadow-2xl">
         <textarea 
           value={inputText}
           onChange={e => setInputText(e.target.value)}
           placeholder="Что на объекте происходит? Пиши без цензуры, по-мужицки..."
           className="w-full bg-transparent p-2 text-white text-sm outline-none resize-none font-medium italic min-h-[80px]"
         />
         <div className="flex justify-end mt-2">
            <button 
              onClick={handlePost}
              disabled={posting || !inputText.trim()}
              className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] italic transition-all ${inputText.trim() ? 'bg-[#F5C518] text-black shadow-lg shadow-[#F5C518]/20' : 'bg-zinc-800 text-zinc-600'}`}
            >
              {posting ? 'ПУБЛИКУЮ...' : 'ЗАБРОСИТЬ В ЭФИР'}
            </button>
         </div>
      </div>

      {/* Список постов */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-20 text-center opacity-20 font-black uppercase italic animate-pulse tracking-widest">Синхронизация эфира...</div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center opacity-10 font-black uppercase italic tracking-widest">В Цехе пока тихо...</div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-[#121212] rounded-[30px] border border-white/5 p-5 relative shadow-xl animate-slide-up">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-zinc-900 rounded-2xl overflow-hidden border border-white/5">
                     {post.authorPhoto ? <img src={post.authorPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-600">👤</div>}
                  </div>
                  <div className="flex flex-col text-left">
                     <span className="text-[12px] font-black text-white uppercase italic leading-none mb-1">{post.authorName}</span>
                     <span className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {post.authorId === user.id && (
                    <button onClick={() => handleDelete(post.id)} className="ml-auto text-zinc-800 hover:text-red-500 p-2">✕</button>
                  )}
               </div>
               <p className="text-zinc-300 text-[14px] leading-relaxed italic text-left whitespace-pre-wrap">
                  {post.content}
               </p>
               {post.imageUrl && (
                 <img src={post.imageUrl} className="mt-4 rounded-2xl w-full border border-white/5" alt="Post" />
               )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;
