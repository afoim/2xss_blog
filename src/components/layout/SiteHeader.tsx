import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { SpaToggleItem, useDisableSpa } from '@/components/spa-toggle';
import { SITE_ICON, SITE_NAME, navForTarget } from '@/lib/nav';

const navLinkClass =
  'flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-background rounded-md hover:bg-foreground transition-colors';

const extLinkSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3 opacity-40">
    <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
  </svg>
);

export function SiteHeader() {
  const toolsRef = useRef<HTMLDetailsElement>(null);
  const [spaDisabled, setSpaDisabled] = useDisableSpa();
  const closeTools = useCallback(() => {
    if (toolsRef.current) toolsRef.current.open = false;
  }, []);

  // 「工具」下拉：<details> 原生只认再点一次 summary，点空白处不会收起。
  // 这里补的是**纯增强**——无 JS 时下拉照样能开合，只是少了点外部关闭这一路。
  // 用 pointerdown 而非 click：链接的 click 会带着导航一起走，pointerdown 先到，
  // 收起动作不会被导航打断。
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = toolsRef.current;
      if (el?.open && !el.contains(e.target as Node)) el.open = false;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (toolsRef.current?.open) {
        toolsRef.current.open = false;
        toolsRef.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // 每个子业务有自己的构建目标，导航里只有自己的东西、没有任何外链
  // （见 src/lib/site-map.ts 的两条铁律）
  const nav = navForTarget();
  const primaryLinks  = nav.links.filter((l) => nav.primary.includes(l.label));
  const toolLinks     = nav.links.filter((l) => nav.tools.includes(l.label));
  const externalLinks = nav.external
    .map((label) => nav.links.find((l) => l.label === label))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  return (
    <header className="fixed inset-x-0 top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 flex h-14 items-center justify-between gap-4">

        {/* Logo */}
        <Link to={nav.home} className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity">
          <img src={SITE_ICON} alt="logo" width={28} height={28} className="h-7 w-7 rounded-full" />
          <span className="font-semibold text-sm tracking-tight">{SITE_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="flex items-center min-w-0 overflow-x-auto">
          {primaryLinks.map((link) => {
            const isExternal = link.href.startsWith('http');
            return isExternal ? (
              <a
                key={link.href}
                href={link.href}
                {...(link.sameTab ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                className={navLinkClass}
              >
                <Icon icon={link.icon} className="size-4" />
                {link.label}
                {link.badge && (
                  <Badge className="px-1.5 py-px text-[10px]">{link.badge}</Badge>
                )}
              </a>
            ) : (
              <Link key={link.href} to={link.href} className={navLinkClass}>
                <Icon icon={link.icon} className="size-4" />
                {link.label}
                {link.badge && (
                  <Badge className="px-1.5 py-px text-[10px]">{link.badge}</Badge>
                )}
              </Link>
            );
          })}

          {/* 工具下拉 —— 纯 CSS <details>，禁用 JS 也能展开。
              子业务的 NavSet 里 toolLinks / externalLinks 都是空的，整块不渲染。
              「禁用 SPA」是性能对比用的调试项，跟着这个下拉走，只在完整站出现 */}
          {(toolLinks.length > 0 || externalLinks.length > 0) && (
          <details ref={toolsRef} className="relative group">
            <summary className={`${navLinkClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
              <Icon icon="mdi:toolbox-outline" className="size-4" />
              工具
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 opacity-60 transition-transform group-open:rotate-180">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </summary>
            {/* 同移动端：有 JS 时 <Link> 走客户端导航、页面不重载，
                details 会一直开着，点到链接就手动合上 */}
            <div
              className="absolute left-0 top-full z-50 mt-2 w-max min-w-32 border border-foreground/80 bg-popover p-1 font-mono text-popover-foreground animate-[shell-fade-in_75ms_linear]"
              onClick={(e) => { if ((e.target as HTMLElement).closest('a')) closeTools(); }}
            >
              {toolLinks.map((link) => link.href.startsWith('http') ? (
                <a key={link.href} href={link.href} {...(link.sameTab ? {} : { target: '_blank', rel: 'noopener noreferrer' })} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-foreground hover:text-background focus:bg-foreground focus:text-background outline-none">
                  <Icon icon={link.icon} className="size-4 text-muted-foreground" />
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} to={link.href} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-foreground hover:text-background focus:bg-foreground focus:text-background outline-none">
                  <Icon icon={link.icon} className="size-4 text-muted-foreground" />
                  {link.label}
                </Link>
              ))}
              {externalLinks.length > 0 && (
                <>
                  <div className="-mx-1 my-1 h-px bg-border" />
                  {externalLinks.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-foreground hover:text-background focus:bg-foreground focus:text-background outline-none">
                      <Icon icon={link.icon} className="size-4 text-muted-foreground" />
                      {link.label}
                      {extLinkSvg}
                    </a>
                  ))}
                </>
              )}
              <div className="-mx-1 my-1 h-px bg-border" />
              <SpaToggleItem
                id="spa-toggle-desktop"
                checked={spaDisabled}
                onChange={setSpaDisabled}
                className="gap-2 px-2 py-1.5"
              />
            </div>
          </details>
          )}
        </nav>

      </div>
    </header>
  );
}