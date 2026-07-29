import { Link } from "react-router";
import { loader } from "./posts_.slug.server";

export { loader };

export const meta = ({ loaderData }: { loaderData?: { meta?: { title: string; description: string } } }) => {
  const post = loaderData?.meta;
  if (!post) return [{ title: "404 | 二叉树树" }];
  return [{ title: post.title + " | 二叉树树" }, { name: "description", content: post.description || "" }];
};

export default function PostDetailRoute({ loaderData }: { loaderData: { meta: { title: string; description: string; slug: string; published: string; pinned: boolean; tags: string[]; category?: string }; html: string; neighbors: { prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null }; pageviews: number | null } }) {
  const { meta: post, html, neighbors, pageviews } = loaderData;
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <article className="flex-1 min-w-0 max-w-3xl mx-auto">
        <Link to="/posts" className="text-sm text-muted-foreground hover:text-foreground mb-4 block">
          ← 返回博客列表
        </Link>
        <header className="mb-8 pb-6 border-b border-border">
          {post.pinned && <span className="text-xs text-amber-400">置顶</span>}
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          {post.description && <p className="mt-3 text-muted-foreground">{post.description}</p>}
          <time className="text-xs text-muted-foreground mt-3 block" dateTime={post.published}>{post.published.slice(0, 10)}</time>
        </header>
        <div className="prose prose-zinc dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        <nav className="mt-8 pt-6 border-t border-border flex justify-between">
          {neighbors.prev ? <Link to={`/posts/${neighbors.prev.slug}`} className="text-sm">← {neighbors.prev.title}</Link> : <span />}
          {neighbors.next ? <Link to={`/posts/${neighbors.next.slug}`} className="text-sm">{neighbors.next.title} →</Link> : <span />}
        </nav>
      </article>
    </main>
  );
}
