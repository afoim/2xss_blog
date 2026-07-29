/**
 * /posts/rss.xml —— 博客 RSS 2.0 订阅源。
 * 构建期生成：ssr:false + prerender 会在构建时跑 loader 并把结果存为静态文件。
 */
import { getRecentPosts } from "../lib/blog.server";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function loader() {
  const posts = getRecentPosts(50);
  const items = posts.map(p => {
    const img = p.image ? '<enclosure url="' + esc(p.image) + '" type="image/png"/>' : "";
    return "<item><title>" + esc(p.title) + "</title>"
      + "<link>https://blog.2x.nz/posts/" + esc(p.slug) + "</link>"
      + "<description>" + esc(p.description) + "</description>"
      + "<pubDate>" + new Date(p.published).toUTCString() + "</pubDate>"
      + "<guid isPermaLink=\"true\">https://blog.2x.nz/posts/" + esc(p.slug) + "</guid>"
      + img + "</item>";
  }).join("\n");

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<?xml-stylesheet type="text/xsl" href="/xsl/rss.xsl"?>\n'
    + '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
    + '<channel>\n'
    + '<title>二叉树树的博客</title>\n'
    + '<link>https://blog.2x.nz/posts</link>\n'
    + '<description>二叉树树的个人技术博客</description>\n'
    + '<language>zh-CN</language>\n'
    + '<atom:link href="https://blog.2x.nz/posts/rss.xml" rel="self" type="application/rss+xml"/>\n'
    + items + '\n'
    + '</channel>\n'
    + '</rss>\n';

  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}

export async function sitemapLoader() {
  const posts = getRecentPosts(200);
  const urls = posts.map(p =>
    "  <url><loc>https://blog.2x.nz/posts/" + esc(p.slug) + "</loc><lastmod>" + p.published.slice(0,10) + "</lastmod></url>"
  ).join("\n");
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<?xml-stylesheet type="text/xsl" href="/xsl/sitemap.xsl"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls + '\n'
    + '</urlset>\n';
  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}
