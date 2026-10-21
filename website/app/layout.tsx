import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Oshane Jackson — GTM Engineer',
  description: 'GTM Engineer and GTM Analytics Engineer building cleaner data, faster handoffs, and more reliable GTM decisions.',
  openGraph: {
    title: 'Oshane Jackson — GTM Engineer',
    description: 'I build cleaner data, faster handoffs, and more reliable GTM decisions.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Cleaner data, faster handoffs, and better GTM decisions.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oshane Jackson — GTM Engineer',
    description: 'I build cleaner data, faster handoffs, and more reliable GTM decisions.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
