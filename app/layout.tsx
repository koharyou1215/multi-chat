import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./components/safari-mobile-fix.css";
import ViewportStabilizer from "./components/ViewportStabilizer";
import MobileLayoutFix from "./components/MobileLayoutFix";
import ClientVH from "./components/ClientVH";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MultiChat AI - ChatHub Style Multi-Model Comparison",
  description: "Compare AI responses from multiple models simultaneously",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientVH />
        <ViewportStabilizer />
        <MobileLayoutFix />
        {children}
      </body>
    </html>
  );
}