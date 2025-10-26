import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey as anonKey } from './supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, anonKey);
export const publicAnonKey = anonKey;
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8457b97f`;
