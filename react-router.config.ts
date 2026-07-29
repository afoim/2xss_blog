import type { Config } from "@react-router/dev/config";
import { readFileSync } from "node:fs";

// 全站 SSR：每次请求由 Node 服务端渲染 HTML（对人和爬虫一视同仁）。
//
// buildDirectory 可由 SVAF_BUILD_DIR 覆盖，用于「先构建到旁路目录、再原子替换」的
// 近零停机部署：直接原地 build 会在构建期间清空 build/client/assets，而此时旧进程
// 仍在用旧 HTML 引用那些已被删掉的哈希文件名，访客会拿到 404 的 JS/CSS。
// 部署流程：SVAF_BUILD_DIR=build-next npm run build && mv build build.old &&
//           mv build-next build && supervisorctl restart svaf-ssr:

/**
 * SVAF_TARGET=blog —— 给 blog.2x.nz 出**纯静态**产物。
 *
 * ssr: false + prerender 就是 RR7 的 SSG 模式：清单里的每条路径都在构建期跑完
 * loader、渲染成**完整 HTML**（不是 SPA 空壳，禁用 JS 照样有内容）。
 *
 * 这里必须是 false 而不是 true。ssr:true 也能预渲染出一样的 HTML，但客户端会保留
 * 「Fog of War」按需路由发现，一挂载就去请求 /__manifest?paths=… —— 静态托管上
 * 没有服务器应答，浏览器控制台里是 4 次 404 重试。ssr:false 让 RR 把整份路由清单
 * 内联进产物，不再有这个请求。
 *
 * 预渲染清单必须**穷举**：静态托管上没有兜底渲染的服务器，漏一条就是 404。
 * 数据源是 VPS 上那份 eleventy 仓库副本，所以 blog 构建只能在 VPS 上跑。
 */
const CONTENT_DIR = "/root/eleventy-blog-pagescms";

function blogPrerenderPaths(): string[] {
  const idx = JSON.parse(readFileSync(`${CONTENT_DIR}/posts.json`, "utf-8"));
  const posts: { slug: string }[] = Array.isArray(idx) ? idx : idx.posts;
  const perPage: number = Array.isArray(idx) ? 30 : idx.perPage || 30;
  const pageCount: number = Array.isArray(idx)
    ? Math.ceil(posts.length / perPage)
    : idx.pageCount || Math.ceil(posts.length / perPage);

  // /404 会落到路由表末尾那条 route("*")，预渲染出来给 CF 的 not_found_handling 用
  const paths = ["/posts", "/posts/rss.xml", "/posts/sitemap.xml", "/404"];
  // 第 0 页就是 /posts，路径形态从第 2 页开始
  for (let n = 2; n <= pageCount; n++) paths.push(`/posts/page/${n}`);
  for (const p of posts) paths.push(`/posts/${p.slug}`);
  return paths;
}

import { readdirSync, readFileSync } from "node:fs";
import matter from "gray-matter";

function blogPrerenderPaths(): string[] {
  const posts = readdirSync("posts").filter(f => f.endsWith(".md")).map(f => f.replace(".md", ""));
  const perPage = 30;
  const pageCount = Math.ceil(posts.length / perPage);
  const paths = ["/posts", "/posts/rss.xml", "/posts/sitemap.xml", "/404"];
  for (let n = 2; n <= pageCount; n++) paths.push(`/posts/page/${n}`);
  for (const slug of posts) paths.push(`/posts/${slug}`);
  return paths;
}

export default {
  ssr: false,
  buildDirectory: process.env.SVAF_BUILD_DIR || "build",
  prerender: blogPrerenderPaths(),
} satisfies Config;
