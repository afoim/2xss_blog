/**
 * 把博客封面的**原图 URL** 换成本站缩略图端点的 URL。
 *
 * posts.json 里的 `image` 指向 raw-posts.2x.nz 上的原图（单张最大 697KB），
 * 而列表里只显示成 144×96。服务端 `thumbs.js` 负责真正的缩放，这里只做
 * URL 改写。两边的路径形态（`/thumb/<宽度>/<文件名>`）和允许的宽度必须一致 ——
 * 宽度不在 thumbs.js 的白名单里会被 302 回原图，白改一场。
 *
 * 非 raw-posts 域名的图片（外链封面）原样返回，不经过缩略图端点：源文件不在
 * 本地磁盘上，缩不了。
 */

declare const __THUMB_BASE__: string;

const POSTS_DOMAIN = import.meta.env.VITE_POSTS_DOMAIN || 'https://raw-posts.2x.nz';

/**
 * 缩略图端点的来源。空串 = 同源（2x.nz / forum / ai 都由 VPS 上的 thumbs.js 提供）。
 * blog.2x.nz 是托管在 CF 上的**纯静态产物**，那里没有 thumbs.js，必须指回主站。
 */
const THUMB_BASE = __THUMB_BASE__;

/** 与 thumbs.js 的 WIDTHS 白名单对应 */
export type ThumbWidth = 64 | 192 | 288;

export function coverThumb(url: string, width: ThumbWidth = 288): string {
  const prefix = `${POSTS_DOMAIN}/img/`;
  if (!url.startsWith(prefix)) return url;
  const name = url.slice(prefix.length);
  // 文件名里有空格和中文（例如 `... - 副本.jpg`），必须编码；
  // 但已经编码过的（含 %）不要二次编码
  const safe = name.includes('%') ? name : encodeURIComponent(name);
  return `${THUMB_BASE}/thumb/${width}/${safe}`;
}

/**
 * 论坛配图（S3 上的任意 URL）的缩略图。
 *
 * 与 coverThumb 分成两个函数而不是合并：博客图在 VPS 上有本地副本，走文件名；
 * 论坛图只有远端 URL，得让服务端现抓。两者的缓存键和失败兜底都不一样。
 *
 * **白名单在服务端**（thumbs.js 的 REMOTE_HOSTS）。这里不做校验也不该做——
 * 前端校验挡不住直接构造请求的人，真正的防线只有服务端那一道。
 * 不在白名单里的 URL 服务端会返回 400，所以这里保持原样返回、不改写更安全。
 */
const REMOTE_THUMB_HOSTS = ['ny-1s.enzonix.com'];

export function remoteThumb(url: string, width: ThumbWidth = 288): string {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' || !REMOTE_THUMB_HOSTS.includes(u.hostname)) return url;
    return `/thumb/${width}?u=${encodeURIComponent(url)}`;
  } catch {
    return url; // 相对路径或畸形 URL，原样返回
  }
}
