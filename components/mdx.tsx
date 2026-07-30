import type { ComponentProps } from "react";
import { Callout } from "fumadocs-ui/components/callout";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import type { MDXComponents } from "mdx/types";

// 语言名直接用 shiki 的 id（bash、sql、powershell……），只把无语言的情况归一
const PLAIN_LANGUAGES = new Set(["plaintext", "plain", "text", "txt", ""]);

function languageLabel(lang: unknown): string {
  if (typeof lang !== "string" || PLAIN_LANGUAGES.has(lang.toLowerCase())) {
    return "text";
  }
  return lang;
}

/**
 * 代码块：外层是 <figure>（带 not-prose，不再被 prose 的行内 code 样式接管），
 * 左上角显示语言，右上角是复制按钮，内容区独立滚动。
 */
function CodePre({
  ref: _ref,
  title,
  ...props
}: ComponentProps<"pre"> & { "data-language"?: string }) {
  // 代码块上写了 title="xxx" 时以它为准，否则显示语言
  const heading = title ?? languageLabel(props["data-language"]);

  return (
    <CodeBlock {...props} title={heading}>
      <Pre>{props.children}</Pre>
    </CodeBlock>
  );
}

export const mdxComponents: MDXComponents = {
  Callout,
  pre: CodePre,
};
