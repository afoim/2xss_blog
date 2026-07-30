/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/site";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto w-full flex h-14 items-center justify-between px-6">
        <div className="mr-4 flex">
          <Link
            href="/"
            aria-label="回到首页"
            className="mr-6 flex size-8 items-center justify-center rounded-md overflow-hidden"
          >
            {/* 图片与容器同尺寸，不再被容器裁切缩放 */}
            <img
              src={siteConfig.avatar}
              alt={siteConfig.author}
              width={32}
              height={32}
              className="size-full object-contain"
            />
          </Link>
        </div>

        <div className="flex flex-1 w-full justify-end">
          <nav className="flex items-center">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
