
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Screen, User, Job, ServiceRequest, Location, Team, AutoService, HeavyMachinery, HitchhikingCargo, Conversation, MarketItem } from './types';
import { db } from './database';
import Welcome from './components/Welcome';
import Auth from './components/Auth';
import Home from './components/Home';
import Jobs from './components/Jobs';
import Services from './components/Services';
import HitchhikingCargoScreen from './components/HitchhikingCargo';
import Profile from './components/Profile';
import Referral from './components/Referral';
import Ranking from './components/Ranking';
import LocationSelector from './components/LocationSelector';
import Teams from './components/Teams';
import AutoServices from './components/AutoServices';
import HeavyMachineryScreen from './components/HeavyMachinery';
import Support from './components/Support';
import MyAds from './components/MyAds';
import AdminLogin from './components/AdminLogin';
import AdminVacancies from './components/AdminVacancies';
import ChatList from './components/ChatList';
import ChatDetail from './components/ChatDetail';
import Marketplace from './components/Marketplace';
import Diagnostic from './components/Diagnostic';
import BugorChat from './components/BugorChat';
import { isSupabaseConfigured } from './lib/supabase';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.WELCOME);
  const [user, setUser] = useState<User | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [cargo, setCargo] = useState<HitchhikingCargo[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [autoServices, setAutoServices] = useState<AutoService[]>([]);
  const [machinery, setMachinery] = useState<HeavyMachinery[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const initData = useCallback(async () => {
    setIsInitializing(true);
    
    if (!isSupabaseConfigured()) {
      setDbConnected(false);
      setIsInitializing(false);
      return;
    }

    const connectionTest = await db.testConnection();
    setDbConnected(connectionTest.success);

    try {
      const sessionUser = await db.getCurrentSessionUser();
      if (sessionUser) {
        if (sessionUser.isBanned) {
          alert("Твой аккаунт заблокирован администрацией Цеха.");
        }
        setUser(sessionUser);
        setCurrentScreen(Screen.HOME);
      }
      
      const [jobsData, servicesData, cargoData, teamsData, autoData, machData, marketData] = await Promise.all([
        db.getJobs(),
        db.getServices(),
        db.getCargo(),
        db.getTeams(),
        db.getAutoServices(),
        db.getMachinery(),
        db.getMarketItems()
      ]);

      setJobs(jobsData);
      setServices(servicesData);
      setCargo(cargoData);
      setTeams(teamsData);
      setAutoServices(autoData);
      setMachinery(machData);
      setMarketItems(marketData);
    } catch (e) {
      console.error("Initialization failure:", e);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    initData();
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      try {
        if (tg.expand) tg.expand();
        if (typeof tg.setHeaderColor === 'function') tg.setHeaderColor('#0E0E0E');
      } catch (e) {}
    }
  }, [initData]);

  const updateUser = useCallback(async (updatedFields: Partial<User>) => {
    if (!user) return;
    try {
      const next = { ...user, ...updatedFields };
      await db.saveUser(next);
      setUser(next);
    } catch (e) {
      console.error("Failed to persist profile update:", e);
    }
  }, [user]);

  const navigate = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback?.impactOccurred) {
      try { tg.HapticFeedback.impactOccurred('medium'); } catch (e) {}
    }
  }, []);

  const startChat = useCallback((participant: Partial<User>) => {
    const chat: Conversation = {
      id: `chat-${participant.id}`,
      participant,
      unreadCount: 0
    };
    setActiveChat(chat);
    navigate(Screen.CHAT_DETAIL);
  }, [navigate]);

  const currentView = useMemo(() => {
    if (isInitializing) return (
      <div className="flex-1 bg-[#080808] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-[#F5C518]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#F5C518] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );

    // Если нет конфига Supabase и мы не на экране диагностики
    if (!isSupabaseConfigured() && currentScreen !== Screen.DIAGNOSTIC) {
      return (
        <div className="flex-1 bg-[#080808] flex flex-col items-center justify-center p-8 text-center">
          <div className="text-5xl mb-6">⚠️</div>
          <h2 className="text-xl font-black text-white uppercase italic mb-4">ЦЕХ ОБЕСТОЧЕН</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">
            Связь с базой данных потеряна. Возможно, старые ключи больше не работают.
          </p>
          <button 
            onClick={() => navigate(Screen.DIAGNOSTIC)}
            className="w-full bg-[#F5C518] text-black font-black py-4 rounded-2xl uppercase italic tracking-tighter shadow-xl shadow-[#F5C518]/20"
          >
            НАСТРОИТЬ ПОДКЛЮЧЕНИЕ
          </button>
        </div>
      );
    }

    switch (currentScreen) {
      case Screen.WELCOME: return <Welcome onStart={() => navigate(user ? Screen.HOME : Screen.AUTH)} />;
      case Screen.AUTH: return <Auth onSuccess={() => initData()} navigate={navigate} />;
      case Screen.HOME: return <Home navigate={navigate} user={user} location={selectedLocation} dbConnected={dbConnected} />;
      case Screen.JOBS: return <Jobs jobs={jobs} user={user} navigate={navigate} onAddJob={async (j) => { await db.addJob(j); setJobs(await db.getJobs()); }} onUpdateUser={updateUser} location={selectedLocation} onStartChat={startChat} />;
      case Screen.SERVICES: return <Services services={services} navigate={navigate} onAddService={async (s) => { await db.addService(s); setServices(await db.getServices()); }} location={selectedLocation} onStartChat={startChat} />;
      case Screen.MARKETPLACE: return <Marketplace items={marketItems} user={user!} navigate={navigate} onAddItem={async (item) => { await db.addMarketItem(item); setMarketItems(await db.getMarketItems()); }} location={selectedLocation} onStartChat={startChat} />;
      case Screen.CARGO: return <HitchhikingCargoScreen cargo={cargo} navigate={navigate} onAddCargo={async (c) => { await db.addCargo(c); setCargo(await db.getCargo()); }} location={selectedLocation} onStartChat={startChat} />;
      case Screen.PROFILE: return <Profile user={user} navigate={navigate} onUpdate={updateUser} dbConnected={dbConnected} />;
      case Screen.REFERRAL: return <Referral user={user} navigate={navigate} onBonusClaim={(p) => user && updateUser({ points: user.points + p })} />;
      case Screen.RANKING: return <Ranking navigate={navigate} currentUser={user} />;
      case Screen.LOCATIONS: return <LocationSelector onSelect={(l) => { setSelectedLocation(l); navigate(Screen.HOME); }} navigate={navigate} />;
      case Screen.TEAMS: return <Teams teams={teams} navigate={navigate} onAddTeam={async (t) => { await db.addTeam(t); setTeams(await db.getTeams()); }} location={selectedLocation} onStartChat={startChat} />;
      case Screen.AUTO_SERVICES: return <AutoServices autoServices={autoServices} navigate={navigate} onAddService={async (as) => { await db.addAutoService(as); setAutoServices(await db.getAutoServices()); }} location={selectedLocation} />;
      case Screen.HEAVY_MACHINERY: return <HeavyMachineryScreen machinery={machinery} navigate={navigate} onAddMachinery={async (m) => { await db.addMachinery(m); setMachinery(await db.getMachinery()); }} location={selectedLocation} />;
      case Screen.CHATS: return <ChatList user={user!} navigate={navigate} onSelectChat={(c) => { setActiveChat(c); navigate(Screen.CHAT_DETAIL); }} />;
      case Screen.CHAT_DETAIL: return <ChatDetail chat={activeChat} user={user!} navigate={navigate} />;
      case Screen.BUGOR_CHAT: return <BugorChat user={user!} navigate={navigate} />;
      case Screen.MY_ADS: return (
        < MyAds 
          user={user!} 
          navigate={navigate} 
          jobs={jobs} 
          services={services}
          cargo={cargo}
          teams={teams} 
          autoServices={autoServices} 
          machinery={machinery} 
          marketItems={marketItems}
          onDeleteJob={async (id) => { await db.deleteJob(id); setJobs(await db.getJobs()); }}
          onDeleteService={async (id) => { await db.deleteService(id); setServices(await db.getServices()); }}
          onDeleteCargo={async (id) => { await db.deleteCargo(id); setCargo(await db.getCargo()); }}
          onDeleteTeam={async (id) => { await db.deleteTeam(id); setTeams(await db.getTeams()); }}
          onDeleteAutoService={async (id) => { await db.deleteAutoService(id); setAutoServices(await db.getAutoServices()); }}
          onDeleteMachinery={async (id) => { await db.deleteMachinery(id); setMachinery(await db.getMachinery()); }}
          onDeleteMarketItem={async (id) => { await db.deleteMarketItem(id); setMarketItems(await db.getMarketItems()); }}
        />
      );
      case Screen.DIAGNOSTIC: return <Diagnostic navigate={navigate} onRefresh={initData} />;
      default: return <Home navigate={navigate} user={user} location={selectedLocation} dbConnected={dbConnected} />;
    }
  }, [currentScreen, user, selectedLocation, jobs, services, cargo, teams, autoServices, machinery, marketItems, activeChat, navigate, updateUser, startChat, isInitializing, initData, dbConnected]);

  const showNav = user && ![
    Screen.WELCOME, 
    Screen.AUTH,
    Screen.LOCATIONS, 
    Screen.CHAT_DETAIL,
    Screen.BUGOR_CHAT,
    Screen.DIAGNOSTIC
  ].includes(currentScreen);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#080808] relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-[9999]" 
           style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }}>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView}
      </main>
      
      {showNav && (
        <div className="fixed bottom-6 left-5 right-5 h-20 z-[100]">
          <nav className="w-full h-full bg-[#121212]/90 backdrop-blur-xl rounded-[30px] border border-white/5 flex items-center justify-around px-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
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
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 relative group ${active ? 'text-[#F5C518]' : 'text-zinc-600 hover:text-zinc-400'}`}
  >
    {active && <div className="absolute -top-1 w-8 h-1 bg-[#F5C518] rounded-full blur-[2px] animate-pulse"></div>}
    <span className={`text-xl mb-0.5 transition-transform duration-300 ${active ? 'scale-110 -translate-y-1' : ''}`}>{children}</span>
    <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);

export default App;
