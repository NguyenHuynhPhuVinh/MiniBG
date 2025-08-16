import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./fonts.css";
import { ThemeProvider } from "@/components/features/shared/theme-provider";
import { Toaster } from "sonner";
import MockInit from "@/components/features/shared/mock-init";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synlearnia",
  description: "Nền tảng học tập và thi trực tuyến thông minh.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Hidden divs to preload Kenney fonts for Phaser */}
        <div className="font-[KenneyFuture] absolute -left-[1000px] invisible">
          .
        </div>
        <div className="font-[KenneyFutureNarrow] absolute -left-[1000px] invisible">
          .
        </div>

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-right" richColors closeButton />
          <MockInit>{children}</MockInit>
        </ThemeProvider>
      </body>
    </html>
  );
}
