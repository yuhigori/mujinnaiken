import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google"; // Changed from Geist
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "無人内見予約 | Stylish Booking",
  description: "24時間いつでも予約可能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${inter.variable} font-sans antialiased bg-background text-foreground selection:bg-primary selection:text-white`}
      >
        <div className="fixed inset-0 -z-10 h-full w-full bg-gradient-to-br from-orange-50 via-pink-50 to-cyan-50 pointer-events-none" />
        {children}
      </body>
    </html>
  );
}
