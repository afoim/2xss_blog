/**
 * 博客搜索打分 —— **纯函数，服务端和浏览器共用同一份**。
 *
 * 2x.nz 上搜索在 loader 里跑（blog.server.ts 的 searchPosts）；
 * blog.2x.nz 是静态产物，没有服务器可跑 loader，搜索只能在浏览器里做
 * （posts.tsx 的 IS_BLOG 分支，索引从 raw-posts CDN 拉）。
 * 两边各写一份打分逻辑必然漂移 —— 同一个词在两个域搜出不同的排序，
 * 所以抽到这里。
 */
import { escapeRegExp } from "./search-utils";

export interface SearchablePost {
  title: string;
  description: string;
  tags: string[];
}

/** 标题 5 分 / 描述 3 分 / 标签 2 分，按命中次数累加，0 分的丢弃 */
export function scorePosts<T extends SearchablePost>(
  posts: T[],
  query: string,
): (T & { score: number })[] {
  const keywords = query.split(/\s+/).filter(Boolean);
  if (keywords.length === 0) return [];
  return posts
    .map((post) => {
      const title = post.title.toLowerCase();
      const desc = (post.description || "").toLowerCase();
      const tags = (post.tags || []).join(" ").toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        const k = escapeRegExp(kw.toLowerCase());
        score += (title.match(new RegExp(k, "g")) || []).length * 5;
        score += (desc.match(new RegExp(k, "g")) || []).length * 3;
        score += (tags.match(new RegExp(k, "g")) || []).length * 2;
      }
      return { ...post, score };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);
}
