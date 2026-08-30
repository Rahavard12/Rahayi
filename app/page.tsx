import { articles as fallback } from '../lib/articles'
import { serverDb } from '../lib/db-server'
export const revalidate=30

export default async function Home(){
  const db=serverDb()
  const {data}=db?await db.from('articles').select('slug,title,category,excerpt').eq('published',true).order('published_at',{ascending:false}):{data:null}
  const articles=(data&&data.length?data:fallback)

  return <main>
    <style>{` .latestLayout{display:grid;grid-template-columns:minmax(260px,320px) minmax(0,1fr);gap:28px;align-items:start}.articleSidebar{direction:rtl;background:#171d1a;border:1px solid #303733;padding:22px;position:sticky;top:20px;max-height:calc(100vh - 40px);overflow:auto}.sidebarHead{border-bottom:1px solid #303733;padding-bottom:18px;margin-bottom:8px}.sidebarHead .eyebrow{margin-bottom:8px}.sidebarHead h2{font-size:25px;margin:0 0 7px;color:#edf0ec}.sidebarHead>span{font-size:11px;color:#87918a}.sidebarList{display:grid}.sidebarArticle{display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px;align-items:start;padding:15px 2px;border-bottom:1px solid #252c28;text-decoration:none;transition:background .2s,transform .2s}.sidebarArticle:hover{background:#202622;transform:translateX(-2px)}.sidebarNumber{font-size:11px;color:#d4af37;padding-top:2px;direction:ltr}.sidebarArticleText{min-width:0}.sidebarArticleText b{display:block;color:#dfe4e1;font-size:13px;line-height:1.85;font-weight:600}.sidebarArticleText small{display:block;color:#7f8982;font-size:10px;margin-top:5px}.posts{min-width:0}.postTitle{color:#dfe4e1;text-decoration:none;display:block;cursor:pointer;transition:color .25s ease,transform .25s ease}.postTitle:hover{color:#d4af37;transform:translateX(-3px)}.postTitle h3{margin:0;transition:color .25s ease}.postTitle:hover h3{color:#d4af37}.postContinue{display:inline-block;transition:color .25s ease,transform .25s ease}.postContinue:hover{color:#d4af37;transform:translateX(-3px)}@media(max-width:850px){.latestLayout{grid-template-columns:1fr}.articleSidebar{position:relative;top:auto;max-height:420px;order:-1}.posts{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.posts{grid-template-columns:1fr}.articleSidebar{max-height:360px}.sidebarArticleText b{font-size:12px}} `}</style>
    <header className="header"><div className="container nav"><a className="logo" href="/">Rahayi<span>رهایی</span></a><nav><a href="#latest">آخرین مطالب</a><a href="#about">درباره رهایی</a><a href="/manage">مدیریت</a></nav><button>جست‌وجو</button></div></header>
    <section className="hero"><div className="container heroGrid"><div><p className="eyebrow">وبلاگ سیاسی رهایی</p><h1>سرزمین جاویدان</h1><a className="cta" href="#latest">مطالعه مطالب ←</a></div><div className="heroCard"><img src="/khaleej-fars.svg" alt="خلیج همیشه فارس" /></div></div></section>
    <section id="latest" className="section container">
      <div className="sectionHead"><div><p className="eyebrow">منتخب سردبیر</p><h2>آخرین مطالب</h2></div></div>
      <div className="latestLayout">
        <aside className="articleSidebar" aria-label="فهرست همه مقالات">
          <div className="sidebarHead"><p className="eyebrow">آرشیو</p><h2>همه مقالات</h2><span>{articles.length} مقاله</span></div>
          <div className="sidebarList">
            {articles.map((p:any,i:number)=><a className="sidebarArticle" key={p.slug} href={`/article/${p.slug}`}><span className="sidebarNumber">{String(i+1).padStart(2,'0')}</span><span className="sidebarArticleText"><b>{p.title}</b>{p.category&&<small>{p.category}</small>}</span></a>)}
          </div>
        </aside>
        <div className="posts">{articles.map((p:any,i:number)=><article className="post" key={p.slug}><div className="number">{String(i+1).padStart(2,'0')}</div><span>{p.category}</span><a className="postTitle" href={`/article/${p.slug}`} aria-label={`مطالعه مقاله: ${p.title}`}><h3>{p.title}</h3></a><p>{p.excerpt}</p><a className="postContinue" href={`/article/${p.slug}`}>ادامه مطلب ←</a></article>)}</div>
      </div>
    </section>
    <section id="about" className="about"><div className="container aboutGrid"><div><p className="eyebrow">درباره رهایی</p><h2>یک نگاه مستقل،<br/>بدون هیاهو.</h2></div><p>«رهایی» یک وبلاگ سیاسی برای انتشار یادداشت‌ها و تحلیل‌هایی درباره ایران، جهان و مسائل اجتماعی است. هدف ما ایجاد فضایی برای فکر کردن، پرسیدن و شنیدن دیدگاه‌های متفاوت است.</p></div></section>
    <footer><div className="container"><strong>Rahayi</strong><span>رهایی؛ برای پرسیدن و فهمیدن.</span><small>© 2026 Rahayi</small></div></footer>
  </main>
}
