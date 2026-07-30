import { defineConfig, defineDocs, frontmatterSchema } from "fumadocs-mdx/config";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import type { RehypeCodeOptions } from "fumadocs-core/mdx-plugins";
import { z } from "zod";
import { remarkGithubAlerts } from "./lib/remark-github-alerts";

type ShikiTransformer = NonNullable<RehypeCodeOptions["transformers"]>[number];

/**
 * Shiki 默认不会把语言写到 DOM 上，这里补一个 data-language，
 * 供 <CodeBlock> 在代码块左上角显示语言名。
 */
const addLanguageAttribute: ShikiTransformer = {
  name: "blog:add-language",
  pre(node) {
    node.properties["data-language"] = this.options.lang;
  },
};

export default defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    remarkImageOptions: false,
    // > [!CAUTION] 之类的 GitHub 提示块转成 <Callout>
    remarkPlugins: (plugins) => [remarkGithubAlerts, ...plugins],
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      // 展开默认 transformers，否则会覆盖掉 // [!code highlight] 等标注功能
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        addLanguageAttribute,
      ],
    },
  },
});

export const { docs, meta } = defineDocs({
  dir: "content",
  docs: {
    schema: frontmatterSchema.extend({
      // Pages CMS 用 yaml 包写回 frontmatter，日期不带引号（YAML 1.2 里那是字符串）；
      // 而这里用 js-yaml 读，默认 schema 会把裸日期解析成 Date。两边都接受，统一成 YYYY-MM-DD。
      date: z
        .union([z.string(), z.date()])
        .transform((value) =>
          typeof value === "string" ? value : value.toISOString().slice(0, 10)
        ),
      tags: z.array(z.string()).optional(),
      // 草稿：draft: true 的文章不进构建、不出现在任何列表里
      draft: z.boolean().optional().default(false),
      featured: z.boolean().optional().default(false),
      // 置顶：pin: true 的文章排在列表最前
      pin: z.boolean().optional().default(false),
      readTime: z.string().optional(),
      author: z.string().optional(),
      // 封面图：迁移过来的文章用 coverImage，模板旧字段 thumbnail 作为兼容
      coverImage: z.string().optional(),
      thumbnail: z.string().optional(),
    }),
  },
});
