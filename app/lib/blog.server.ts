/**
 * 博客数据层 —— 直读 posts/*.md。
 *
 * 不再依赖外部 posts.json。构建期扫描目录 + gray-matter 提取 frontmatter，
 * RSS / sitemap 也基于同一份索引。
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderMarkdown, addHeadingIds } from "@/lib/render-markdown";
import { sanitizeBlogHtml } from "./sanitize.server";
import matter from "gray-matter";

const POSTS_DIR = join(process.cwd(), "posts");

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  published: string;
  image: string | null;
  pinned: boolean;
  draft: boolean;
  hide: boolean;
  category?: string;
  tags: string[];
  lang?: string;
  ai_level?: number;
}

export interface PostsIndex {
  generatedAt: string;
  perPage: number;
  total: number;
  pageCount: number;
  posts: BlogPostMeta[];
}

const IMG_ORIGIN = "https://raw-posts.2x.nz";

let _indexCache: PostsIndex | null = null;

/** 扫描 posts/ 目录构建全量索引。置顶优先 + 日期倒序。 */
export function getPostsIndex(): PostsIndex {
  if (_indexCache) return _indexCache;

  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts: BlogPostMeta[] = [];

  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    const raw = readFileSync(join(POSTS_DIR, f), "utf-8");
    const { data } = matter(raw);

    if (data.draft || data.hide) continue;

    posts.push({
      slug,
      title: data.title || slug,
      description: data.description || "",
      published: data.date
        ? new Date(data.date).toISOString().slice(0, 10) + "T00:00:00+08:00"
        : data.published || "",
      image: (data.image && data.image.startsWith("http"))
        ? data.image
        : data.image
          ? `${IMG_ORIGIN}/img/${data.image}`
          : null,
      pinned: !!data.pinned,
      draft: false,
      hide: false,
      category: data.category || undefined,
      tags: data.tags || [],
      lang: data.lang || undefined,
      ai_level: data.ai_level || undefined,
    });
  }

  posts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.published).getTime() - new Date(a.published).getTime();
  });

  const perPage = 30;
  _indexCache = {
    generatedAt: new Date().toISOString(),
    perPage,
    total: posts.length,
    pageCount: Math.ceil(posts.length / perPage),
    posts,
  };
  return _indexCache!;
}

export function clearPostsCache() {
  _indexCache = null;
}

import { scorePosts } from "./blog-search";

export { highlightSearchTerm } from "./search-utils";

export function searchPosts(
  query: string
): { posts: (BlogPostMeta & { score: number })[]; total: number } {
  const scored = scorePosts(getPostsIndex().posts, query);
  return { posts: scored, total: scored.length };
}

/** 把 Markdown 里的相对路径 /img/xxx 改写为 CDN 绝对 URL */
function rewriteImageUrls(html: string): string {
  return html.replace(/(src|href)="\/img\//g, `$1="${IMG_ORIGIN}/img/`);
}

export function getPostBySlug(
  slug: string
): { meta: BlogPostMeta; html: string } | null {
  const index = getPostsIndex();
  const meta = index.posts.find((p) => p.slug === slug);
  if (!meta) return null;
  try {
    const raw = readFileSync(join(POSTS_DIR, `${slug}.md`), "utf-8");
    const { content } = matter(raw);
    const rendered = renderMarkdown(content, { eagerFirstImage: true });
    return { meta, html: rewriteImageUrls(sanitizeBlogHtml(addHeadingIds(rendered))) };
  } catch {
    return null;
  }
}

export function getPostsPage(page: number) {
  const idx = getPostsIndex();
  const start = page * idx.perPage;
  return {
    posts: idx.posts.slice(start, start + idx.perPage),
    total: idx.total,
    pageCount: idx.pageCount,
    perPage: idx.perPage,
  };
}

export function getNeighbors(slug: string) {
  const index = getPostsIndex();
  const i = index.posts.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? index.posts[i - 1] : null,
    next: i < index.posts.length - 1 ? index.posts[i + 1] : null,
  };
}

/** RSS / sitemap 用的文章列表（最近 100 篇，按日期倒序） */
export function getRecentPosts(limit = 100): BlogPostMeta[] {
  const index = getPostsIndex();
  return [...index.posts]
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
    .slice(0, limit);
}
