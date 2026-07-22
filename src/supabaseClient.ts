// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fikrpsbyrfiupfkneulj.supabase.co'
const supabaseAnonKey = 'sb_publishable_YZaObQJoTaHPAtaO1Uf-RQ_6puW1DkS'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)