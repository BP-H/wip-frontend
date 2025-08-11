// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'superNova_2177',
  description: 'Futuristic social platform.',
  icons: { icon: '/icon.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ff2db8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="app">{children}</div>
        {/* For mobile drawer / modals */}
        <div id="modal-root" />
        <style>{`
          :root{
            --bg:#ffffff;       /* 80% white */
            --ink:#0a0a0a;
            --pink:#ff2db8;     /* 15% pink */
            --blue:#4f46e5;     /* 5% blue  */
          }
          *{box-sizing:border-box}
          html,body{height:100%}
          body{
            margin:0;
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji","Segoe UI Emoji";
            background:var(--bg);
            color:var(--ink);
            overflow-x:hidden;   /* allow page to scroll normally */
          }
          a,button{cursor:pointer}
          button, [role="button"], a{
            outline:none;
          }
          :focus-visible{
            outline:2px solid var(--blue);
            outline-offset:2px;
            border-radius:8px;
          }
        `}</style>
      </body>
    </html>
  );
}
