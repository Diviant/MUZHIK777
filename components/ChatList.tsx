
import React, { useState, useEffect } from 'react';
import { Screen, User, Conversation } from '../types';
import { db } from '../database';

interface Props {
  user: User;
  navigate: (screen: Screen) => void;
  onSelectChat: (chat: Conversation) => void;
}

const ChatList: React.FC<Props> = ({ user, navigate, onSelectChat }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.getConversations(user.id).then(list => {
      setConversations(list);
      setLoading(false);
    });
  }, [user.id]);

  return (
    <div className="flex-1 flex flex-col p-5 screen-fade pb-32 overflow-y-auto no-scrollbar">
      <header className="flex flex-col gap-2 py-4 mb-6">
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">СООБЩЕНИЯ</h2>
        <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Твои переписки в цехе</span>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20 opacity-20 italic uppercase font-black tracking-widest">Загрузка...</div>
      ) : conversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20 text-white text-center">
          <span className="text-6xl mb-4">💬</span>
          <p className="text-sm font-black uppercase italic tracking-widest">Переписок пока нет</p>
          <p className="text-[10px] mt-2">Начни чат в разделе Работа или Заказы</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((chat, idx) => (
            <button 
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className="w-full bg-[#161616] card-border p-4 rounded-[24px] flex items-center gap-4 active-scale border border-white/5 stagger-item"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
                {chat.participant.photoUrl ? (
                  <img src={chat.participant.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-zinc-600 font-black text-xl italic">{chat.participant.firstName?.[0]}</span>
                )}
              </div>
              <div className="flex-1 flex flex-col items-start min-w-0">
                <div className="flex justify-between items-center w-full mb-1">
                   <span className="text-[13px] font-black text-white uppercase italic tracking-tight truncate">{chat.participant.firstName}</span>
                   {chat.lastMessageTime && (
                     <span className="text-[8px] text-zinc-600 font-black">{new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   )}
                </div>
                <p className="text-zinc-500 text-[11px] font-medium truncate w-full text-left italic">
                  {chat.lastMessage || 'Начать переписку...'}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="w-5 h-5 bg-[#F5C518] rounded-full flex items-center justify-center shadow-lg shadow-[#F5C518]/20">
                   <span className="text-[9px] font-black text-black">{chat.unreadCount}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;
