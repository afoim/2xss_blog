import { Github } from "lucide-react";
import { siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto p-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.author} 保留所有权利。
        </p>
        <a
          href={siteConfig.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="size-4" />
          开源仓库
        </a>
      </div>
    </footer>
  );
}
