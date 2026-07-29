import type { Config } from "@react-router/dev/config";
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
