// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Safely turn NEXT_PUBLIC_SITE_URL into an absolute URL (adds https:// if missing)
const toAbsoluteHttps = (u?: string): URL | undefined => {
  if (!u) return undefined;
  try {
    const hasProtocol = /^https?:\/\//i.test(u);
    return new URL(hasProtocol ? u : `https://${u}`);
  } catch {
    return undefined;
  }
};

const siteUrl =
  toAbsoluteHttps(process.env.NEXT_PUBLIC_SITE_URL) ??
  new URL('https://www.sN2177.com');

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: 'superNova_2177',
  description: 'symbolic social metaverse — experimental',
  icons: {
    icon: '/superNova2177.png',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
