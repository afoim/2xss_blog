import { getPostBySlug, getNeighbors } from "../lib/blog.server";

export async function loader({ params }: { params: { slug: string } }) {
  const result = getPostBySlug(params.slug);
  if (!result) throw new Response("Not Found", { status: 404 });
  const neighbors = getNeighbors(params.slug);
  return { ...result, neighbors, pageviews: null };
}
