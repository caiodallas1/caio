
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mynrhlljwdmljawmsjgz.supabase.co';
const supabaseAnonKey = 'sb_publishable_1GW4bOhvi-MT5NkATrqdug_ncu9s4mU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
