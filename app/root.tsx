import "./globals.css";
// hljs.css **不在这里** import：代码高亮样式只有正文页用得上，放进 root 会把它
// 打进全站唯一那份阻塞渲染的 CSS（首页/论坛列表白背 ~13KB 构建后体积）。
// 已下放到 posts_.slug.tsx 与 forum.post.$id.tsx 两条真正渲染 markdown 的路由。
import { lazy, Suspense } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from "react-router";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { ClientOnly } from "./client-only";
import { SITE_NAME, SITE_URL } from "./lib/site";
import { jsonLd } from "./lib/json-ld";
import { generateBreadcrumbLd } from "./lib/breadcrumb";

const ClientChrome = lazy(() => import("./client-chrome"));

const PROD_HOST = "blog.2x.nz";
const SITE_TITLE = "《二叉树树》官方网站";
const SITE_DESC = "二叉树树的个人网站 —— 包含技术博客、论坛社区、AI 生图、实用在线工具等，记录分享技术与生活。";
const OG_IMAGE = `${SITE_URL}/files/img/official.png`;

export function loader({ request }: { request: Request }) {
  const host = request.headers.get("host")?.replace(/:\d+$/, "") || "unknown";
  // 预渲染时没有真实请求，默认视为生产
  return { isProd: host === PROD_HOST || host === "localhost" };
}

// RR8 的 MetaArgs 直接给 loaderData（本路由 loader 的返回值）；
// MetaMatch 上的字段也叫 loaderData，**没有** .data —— 那是 RR7 的形状。
// 之前写成 matches[0]?.data 恒为 undefined，导致 isProd 永远为假、
// 每个页面都被打上 noindex（仅因所有叶子路由都自带 meta 才没暴露）。
export function meta({
  loaderData,
  error,
}: {
  loaderData?: { isProd: boolean };
  error?: unknown;
}) {
  // 叶子路由抛错（如 redirect-splat 抛 404）时走的是错误分支，
  // 该路由自己的 meta() 不会被应用，只剩 root 这一份 —— 不特判的话
  // 404 页会顶着站点标题、且没有 noindex。
  if (error) {
    return [
      { title: "404 | " + SITE_NAME },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }
  // 只有 author/keywords/og:site_name/og:locale 这类**永不随路由变化**的标签
  // 仍硬编码在 Layout 中。og:type/og:image/twitter:card/twitter:image 会被详情页
  // 覆盖，硬编码会产生重复标签，因此在此和 staticMeta() 里各给一份默认值。
  // 注意：叶子路由的 meta() 会整体替换本函数的返回值，所以这里其实只是兜底。
  const data = loaderData;
  const tags = [
    { title: SITE_TITLE },
    { name: "description", content: SITE_DESC },
    { property: "og:title", content: SITE_TITLE },
    { property: "og:description", content: SITE_DESC },
    { property: "og:url", content: SITE_URL },
    { property: "og:type", content: "website" },
    { property: "og:image", content: OG_IMAGE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: OG_IMAGE },
  ];
  if (!data?.isProd) {
    tags.push({ name: "robots", content: "noindex, nofollow" });
  }
  return tags;
}

function BreadcrumbLd() {
  const { pathname } = useLocation();
  const data = generateBreadcrumbLd(pathname);
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
    />
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#171717" />
        {/* spec=140 而非 spec=0：favicon 最大也就显示 32px，原图是 72KB */}
        <link rel="icon" href="https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=140" />
        {/* 站点级 SEO 元数据 —— 硬编码在 Layout 中确保 100% SSR 直出 */}
        <meta name="author" content="AcoFork" />
        <meta name="keywords" content="二叉树树,二叉树树官网,博客,AcoFork" />
        <meta name="baidu-site-verification" content="codeva-aEC99Uu69k" />
        <meta property="og:site_name" content={SITE_TITLE} />
        <meta property="og:locale" content="zh_CN" />
        {/* og:type / og:image / twitter:card / twitter:image **不要**放在这里：
            Layout 对所有路由都渲染，详情页的 meta() 又会各出一份，导致同一页面
            出现两组标签，爬虫取第一个 —— 文章封面永远被站点默认图盖掉。
            它们的站点默认值已挪到 route-meta.ts 的 staticMeta()。 */}

        <link rel="alternate" type="application/rss+xml" title="二叉树树的博客" href="/posts/rss.xml" />
        
        {/* JSON-LD 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": SITE_URL + "/#website",
                  url: SITE_URL + "/",
                  name: SITE_TITLE,
                  alternateName: [SITE_NAME, "AcoFork Blog"],
                  description: SITE_DESC,
                  inLanguage: "zh-CN",
                  publisher: { "@id": SITE_URL + "/#organization" },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: SITE_URL + "/posts?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "Organization",
                  "@id": SITE_URL + "/#organization",
                  name: SITE_NAME,
                  alternateName: "AcoFork",
                  url: SITE_URL + "/",
                  logo: {
                    "@type": "ImageObject",
                    url: OG_IMAGE,
                    width: 1200,
                    height: 630,
                  },
                  sameAs: [
                    "https://space.bilibili.com/325903362",
                    "https://github.com/afoim",
                  ],
                },
                {
                  "@type": "Person",
                  "@id": SITE_URL + "/#person",
                  name: "AcoFork",
                  alternateName: SITE_NAME,
                  url: SITE_URL + "/",
                  memberOf: { "@id": SITE_URL + "/#organization" },
                  sameAs: [
                    "https://space.bilibili.com/325903362",
                    "https://github.com/afoim",
                    "https://www.ifdian.net/a/acofork",
                  ],
                },
              ],
            }),
          }}
        />
        {/* 面包屑 BreadcrumbList —— 全站自动补全，详情页路由自带的手写版优先 */}
        <BreadcrumbLd />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen flex-col">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SiteHeader />
      <div className="flex-1 flex flex-col min-h-0 pt-14">
        <Outlet />
      </div>
      <Footer />
      <ClientOnly>
        {() => (
          <Suspense fallback={null}>
            <ClientChrome />
          </Suspense>
        )}
      </ClientOnly>
    </ThemeProvider>
  );
}
