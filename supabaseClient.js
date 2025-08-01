import { createClient } from '@supabase/supabase-js';

// It's best practice to keep sensitive keys in environment variables.
// For demonstration, your keys are shown directly, but consider using process.env for production.

const SUPABASE_URL = 'https://gxewpstvuoofdqanhjzi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZXdwc3R2dW9vZmRxYW5oanppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjM1NzUsImV4cCI6MjA2OTYzOTU3NX0._W88NSjDmv4dXoE701SKMQ60J8D3DTCcRX5VVRJYr_E';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;