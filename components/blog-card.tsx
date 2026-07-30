import Link from "next/link";
import Image from "next/image";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  url: string;
  title: string;
  description: string;
  date: string;
  cover?: string;
  pinned?: boolean;
  showRightBorder?: boolean;
}

// 没有封面图时按标题生成一个稳定的色相，避免卡片高度参差不齐
const hueFromTitle = (title: string): number => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) % 360;
  }
  return hash;
};

export function BlogCard({
  url,
  title,
  description,
  date,
  cover,
  pinned = false,
  showRightBorder = true,
}: BlogCardProps) {
  const hue = hueFromTitle(title);
  return (
    <Link
      href={url}
      className={cn(
        "group block relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-0 after:h-px after:w-screen after:bg-border after:content-['']",
        showRightBorder && "md:border-r border-border border-b-0"
      )}
    >
      <div className="flex flex-col">
        <div className="relative w-full h-48 overflow-hidden bg-muted">
          {cover ? (
            <Image
              src={cover}
              alt={title}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div
              aria-hidden
              className="size-full transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundImage: `linear-gradient(135deg, hsl(${hue} 55% 62%), hsl(${(hue + 48) % 360} 60% 42%))`,
              }}
            />
          )}
          {pinned && (
            <span className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-md bg-background/85 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm border border-border">
              <Pin className="size-3" />
              置顶
            </span>
          )}
        </div>

        <div className="p-6 flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-card-foreground group-hover:underline underline-offset-4">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">{description}</p>
          <time className="block text-sm font-medium text-muted-foreground">
            {date}
          </time>
        </div>
      </div>
    </Link>
  );
}
