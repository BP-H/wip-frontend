import type { Metadata, Viewport } from 'next/document';
import './globals.css'; // keep if you have it; otherwise remove this line

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sn2177.com'),
  title: {
    default: 'superNova_2177',
    template: '%s · superNova_2177',
  },
  description: 'Minimal social UI with a 3D portal hero.',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
