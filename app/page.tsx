const posts = [
  { tag: 'تحلیل', title: 'سیاست در جهان امروز؛ میان بحران و تغییر', text: 'نگاهی کوتاه به روندهایی که فضای سیاسی امروز را شکل می‌دهند.' },
  { tag: 'ایران', title: 'چرا گفت‌وگو در سیاست اهمیت دارد؟', text: 'بررسی نقش گفت‌وگو، نقد و مشارکت آگاهانه در جامعه.' },
  { tag: 'جهان', title: 'قدرت‌های جهانی و نظم در حال تغییر', text: 'تحلیلی مستقل درباره تغییر موازنه‌های سیاسی در جهان.' },
]

export default function Home() {
  return <main>
    <header className="header"><div className="container nav"><div className="logo">Rahayi<span>رهایی</span></div><nav><a href="#latest">آخرین مطالب</a><a href="#analysis">تحلیل</a><a href="#about">درباره رهایی</a></nav><button>جست‌وجو</button></div></header>
    <section className="hero"><div className="container heroGrid"><div><p className="eyebrow">وبلاگ سیاسی رهایی</p><h1>برای فهمیدن،<br/><em>باید پرسید.</em></h1><p className="lead">رهایی فضایی برای تحلیل، گفت‌وگو و نگاه مستقل به سیاست ایران و جهان است.</p><a className="cta" href="#latest">مطالعه مطالب ←</a></div><div className="heroCard"><span>یادداشت سردبیر</span><h2>سیاست را فقط از یک زاویه نبینیم.</h2><p>اینجا قرار است روایت‌های مختلف را بخوانیم، پرسش کنیم و با ذهنی باز به رویدادها نگاه کنیم.</p></div></div></section>
    <section id="latest" className="section container"><div className="sectionHead"><div><p className="eyebrow">منتخب سردبیر</p><h2>آخرین مطالب</h2></div><a href="#">همه مطالب ←</a></div><div className="posts">{posts.map((p,i)=><article className="post" key={p.title}><div className="number">0{i+1}</div><span>{p.tag}</span><h3>{p.title}</h3><p>{p.text}</p><a href="#">ادامه مطلب ←</a></article>)}</div></section>
    <section id="about" className="about"><div className="container aboutGrid"><div><p className="eyebrow">درباره رهایی</p><h2>یک نگاه مستقل،<br/>بدون هیاهو.</h2></div><p>«رهایی» یک وبلاگ سیاسی برای انتشار یادداشت‌ها و تحلیل‌هایی درباره ایران، جهان و مسائل اجتماعی است. هدف ما ایجاد فضایی برای فکر کردن، پرسیدن و شنیدن دیدگاه‌های متفاوت است.</p></div></section>
    <footer><div className="container"><strong>Rahayi</strong><span>رهایی؛ برای پرسیدن و فهمیدن.</span><small>© 2026 Rahayi</small></div></footer>
  </main>
}