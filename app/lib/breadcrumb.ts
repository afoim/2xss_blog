/**
 * 全站 BreadcrumbList JSON-LD 结构化数据 —— 单一权威来源。
 *
 * Google 的"增强功能"报告里每个页面类型（Article / DiscussionForumPosting /
 * BreadcrumbList 等）是一个独立维度。此前全站只有博客文章详情页有
 * BreadcrumbList，其他所有页面都缺 —— 导致 Google Search Console 的
 * 「增强功能」板块显示「网址没有任何增强选项」。
 *
 * 这里提供两套接口：
 * 1. generateBreadcrumbLd(pathname) —— Layout 层自动补全，覆盖所有静态页面。
 *    对 `/posts/:slug`、`/forum/post/:id` 这类已在路由组件里手写更详细
 *    面包屑的路径，返回 null 以避免同页出现两份 BreadcrumbList。
 * 2. buildBreadcrumbItems() —— 供路由组件拼装自定义面包屑（带动态标题）。
 */

import { SITE_URL } from "./site";

/** 路径段 → 显示标签 */
const LABELS: Record<string, string> = {
  "/": "首页",
  "/posts": "博客文章",
  "/forum": "论坛社区",
  "/forum/post/new": "发布新帖",
  "/forum/auth/login": "登录",
  "/forum/auth/register": "注册账号",
  "/forum/auth/forgot-password": "找回密码",
  "/forum/auth/reset-password": "重置密码",
  "/forum/me": "个人中心",
  "/forum/u": "用户主页",
  "/forum/admin": "论坛管理",
  "/friends": "友情链接",
  "/sponsors": "赞助鸣谢",
  "/files": "文件下载",
  "/cover": "视频封面制作工具",
  "/watermark": "图片水印工具",
  "/convert": "图片格式转换工具",
  "/bili-cover": "B站视频封面获取",
  "/tier": "从夯到拉",
  "/anime": "追番列表",
  "/draw": "AI 生图",
  "/draw/img2img": "AI 图生图",
  "/draw/admin": "生图管理",
  "/draw/admin/collaborator": "协作者管理",
};

/**
 * 按精确匹配递减路径段数来解析标签：`/draw/admin/collaborator` 先精确匹配，
 * 不中则退到 `/draw/admin`，最后退到 `/draw`。
 */
function resolveLabel(pathname: string): string | null {
  // 去掉可能的尾斜杠再查
  const clean = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (LABELS[clean]) return LABELS[clean];

  // 逐段回退：/draw/admin/collaborator → /draw/admin → /draw
  let cursor = clean;
  while (cursor.lastIndexOf("/") > 0) {
    cursor = cursor.slice(0, cursor.lastIndexOf("/"));
    if (LABELS[cursor]) return LABELS[cursor];
  }
  return null;
}

interface BreadcrumbItem {
  "@type": "ListItem";
  position: number;
  name: string;
  item?: string;
}

/**
 * 从路径推导全量面包屑项（首页 → 中间页 → 当前页）。
 * `extra` 为可选末尾追加项（如帖子标题），会被附加到末尾。
 *
 * 示例：`buildBreadcrumbItems("/forum/post/123", [{ name: "帖子标题" }])`
 * → 首页 / 论坛社区 / 帖子标题
 */
export function buildBreadcrumbItems(
  pathname: string,
  extra?: { name: string; item?: string }[],
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { "@type": "ListItem", position: 1, name: "首页", item: SITE_URL + "/" },
  ];

  // 去掉多余的尾斜杠与查询参数
  let clean = pathname.replace(/\?.*$/, "");
  if (clean.endsWith("/")) clean = clean.slice(0, -1);
  if (clean === "") return items;

  // 把路径拆成段，逐段叠加查找标签
  const segments = clean.split("/").filter(Boolean);

  // 走 URL 树从根往叶子匹配：/forum/post/new → 找 /forum → 找 /forum/post/new
  for (let i = 1; i <= segments.length; i++) {
    const candidate = "/" + segments.slice(0, i).join("/");
    const label = LABELS[candidate];
    if (label) {
      // 跳过根路径（已作为首页）
      if (candidate === "/") continue;
      const item: BreadcrumbItem = {
        "@type": "ListItem",
        position: items.length + 1,
        name: label,
      };
      // 只有非终末段才给链接；终末段不给（当前页）
      if (i < segments.length || extra) {
        item.item = SITE_URL + candidate;
      }
      items.push(item);
    }
  }

  // 补上动态段（如 /draw/admin/collaborator 的 collaborator 段未在 LABELS 中）
  // 如果循环匹配完后 items 的末项不覆盖全部已知段，补一个"解析"标签
  if (items.length === 1 && segments.length >= 1) {
    // 有路径段但一个都没匹配到 → 用最后一个段作为标签
    const lastName = segments[segments.length - 1];
    items.push({
      "@type": "ListItem",
      position: 2,
      name: lastName,
    });
  }

  // 附加自定义项
  if (extra) {
    for (const e of extra) {
      items.push({
        "@type": "ListItem",
        position: items.length + 1,
        name: e.name,
        item: e.item,
      });
    }
  }

  return items;
}

/**
 * 按路径生成 BreadcrumbList JSON-LD 数据。
 * 返回 null 表示不应输出（该路径已有更详细的路由级面包屑）。
 */
export function generateBreadcrumbLd(
  pathname: string,
  opts?: { skip?: boolean; extra?: { name: string; item?: string }[] },
): object | null {
  if (opts?.skip) return null;

  // 以下路径由各自的路由组件提供更详细的面包屑（含动态标题等）
  const clean = pathname.replace(/\?.*$/, "").replace(/\/+$/, "");
  if (/^\/posts\/[^/]+$/.test(clean)) return null;
  if (/^\/forum\/post\/\d+$/.test(clean)) return null;

  // 排除无面包屑意义的页面
  if (clean === "/" || clean === "") {
    return {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "首页", item: SITE_URL + "/" },
      ],
    };
  }

  const items = buildBreadcrumbItems(pathname, opts?.extra);
  if (items.length <= 1) return null;

  return {
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
