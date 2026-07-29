import { siteConfig } from '@/lib/config/site';

declare const __BUILD_LABEL__: string;

export function Footer() {
  return (
    <footer className="mt-8 border-t pt-6 pb-8">
      <div className="container mx-auto flex flex-col items-center gap-2 text-sm text-muted-foreground">
        {/* 「Cookie 与偏好设置」入口随同意横幅一起移除，见 app/client-chrome.tsx */}
        <p>&copy; {new Date().getFullYear()} {siteConfig.bio.name}</p>
        {/* 不要再降透明度：/60 时对比度只有 3.3:1，达不到 WCAG AA 的 4.5:1 */}
        <small className="text-xs text-muted-foreground">构建时间：{__BUILD_LABEL__}</small>
      </div>
    </footer>
  );
}
