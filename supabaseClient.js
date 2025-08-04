import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gxewpstvuoofdqanhjzi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZXdwc3R2dW9vZmRxYW5oanppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjM1NzUsImV4cCI6MjA2OTYzOTU3NX0._W88NSjDmv4dXoE701SKMQ60J8D3DTCcRX5VVRJYr_E'

export const supabase = createClient(supabaseUrl, supabaseKey)
