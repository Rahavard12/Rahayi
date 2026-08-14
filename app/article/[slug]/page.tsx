import { notFound } from 'next/navigation'
import { articles as fallback } from '../../../lib/articles'
import { serverDb } from '../../../lib/db-server'
import ViewCounter from './ViewCounter'

export const revalidate = 30

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const db = serverDb()

  const { data } = db
    ? await db
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle()
    : { data: null }

  const article: any = data || fallback.find((x) => x.slug === slug)

  if (!article) notFound()

  const body =
    typeof article.body === 'string'
      ? article.body.split('\n').filter(Boolean)
      : article.body

  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('fa-IR')
    : article.date

  const articleUrl = `https://rahayi.vercel.app/article/${encodeURIComponent(slug)}`
  const shareText = `${article.title} — رهایی`
  const encodedUrl = encodeURIComponent(articleUrl)
  const encodedText = encodeURIComponent(shareText)

  return (
    <main>
      <ViewCounter articleId={article.id} />

      <header className="header">
        <div className="container nav">
          <a className="logo" href="/">
            Rahayi<span>رهایی</span>
          </a>

          <nav>
            <a href="/#latest">آخرین مطالب</a>
            <a href="/#about">درباره رهایی</a>
            <a href="/manage">مدیریت</a>
          </nav>

          <a className="back" href="/">
            بازگشت به صفحه اصلی
          </a>
        </div>
      </header>

      <article className="articlePage container">
        <div className="articleMeta">
          <span>{article.category}</span>
          <span>{date}</span>
          <span>{article.author}</span>
        </div>

        <h1>{article.title}</h1>

        <p className="articleLead">{article.excerpt}</p>

        {article.image_url && (
          <img
            className="articleHero"
            src={article.image_url}
            alt={article.title}
          />
        )}

        <div className="articleBody">
          {body.map((p: string) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <div className="shareBox">
          <strong>اشتراک‌گذاری این مقاله</strong>

          <div className="shareButtons">
            <a
              className="shareButton"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>

            <a
              className="shareButton"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>

            <a
              className="shareButton"
              href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>

            <a
              className="shareButton"
              href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Telegram
            </a>
          </div>
        </div>

        <a className="cta" href="/">
          ← بازگشت به مطالب
        </a>
      </article>

      <footer>
        <div className="container">
          <strong>Rahayi</strong>
          <span>رهایی؛ برای پرسیدن و فهمیدن.</span>
          <small>© 2026 Rahayi</small>
        </div>
      </footer>
    </main>
  )
}
