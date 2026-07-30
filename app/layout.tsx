import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { metadataKeywords } from "./metadata";
import { siteConfig } from "@/lib/site";
import { SiteNav } from "@/components/site-nav";
import Footer from "@/components/footer";
import "@/app/globals.css";

export const viewport: Viewport = {
  themeColor: "black",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://blog.2x.nz"),
  title: {
    default: "二叉树树的博客",
    template: "%s | 二叉树树",
  },
  description: "二叉树树的个人技术博客 —— 前端、后端、DevOps、Cloudflare。",
  keywords: metadataKeywords,
  authors: [{ name: "AcoFork", url: "https://blog.2x.nz" }],
  creator: "AcoFork",
  // 站点图标用导航栏同一张头像
  icons: {
    icon: siteConfig.avatar,
    shortcut: siteConfig.avatar,
    apple: siteConfig.avatar,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://blog.2x.nz",
    title: "二叉树树的博客",
    description: "二叉树树的个人技术博客",
    siteName: "二叉树树",
  },
  twitter: {
    card: "summary_large_image",
    title: "二叉树树的博客",
    description: "二叉树树的个人技术博客",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteNav />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
