import { createBrowserClient } from '@supabase/ssr'
const url=process.env.NEXT_PUBLIC_SUPABASE_URL||'https://svdfsrmekynmjwpbfxrj.supabase.co'
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_AZtFfqlbCxiN2l4uwB0uZA_akT0lFsf'
export function createClient(){return createBrowserClient(url,key)}
