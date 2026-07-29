import { getPostsPage, searchPosts } from "../lib/blog.server";

export async function loader({
  request, params,
}: { request: Request; params: { n?: string } }) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  if (query.trim()) {
    const { posts, total } = searchPosts(query.trim());
    return { mode: "search" as const, query: query.trim(), posts, total, pvMap: {}, withPageviews: false };
  }
  const page = params.n
    ? Math.max(0, (parseInt(params.n, 10) || 1) - 1)
    : Math.max(0, parseInt(url.searchParams.get("page") || "0", 10) || 0);
  const data = getPostsPage(page);
  return { mode: "list" as const, ...data, page, pvMap: {}, withPageviews: false };
}
