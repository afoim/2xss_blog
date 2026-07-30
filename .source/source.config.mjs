// source.config.ts
import { defineConfig, defineDocs, frontmatterSchema } from "fumadocs-mdx/config";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { z } from "zod";

// lib/remark-github-alerts.ts
var ALERT_STYLES = {
  note: { type: "info", title: "\u6CE8\u610F" },
  tip: { type: "success", title: "\u63D0\u793A" },
  important: { type: "info", title: "\u91CD\u8981" },
  warning: { type: "warn", title: "\u8B66\u544A" },
  caution: { type: "error", title: "\u5371\u9669" }
};
var MARKER = /^\[!(note|tip|important|warning|caution)\][ \t]*(?:\r?\n)?/i;
function toCallout(blockquote) {
  const first = blockquote.children?.[0];
  if (first?.type !== "paragraph") return null;
  const firstText = first.children?.[0];
  if (firstText?.type !== "text" || typeof firstText.value !== "string") {
    return null;
  }
  const match = MARKER.exec(firstText.value);
  if (!match) return null;
  const style = ALERT_STYLES[match[1].toLowerCase()];
  firstText.value = firstText.value.slice(match[0].length);
  const children = [...blockquote.children];
  if (firstText.value === "") {
    first.children.shift();
    if (first.children.length === 0) children.shift();
  }
  return {
    type: "mdxJsxFlowElement",
    name: "Callout",
    attributes: [
      { type: "mdxJsxAttribute", name: "type", value: style.type },
      { type: "mdxJsxAttribute", name: "title", value: style.title }
    ],
    children
  };
}
function walk(node) {
  if (!Array.isArray(node?.children)) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child?.type === "blockquote") {
      const callout = toCallout(child);
      if (callout) {
        node.children[i] = callout;
        walk(callout);
        continue;
      }
    }
    walk(child);
  }
}
function remarkGithubAlerts() {
  return (tree) => {
    walk(tree);
  };
}

// source.config.ts
var addLanguageAttribute = {
  name: "blog:add-language",
  pre(node) {
    node.properties["data-language"] = this.options.lang;
  }
};
var source_config_default = defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    remarkImageOptions: false,
    // > [!CAUTION] 之类的 GitHub 提示块转成 <Callout>
    remarkPlugins: (plugins) => [remarkGithubAlerts, ...plugins],
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      // 展开默认 transformers，否则会覆盖掉 // [!code highlight] 等标注功能
      transformers: [
        ...rehypeCodeDefaultOptions.transformers ?? [],
        addLanguageAttribute
      ]
    }
  }
});
var { docs, meta } = defineDocs({
  dir: "content",
  docs: {
    schema: frontmatterSchema.extend({
      // Pages CMS 用 yaml 包写回 frontmatter，日期不带引号（YAML 1.2 里那是字符串）；
      // 而这里用 js-yaml 读，默认 schema 会把裸日期解析成 Date。两边都接受，统一成 YYYY-MM-DD。
      date: z.union([z.string(), z.date()]).transform(
        (value) => typeof value === "string" ? value : value.toISOString().slice(0, 10)
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
      thumbnail: z.string().optional()
    })
  }
});
export {
  source_config_default as default,
  docs,
  meta
};
