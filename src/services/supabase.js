// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase env vars missing:', { supabaseUrlPresent: !!supabaseUrl, supabaseKeyPresent: !!supabaseAnonKey })
}

// create client with default options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // enable auth persistence using localStorage (default)
  auth: {
    persistSession: true,
    // force cookie usage only when needed; default is fine for SPA
  }
})