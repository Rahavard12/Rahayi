'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '../../lib/supabase'

type Article = {
  id?: string
  slug: string
  title: string
  category: string
  excerpt: string
  body: string
  author: string
  published: boolean
  published_at?: string | null
  created_at?: string | null
  image_url?: string | null
  views?: number | null
  view_count?: number | null
}

type ViewEvent = {
  id: string
  article_id: string
  viewed_at: string
}

const blank: Article = {
  slug: '',
  title: '',
  category: 'تحلیل',
  excerpt: '',
  body: '',
  author: 'تحریریه رهایی',
  published: false,
  published_at: null,
  image_url: '',
}

function getViews(article: Article) {
  if (typeof article.views === 'number') return article.views
  if (typeof article.view_count === 'number') return article.view_count
  return 0
}

function faNumber(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value)
}

function dayKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function startOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export default function Admin() {
  const [s, setS] = useState<Article>(blank)
  const [list, setList] = useState<Article[]>([])
  const [events, setEvents] = useState<ViewEvent[]>([])
  const [ok, setOk] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    setStatsLoading(true)
    setErr('')

    const db = createClient()

    const [articlesResult, eventsResult] = await Promise.all([
      db
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false }),
      db
        .from('article_view_events')
        .select('id,article_id,viewed_at')
        .gte(
          'viewed_at',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        )
        .order('viewed_at', { ascending: true }),
    ])

    if (articlesResult.error) {
      setErr(articlesResult.error.message)
      setList([])
    } else {
      setList((articlesResult.data || []) as Article[])
    }

    if (eventsResult.error) {
      setErr((current) => current || eventsResult.error.message)
      setEvents([])
    } else {
      setEvents((eventsResult.data || []) as ViewEvent[])
    }

    setLoading(false)
    setStatsLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setOk('')
    setErr('')
    setSaving(true)

    const db = createClient()

    const payload = {
      slug: s.slug.trim(),
      title: s.title.trim(),
      category: s.category.trim() || 'تحلیل',
      excerpt: s.excerpt.trim(),
      body: s.body.trim(),
      author: s.author.trim() || 'تحریریه رهایی',
      published: s.published,
      published_at: s.published
        ? s.published_at || new Date().toISOString()
        : null,
      image_url: s.image_url?.trim() || null,
    }

    const r = s.id
      ? await db.from('articles').update(payload).eq('id', s.id)
      : await db.from('articles').insert(payload)

    if (r.error) {
      setErr(r.error.message)
    } else {
      setOk(s.id ? 'مطلب با موفقیت ویرایش شد.' : 'مطلب با موفقیت ذخیره شد.')
      setS(blank)
      await load()
    }

    setSaving(false)
  }

  async function del(id: string) {
    const confirmed = window.confirm(
      'آیا مطمئن هستید که این مطلب حذف شود؟ این عملیات قابل بازگشت نیست.'
    )
    if (!confirmed) return

    setOk('')
    setErr('')
    const db = createClient()
    const r = await db.from('articles').delete().eq('id', id)

    if (r.error) setErr(r.error.message)
    else {
      setOk('مطلب حذف شد.')
      await load()
    }
  }

  function edit(article: Article) {
    setErr('')
    setOk('')
    setS({ ...blank, ...article, image_url: article.image_url || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setS(blank)
    setOk('')
    setErr('')
  }

  async function out() {
    const db = createClient()
    await db.auth.signOut()
    window.location.href = '/signin'
  }

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((article) =>
      article.title?.toLowerCase().includes(q) ||
      article.slug?.toLowerCase().includes(q) ||
      article.category?.toLowerCase().includes(q) ||
      article.author?.toLowerCase().includes(q)
    )
  }, [list, search])

  const totalViews = useMemo(
    () => list.reduce((sum, article) => sum + getViews(article), 0),
    [list]
  )

  const publishedCount = useMemo(
    () => list.filter((article) => article.published).length,
    [list]
  )

  const draftCount = useMemo(
    () => list.filter((article) => !article.published).length,
    [list]
  )

  const averageViews = list.length ? Math.round(totalViews / list.length) : 0

  const popularArticles = useMemo(
    () => [...list].sort((a, b) => getViews(b) - getViews(a)).slice(0, 5),
    [list]
  )

  const detailedStats = useMemo(() => {
    const now = new Date()
    const today = startOfDay(now)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)

    let todayViews = 0
    let last7Days = 0
    let last30Days = 0

    const counts = new Map<string, number>()

    for (let i = 0; i < 30; i += 1) {
      const date = new Date(thirtyDaysAgo)
      date.setDate(thirtyDaysAgo.getDate() + i)
      counts.set(dayKey(date), 0)
    }

    for (const event of events) {
      const date = new Date(event.viewed_at)
      if (Number.isNaN(date.getTime())) continue

      const key = dayKey(date)
      if (date >= today) todayViews += 1
      if (date >= sevenDaysAgo) last7Days += 1
      if (date >= thirtyDaysAgo) last30Days += 1
      if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1)
    }

    const chart = Array.from(counts.entries()).map(([key, value]) => {
      const date = new Date(`${key}T12:00:00`)
      return {
        key,
        value,
        label: `${date.getMonth() + 1}/${date.getDate()}`,
      }
    })

    const max = Math.max(1, ...chart.map((item) => item.value))

    return { todayViews, last7Days, last30Days, chart, max }
  }, [events])

  return (
    <main className="adminPage">
      <div className="container">
        <div className="adminTop">
          <div>
            <a className="logo" href="/">Rahayi<span>رهایی</span></a>
            <h1>مدیریت مطالب</h1>
          </div>
          <button type="button" onClick={out}>خروج</button>
        </div>

        <section className="adminStats">
          <div className="statCard"><span>بازدید کل</span><strong>{faNumber(totalViews)}</strong></div>
          <div className="statCard"><span>بازدید امروز</span><strong>{statsLoading ? '—' : faNumber(detailedStats.todayViews)}</strong></div>
          <div className="statCard"><span>۷ روز اخیر</span><strong>{statsLoading ? '—' : faNumber(detailedStats.last7Days)}</strong></div>
          <div className="statCard"><span>۳۰ روز اخیر</span><strong>{statsLoading ? '—' : faNumber(detailedStats.last30Days)}</strong></div>
          <div className="statCard"><span>مقالات منتشرشده</span><strong>{faNumber(publishedCount)}</strong></div>
          <div className="statCard"><span>تعداد مطالب</span><strong>{faNumber(list.length)}</strong></div>
        </section>

        <section className="viewsChartCard">
          <div className="sectionTitle">
            <div>
              <span className="eyebrow">ANALYTICS</span>
              <h2>نمودار بازدید ۳۰ روز اخیر</h2>
            </div>
            <button type="button" onClick={load} disabled={statsLoading}>به‌روزرسانی</button>
          </div>

          {statsLoading ? (
            <div className="chartEmpty">در حال دریافت آمار بازدید...</div>
          ) : (
            <div className="viewsChart" aria-label="نمودار بازدید ۳۰ روز اخیر">
              {detailedStats.chart.map((item) => (
                <div className="chartColumn" key={item.key} title={`${item.label}: ${faNumber(item.value)} بازدید`}>
                  <span className="chartValue">{item.value ? faNumber(item.value) : ''}</span>
                  <div className="chartBarWrap">
                    <div className="chartBar" style={{ height: `${Math.max(4, (item.value / detailedStats.max) * 100)}%` }} />
                  </div>
                  <span className="chartLabel">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {ok && <div className="notice success">{ok}</div>}
        {err && <div className="notice error">{err}</div>}

        <div className="adminGrid">
          <section className="adminForm">
            <div className="sectionTitle"><div><span className="eyebrow">EDITOR</span><h2>{s.id ? 'ویرایش مطلب' : 'مطلب جدید'}</h2></div></div>
            <form onSubmit={save}>
              <label>عنوان مطلب<input placeholder="عنوان مقاله" value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} required /></label>
              <label>Slug<input placeholder="مثلاً iran-america-war" value={s.slug} onChange={(e) => setS({ ...s, slug: e.target.value })} required /></label>
              <label>دسته‌بندی<input placeholder="تحلیل" value={s.category} onChange={(e) => setS({ ...s, category: e.target.value })} /></label>
              <label>نویسنده<input placeholder="تحریریه رهایی" value={s.author} onChange={(e) => setS({ ...s, author: e.target.value })} /></label>
              <label>تصویر مقاله<input placeholder="https://..." value={s.image_url || ''} onChange={(e) => setS({ ...s, image_url: e.target.value })} /></label>
              <label>خلاصه مطلب<textarea placeholder="خلاصه کوتاه مقاله" value={s.excerpt} onChange={(e) => setS({ ...s, excerpt: e.target.value })} /></label>
              <label>متن مقاله<textarea className="bodyInput" placeholder="متن مقاله؛ هر پاراگراف را با یک خط خالی جدا کن." value={s.body} onChange={(e) => setS({ ...s, body: e.target.value })} required /></label>
              <label className="publishCheck"><input type="checkbox" checked={s.published} onChange={(e) => setS({ ...s, published: e.target.checked, published_at: e.target.checked ? s.published_at || new Date().toISOString() : null })} /><span>انتشار عمومی</span></label>
              <div className="formActions"><button className="cta" type="submit" disabled={saving}>{saving ? 'در حال ذخیره...' : s.id ? 'ذخیره تغییرات' : 'انتشار / ذخیره'}</button>{s.id && <button type="button" onClick={cancelEdit}>انصراف</button>}</div>
            </form>
          </section>

          <section className="adminArticles">
            <div className="sectionTitle"><div><span className="eyebrow">ARTICLES</span><h2>مطالب</h2></div><span className="articleCount">{faNumber(list.length)} مطلب</span></div>
            <div className="adminSearch"><input placeholder="جستجوی عنوان، دسته‌بندی یا نویسنده..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>

            <div className="popularBox">
              <h3>پربازدیدترین مطالب</h3>
              {popularArticles.length === 0 ? <p>هنوز مطلبی ثبت نشده است.</p> : <div className="popularList">{popularArticles.map((article, index) => <div className="popularItem" key={article.id || article.slug}><span className="popularNumber">{faNumber(index + 1)}</span><div><b>{article.title}</b><small>{faNumber(getViews(article))} بازدید</small></div></div>)}</div>}
            </div>

            <div className="articleList">
              {loading ? <div className="emptyState">در حال دریافت مطالب...</div> : filteredList.length === 0 ? <div className="emptyState">مطلبی پیدا نشد.</div> : filteredList.map((article) => <article className="adminItem" key={article.id || article.slug}><div className="adminItemMain"><div className="adminItemTitle"><b>{article.title}</b><div className="adminMeta"><span>{article.category || 'بدون دسته'}</span><span>{article.published ? 'منتشر شده' : 'پیش‌نویس'}</span><span>{faNumber(getViews(article))} بازدید</span></div></div><div className="adminItemActions"><button type="button" onClick={() => edit(article)}>ویرایش</button><button type="button" onClick={() => article.id && del(article.id)}>حذف</button></div></div></article>)}
            </div>

            <div className="draftSummary"><span>پیش‌نویس‌ها</span><strong>{faNumber(draftCount)}</strong></div>
          </section>
        </div>
      </div>
    </main>
  )
}
