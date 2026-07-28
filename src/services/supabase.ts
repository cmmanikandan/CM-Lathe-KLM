import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lcxbnhwtvmnvbolsmtzh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TnEuiuA4l3tOta5Yz37bPQ_Z6hlSV6E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
