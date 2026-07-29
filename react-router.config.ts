import type { Config } from "@react-router/dev/config";
import { readdirSync, readFileSync } from "node:fs";
import matter from "gray-matter";

function blogPrerenderPaths(): string[] {
  const files = readdirSync("posts").filter(f => f.endsWith(".md"));
  const slugs: string[] = [];
  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    try {
      const raw = readFileSync(`posts/${f}`, "utf-8");
      const { data } = matter(raw);
      if (data.draft || data.hide) continue;
    } catch { continue; }
    slugs.push(slug);
  }
  const perPage = 30;
  const pageCount = Math.ceil(slugs.length / perPage);
  const paths = ["/posts", "/posts/rss.xml", "/posts/sitemap.xml", "/404"];
  for (let n = 2; n <= pageCount; n++) paths.push(`/posts/page/${n}`);
  for (const slug of slugs) paths.push(`/posts/${slug}`);
  return paths;
}

export default {
  ssr: false,
  buildDirectory: process.env.SVAF_BUILD_DIR || "build",
  prerender: blogPrerenderPaths(),
} satisfies Config;
