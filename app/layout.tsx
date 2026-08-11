import './globals.css'
import type { Metadata } from 'next'

const siteUrl = 'https://rahayi-blog.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Rahayi | رهایی — وبلاگ سیاسی',
    template: '%s | Rahayi'
  },
  description: 'رهایی؛ وبلاگ سیاسی برای تحلیل، گفت‌وگو و نگاه مستقل به سیاست ایران و جهان.',
  keywords: ['رهایی', 'Rahayi', 'سیاست ایران', 'تحلیل سیاسی', 'سیاست جهان', 'اخبار سیاسی'],
  authors: [{ name: 'تحریریه رهایی' }],
  creator: 'Rahayi',
  publisher: 'Rahayi',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: siteUrl,
    siteName: 'Rahayi | رهایی',
    title: 'Rahayi | رهایی — وبلاگ سیاسی',
    description: 'تحلیل، گفت‌وگو و نگاه مستقل به سیاست ایران و جهان.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rahayi | رهایی — وبلاگ سیاسی',
    description: 'تحلیل، گفت‌وگو و نگاه مستقل به سیاست ایران و جهان.'
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>
}