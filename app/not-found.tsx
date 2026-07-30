import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center w-full z-10">
      <div className="absolute top-0 left-0 z-0 w-full h-[500px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)]">
        <FlickeringGrid
          className="absolute top-0 left-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.5}
          flickerChance={0.1}
        />
      </div>
      <div className="text-center flex flex-col gap-4 max-w-xs mx-auto relative">
        <h1 className="text-8xl font-mono font-bold drop-shadow-lg text-primary">
          404
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed text-center tracking-tight text-balance">
          抱歉，没有找到你要访问的页面。它可能已被移动或删除，也可能是网址输入有误。
        </p>
        <Button asChild className="w-full rounded-lg h-9 drop-shadow-lg">
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    </div>
  );
}
