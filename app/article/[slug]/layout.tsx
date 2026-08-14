import ViewCounter from './ViewCounter'

export default async function ArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { serverDb } = await import('../../../lib/db-server')
  const db = serverDb()
  const { data } = await db.from('articles').select('id').eq('slug', slug).eq('published', true).maybeSingle()

  return (
    <>
      <ViewCounter articleId={data?.id} />
      {children}
    </>
  )
}
