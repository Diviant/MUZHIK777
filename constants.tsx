
import { Job, ServiceRequest, Location, Team, AutoService, HeavyMachinery } from './types';

export const COLORS = {
  bg: '#0E0E0E',
  card: '#161616',
  secondary: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accent: '#F5C518',
  error: '#8B0000',
  success: '#2E7D32',
};

// Экономика приложения
export const ECONOMY = {
  AD_POST_COST: 50,    // Стоимость размещения объявления
  PRO_STATUS_COST: 1000, // Стоимость PRO аккаунта
  REFERRAL_BONUS: 50,  // Бонус за друга (синхронизировано с UI)
  DAILY_REF_LIMIT: 3,  // Лимит рефералов в сутки
};

export const REGIONS: Location[] = [
  { id: 'reg-77', name: 'Москва и МО', type: 'region', count: 1240 },
  { id: 'reg-78', name: 'Санкт-Петербург', type: 'region', count: 850 },
  { id: 'reg-23', name: 'Краснодарский край', type: 'region', count: 420 },
  { id: 'reg-54', name: 'Новосибирская обл.', type: 'region', count: 310 },
  { id: 'reg-24', name: 'Красноярский край', type: 'region', count: 280 },
  { id: 'reg-89', name: 'ЯНАО', type: 'region', count: 150 },
];

export const CITIES: Location[] = [
  { id: 'city-77', parentId: 'reg-77', name: 'Москва', type: 'city', count: 900 },
  { id: 'city-50', parentId: 'reg-77', name: 'Химки', type: 'city', count: 45 },
  { id: 'city-78', parentId: 'reg-78', name: 'Санкт-Петербург', type: 'city', count: 850 },
  { id: 'city-23', parentId: 'reg-23', name: 'Краснодар', type: 'city', count: 200 },
  { id: 'city-sochi', parentId: 'reg-23', name: 'Сочи', type: 'city', count: 120 },
  { id: 'city-24', parentId: 'reg-24', name: 'Красноярск', type: 'city', count: 210 },
  { id: 'city-norilsk', parentId: 'reg-24', name: 'Норильск', type: 'city', count: 70 },
  { id: 'city-sabetta', parentId: 'reg-89', name: 'Сабетта', type: 'city', count: 50 },
];

export const MOCK_HEAVY_MACHINERY: HeavyMachinery[] = [
  {
    id: 'hm-1',
    type: 'Экскаватор',
    model: 'JCB 3CX Eco',
    rate: '3,000 ₽ / час',
    cityId: 'city-77',
    description: 'Ковш 0.3м3. Есть узкий ковш и гидромолот. Машинист с опытом 10 лет.',
    contact: 'https://t.me/stroy_tech_mos',
    includesOperator: true,
    includesFuel: true,
    specs: ['Ковш 0.3 м3', 'Глубина 5.5м', 'Гидромолот']
  }
];

export const MOCK_AUTO_SERVICES: AutoService[] = [
  {
    id: 'as-1',
    name: 'Garage Brothers',
    category: 'Малярка',
    address: 'ул. Промышленная, 12',
    description: 'Покраска в камере, подбор цвета, кузовной ремонт любой сложности.',
    rating: 4.9,
    cityId: 'city-77',
    contact: 'https://t.me/garage_bros_moscow',
    features: ['Гарантия 1 год', 'Своя лаборатория']
  }
];

export const MOCK_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Бригада "Монолит-77"',
    leader: 'Дмитрий Степанов',
    category: 'Бетонные работы',
    memberCount: 8,
    structure: [
      { role: 'Мастер-бетонщик', count: 4 },
      { role: 'Арматурщик', count: 2 },
      { role: 'Подсобник', count: 2 }
    ],
    equipment: ['Вибраторы', 'Опалубка (своя)', 'Нивелир'],
    description: 'Берем объекты от 500 м3. Свой инструмент. Работаем по договору.',
    rating: 5.0,
    cityId: 'city-77',
    contact: 'https://t.me/dmitry_monolit'
  }
];

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    // Added authorId to fix Property 'authorId' is missing error
    authorId: 'system-recruiter-1',
    title: 'Сварщик НАКС (Вахта 60/30)',
    salary: '180,000 - 240,000 ₽',
    region: 'ЯНАО',
    cityId: 'city-sabetta',
    isVahta: true,
    housing: true,
    description: 'Требуются сварщики с действующим удостоверением. Питание и перелет за счет компании.',
    contact: 'https://t.me/job_recruiter_1',
  }
];

export const MOCK_SERVICES: ServiceRequest[] = [
  {
    id: '101',
    category: 'Сантехника',
    title: 'Замена смесителя и сифона',
    description: 'Нужно заменить смеситель на кухне. Все детали куплены.',
    price: '2,500 ₽',
    author: 'Иван Петров',
    contact: 'https://t.me/ivan_master_88',
    cityId: 'city-77',
  }
];
