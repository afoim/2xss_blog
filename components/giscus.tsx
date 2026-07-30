"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const GISCUS_ORIGIN = "https://giscus.app";

const GISCUS_ATTRS: Record<string, string> = {
  "data-repo": "afoim/af_comments-data",
  "data-repo-id": "R_kgDOOi8quw",
  "data-category": "Announcements",
  "data-category-id": "DIC_kwDOOi8qu84CprDV",
  "data-mapping": "pathname",
  "data-strict": "0",
  "data-reactions-enabled": "1",
  "data-emit-metadata": "0",
  "data-input-position": "top",
  "data-lang": "zh-CN",
  "data-loading": "lazy",
};

export function Giscus() {
  const ref = useRef<HTMLDivElement>(null);
  const injected = useRef(false);
  const { resolvedTheme } = useTheme();
  // 跟随站内主题切换，而不是只跟随系统偏好（见 README 说明）
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    // resolvedTheme 在首次渲染时还是 undefined，等它确定后再注入，
    // 否则深色模式下评论区会先闪一下白底
    if (!resolvedTheme || injected.current || !ref.current) return;
    injected.current = true;

    const script = document.createElement("script");
    script.src = `${GISCUS_ORIGIN}/client.js`;
    for (const [name, value] of Object.entries(GISCUS_ATTRS)) {
      script.setAttribute(name, value);
    }
    script.setAttribute("data-theme", theme);
    script.crossOrigin = "anonymous";
    script.async = true;
    ref.current.appendChild(script);
  }, [resolvedTheme, theme]);

  // 切换主题时通知已加载的 iframe，避免重新加载整个评论区
  useEffect(() => {
    const iframe = ref.current?.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame"
    );
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme } } },
      GISCUS_ORIGIN
    );
  }, [theme]);

  return <div ref={ref} className="giscus" />;
}
