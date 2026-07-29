/** 搜索工具函数 —— 服务端/客户端共享，不依赖 node API */
export function escapeRegExp(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export function highlightSearchTerm(text: string, keywords: string[]): string {
  if (!keywords.length) return text;
  const re = new RegExp(`(${keywords.map((k) => escapeRegExp(k)).join("|")})`, "gi");
  return text.replace(re, "<mark>$1</mark>");
}
