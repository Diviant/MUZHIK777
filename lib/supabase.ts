
import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem(`OVERRIDE_SUPABASE_${key}`);
    if (override) return override.trim();
  }
  
  // Ищем во всех возможных местах (Vite, Next, Process)
  const variations = [`VITE_SUPABASE_${key}`, `NEXT_PUBLIC_MUZHIKSUPABASE_${key}`, `SUPABASE_${key}`, `VITE_${key}`];
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
  key: getEnvVar('ANON_KEY')
};

export const isSupabaseConfigured = () => {
  const hasUrl = !!config.url && config.url.startsWith('https://');
  const hasKey = !!config.key && config.key.length > 20;
  return hasUrl && hasKey;
};

export const supabase = createClient(
  config.url || 'https://placeholder.supabase.co',
  config.key || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Added missing getAdminClient export for bulk operations
export const getAdminClient = () => supabase;

export const getDebugConfig = () => {
  return { 
    url: config.url, 
    key: config.key ? `${config.key.substring(0, 8)}...${config.key.substring(config.key.length - 4)}` : 'MISSING',
    urlOk: config.url?.includes('supabase.co'),
    keyOk: config.key?.length > 50,
    isManual: typeof window !== 'undefined' && !!localStorage.getItem('OVERRIDE_SUPABASE_URL')
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
  localStorage.clear();
  window.location.reload();
};

export const getTgCredentials = (tgId: number) => {
  return {
    email: `tg_${tgId}@muzhik.app`,
    password: `pass_${tgId}_${(config.key || 'default').substring(0, 10)}`
  };
};
