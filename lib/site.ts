export const siteConfig = {
  name: "二叉树树的博客",
  url: "https://blog.2x.nz",
  description: "二叉树树的个人技术博客 —— 前端、后端、DevOps、Cloudflare。记录技术与生活。",
  author: "二叉树树",
  // 开源仓库：页脚链接 + 文末「在 GitHub 上编辑此文章」都用它
  repo: "https://github.com/afoim/2xss_blog",
  // 编辑分支：文末「在 GitHub 上编辑此文章」要落到 edit 而不是 main，
  // 否则网页端改动会直接进 main 并触发部署，绕过 edit → main 的发布流程
  repoBranch: "edit",
  // 头像：导航栏左上角和站点图标（favicon）共用这一个链接
  avatar: "https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=140",
};
export type SiteConfig = typeof siteConfig;
