import { notFound } from 'next/navigation'
import { articles, getArticle } from '@/lib/articles'

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }))
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  return <main>
    <header className="header"><div className="container nav"><a className="logo" href="/">Rahayi<span>رهایی</span></a><nav><a href="/#latest">آخرین مطالب</a><a href="/#about">درباره رهایی</a></nav><a className="back" href="/">بازگشت به صفحه اصلی</a></div></header>
    <article className="articlePage container">
      <div className="articleMeta"><span>{article.category}</span><span>{article.date}</span><span>{article.author}</span></div>
      <h1>{article.title}</h1>
      <p className="articleLead">{article.excerpt}</p>
      <div className="articleBody">{article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      <a className="cta" href="/">← بازگشت به مطالب</a>
    </article>
    <footer><div className="container"><strong>Rahayi</strong><span>رهایی؛ برای پرسیدن و فهمیدن.</span><small>© 2026 Rahayi</small></div></footer>
  </main>
}