'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Icon } from '@/components/ui/icon';
import { siteConfig } from '@/lib/config/site';

/* 自定义主题：GitHub Dark + 全直角（public/giscus-shell.css）。
   giscus 在 https iframe 内加载该样式表，必须是可公开访问的 HTTPS 绝对地址。 */
const GISCUS_THEME = `${siteConfig.url}/giscus-shell.css`;

const GISCUS_CONFIG = {
  src: 'https://giscus.app/client.js',
  'data-repo': siteConfig.giscus.repo,
  'data-repo-id': siteConfig.giscus.repoId,
  'data-category': siteConfig.giscus.category,
  'data-category-id': siteConfig.giscus.categoryId,
  'data-mapping': 'pathname',
  'data-strict': '1',
  'data-reactions-enabled': '1',
  'data-emit-metadata': '0',
  'data-input-position': 'top',
  'data-lang': 'zh-CN',
  'data-loading': 'lazy',
  crossorigin: 'anonymous',
};

export function Giscus() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  /**
   * 已经为哪个路径注入过 giscus。
   *
   * `data-mapping: pathname` 意味着评论串是按 URL 路径绑定的，而文章底部的
   * 「上一篇 / 下一篇」是 <Link>（客户端导航）—— 路由参数变了但组件不重挂。
   * 原先这里是个布尔量 `scriptInjected`，注入过就永不再注入，于是从 A 篇跳到
   * B 篇后，页面是 B 的、评论区还挂着 A 的讨论串（`data-strict: 1` 下评论会
   * 直接发到 A 底下）。改存路径，路径变了就重新注入。
   */
  const loadedPath = useRef<string | null>(null);
  const { pathname } = useLocation();

  const loadGiscus = useCallback(() => {
    if (!containerRef.current || loadedPath.current === pathname) return;
    loadedPath.current = pathname;

    const container = containerRef.current;
    // 换文章时先清掉上一篇的 iframe
    container.innerHTML = '';

    const script = document.createElement('script');
    for (const [attr, value] of Object.entries(GISCUS_CONFIG)) {
      script.setAttribute(attr, value);
    }
    script.setAttribute('data-theme', GISCUS_THEME);
    script.async = true;
    container.appendChild(script);
    setLoaded(true);
  }, [pathname]);

  // 挂载 + 每次换文章：（重新）注入。
  // Cookie 同意横幅已移除（见 app/client-chrome.tsx），原来要等
  // 'cookie-consent-updated' 才注入 —— 横幅没了就永远等不到，改成无条件加载。
  useEffect(() => {
    loadGiscus();
  }, [loadGiscus]);

  // Sync theme after loaded
  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          giscus: {
            setConfig: {
              theme: GISCUS_THEME,
            },
          },
        },
        'https://giscus.app',
      );
    }
  }, []);

  return (
    <div className="mt-12 border-t pt-8">
      {!loaded && (
        <div className="flex items-start gap-3 rounded-lg border p-4 text-sm">
          <Icon
            icon="mdi:information-outline"
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
          />
          <div>
            <p className="font-medium">评论功能需要启用功能性 Cookie</p>
            <p className="text-muted-foreground mt-1">
              请在{' '}
              <a
                href="#"
                id="open_preferences_center"
                className="text-primary underline"
              >
                Cookie 设置
              </a>{' '}
              中启用
            </p>
          </div>
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
