'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function SignIn(){
 const [email,setEmail]=useState('')
 const [code,setCode]=useState('')
 const [error,setError]=useState('')
 const [message,setMessage]=useState('')
 const [sending,setSending]=useState(false)
 async function go(e:any){e.preventDefault();setError('');const r=await createClient().auth.signInWithPassword({email:email.trim(),password:code});if(r.error){setError('ورود ناموفق بود. ایمیل یا رمز عبور را بررسی کنید.')}else{location.href='/manage'}}
 async function forgot(){
  if(!email.trim()){setError('ابتدا ایمیل خود را وارد کنید.');return}
  setError('');setMessage('');setSending(true)
  const r=await createClient().auth.resetPasswordForEmail(email.trim(),{redirectTo:'https://rahayi.vercel.app/reset-password'})
  setSending(false)
  if(r.error){setError('ارسال لینک بازیابی انجام نشد. تنظیمات Supabase را بررسی کنید.')}else{setMessage('لینک تغییر رمز عبور به ایمیل شما ارسال شد.')}
 }
 return <main className="authPage"><div className="authCard"><a href="/" className="logo">Rahayi<span>رهایی</span></a><h1>ورود</h1><form onSubmit={go}><input aria-label="ایمیل" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ایمیل" required/><input aria-label="رمز" type="password" value={code} onChange={e=>setCode(e.target.value)} placeholder="رمز" required/>{error&&<p className="error">{error}</p>}{message&&<p className="success">{message}</p>}<button className="cta" type="submit">ورود</button></form><button type="button" className="backLink" onClick={forgot} disabled={sending}>{sending?'در حال ارسال…':'فراموشی رمز عبور'}</button><a className="backLink" href="/signup">ساخت حساب مدیر</a></div></main>
}
