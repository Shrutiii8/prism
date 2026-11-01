import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import SmoothScrollProvider from "@/components/motion/SmoothScrollProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  for (var r of regs) { r.unregister(); }
                });
              }
            `,
          }}
        />
      </head>
      <body className="bg-canvas text-canvas-text font-sans antialiased selection:bg-saffron/30 selection:text-white">
        <ThemeProvider>
          <SmoothScrollProvider>
            <SmokeCursor />
            <CustomCursor />
            <AppLayout>{children}</AppLayout>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
