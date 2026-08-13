'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function ViewCounter({ articleId }: { articleId?: string }) {
  useEffect(() => {
    if (!articleId) return
    const db = createClient()
    db.rpc('increment_article_views', { p_article_id: articleId }).then(({ error }) => {
      if (error) console.error('Article view tracking failed:', error)
    })
  }, [articleId])

  return null
}
