import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validasi dikit biar nggak pusing kalau lupa input lagi
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Waduh! API Key Supabase belum masuk ke Env!")
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')