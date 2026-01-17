import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem(`OVERRIDE_SUPABASE_${key}`);
    if (override) return override.trim();
  }
  
  const variations = [
    `VITE_SUPABASE_${key}`, 
    `VITE_${key}`,
    `SUPABASE_${key}`, 
    `NEXT_PUBLIC_SUPABASE_${key}`,
    key 
  ];
  
  // @ts-ignore
  const metaEnv = import.meta.env || {};
  const processEnv = typeof process !== 'undefined' ? (process.env as any) : {};
  
  for (const v of variations) {
    const val = metaEnv[v] || processEnv[v] || (typeof window !== 'undefined' ? (window as any)[v] : undefined);
    if (val && typeof val === 'string' && val.length > 5) {
      return val.split('\n')[0].trim();
    }
  }
  
  return '';
};

// Функция для Gemini: проверяет локальный "ключ из профиля", затем системный process.env.API_KEY
export const getGeminiKey = (): string => {
  if (typeof window !== 'undefined') {
    const profileKey = localStorage.getItem('MUZHIK_PROFILE_GEMINI_KEY');
    if (profileKey && profileKey.length > 10) return profileKey.trim();
  }
  return process.env.API_KEY || '';
};

const config = {
  url: getEnvVar('URL'),
  key: getEnvVar('ANON_KEY'),
  serviceKey: getEnvVar('SERVICE_ROLE_KEY'),
};

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';

export const isSupabaseConfigured = () => {
  const hasUrl = !!config.url && config.url.includes('supabase.co') && config.url !== PLACEHOLDER_URL;
  const hasKey = !!config.key && config.key.length > 20;
  return hasUrl && hasKey;
};

export const supabase = createClient(
  config.url || PLACEHOLDER_URL,
  config.key || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export const getAdminClient = () => {
  return createClient(
    config.url || PLACEHOLDER_URL,
    config.serviceKey || config.key || 'placeholder',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
};

export const getTgCredentials = (tgId: string | number) => {
  return {
    email: `tg_${tgId}@muzhik.internal`,
    password: `tg_pass_${tgId}_secure_core`
  };
};

export const getDebugConfig = () => {
  const metaEnv = (import.meta as any).env || {};
  const procEnv = (typeof process !== 'undefined' ? process.env : {}) as any;

  return { 
    url: config.url || 'NOT_SET', 
    urlOk: isSupabaseConfigured(),
    sources: {
      vite_url: !!metaEnv.VITE_SUPABASE_URL,
      vite_key: !!metaEnv.VITE_SUPABASE_ANON_KEY,
      proc_key: !!procEnv.API_KEY,
      local_override: typeof window !== 'undefined' && !!localStorage.getItem('OVERRIDE_SUPABASE_URL'),
      profile_ai_key: typeof window !== 'undefined' && !!localStorage.getItem('MUZHIK_PROFILE_GEMINI_KEY')
    },
    geminiKeySet: !!getGeminiKey()
  };
};

export const saveManualConfig = (url: string, key: string, gKey?: string) => {
  if (url) localStorage.setItem('OVERRIDE_SUPABASE_URL', url.trim());
  if (key) localStorage.setItem('OVERRIDE_SUPABASE_ANON_KEY', key.trim());
  if (gKey) localStorage.setItem('MUZHIK_PROFILE_GEMINI_KEY', gKey.trim());
  window.location.reload();
};

export const clearManualConfig = () => {
  localStorage.removeItem('OVERRIDE_SUPABASE_URL');
  localStorage.removeItem('OVERRIDE_SUPABASE_ANON_KEY');
  localStorage.removeItem('MUZHIK_PROFILE_GEMINI_KEY');
  window.location.reload();
};
