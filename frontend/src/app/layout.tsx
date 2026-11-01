import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import SmoothScrollProvider from "@/components/motion/SmoothScrollProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n";
import SmokeCursor from "@/components/effects/SmokeCursor";
import CustomCursor from "@/components/landing/CustomCursor";

export const metadata: Metadata = {
  title: "PRISM — Integrated Institution Complaint Monitoring & Coordination Platform",
  description:
    "AICTE Centralized Regulatory Oversight Intelligence Platform unifying complaints across Regulation Bureau, PGRC, Approval Bureau, and Regional Offices into one institution record.",
  icons: {
    icon: "/prism-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#08090B" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PRISM" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    for (var i = 0; i < regs.length; i++) {
                      regs[i].unregister();
                    }
                  });
                  if ('caches' in window) {
                    caches.keys().then(function(names) {
                      for (var i = 0; i < names.length; i++) {
                        caches.delete(names[i]);
                      }
                    });
                  }
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function(err) {
                      console.log('SW registration error:', err);
                    });
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body className="bg-canvas text-canvas-text font-sans antialiased selection:bg-saffron/30 selection:text-white">
        <ThemeProvider>
          <LanguageProvider>
            <SmoothScrollProvider>
              <SmokeCursor />
              <CustomCursor />
              <AppLayout>{children}</AppLayout>
            </SmoothScrollProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
