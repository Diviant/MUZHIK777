
export enum Screen {
  WELCOME = 'WELCOME',
  AUTH = 'AUTH',
  HOME = 'HOME',
  JOBS = 'JOBS',
  SERVICES = 'SERVICES',
  PROFILE = 'PROFILE',
  REFERRAL = 'REFERRAL',
  RANKING = 'RANKING',
  LOCATIONS = 'LOCATIONS',
  TEAMS = 'TEAMS',
  AUTO_SERVICES = 'AUTO_SERVICES',
  HEAVY_MACHINERY = 'HEAVY_MACHINERY',
  CARGO = 'CARGO',
  SUPPORT = 'SUPPORT',
  MY_ADS = 'MY_ADS',
  CHATS = 'CHATS',
  CHAT_DETAIL = 'CHAT_DETAIL',
  MARKETPLACE = 'MARKETPLACE',
  DIAGNOSTIC = 'DIAGNOSTIC',
  BUGOR_CHAT = 'BUGOR_CHAT',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_VACANCIES = 'ADMIN_VACANCIES',
  VAKHTA_JOURNAL = 'VAKHTA_JOURNAL',
  MATERIALS_SEARCH = 'MATERIALS_SEARCH',
  NOTES = 'NOTES',
  FEED = 'FEED',
  CONTRACT_GEN = 'CONTRACT_GEN',
  CALCULATORS = 'CALCULATORS'
}

export interface User {
  id: string; 
  username: string;
  firstName: string;
  photoUrl?: string;
  rating: number;
  points: number;
  isPro: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  isReliable: boolean;
  isBanned?: boolean;
  referralCode: string;
  referredById?: string;
  dealsCount: number;
  isDonor: boolean;
  level: string;
  specialization: string[];
  portfolioImages?: string[]; // Новое поле
}

// ... остальные интерфейсы без изменений
export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  imageUrl?: string;
  createdAt: number;
}
export interface VakhtaEntry {
  startDate: string;
  expectedSalary: number;
  advances: number;
  travelExpenses: number;
  foodExpenses: number;
  sentHome: number;
}
export interface Note {
  id: string;
  text: string;
  timestamp: number;
}
export interface MarketItem {
  id: string;
  authorId: string;
  type: 'SELL' | 'BUY';
  category: string;
  title: string;
  price: string;
  condition: string;
  description: string;
  contact: string;
  cityId?: string;
}
export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  image?: string;
  voiceUrl?: string;
  timestamp: number;
}
export interface Conversation {
  id: string;
  participant: Partial<User>;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
}
export interface Location { id: string; name: string; type: 'region' | 'city' | 'settlement'; parentId?: string; count?: number; }
export interface Job { id: string; authorId?: string; title: string; salary: string; region: string; cityId?: string; isVahta: boolean; housing: boolean; description: string; contact: string; }
export interface ServiceRequest { id: string; authorId?: string; category: string; title: string; description: string; price: string; author: string; contact: string; cityId?: string; }
export interface HitchhikingCargo { id: string; authorId?: string; title: string; routeFrom: string; routeTo: string; cargoType: string; weight: string; price: string; departureDate: string; description: string; contact: string; }
export interface TeamMember { role: string; count: number; }
export interface Team { id: string; authorId?: string; name: string; leader: string; category: string; memberCount: number; structure: TeamMember[]; equipment: string[]; description: string; rating: number; cityId?: string; contact: string; }
export interface AutoService { id: string; authorId?: string; name: string; category: string; address: string; description: string; rating: number; cityId?: string; contact: string; features: string[]; }
export interface HeavyMachinery { id: string; authorId?: string; type: string; model: string; rate: string; cityId?: string; description: string; contact: string; includesOperator: boolean; includesFuel: boolean; specs: string[]; }
