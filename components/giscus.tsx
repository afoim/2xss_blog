"use client";

import { useEffect, useRef } from "react";

export function Giscus() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "afoim/af_comments-data");
    script.setAttribute("data-repo-id", "R_kgDON3IlWA");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDON3IlWM4CmqVa");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "1");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("data-loading", "lazy");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;
    ref.current.appendChild(script);
  }, []);

  return <div ref={ref} className="giscus" />;
}
