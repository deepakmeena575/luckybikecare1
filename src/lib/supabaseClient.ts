import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mepjeemilcxbuptfxoje.supabase.co';
const supabaseAnonKey = 'sb_publishable_ezRQMClDBoJT8q74mi3_Dg_TH8HqAmS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
