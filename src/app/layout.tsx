import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// 使用更现代的 Inter 字体作为正文
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// 使用 JetBrains Mono 作为代码/数据字体
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GeoTARS | 全球农业灾害监测系统",
  description: "AI-Driven Global Disaster Monitoring & Agriculture Analysis",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
