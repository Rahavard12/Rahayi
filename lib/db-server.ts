import { createClient } from '@supabase/supabase-js'
const url=process.env.NEXT_PUBLIC_SUPABASE_URL||'https://svdfsrmekynmjwpbfxrj.supabase.co'
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_AZtFfqlbCxiN2l4uwB0uZA_akT0lFsf'
export function serverDb(){return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})}
