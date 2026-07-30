/**
 * 把 GitHub 风格的提示块语法转成 fumadocs 的 <Callout>：
 *
 *   > [!CAUTION]
 *   > 正文……
 *
 * 也支持标记后面直接跟正文的写法（仓库里两种都有）：
 *
 *   > [!CAUTION] 本文使用 DeepSeek-V4-Pro 编写。
 *
 * 产出的节点结构与 fumadocs 自带的 remarkAdmonition 一致，
 * 因此渲染时只需在 MDX components 里提供 Callout。
 */

interface AlertStyle {
  /** 对应 fumadocs Callout 的 type */
  type: "info" | "warn" | "error" | "success";
  title: string;
}

// GitHub 的五种提示块，标题统一用中文
export const ALERT_STYLES: Record<string, AlertStyle> = {
  note: { type: "info", title: "注意" },
  tip: { type: "success", title: "提示" },
  important: { type: "info", title: "重要" },
  warning: { type: "warn", title: "警告" },
  caution: { type: "error", title: "危险" },
};

// 标记后可能跟着空格和/或换行，换行最多吃掉一个（软换行），剩下的都是正文
const MARKER =
  /^\[!(note|tip|important|warning|caution)\][ \t]*(?:\r?\n)?/i;

/* eslint-disable @typescript-eslint/no-explicit-any */

function toCallout(blockquote: any): any | null {
  const first = blockquote.children?.[0];
  if (first?.type !== "paragraph") return null;

  const firstText = first.children?.[0];
  if (firstText?.type !== "text" || typeof firstText.value !== "string") {
    return null;
  }

  const match = MARKER.exec(firstText.value);
  if (!match) return null;

  const style = ALERT_STYLES[match[1].toLowerCase()];

  // 去掉标记，剩下的文本仍然是正文的一部分
  firstText.value = firstText.value.slice(match[0].length);

  const children = [...blockquote.children];
  if (firstText.value === "") {
    first.children.shift();
    // 标记独占一行时首段会被清空，直接丢掉这个空段落
    if (first.children.length === 0) children.shift();
  }

  return {
    type: "mdxJsxFlowElement",
    name: "Callout",
    attributes: [
      { type: "mdxJsxAttribute", name: "type", value: style.type },
      { type: "mdxJsxAttribute", name: "title", value: style.title },
    ],
    children,
  };
}

/** 自己遍历，避免为此引入 unist-util-visit 依赖 */
function walk(node: any): void {
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

export function remarkGithubAlerts() {
  return (tree: any) => {
    walk(tree);
  };
}
