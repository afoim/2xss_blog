import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const BUILD_STAMP = process.env.SVAF_BUILD_STAMP || String(Date.now());

function buildLabel() {
  const now = new Date(Number(BUILD_STAMP));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}年${pad(now.getMonth() + 1)}月${pad(now.getDate())}日 ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  ssr: {
    noExternal: ["@lobehub/icons"],
  },
  define: {
    __BUILD_LABEL__: JSON.stringify(buildLabel()),
    __BUILD_ID__: JSON.stringify(BUILD_STAMP),
    __SVAF_TARGET__: JSON.stringify("blog"),
    __SITE_URL__: JSON.stringify("https://blog.2x.nz"),
    __THUMB_BASE__: JSON.stringify("https://img.2x.nz"),
  },
  plugins: [tailwindcss(), reactRouter()],
  build: {
    target: "es2021",
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              name: "vendor-react",
              test: /[\/]node_modules[\/](react|react-dom|scheduler)[\/]/,
              priority: 40,
            },
            {
              name: "ui-shared",
              test: /[\/]src[\/]components[\/]ui[\/]/,
              priority: 20,
              minShareCount: 2,
            },
            {
              name: "lib-shared",
              test: /[\/](src[\/]lib[\/](utils|config)|app[\/]lib[\/](site|json-ld|breadcrumb))[\/.]/,
              priority: 20,
              minShareCount: 2,
            },
          ],
        },
      },
    },
  },
});
