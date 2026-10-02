// Supabase Client Helper
// Catatan: Supabase database belum diaktifkan sesuai instruksi.
// File ini disiapkan agar jika environment variable VITE_SUPABASE_URL
// dan VITE_SUPABASE_ANON_KEY diisi di kemudian hari, integrasi langsung terhubung.

export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  isConfigured: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
};
