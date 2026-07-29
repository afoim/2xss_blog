/**
 * 服务端 HTML 净化 —— 与客户端 DOMPurify 行为完全一致。
 *
 * 为什么必须有这一层：`src/lib/render-markdown.ts` 的 markdown-it 配置是
 * `html: true`（博客文章要用原始 HTML 做嵌入），所以用户投稿的 markdown 里的
 * `<script>` / `on*` 事件处理器会**原样穿过** renderMarkdown。
 *
 * 在 SPA 时代这没事：正文渲染只发生在客户端，出口有 `DOMPurify.sanitize()`。
 * 但 SSR 把渲染搬到了服务端，而 DOMPurify 依赖真实 DOM，Node 里跑不了 ——
 * 于是净化那一步被静悄悄跳过，用户投稿的脚本直接落进 SSR HTML 并执行。
 * 论坛里确实躺着这样的帖子（id 87，标题和正文都是 `<script>alert('xss')</script>`）。
 *
 * 用 jsdom 造一个最小 DOM 喂给 DOMPurify，就能拿到与客户端逐字节一致的结果，
 * 不必自己维护一份标签白名单（自造白名单和客户端不一致会导致水合内容漂移）。
 */
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// 一次性创建，后续复用（jsdom 初始化约 100ms，不能每次请求都建）
const purify = createDOMPurify(new JSDOM("").window as unknown as Window & typeof globalThis);

/** 净化用户投稿内容渲染出的 HTML（论坛帖子、评论）。
 *  放行 id 属性 —— 否则 addHeadingIds 注入的标题锚点会被剥掉，TOC 跳转失效。 */
export function sanitizeUserHtml(html: string): string {
  return purify.sanitize(html, { ADD_ATTR: ["id"] });
}

/**
 * 净化博客正文。与客户端 post-body.tsx 原来的配置保持一致：额外放行 id 属性，
 * 否则标题锚点会被剥掉，目录（TOC）点击就跳不过去了。
 */
export function sanitizeBlogHtml(html: string): string {
  return purify.sanitize(html, { ADD_ATTR: ["id"] });
}
