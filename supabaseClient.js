import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://gxewpstvuoofdqanhjzi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJ1Zl6Imd4ZXdwc3R2dW9vZmRxYW5oanppliwicm9sZSI6InFub24iLCJpYXQiOjE3NTQwNjM1NzUsImV4cCI6MjA2OTYzOTU3NX0._W8NSjDmv4dXoE701SKMQ60J8D3DTCCcRX5WRJYr_E'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
