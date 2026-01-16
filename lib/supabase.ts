
import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem(`OVERRIDE_SUPABASE_${key}`);
    if (override) return override.trim();
  }
  const variations = [`VITE_SUPABASE_${key}`, `NEXT_PUBLIC_MUZHIKSUPABASE_${key}`, `SUPABASE_${key}`];
  const metaEnv = (import.meta as any).env || {};
  const processEnv = typeof process !== 'undefined' ? (process.env as any) : {};
  for (const v of variations) {
    if (metaEnv[v]) return metaEnv[v].trim();
    if (processEnv[v]) return processEnv[v].trim();
    if (typeof window !== 'undefined' && (window as any)[v]) return (window as any)[v].trim();
  }
  return '';
};

const config = {
  url: getEnvVar('URL'),
  key: getEnvVar('ANON_KEY'),
  serviceKey: typeof process !== 'undefined' ? (process.env.SUPABASE_SERVICE_ROLE_KEY || '') : ''
};

export const isSupabaseConfigured = () => {
  const hasUrl = !!config.url && config.url.startsWith('https://');
  const hasKey = !!config.key && config.key.length > 20;
  return hasUrl && hasKey;
};

export const supabase = createClient(
  config.url || 'https://placeholder-fix-your-env.supabase.co',
  config.key || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

export const getAdminClient = () => {
  return createClient(
    config.url || 'https://placeholder.supabase.co',
    config.serviceKey || config.key || 'placeholder',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

export const getTgCredentials = (tgId: number) => {
  return {
    email: `tg_${tgId}@muzhik.app`,
    password: `pass_${tgId}_${config.key.substring(0, 10)}`
  };
};

export const getDebugConfig = () => {
  const metaEnv = (import.meta as any).env || {};
  const processEnv = typeof process !== 'undefined' ? (process.env as any) : {};
  
  const check = (key: string) => !!(metaEnv[key] || processEnv[key] || (typeof window !== 'undefined' && (window as any)[key]));

  const isLocalStorage = typeof window !== 'undefined' && !!(localStorage.getItem('OVERRIDE_SUPABASE_URL') || localStorage.getItem('OVERRIDE_SUPABASE_ANON_KEY'));

  return { 
    url: config.url, 
    key: config.key, 
    urlStatus: config.url && config.url.includes('supabase.co') ? 'OK' : 'INVALID', 
    keyStatus: config.key && config.key.length > 50 ? 'OK' : 'TOO_SHORT', 
    systemEnv: {
      HAS_VITE_URL: check('VITE_SUPABASE_URL'),
      HAS_VITE_KEY: check('VITE_SUPABASE_ANON_KEY'),
    },
    isLocalStorage,
    source: isLocalStorage ? 'LOCAL_STORAGE (OVERRIDE)' : 'SYSTEM_ENV'
  };
};

export const saveManualConfig = (url: string, key: string) => {
  localStorage.setItem('OVERRIDE_SUPABASE_URL', url.trim());
  localStorage.setItem('OVERRIDE_SUPABASE_ANON_KEY', key.trim());
  window.location.reload();
};

export const clearManualConfig = () => {
  localStorage.removeItem('OVERRIDE_SUPABASE_URL');
  localStorage.removeItem('OVERRIDE_SUPABASE_ANON_KEY');
  localStorage.clear(); // Полная зачистка
  window.location.reload();
};
