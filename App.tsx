
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Screen, User, Job, ServiceRequest, Location, Team, AutoService, HeavyMachinery, HitchhikingCargo, Conversation, MarketItem } from './types';
import { db } from './database';
import Welcome from './components/Welcome';
import Auth from './components/Auth';
import Home from './components/Home';
import Jobs from './components/Jobs';
import Services from './components/Services';
import Profile from './components/Profile';
import Referral from './components/Referral';
import Ranking from './components/Ranking';
import Marketplace from './components/Marketplace';
import ChatList from './components/ChatList';
import ChatDetail from './components/ChatDetail';
import BugorChat from './components/BugorChat';
import VakhtaJournal from './components/VakhtaJournal';
import MaterialsSearch from './components/MaterialsSearch';
import Notes from './components/Notes';
import Diagnostic from './components/Diagnostic';
import { isSupabaseConfigured } from './lib/supabase';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.WELCOME);
  const [user, setUser] = useState<User | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);

  const initData = useCallback(async () => {
    setIsInitializing(true);
    try {
      if (!isSupabaseConfigured()) {
        setDbConnected(false);
        setIsInitializing(false);
        return;
      }

      const connectionTest = await db.testConnection();
      setDbConnected(connectionTest.success);

      const sessionUser = await db.getCurrentSessionUser();
      if (sessionUser) {
        setUser(sessionUser);
        setCurrentScreen(Screen.HOME);
      }
      
      const [jobsData, marketData] = await Promise.all([
        db.getJobs(),
        db.getMarketItems()
      ]);

      setJobs(jobsData);
      setMarketItems(marketData);
    } catch (e: any) {
      console.error("Init failure:", e);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  const updateUser = useCallback(async (updatedFields: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...updatedFields };
    setUser(next);
    await db.saveUser(next);
  }, [user]);

  const navigate = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  const currentView = useMemo(() => {
    if (isInitializing) return <div className="flex-1 bg-black flex items-center justify-center text-[#F5C518] font-black italic">ЦЕХ / ЗАГРУЗКА...</div>;

    switch (currentScreen) {
      case Screen.WELCOME: return <Welcome onStart={() => navigate(user ? Screen.HOME : Screen.AUTH)} />;
      case Screen.AUTH: return <Auth onSuccess={() => initData()} navigate={navigate} />;
      case Screen.HOME: return <Home navigate={navigate} user={user} location={selectedLocation} dbConnected={dbConnected} />;
      case Screen.JOBS: return <Jobs jobs={jobs} user={user} navigate={navigate} onAddJob={async (j) => { await db.addJob(j); setJobs(await db.getJobs()); }} onUpdateUser={updateUser} location={selectedLocation} onStartChat={(p) => { setActiveChat({ id: `chat-${p.id}`, participant: p, unreadCount: 0 }); navigate(Screen.CHAT_DETAIL); }} />;
      case Screen.PROFILE: return <Profile user={user} navigate={navigate} onUpdate={updateUser} dbConnected={dbConnected} />;
      case Screen.VAKHTA_JOURNAL: return <VakhtaJournal navigate={navigate} user={user} />;
      case Screen.MATERIALS_SEARCH: return <MaterialsSearch navigate={navigate} location={selectedLocation} />;
      case Screen.NOTES: return <Notes navigate={navigate} user={user} />;
      case Screen.MARKETPLACE: return <Marketplace items={marketItems} user={user!} navigate={navigate} onAddItem={async (item) => { await db.addMarketItem(item); setMarketItems(await db.getMarketItems()); }} location={selectedLocation} onStartChat={(p) => { setActiveChat({ id: `chat-${p.id}`, participant: p, unreadCount: 0 }); navigate(Screen.CHAT_DETAIL); }} />;
      case Screen.CHATS: return <ChatList user={user!} navigate={navigate} onSelectChat={(c) => { setActiveChat(c); navigate(Screen.CHAT_DETAIL); }} />;
      case Screen.CHAT_DETAIL: return <ChatDetail chat={activeChat} user={user!} navigate={navigate} />;
      case Screen.BUGOR_CHAT: return <BugorChat user={user!} navigate={navigate} />;
      case Screen.DIAGNOSTIC: return <Diagnostic navigate={navigate} onRefresh={initData} />;
      default: return <Home navigate={navigate} user={user} location={selectedLocation} dbConnected={dbConnected} />;
    }
  }, [currentScreen, user, isInitializing, activeChat, jobs, marketItems, selectedLocation, dbConnected, initData, navigate, updateUser]);

  const showNav = user && ![Screen.WELCOME, Screen.AUTH, Screen.CHAT_DETAIL, Screen.BUGOR_CHAT, Screen.VAKHTA_JOURNAL, Screen.MATERIALS_SEARCH, Screen.NOTES, Screen.DIAGNOSTIC].includes(currentScreen);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#080808]">
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView}
      </main>
      
      {showNav && (
        <div className="fixed bottom-6 left-5 right-5 h-20 z-[100]">
          <nav className="w-full h-full bg-[#121212]/90 backdrop-blur-xl rounded-[30px] border border-white/5 flex items-center justify-around px-2 shadow-2xl">
            <NavButton active={currentScreen === Screen.HOME} onClick={() => navigate(Screen.HOME)} label="Цех">🏠</NavButton>
            <NavButton active={currentScreen === Screen.JOBS} onClick={() => navigate(Screen.JOBS)} label="Работа">💼</NavButton>
            <NavButton active={currentScreen === Screen.MARKETPLACE} onClick={() => navigate(Screen.MARKETPLACE)} label="Базар">📦</NavButton>
            <NavButton active={currentScreen === Screen.CHATS} onClick={() => navigate(Screen.CHATS)} label="Чат">💬</NavButton>
            <NavButton active={currentScreen === Screen.PROFILE} onClick={() => navigate(Screen.PROFILE)} label="Я">👤</NavButton>
          </nav>
        </div>
      )}
    </div>
  );
};

const NavButton: React.FC<{active: boolean, onClick: () => void, label: string, children: React.ReactNode}> = ({active, onClick, label, children}) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${active ? 'text-[#F5C518]' : 'text-zinc-600'}`}>
    <span className={`text-xl mb-0.5 ${active ? 'scale-110' : ''}`}>{children}</span>
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
