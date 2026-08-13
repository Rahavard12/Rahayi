'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Row = { id: string; slug: string; title: string; category: string; excerpt: string; body: string; author: string; published: boolean; image_url?: string | null }

const IMAGE_BUCKET = 'article-images'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const SAVE_TIMEOUT_MS = 15000

export default function ArticleManager() {
  const [rows, setRows] = useState<Row[]>([])
  const [row, setRow] = useState<Row | null>(null)
  const [setup, setSetup] = useState('')
  const [msg, setMsg] = useState('')
  const [ready, setReady] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const db = createClient()

  async function load() {
    const { data, error } = await db.from('articles').select('*').order('created_at', { ascending: false })
    if (error) setMsg('اتصال به پایگاه داده برقرار نشد.')
    else setRows((data || []) as Row[])
  }

  useEffect(() => {
    db.auth.getUser().then(({ data }) => {
      if (data.user) { setReady(true); load() }
      else location.href = '/signin'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function claim() {
    setMsg('')
    const { data, error } = await db.rpc('claim_admin', { setup_token: setup })
    if (error || !data) setMsg('کد راه‌اندازی نامعتبر است.')
    else { setMsg('دسترسی مدیر فعال شد.'); load() }
  }

  async function uploadImage(file: File) {
    if (!row) return
    if (!file.type.startsWith('image/')) { setMsg('لطفاً فقط فایل تصویری انتخاب کنید.'); return }
    if (file.size > MAX_IMAGE_SIZE) { setMsg('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.'); return }
    setUploading(true); setMsg('در حال بارگذاری تصویر…')
    try {
      const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
      const filePath = `articles/${crypto.randomUUID()}.${extension}`
      const { error: uploadError } = await db.storage.from(IMAGE_BUCKET).upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type })
      if (uploadError) { setMsg(`بارگذاری تصویر انجام نشد: ${uploadError.message || 'خطای نامشخص'}`); return }
      const { data } = db.storage.from(IMAGE_BUCKET).getPublicUrl(filePath)
      setRow(current => current ? { ...current, image_url: data.publicUrl } : current)
      setMsg('تصویر با موفقیت بارگذاری شد.')
    } catch (error) {
      setMsg(`بارگذاری تصویر انجام نشد: ${error instanceof Error ? error.message : 'خطای نامشخص'}`)
    } finally { setUploading(false) }
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!row || saving || uploading) return
    setSaving(true)
    setMsg(row.published ? 'در حال انتشار مقاله…' : 'در حال ذخیره مقاله…')

    const payload = {
      slug: row.slug.trim(), title: row.title.trim(), category: row.category.trim(), excerpt: row.excerpt.trim(), body: row.body,
      author: row.author.trim(), published: row.published, image_url: row.image_url || null,
      published_at: row.published ? new Date().toISOString() : null, updated_at: new Date().toISOString(),
    }

    if (!payload.slug || !payload.title || !payload.body) {
      setMsg('عنوان، slug و متن مقاله الزامی است.'); setSaving(false); return
    }

    try {
      const query = row.id ? db.from('articles').update(payload).eq('id', row.id) : db.from('articles').insert(payload)
      const result = await Promise.race([
        query,
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('SAVE_TIMEOUT')), SAVE_TIMEOUT_MS)),
      ])
      const { error } = result
      if (error) {
        if (error.message?.toLowerCase().includes('image_url') || error.code === '42703') setMsg('ذخیره انجام نشد: ستون image_url در جدول articles وجود ندارد.')
        else if (error.code === '42501' || error.message?.toLowerCase().includes('row-level security')) setMsg('ذخیره انجام نشد: دسترسی مدیر یا RLS در Supabase اجازه انتشار این مقاله را نمی‌دهد.')
        else setMsg(`ذخیره انجام نشد: ${error.message || 'خطای Supabase'}`)
        return
      }
      setMsg(row.published ? 'مقاله با موفقیت منتشر شد.' : 'مقاله با موفقیت ذخیره شد.')
      setRow(null)
      await load()
    } catch (error) {
      if (error instanceof Error && error.message === 'SAVE_TIMEOUT') setMsg('عملیات ذخیره بیشتر از ۱۵ ثانیه طول کشید. اتصال Supabase را بررسی کنید و دوباره تلاش کنید.')
      else setMsg(`ذخیره انجام نشد: ${error instanceof Error ? error.message : 'خطای نامشخص'}`)
    } finally { setSaving(false) }
  }

  async function remove(id: string) {
    if (!confirm('این مقاله حذف شود؟')) return
    const { error } = await db.from('articles').delete().eq('id', id)
    setMsg(error ? `حذف انجام نشد: ${error.message || 'خطای Supabase'}` : 'مقاله حذف شد.')
    load()
  }

  function newArticle() {
    setMsg('')
    setRow({ id: '', slug: '', title: '', category: 'تحلیل', excerpt: '', body: '', author: 'تحریریه رهایی', published: false, image_url: null })
  }

  if (!ready) return <main className="authPage"><div className="authCard">در حال بررسی ورود…</div></main>

  return (
    <main className="adminPage"><div className="container">
      <div className="adminTop"><div><a href="/" className="logo">Rahayi<span>رهایی</span></a><h1>مدیریت مطالب</h1></div><button onClick={async () => { await db.auth.signOut(); location.href = '/' }}>خروج</button></div>
      {msg && <p className="notice">{msg}</p>}
      <section className="setup"><strong>راه‌اندازی مدیر اول</strong><p>کد یک‌بارمصرف راه‌اندازی را وارد کنید.</p><input value={setup} onChange={e => setSetup(e.target.value)} placeholder="کد راه‌اندازی"/><button onClick={claim}>فعال‌سازی</button></section>
      <div className="adminActions"><button className="cta" onClick={newArticle}>+ مقاله جدید</button></div>
      <div className="adminList">{rows.map(r => <div className="adminRow" key={r.id}><div><b>{r.title}</b><span>{r.category} · {r.published ? 'منتشر شده' : 'پیش‌نویس'}</span></div><div><button onClick={() => setRow(r)} disabled={saving}>ویرایش</button><button onClick={() => remove(r.id)} disabled={saving}>حذف</button></div></div>)}</div>
      {row && <form className="editor" onSubmit={save}>
        <h2>{row.id ? 'ویرایش مقاله' : 'مقاله جدید'}</h2>
        <input value={row.title} onChange={e => setRow({ ...row, title: e.target.value })} placeholder="عنوان" required disabled={saving}/>
        <input value={row.slug} onChange={e => setRow({ ...row, slug: e.target.value })} placeholder="slug انگلیسی" required disabled={saving}/>
        <input value={row.category} onChange={e => setRow({ ...row, category: e.target.value })} placeholder="دسته‌بندی" disabled={saving}/>
        <input value={row.author} onChange={e => setRow({ ...row, author: e.target.value })} placeholder="نویسنده" disabled={saving}/>
        <textarea value={row.excerpt} onChange={e => setRow({ ...row, excerpt: e.target.value })} placeholder="خلاصه" disabled={saving}/>
        <div className="imageField"><label htmlFor="article-image">تصویر مقاله</label><input id="article-image" ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading || saving} onChange={e => { const file = e.target.files?.[0]; if (file) uploadImage(file) }}/><small>فرمت‌های JPG، PNG، WEBP یا GIF — حداکثر ۵ مگابایت</small>{uploading && <p>در حال بارگذاری تصویر…</p>}{row.image_url && <div className="imagePreview"><img src={row.image_url} alt="پیش‌نمایش تصویر مقاله"/><button type="button" disabled={saving} onClick={() => setRow({ ...row, image_url: null })}>حذف تصویر</button></div>}</div>
        <textarea className="bodyInput" value={row.body} onChange={e => setRow({ ...row, body: e.target.value })} placeholder="متن مقاله" required disabled={saving}/>
        <label className="check"><input type="checkbox" checked={row.published} disabled={saving} onChange={e => setRow({ ...row, published: e.target.checked })}/>انتشار مقاله</label>
        <button className="cta" type="submit" disabled={uploading || saving}>{saving ? (row.published ? 'در حال انتشار…' : 'در حال ذخیره…') : (row.published ? 'انتشار مقاله' : 'ذخیره')}</button>
        <button type="button" onClick={() => setRow(null)} disabled={saving}>انصراف</button>
      </form>}
    </div></main>
  )
}
