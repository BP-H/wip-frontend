// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "superNova_2177",
  description: "Matte‑white, angular, next‑level SNS prototype.",
  themeColor: "#ffffff",
  icons: {
    icon: "/icon.png",          // Next.js will serve from /app or /public
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* we force light; CSS already ignores dark mode */}
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
