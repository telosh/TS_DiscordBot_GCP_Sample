import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
 
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Supabaseのクライアントをエクスポート
export default supabase;