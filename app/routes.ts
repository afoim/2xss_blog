import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("posts", "routes/posts.tsx"),
  route("posts/page/:n", "routes/posts.tsx", { id: "posts-page" }),
  route("posts/:slug", "routes/posts_.slug.tsx"),
  route("posts/rss.xml", "routes/posts.rss.xml.ts"),
  route("posts/sitemap.xml", "routes/posts.sitemap.xml.ts"),
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;