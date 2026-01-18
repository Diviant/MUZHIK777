
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Screen, User, Job, ServiceRequest, Location, Team, AutoService, HeavyMachinery, HitchhikingCargo, Conversation, MarketItem, Hitchhiker } from './types';
import { db } from './database';
import Welcome from './components/Welcome';
import Auth from './components/Auth';
import Home from './components/Home';
import Jobs from './components/Jobs';
import Ranking from './components/Ranking';
import Profile from './components/Profile';
import Marketplace from './components/Marketplace';
import ChatList from './components/ChatList';
import ChatDetail from './components/ChatDetail';
import BugorChat from './components/BugorChat';
import VakhtaJournal from './components/VakhtaJournal';
import MaterialsSearch from './components/MaterialsSearch';
import Notes from './components/Notes';
import Feed from './components/Feed';
import ContractGen from './components/ContractGen';
import Calculators from './components/Calculators';
import AutoServices from './components/AutoServices';
import HeavyMachineryScreen from './components/HeavyMachinery';
import HitchhikingCargoScreen from './components/HitchhikingCargo';
import Hitchhikers from './components/Hitchhikers';
import Teams from './components/Teams';
import AdminLogin from './components/AdminLogin';
import AdminVacancies from './components/AdminVacancies';
import Diagnostic from './components/Diagnostic';
import Gallery from './components/Gallery';
import Referral from './components/Referral';
import VakhtaCenter from './components/VakhtaCenter';
import MapExplorer from './components/MapExplorer';
import SVOCenter from './components/SVOCenter';
import Checklists from './components/Checklists';
import Logistics from './components/Logistics';
import Rest from './components/Rest';
import About from './components/About';
import AgroCenter from './components/AgroCenter';
import SOSRules from './components/SOSRules';
import LegalCenter from './components/LegalCenter';
import { isSupabaseConfigured } from './lib/supabase';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.WELCOME);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [cargo, setCargo] = useState<HitchhikingCargo[]>([]);
  const [hitchhikers, setHitchhikers] = useState<Hitchhiker[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [autoServices, setAutoServices] = useState<AutoService[]>([]);
  const [machinery, setMachinery] = useState<HeavyMachinery[]>([]);

  const fetchContent = useCallback(() => {
    db.getJobs().then(setJobs).catch(() => {});
    db.getMarketItems().then(setMarketItems).catch(() => {});
    db.getCargo().then(setCargo).catch(() => {});
    db.getHitchhikers().then(setHitchhikers).catch(() => {});
    db.getTeams().then(setTeams).catch(() => {});
    db.getAutoServices().then(setAutoServices).catch(() => {});
    db.getMachinery().then(setMachinery).catch(() => {});
  }, []);

  const handleWelcomeBonus = useCallback(async (loadedUser: User) => {
    if (!loadedUser.welcomeBonusClaimed && loadedUser.id !== 'guest') {
      const updatedPoints = await db.claimWelcomeBonus(loadedUser.id);
      if (updatedPoints !== null) {
        setUser(prev => prev ? { ...prev, points: updatedPoints, welcomeBonusClaimed: true } : null);
      }
    }
  }, []);

  const initData = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const sessionUser = await db.getCurrentSessionUser();
      if (sessionUser) {
        setUser(sessionUser);
        setIsGuest(false);
        setCurrentScreen(Screen.HOME);
        setDbConnected(true);
        fetchContent();
        handleWelcomeBonus(sessionUser);
      } else {
        setDbConnected(true);
      }
    } else {
      setDbConnected(false);
    }
    setIsInitializing(false);
  }, [fetchContent, handleWelcomeBonus]);

  useEffect(() => {
    initData();
  }, [initData]);

  const handleGuestEntry = useCallback(() => {
    setIsGuest(true);
    setUser({
      id: 'guest',
      username: 'guest_user',
      firstName: 'Гость',
      rating: 5,
      points: 0,
      isPro: false,
      isAdmin: false,
      isVerified: false,
      welcomeBonusClaimed: true,
      isReliable: true,
      referralCode: '',
      dealsCount: 0,
      isDonor: false,
      level: 'Новичок',
      specialization: []
    });
    setCurrentScreen(Screen.HOME);
    fetchContent();
  }, [fetchContent]);

  const navigate = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  const currentView = useMemo(() => {
    if (isInitializing) return (
      <div className="flex-1 bg-black flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-6"></div>
        <div className="text-[#D4AF37] font-black italic text-[9px] tracking-[0.6em] uppercase animate-pulse">ЦЕХ / СОЕДИНЕНИЕ</div>
      </div>
    );

    switch (currentScreen) {
      case Screen.WELCOME: return <Welcome onStart={() => navigate(user ? Screen.HOME : Screen.AUTH)} onGuest={handleGuestEntry} navigate={navigate} />;
      case Screen.AUTH: return <Auth onSuccess={() => initData()} onGuest={handleGuestEntry} navigate={navigate} />;
      case Screen.HOME: return <Home navigate={navigate} user={user} location={selectedLocation} dbConnected={dbConnected} />;
      case Screen.JOBS: return <Jobs jobs={jobs} user={user} navigate={navigate} onAddJob={async (j) => { await db.addJob(j); fetchContent(); }} onUpdateUser={f => setUser(prev => prev ? {...prev, ...f} : null)} location={selectedLocation} onStartChat={(p) => { setActiveChat({ id: `chat-${p.id}`, participant: p, unreadCount: 0 }); navigate(Screen.CHAT_DETAIL); }} />;
      case Screen.RANKING: return <Ranking navigate={navigate} currentUser={user} />;
      case Screen.PROFILE: return <Profile user={user} navigate={navigate} onUpdate={f => setUser(prev => prev ? {...prev, ...f} : null)} dbConnected={dbConnected} isGuest={isGuest} />;
      case Screen.VAKHTA_JOURNAL: return <VakhtaJournal navigate={navigate} user={user} />;
      case Screen.FEED: return <Feed navigate={navigate} user={user!} />;
      case Screen.MARKETPLACE: return <Marketplace items={marketItems} user={user!} navigate={navigate} onAddItem={async (item) => { await db.addMarketItem(item); fetchContent(); }} location={selectedLocation} onStartChat={(p) => { setActiveChat({ id: `chat-${p.id}`, participant: p, unreadCount: 0 }); navigate(Screen.CHAT_DETAIL); }} />;
      case Screen.CHATS: return <ChatList user={user!} navigate={navigate} onSelectChat={(c) => { setActiveChat(c); navigate(Screen.CHAT_DETAIL); }} />;
      case Screen.CHAT_DETAIL: return <ChatDetail chat={activeChat} user={user!} navigate={navigate} />;
      case Screen.BUGOR_CHAT: return <BugorChat user={user!} navigate={navigate} />;
      case Screen.MATERIALS_SEARCH: return <MaterialsSearch navigate={navigate} location={selectedLocation} />;
      case Screen.HEAVY_MACHINERY: return <HeavyMachineryScreen machinery={machinery} navigate={navigate} onAddMachinery={async (m) => { await db.addMachinery(m); fetchContent(); }} location={selectedLocation} />;
      case Screen.AUTO_SERVICES: return <AutoServices autoServices={autoServices} navigate={navigate} onAddService={async (as) => { await db.addAutoService(as); fetchContent(); }} location={selectedLocation} />;
      case Screen.CARGO: return <HitchhikingCargoScreen cargo={cargo} navigate={navigate} onAddCargo={async (c) => { await db.addCargo(c); fetchContent(); }} location={selectedLocation} onStartChat={(p) => { setActiveChat({ id: `chat-${p.id}`, participant: p, unreadCount: 0 }); navigate(Screen.CHAT_DETAIL); }} />;
      case Screen.HITCHHIKERS: return <Hitchhikers hitchhikers={hitchhikers} navigate={navigate} onAddHitchhiker={async (h) => { await db.addHitchhiker(h); fetchContent(); }} location={selectedLocation} onStartChat={(p) => { setActiveChat({ id: `chat-${p.id}`, participant: p, unreadCount: 0 }); navigate(Screen.CHAT_DETAIL); }} />;
      case Screen.CONTRACT_GEN: return <ContractGen navigate={navigate} user={user!} />;
      case Screen.CALCULATORS: return <Calculators navigate={navigate} />;
      case Screen.TEAMS: return <Teams teams={teams} navigate={navigate} onAddTeam={async (t) => { await db.addTeam(t); fetchContent(); }} location={selectedLocation} onStartChat={(p) => { setActiveChat({ id: `chat-${p.id}`, participant: p, unreadCount: 0 }); navigate(Screen.CHAT_DETAIL); }} />;
      case Screen.ADMIN_LOGIN: return <AdminLogin navigate={navigate} />;
      case Screen.ADMIN_VACANCIES: return <AdminVacancies navigate={navigate} onStartChat={(p) => { setActiveChat({ id: `chat-${p.id}`, participant: p, unreadCount: 0 }); navigate(Screen.CHAT_DETAIL); }} />;
      case Screen.DIAGNOSTIC: return <Diagnostic navigate={navigate} onRefresh={() => initData()} />;
      case Screen.GALLERY: return <Gallery user={user!} navigate={navigate} onUpdate={f => setUser(prev => prev ? {...prev, ...f} : null)} />;
      case Screen.REFERRAL: return <Referral user={user} navigate={navigate} onBonusClaim={(p) => setUser(prev => prev ? {...prev, points: prev.points + p} : null)} />;
      case Screen.VAKHTA_CENTER: return <VakhtaCenter jobs={jobs} user={user!} navigate={navigate} onStartChat={(p) => { setActiveChat({ id: `chat-${p.id}`, participant: p, unreadCount: 0 }); navigate(Screen.CHAT_DETAIL); }} />;
      case Screen.MAP_EXPLORER: return <MapExplorer navigate={navigate} user={user!} />;
      case Screen.SVO_CENTER: return <SVOCenter user={user!} navigate={navigate} />;
      case Screen.CHECKLISTS: return <Checklists navigate={navigate} />;
      case Screen.LOGISTICS: return <Logistics navigate={navigate} user={user} />;
      case Screen.REST: return <Rest navigate={navigate} location={selectedLocation} />;
      case Screen.ABOUT: return <About navigate={navigate} />;
      case Screen.AGRO_CENTER: return <AgroCenter navigate={navigate} user={user} location={selectedLocation} />;
      case Screen.SOS_RULES: return <SOSRules navigate={navigate} />;
      case Screen.LEGAL_CENTER: return <LegalCenter user={user!} navigate={navigate} />;
      default: return <Home navigate={navigate} user={user} location={selectedLocation} dbConnected={dbConnected} />;
    }
  }, [currentScreen, user, isInitializing, activeChat, jobs, marketItems, cargo, hitchhikers, teams, autoServices, machinery, selectedLocation, dbConnected, initData, navigate, handleGuestEntry, isGuest, fetchContent]);

  const showNav = user && ![Screen.WELCOME, Screen.AUTH, Screen.CHAT_DETAIL, Screen.BUGOR_CHAT, Screen.ADMIN_LOGIN, Screen.ADMIN_VACANCIES, Screen.DIAGNOSTIC, Screen.GALLERY, Screen.REFERRAL, Screen.MAP_EXPLORER, Screen.SVO_CENTER, Screen.ABOUT, Screen.AGRO_CENTER, Screen.SOS_RULES, Screen.LEGAL_CENTER].includes(currentScreen);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#050505]">
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView}
      </main>
      
      {showNav && (
        <div className="fixed bottom-0 left-0 right-0 h-16 z-[100] pb-safe">
          <nav className="w-full h-full bg-[#080808]/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-2 shadow-2xl">
            <NavButton active={currentScreen === Screen.HOME} onClick={() => navigate(Screen.HOME)} label="Цех">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </NavButton>
            <NavButton active={currentScreen === Screen.JOBS || currentScreen === Screen.VAKHTA_CENTER} onClick={() => navigate(Screen.VAKHTA_CENTER)} label="Вахта">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </NavButton>
            <NavButton active={currentScreen === Screen.MAP_EXPLORER} onClick={() => navigate(Screen.MAP_EXPLORER)} label="Карта">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </NavButton>
            <NavButton active={currentScreen === Screen.CHATS} onClick={() => navigate(Screen.CHATS)} label="Чат">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
            </NavButton>
            <NavButton active={currentScreen === Screen.PROFILE || currentScreen === Screen.SVO_CENTER} onClick={() => navigate(Screen.PROFILE)} label="Я">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </NavButton>
          </nav>
        </div>
      )}
    </div>
  );
};

const NavButton: React.FC<{active: boolean, onClick: () => void, label: string, children: React.ReactNode}> = ({active, onClick, label, children}) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${active ? 'text-[#D4AF37]' : 'text-zinc-600'}`}>
    <span className={`flex items-center justify-center mb-0.5 ${active ? 'scale-110' : ''}`}>{children}</span>
    <span className="text-[7px] font-black uppercase tracking-widest leading-none mt-0.5">{label}</span>
  </button>
);

export default App;
