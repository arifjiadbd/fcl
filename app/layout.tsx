import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Facebook Cricket League (FCL) | Official Digital Platform",
  description: "Official digital platform of Facebook Cricket League (FCL). Real-time cricket stats, player profiles, match formats, and all-time records.",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Facebook Cricket League (FCL)",
    description: "One Game. One Community. The Game Lives Beyond The Field.",
    siteName: "Facebook Cricket League",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
