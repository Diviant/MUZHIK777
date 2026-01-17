
import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem(`OVERRIDE_SUPABASE_${key}`);
    if (override) {
      console.log(`[Supabase Config] Using Manual Override for ${key}`);
      return override.trim();
    }
  }
  
  const variations = [
    `VITE_SUPABASE_${key}`, 
    `VITE_${key}`,
    `SUPABASE_${key}`, 
    `NEXT_PUBLIC_${key}`,
    `NEXT_PUBLIC_MUZHIKSUPABASE_${key}`,
    `REACT_APP_SUPABASE_${key}`
  ];
  
  const metaEnv = (import.meta as any).env || {};
  const processEnv = typeof process !== 'undefined' ? (process.env as any) : {};
  
  for (const v of variations) {
    const val = metaEnv[v] || processEnv[v] || (typeof window !== 'undefined' ? (window as any)[v] : undefined);
    if (val && typeof val === 'string' && val.length > 5) {
      console.log(`[Supabase Config] Found ${key} in variable: ${v}`);
      return val.trim();
    }
  }
  
  console.warn(`[Supabase Config] CRITICAL: ${key} not found in any environment variable!`);
  return '';
};

const config = {
  url: getEnvVar('URL'),
  key: getEnvVar('ANON_KEY'),
  // Added serviceKey to config for administrative operations
  serviceKey: getEnvVar('SERVICE_ROLE_KEY')
};

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';

export const isSupabaseConfigured = () => {
  const hasUrl = !!config.url && config.url.startsWith('https://') && config.url !== PLACEHOLDER_URL;
  const hasKey = !!config.key && config.key.length > 20 && config.key !== 'placeholder';
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

// Fix: Added getAdminClient export to satisfy requirements for server-side administrative operations (bypassing RLS)
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

export const getDebugConfig = () => {
  return { 
    url: config.url || 'NOT_SET', 
    keyPreview: config.key ? `${config.key.substring(0, 8)}...${config.key.substring(config.key.length - 4)}` : 'MISSING',
    urlOk: !!config.url && config.url.includes('supabase.co') && config.url !== PLACEHOLDER_URL,
    keyOk: !!config.key && config.key.length > 50 && config.key !== 'placeholder',
    isManual: typeof window !== 'undefined' && !!localStorage.getItem('OVERRIDE_SUPABASE_URL')
  };
};

export const saveManualConfig = (url: string, key: string) => {
  if (url && url.includes('supabase.co')) localStorage.setItem('OVERRIDE_SUPABASE_URL', url.trim());
  if (key && key.length > 20) localStorage.setItem('OVERRIDE_SUPABASE_ANON_KEY', key.trim());
  window.location.reload();
};

export const clearManualConfig = () => {
  localStorage.clear(); // Полная очистка
  window.location.reload();
};

export const getTgCredentials = (tgId: number) => {
  return {
    email: `tg_${tgId}@muzhik.app`,
    password: `pass_${tgId}_${(config.key || 'default').substring(0, 10)}`
  };
};
