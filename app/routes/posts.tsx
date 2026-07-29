/**
 * /posts —— 博客文章列表（真 SSR）。
 * 支持 ?q= 服务端搜索（关键词高亮）+ 分页浏览。
 * UI 复刻原 SPA PostsSearch 卡片布局，数据 + 浏览量直出。
 */
import { useState } from "react";
import { Link, Form } from "react-router";
import { Icon } from "@/components/ui/icon";
import { coverThumb } from "@/lib/cover-thumb";
import { highlightSearchTerm } from "../lib/search-utils";
import { scorePosts } from "../lib/blog-search";
export { loader } from "./posts.server";
import { staticMeta } from "../lib/route-meta";
import { SITE_NAME, SITE_URL } from "../lib/site";

declare const __SVAF_TARGET__: string;

/**
 * blog.2x.nz 是静态产物：没有服务器能跑 ?q= 的 loader，而且 CF 的资产路由按
 * **路径**取文件、查询串直接被忽略 —— /posts?q=xxx 只会拿到第 0 页那份 HTML。
 * 所以静态博客的搜索改在浏览器里做，全量索引从 raw-posts CDN 拉。
 */
const IS_BLOG = __SVAF_TARGET__ === "blog";
const POSTS_INDEX_URL = "https://raw-posts.2x.nz/posts.json";

/**
 * /posts 与 /posts/page/N 共用本组件，meta 也共用这一份。
 * 不加页码处理的话，翻页页会落到 staticMeta 的兜底分支（只有站点标题、
 * 没有 canonical / robots / og），5 页全是重复内容且没有规范地址。
 */
export const meta = ({ loaderData }: { loaderData?: { page?: number } }) => {
  const tags = staticMeta("/posts");
  const page = loaderData?.page ?? 0;
  if (!page) return tags;
  const suffix = `（第 ${page + 1} 页）`;
  const url = `${SITE_URL}/posts/page/${page + 1}`;
  return tags.map((t) => {
    if ("title" in t) return { title: `博客${suffix} | ${SITE_NAME}` };
    if ("rel" in t && t.rel === "canonical") return { ...t, href: url };
    if ("property" in t && t.property === "og:url") return { ...t, content: url };
    if ("property" in t && t.property === "og:title") return { ...t, content: `博客${suffix} | ${SITE_NAME}` };
    return t;
  });
};

/**
 * 分页链接一律走路径形态。查询串形态（?page=N）在静态托管上不成立 ——
 * CF 的资产路由按路径取文件，?page=1 会拿到第 0 页那份 HTML。
 * 第 0 页保持 /posts，不写成 /posts/page/1，避免同一份内容两个地址。
 */
function pageHref(page: number): string {
  return page <= 0 ? "/posts" : `/posts/page/${page + 1}`;
}

type LoaderData = Awaited<ReturnType<typeof import("./posts.server").loader>>;
type PostEntry = { slug: string; title: string; description: string; published: string; image: string | null; pinned: boolean; category?: string; tags: string[]; score?: number };


function PostCard({ post, pv, keywords, showScore }: { post: PostEntry; pv: number | null; keywords: string[]; showScore?: boolean }) {
  const titleHtml = keywords.length ? highlightSearchTerm(post.title, keywords) : post.title;
  const descHtml = post.description && keywords.length ? highlightSearchTerm(post.description, keywords) : post.description;
  return (
    <Link to={`/posts/${post.slug}`} className="group block border-b border-r border-border bg-background p-3 sm:p-5 hover:bg-card transition-colors duration-75">
      <article className="flex gap-3 sm:gap-4 items-center">
        {post.image && (
          <div className="shrink-0 self-center">
            {/* 封面图原本是原图直出（raw-posts.2x.nz 没开 Cloudflare Image Resizing），
                单张最大 697KB、一页 30 篇合计 3.07MB，却只显示成 144×96 —— SSR 把
                <img> 直接写进首屏 HTML，这些图会和正文抢带宽。现在走本站 /thumb 端点
                （thumbs.js，用 VPS 上那份 eleventy 仓库副本的原图现缩 + 磁盘缓存），
                顺带把封面从 raw-posts 挪回同源，省掉一次 DNS + TLS 握手。
                srcset 让移动端只取 192w：sizes 里 96px×DPR2 正好命中它。
                width/height 让浏览器提前留位（避免布局抖动），
                fetchPriority=low 把它们排到文本之后，LCP 不再被图片挤后。 */}
            <img
              src={coverThumb(post.image!, 288)}
              srcSet={`${coverThumb(post.image!, 192)} 192w, ${coverThumb(post.image!, 288)} 288w`}
              sizes="(min-width: 640px) 144px, 96px"
              alt={post.title}
              width={144}
              height={96}
              className="h-16 w-24 sm:h-24 sm:w-36 rounded-md object-cover"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 flex-wrap leading-none">
            {post.pinned && <><span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400"><Icon icon="mdi:pin" className="size-3" /> 置顶</span><span aria-hidden>·</span></>}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Icon icon="mdi:calendar" className="size-3" /><time dateTime={post.published}>{post.published.slice(0, 10)}</time></span>
            {post.category && <><span aria-hidden>·</span><span className="text-xs text-muted-foreground">{post.category}</span></>}
            {post.tags.length > 0 && <><span aria-hidden>·</span><span className="min-w-0 truncate text-xs text-muted-foreground">{post.tags.join(" / ")}</span></>}
            {pv != null && <><span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Icon icon="mdi:eye" className="size-3" />{pv}</span></>}
          </div>
          <h2 className="text-base sm:text-lg font-semibold group-hover:text-primary transition-colors leading-snug" dangerouslySetInnerHTML={keywords.length ? { __html: titleHtml } : undefined}>
            {keywords.length ? undefined : post.title}
          </h2>
          {descHtml && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={keywords.length ? { __html: descHtml } : undefined}>
              {keywords.length ? undefined : post.description}
            </p>
          )}
        </div>
        {showScore && post.score != null && (
          <span className="shrink-0 self-start text-xs tabular-nums text-muted-foreground/80 pt-1">{post.score} 匹配</span>
        )}
      </article>
    </Link>
  );
}

/** 静态博客的浏览器端搜索：首次查询时懒加载全量索引，之后纯内存打分 */
function useClientSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(PostEntry & { score: number })[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState<PostEntry[] | null>(null);

  async function run(q: string) {
    const trimmed = q.trim();
    setQuery(trimmed);
    if (!trimmed) { setResults(null); return; }
    let idx = index;
    if (!idx) {
      setLoading(true);
      try {
        const json = await fetch(POSTS_INDEX_URL).then((r) => r.json());
        // posts.json 有「索引对象」与旧「数组」两种形态，消费方都要兼容
        idx = Array.isArray(json) ? json : json.posts;
        setIndex(idx);
      } catch {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    setResults(scorePosts(idx || [], trimmed));
  }

  return { query, results, loading, run, clear: () => { setQuery(""); setResults(null); } };
}

export default function PostsList({ loaderData }: { loaderData: LoaderData }) {
  const cs = useClientSearch();
  // 静态博客走浏览器端搜索，其余域仍是 loader 直出的服务端搜索
  const isSearch = IS_BLOG ? cs.results !== null : loaderData.mode === "search";
  const activeQuery = IS_BLOG ? cs.query : (loaderData.mode === "search" ? loaderData.query : "");
  const keywords = isSearch ? (activeQuery || "").split(/\s+/).filter(Boolean) : [];
  const posts = (IS_BLOG && cs.results ? cs.results : loaderData.posts) as PostEntry[];
  const total = IS_BLOG && cs.results ? cs.results.length : loaderData.total;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">博客</h1>
        <a href="/posts/rss.xml" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="订阅 RSS">
          <Icon icon="mdi:rss" className="size-4" /> RSS
        </a>
      </div>

      {/* 搜索框 + 按钮（按需提交，非即时搜索）。
          静态博客上 onSubmit 拦下来在浏览器里搜；其余域照旧 GET 给 loader。
          无 JS 时静态博客这个表单会退化成普通 GET —— 拿到的是第 0 页列表而不是
          结果，这是静态托管的固有限制（没有服务器能算搜索），不是 bug。 */}
      <Form
        method="get"
        action="/posts"
        className="flex gap-2 mb-8"
        onSubmit={IS_BLOG ? (e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("q") as HTMLInputElement | null;
          cs.run(input?.value || "");
        } : undefined}
      >
        <div className="relative flex-1">
          <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text" name="q" defaultValue={activeQuery}
            placeholder="搜索文章…"
            className="w-full h-10 pl-9 pr-4 border bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="submit" className="h-10 px-4 border border-border bg-card text-sm hover:bg-accent transition-colors shrink-0">
          搜索
        </button>
        {isSearch && (IS_BLOG ? (
          <button type="button" onClick={cs.clear} className="h-10 px-3 border border-border bg-card text-sm text-muted-foreground hover:bg-accent transition-colors flex items-center shrink-0">
            <Icon icon="mdi:close" className="size-4" />
          </button>
        ) : (
          <a href="/posts" className="h-10 px-3 border border-border bg-card text-sm text-muted-foreground hover:bg-accent transition-colors flex items-center shrink-0">
            <Icon icon="mdi:close" className="size-4" />
          </a>
        ))}
      </Form>

      {/* 搜索结果 */}
      {isSearch ? (
        <>
          <p className="text-xs text-muted-foreground mb-4">{cs.loading ? "正在加载索引…" : `找到 ${total} 篇文章`}</p>
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">没有找到匹配的文章</p>
          ) : (
            <div className="grid md:grid-cols-2 border-t border-l border-border">
              {posts.map((p) => <PostCard key={p.slug} post={p} pv={loaderData.withPageviews ? (loaderData.pvMap[`/posts/${p.slug}`] ?? 0) : null} keywords={keywords} showScore />)}
            </div>
          )}
        </>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground">暂无文章</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 border-t border-l border-border">
            {posts.map((p) => <PostCard key={p.slug} post={p} pv={loaderData.withPageviews ? (loaderData.pvMap[`/posts/${p.slug}`] ?? 0) : null} keywords={[]} />)}
          </div>
          {"pageCount" in loaderData && loaderData.pageCount! > 1 && (
            <div className="flex justify-center gap-3 mt-8">
              {loaderData.page! > 0 && <Link to={pageHref(loaderData.page! - 1)} className="border border-border bg-card px-4 py-2 text-sm hover:bg-accent transition-colors">← 上一页</Link>}
              <span className="px-4 py-2 text-sm text-muted-foreground">{loaderData.page! + 1} / {loaderData.pageCount}</span>
              {loaderData.page! < loaderData.pageCount! - 1 && <Link to={pageHref(loaderData.page! + 1)} className="border border-border bg-card px-4 py-2 text-sm hover:bg-accent transition-colors">下一页 →</Link>}
            </div>
          )}
        </>
      )}
    </main>
  );
}
