/**
 * 把对象序列化成可安全内联进 `<script type="application/ld+json">` 的字符串。
 *
 * 直接 `JSON.stringify()` 是**有洞的**：JSON 不转义 `<`，所以只要数据里出现
 * `</script>`（论坛里真有一篇标题就是 `<script>alert('xss')</script>` 的帖子），
 * HTML 分词器就会在那里提前闭合 JSON-LD 块，后面的内容按 HTML 解析 ——
 * 前面那个 `<script>` 于是变成一个真的、会执行的脚本元素。
 *
 * 换成各自的 JSON 转义形式即可：解析结果完全一致，但 HTML 分词器再也看不到
 * 任何标签。U+2028/U+2029 一并处理（合法 JSON，却是旧式 JS 解析器眼里的换行符）。
 *
 * 下面刻意用 fromCharCode 构造反斜杠和分隔符，不在源码里写这些字符本身 ——
 * 它们极易在跨工具传递时被转义层吃掉或还原成真实字符。
 */
const BACKSLASH = String.fromCharCode(92);
const LINE_SEP = String.fromCharCode(0x2028);
const PARA_SEP = String.fromCharCode(0x2029);

const ESCAPES: Record<string, string> = {
  "<": BACKSLASH + "u003c",
  [LINE_SEP]: BACKSLASH + "u2028",
  [PARA_SEP]: BACKSLASH + "u2029",
};

const UNSAFE = new RegExp("[<" + LINE_SEP + PARA_SEP + "]", "g");

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(UNSAFE, (c) => ESCAPES[c]);
}
