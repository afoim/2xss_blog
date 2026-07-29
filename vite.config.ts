import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

/**
 * 整次构建共用的时间戳。
 *
 * `react-router build` 会跑两趟 Vite 构建（client 一趟、server 一趟），本配置文件
 * 因此被求值两次。若每次现算 Date.now()，两个 bundle 会烘进相差几十秒的值，
 * 于是 Footer 的"构建时间"在 SSR HTML 和客户端首次渲染时不一致 —— 直接触发
 * React #418 水合失败，整棵树被丢弃重渲。
 *
 * 两趟构建不在同一个进程里（回写 process.env 不管用），所以时间戳由 package.json
 * 的 build 脚本用 SVAF_BUILD_STAMP 在外层注入一次。直接跑 vite 时回退到当前时间，
 * 此时两趟值不同 —— 只影响 Footer 显示，不影响功能。
 */
const BUILD_STAMP = process.env.SVAF_BUILD_STAMP || String(Date.now());

/**
 * 构建目标 —— 决定这份产物是给哪个域用的。
 *
 * - `full`（默认）：2x.nz / forum.2x.nz / ai.2x.nz 用的全站 SSR 产物，行为与分域前完全一致
 * - `blog`：blog.2x.nz 用的**纯静态**产物，只含 /posts，全量预渲染后托管在 CF Worker 上
 * - `www`：www.2x.nz 用的**纯静态**门户，整个域就一个入口清单页
 * - `forum`：forum.2x.nz 用的 SSR 产物，只含 /forum
 * - `ai`：ai.2x.nz 用的**纯静态**产物，只含 /draw（全是 ClientOnly）
 *
 * 和 BUILD_STAMP 同理：`react-router build` 跑两趟 Vite 构建、本文件被求值两次，
 * 所以这个值必须来自外部环境变量而不是在此现算，否则 client / server 两份会不一致。
 */
};

}

export default defineConfig({
  resolve: {
    // 复用 SPA 的 @ 别名指向 src/（tsconfig paths 不会自动进 vite 打包，需在此显式配置）
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  ssr: {
    // 仅对使用「目录导入」（Node 原生 ESM 运行时解析不了）的包做打包内联；
    // 全量 noExternal 会把 mermaid/recharts 等一起打进去导致构建 OOM。
    noExternal: ["@lobehub/icons"],
  },
  define: {
    __BUILD_LABEL__: JSON.stringify(buildLabel()),
    // 头像等外链图片的缓存刷新标记。**不能**在业务代码里用 Date.now() 现算：
    // 服务端拿到的是进程启动时刻、客户端拿到的是页面加载时刻，两个值不同会让
    // 头像 URL 在水合时对不上。走 BUILD_STAMP 才能保证 client/server 两趟
    // 构建烘进同一个值，同时保留"每次部署刷新一次"的原意。
    __BUILD_ID__: JSON.stringify(BUILD_STAMP),