import { useEffect, useState } from "react";

let _isBrowser: boolean | null = null;
function isBrowser() {
  if (_isBrowser === null) _isBrowser = typeof window !== "undefined";
  return _isBrowser;
}

/**
 * 仅在客户端 hydration 后渲染 children；SSR 阶段渲染 fallback（默认 null）。
 * 用于隔离依赖浏览器 API 的装饰性组件，避免其进入服务端渲染。
 *
 * 使用双机制保证 SSR fallback 一定渲染：
 * 1. typeof window 判断（同构渲染时直接返回 fallback）
 * 2. useState+useEffect（hydration 后切换为 children）
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: () => React.ReactNode;
  fallback?: React.ReactNode;
}) {
  // SSR: 直接返回 fallback，不走 state（避免 React 19 流式 SSR 的渲染时序问题）
  if (!isBrowser()) return <>{fallback}</>;

  // 客户端：hydration 后 useEffect 触发切换
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  return <>{hydrated ? children() : fallback}</>;
}
