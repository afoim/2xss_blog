import { Link } from "react-router";
export function meta() { return [{ title: "404 | 二叉树树" }, { name: "robots", content: "noindex, nofollow" }]; }
export default function NotFoundPage() {
  return <main className="container mx-auto px-4 py-16 text-center"><h1 className="text-6xl font-bold mb-4">404</h1><p className="text-muted-foreground mb-8">页面未找到</p><Link to="/posts" className="text-primary hover:underline">返回博客</Link></main>;
}
