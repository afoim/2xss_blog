/**
 * /posts/:slug —— 博客文章详情（真 SSR）。
 * UI 完全复刻原 SPA PostDetailReader，数据从 loader 直出（无骨架屏）。
 * 客户端组件：Giscus（评论）、ImageLightbox、PageViews 显示。
 */
// 代码高亮样式只在有正文的路由加载（从 root 下放，避免全站阻塞渲染的 CSS 带上它）
import { Link } from "react-router";
import { Icon } from "@/components/ui/icon";
import { Giscus } from "@/components/giscus";
import { jsonLd } from "../lib/json-ld";
import { SITE_NAME, SITE_URL } from "../lib/site";
// 先 import 再具名导出：`export { loader } from "..."` 是纯转发，不会把
// loader 引入本模块作用域，下面 `typeof loader` 会 TS2304 找不到名字。
import { loader } from "./posts_.slug.server";
export { loader };

const POSTS_REPO = "https://github.com/afoim/af_blog-data";

/**
 * 无 description 的文章（158 篇里有 2 篇）用标题兜底。
 * 后缀与旧站边缘 Worker 的产出逐字一致 —— 光用标题当描述，搜索结果里
 * 标题和描述会完全重复。
 */
function postDescription(post: { description: string; title: string }) {
  return post.description?.trim() || `${post.title} —— 来自二叉树树的博客文章。`;
}

type LoaderData = Awaited<ReturnType<typeof loader>>;

// 见 root.tsx 注释：RR8 用 loaderData，matches 上没有 .data。
export function meta({ loaderData }: { loaderData?: LoaderData }) {
  const data = loaderData;
  if (!data) return [{ title: "404 | " + SITE_NAME }];
  const post = data.meta;
  const title = post.title + " | " + SITE_NAME;
  const url = `${SITE_URL}/posts/${post.slug}`;
  const image = post.image || `${SITE_URL}/files/img/official.png`;
  const desc = postDescription(post);
  return [
    { title },
    { name: "description", content: desc },
    { name: "robots", content: "index, follow" },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "article" },
    { property: "og:title", content: title },
    { property: "og:description", content: desc },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "article:published_time", content: post.published },
    { property: "article:modified_time", content: post.published },
    { property: "article:author", content: "https://2x.nz" },
    ...(post.tags || []).map((t: string) => ({ property: "article:tag", content: t })),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: desc },
    { name: "twitter:image", content: image },
  ];
}

export default function PostDetailRoute({ loaderData }: { loaderData: LoaderData }) {
  const { meta: post, html, neighbors, pageviews } = loaderData;
  const url = `${SITE_URL}/posts/${post.slug}`;
  const image = post.image || `${SITE_URL}/files/img/official.png`;
  // 正文纯文本 —— articleBody 帮 Google 理解文章全文
  const articleBody = html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
  // 日期补时区：Google 要求 ISO 8601 含时区信息
  const isoDate = post.published.length === 10 ? `${post.published}T00:00:00+08:00` : post.published;
  // Google 官方示例：Article 作为顶层类型，不用 @graph 包裹；
  // image 为数组，日期带时区，author 不含 @id 避免跨块引用
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: postDescription(post),
    articleBody,
    datePublished: isoDate,
    dateModified: isoDate,
    image: [image],
    author: { "@type": "Person", name: "AcoFork", url: SITE_URL },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "博客文章", item: `${SITE_URL}/posts` },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd) }} />
      <div className="flex gap-8 relative">
        {/* 正文区 */}
        <article className="flex-1 min-w-0 max-w-3xl mx-auto">
          <Link
            to="/posts"
            className="flex items-center gap-1 border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent mb-4 transition-colors"
          >
            <Icon icon="mdi:arrow-left" className="size-4" />
            返回博客列表
          </Link>

          <div className="border border-border bg-card p-4 sm:p-6 mb-4">
            <header className="mb-8 pb-6 border-b border-border">
              {post.pinned && (
                <div className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 mb-3">
                  <Icon icon="mdi:pin" className="size-3" />
                  置顶
                </div>
              )}
              <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
              {post.description && (
                <p className="mt-3 text-base text-muted-foreground leading-relaxed">{post.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground flex-wrap leading-none">
                <span className="inline-flex items-center gap-1">
                  <Icon icon="mdi:calendar" className="size-3" />
                  <time dateTime={post.published}>{post.published.slice(0, 10)}</time>
                </span>
                {pageviews != null && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Icon icon="mdi:eye" className="size-3" />
                      {pageviews} 次浏览
                    </span>
                  </>
                )}
                {post.category && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{post.category}</span>
                  </>
                )}
                {post.tags.length > 0 && (
                  <>
                    <span aria-hidden>·</span>
                    <div className="flex gap-1.5">
                      {post.tags.map((tag: string) => (
                        <span key={tag} className="rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {post.ai_level && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="text-xs text-muted-foreground/80">
                      AI 辅助 · {post.ai_level === 1 ? "轻度" : "深度"}
                    </span>
                  </>
                )}
              </div>
              {post.image && (
                <img src={post.image} alt={post.title} data-lightbox className="mt-6 w-full cursor-zoom-in object-cover aspect-video" />
              )}
            </header>

            {/* 正文服务端直出。此前这里是 <PostBody slug>，它在 useEffect 里去
                raw-posts.2x.nz 重新拉一遍 markdown 再渲染 —— loader 早就把 html
                算好了却被扔掉，结果博客正文（全站最重要的 SEO 内容）根本不在
                SSR HTML 里，禁用 JS 时只剩标题。 */}
            <MermaidContent
              html={html}
              className="prose prose-zinc dark:prose-invert max-w-none prose-pre:bg-[#1e1e2e] prose-code:before:content-none prose-code:after:content-none prose-img:rounded-xl prose-headings:scroll-mt-20"
            />

            {/* GitHub 编辑链接 */}
            <div className="mt-8 pt-6 border-t border-border">
              <a
                href={`${POSTS_REPO}/edit/main/posts/${post.slug}.md`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon icon="mdi:github" className="size-4" />
                在 GitHub 编辑此文章
              </a>
            </div>

            {/* 上下篇 */}
            {(neighbors.prev || neighbors.next) && (
              <nav className="mt-8 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  {neighbors.prev && (
                    <Link to={`/posts/${neighbors.prev.slug}`} className="group flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">← 上一篇</span>
                      <span className="font-medium truncate group-hover:underline">{neighbors.prev.title}</span>
                    </Link>
                  )}
                </div>
                <div className="sm:text-right">
                  {neighbors.next && (
                    <Link to={`/posts/${neighbors.next.slug}`} className="group flex flex-col gap-1 sm:items-end">
                      <span className="text-xs text-muted-foreground">下一篇 →</span>
                      <span className="font-medium truncate group-hover:underline max-w-full">{neighbors.next.title}</span>
                    </Link>
                  )}
                </div>
              </nav>
            )}
          </div>

          {/* 评论区 */}
          <div id="comments" className="border border-border bg-card p-4 sm:p-6 scroll-mt-20">
            <Giscus />
          </div>
        </article>

        {/* 目录侧栏 —— SSR 直出标题数据，客户端 scroll-spy 高亮 */}
        <PostToc key={post.slug} items={toc} />
      </div>
      <ImageLightbox />
    </main>
  );
}
