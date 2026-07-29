"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  // 扫描文章区域获取标题（支持客户端动态渲染的内容）
  useEffect(() => {
    const scan = () => {
      const els = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const arr: Heading[] = [];
      els.forEach((el) => {
        if (el.id) {
          arr.push({
            id: el.id,
            text: el.textContent || "",
            level: parseInt(el.tagName.charAt(1)),
          });
        }
      });
      setHeadings(arr);
    };

    // 初始扫描
    scan();

    // 监听文章内容变化（PostBody 是客户端动态渲染的）
    const article = document.querySelector("article");
    if (article) {
      const observer = new MutationObserver(() => scan());
      observer.observe(article, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const update = () => {
      let best = "";
      let bestTop = Infinity;

      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top >= 76 && top < bestTop) {
          bestTop = top;
          best = h.id;
        }
      }

      if (!best) {
        let lastAbove = "";
        let lastAboveTop = -Infinity;
        for (const h of headings) {
          const el = document.getElementById(h.id);
          if (!el) continue;
          const top = el.getBoundingClientRect().top;
          if (top < 76 && top > lastAboveTop) {
            lastAboveTop = top;
            lastAbove = h.id;
          }
        }
        if (lastAbove) best = lastAbove;
      }

      if (!best && headings.length > 0) best = headings[0].id;

      if (best && best !== activeRef.current) setActiveId(best);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();

    return () => window.removeEventListener("scroll", update);
  }, [headings]);

  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <div className={cn("font-mono", className)}>
      <h4 className="mb-3 border-b border-border pb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        本页目录
      </h4>
      <nav>
        <ul className="space-y-px">
          {headings.map((heading) => {
            const depth = Math.max(0, heading.level - minLevel);
            const active = activeId === heading.id;
            return (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(heading.id);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                    window.history.pushState({}, "", `#${heading.id}`);
                  }}
                  className={cn(
                    "flex items-baseline gap-1.5 py-1 pr-1.5 text-left leading-snug no-underline transition-colors duration-75",
                    // 层级区分：字号 / 颜色 / 字重逐级递减
                    depth === 0 && "text-sm font-medium text-foreground/90",
                    depth === 1 && "text-[13px] text-muted-foreground",
                    depth >= 2 && "text-xs text-muted-foreground/80",
                    // 反色选中块 = 终端选区
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-foreground hover:text-background",
                  )}
                  style={{ paddingLeft: `${0.375 + depth * 0.75}rem` }}
                >
                  {/* Markdown 式层级前缀，一眼分辨标题级别 */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "shrink-0 text-[0.85em] select-none",
                      active ? "text-primary-foreground/60" : "text-muted-foreground/40",
                    )}
                  >
                    {"#".repeat(heading.level)}
                  </span>
                  <span className="min-w-0">{heading.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
