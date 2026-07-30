# MagicUI Blog 模板

A modern, responsive blog built with Next.js 15, Fumadocs MDX, and Tailwind CSS. Beautiful interface for displaying articles, tutorials, and insights about React and modern web development.

## ✨ Features

- 🎨 **Modern Design** - Clean, responsive interface
- 📝 **MDX Support** - Write blog posts in MDX with full component support
- 🌙 **Dark Mode** - Built-in dark/light theme toggle
- 🏷️ **Tags & Categories** - Organize content with tags
- ⭐ **Featured Posts** - Highlight your best articles
- 📱 **Mobile Responsive** - Perfect on all devices
- 🚀 **Fast Performance** - Optimized with Next.js 15

## 🚀 Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd blog-template

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## ✍️ 写文章

### 方式一：在浏览器里写（Pages CMS）

仓库根目录的 [`.pages.yml`](.pages.yml) 已配置好 [Pages CMS](https://pagescms.org/)：

1. 打开 <https://app.pagescms.org/> 用 GitHub 账号登录
2. 授权并连接 `afoim/2xss_blog` 仓库
3. 进入「文章」集合，即可新建/编辑，保存直接 commit 到 `main`
4. `.github/workflows/deploy.yml` 监听 `push: main`，保存后自动构建部署

几个注意点：

- **文件名要手填英文 slug**。文件名就是文章 URL（`/posts/<文件名>`），标题是中文没法自动转换，所以文件名在编辑器里是可编辑字段。改动已发布文章的文件名会改变它的 URL。
- **正文用的是代码编辑器而非富文本**。因为文章里有 `> [!CAUTION]` 提示块、mermaid 代码块和 iframe/video 原始 HTML，走富文本往返会被改坏。
- **新增 frontmatter 字段时必须同步改两处**：`.pages.yml` 的 `fields` 和 `source.config.ts` 的 zod schema。Pages CMS 保存时只写回 `.pages.yml` 里声明过的字段，未声明的键会被静默丢弃。

### 方式二：本地新建文件

在 `content/` 下新建 `your-post-slug.mdx`：

````mdx
---
title: 文章标题
description: 一句话摘要，显示在首页卡片和社交分享里
date: "2026-07-30"
coverImage: https://raw-posts.2x.nz/img/xxx.webp
tags: ["Cloudflare", "DevOps"]
draft: false
pin: false
---

正文……

> [!CAUTION]
> GitHub 风格的提示块会渲染成彩色 Callout，支持 note / tip / important / warning / caution

```ts
// 代码块左上角显示语言，右上角有复制按钮
export default function Component() {
  return <div>Hello World!</div>;
}
```
````

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | ✅ | 标题 |
| `description` | ✅ | 摘要，同时用作 OG description |
| `date` | ✅ | `YYYY-MM-DD` |
| `coverImage` | | 封面图完整链接，留空则首页显示渐变占位块 |
| `tags` | | 标签数组 |
| `draft` | | `true` 则不参与构建，线上不可访问 |
| `pin` | | `true` 则置顶到首页第一位 |

## 🎨 Customization

### Adding New Tags/Categories

Simply add them to your blog post frontmatter. The system automatically generates tag pages.

### Featured Posts

Set `featured: true` in your blog post frontmatter to highlight it on the homepage (you can create a dedicated feature section in the home page).

### Styling

The project uses Tailwind CSS with a custom design system. Modify styles in:

- `app/globals.css` - Global styles
- Individual component files - Component-specific styles

### For Authors

Add your author details to the `lib/authors.ts` file.

```tsx
// lib/authors.ts
export const authors: Record<string, Author> = {
  dillion: {
    name: "Dillion Verma",
    position: "Software Engineer",
    avatar: "/authors/dillion.png",
  },
  arghya: {
    name: "Arghya Das",
    position: "Design System Engineer",
    avatar: "/authors/arghya.png",
  },
  // Add your author details here
  yourname: {
    name: "Your Full Name",
    position: "Your Position/Title",
    avatar: "/authors/your-avatar.png",
  },
} as const;
```

Then reference your author in blog posts using the key (e.g., `author: "yourname"`).

## 📖 Technologies Used

- **Next.js 15** - React framework with App Router
- **Fumadocs MDX** - MDX processing and components
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **Geist Font** - Modern typography

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
