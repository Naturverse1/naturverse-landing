import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://gxewpstvuoofdqanhjzi.supabase.co'
const supabaseAnonKey = 'sb_publishable_BDdV5w6oEVsrnwBL5f-zhw_Xdjkm7ip'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
