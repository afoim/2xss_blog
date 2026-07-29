
export function staticMeta(path: string) {
  return [
    { title: "博客文章 | 二叉树树" },
    { name: "description", content: "二叉树树的个人技术博客 —— 前端、后端、DevOps、Cloudflare。" },
    { name: "robots", content: "index, follow" },
    { tagName: "link", rel: "canonical", href: "https://blog.2x.nz" + path },
    { property: "og:title", content: "博客文章 | 二叉树树" },
    { property: "og:description", content: "二叉树树的个人技术博客。" },
    { property: "og:url", content: "https://blog.2x.nz" + path },
    { property: "og:type", content: "website" },
    { property: "og:image", content: "https://blog.2x.nz/files/img/official.png" },
  ];
}
