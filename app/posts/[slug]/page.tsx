import { docs, meta } from "@/.source";
import { DocsBody } from "fumadocs-ui/page";
import { mdxComponents } from "@/components/mdx";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { notFound } from "next/navigation";
import { ArrowLeft, FilePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Giscus } from "@/components/giscus";
import Image from "next/image";

import { TableOfContents } from "@/components/table-of-contents";
import { MobileTableOfContents } from "@/components/mobile-toc";
import { AuthorCard } from "@/components/author-card";
import { ReadMoreSection } from "@/components/read-more-section";
import { getAuthor, isValidAuthor } from "@/lib/authors";
import { getCover } from "@/lib/cover";
import { isPublished } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { HashScrollHandler } from "@/components/hash-scroll-handler";

export { generateMetadata } from "./metadata";

export function generateStaticParams() {
  // 草稿不进预渲染清单，静态导出时不会产出对应的 HTML
  return blogSource
    .getPages()
    .filter((page) => isPublished(page.data))
    .map((page) => ({ slug: page.slugs[0] }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const blogSource = loader({
  baseUrl: "/posts",
  source: createMDXSource(docs, meta),
});

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    notFound();
  }

  const page = blogSource.getPage([slug]);

  // 草稿在 next dev 下直接访问也应该是 404，与构建产物保持一致
  if (!page || !isPublished(page.data)) {
    notFound();
  }

  const MDX = page.data.body;
  const cover = getCover(page.data);
  // page.path 是相对 content/ 的文件名，如 csp.mdx
  const editUrl = `${siteConfig.repo}/edit/${siteConfig.repoBranch}/content/${page.path}`;
  const date = new Date(page.data.date);
  const formattedDate = formatDate(date);

  return (
    <div className="min-h-screen bg-background relative">
      <HashScrollHandler />
      <div className="absolute top-0 left-0 z-0 w-full h-[200px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)]">
        <FlickeringGrid
          className="absolute top-0 left-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.2}
          flickerChance={0.05}
        />
      </div>

      <div className="space-y-4 border-b border-border relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 py-6 px-0 md:px-6">
          <div className="flex flex-wrap items-center gap-3 gap-y-5 text-sm text-muted-foreground">
            <Button variant="outline" asChild className="h-6 w-6">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                <span className="sr-only">返回文章列表</span>
              </Link>
            </Button>
            {page.data.tags && page.data.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 text-muted-foreground">
                {page.data.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="h-6 w-fit px-3 text-sm font-medium bg-muted text-muted-foreground rounded-md border flex items-center justify-center"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <time className="font-medium text-muted-foreground">
              {formattedDate}
            </time>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-balance">
            {page.data.title}
          </h1>

          {page.data.description && (
            <p className="text-muted-foreground max-w-4xl md:text-lg md:text-balance">
              {page.data.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex divide-x divide-border relative max-w-7xl mx-auto px-0 md:px-4 z-10">
        <div className="absolute max-w-7xl mx-auto left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] lg:w-full h-full border-x border-border p-0 pointer-events-none" />
        <main className="w-full p-0 overflow-hidden">
          {cover && (
            <div className="relative w-full h-[500px] overflow-hidden object-cover border border-transparent">
              <Image
                src={cover}
                alt={page.data.title}
                fill
                unoptimized
                className="object-cover"
                priority
              />
            </div>
          )}
          <div className="py-6 px-0 md:px-6 lg:p-10">
            {/*
              prose-code:* 只影响行内代码 —— 代码块外层的 <figure> 带 not-prose，
              prose 的样式进不去。去掉 typography 默认给行内代码加的反引号伪元素，
              换成灰底小圆角，和代码块区分开。
            */}
            <div className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-semibold prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance prose-lg prose-code:before:content-none prose-code:after:content-none prose-code:rounded-md prose-code:border prose-code:border-border prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:text-[0.875em]">
              <DocsBody>
                <MDX components={mdxComponents} />
              </DocsBody>
            </div>

            <div className="mt-10 pt-6 border-t border-border">
              <a
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <FilePen className="size-4" />
                在 GitHub 上编辑此文章
              </a>
            </div>
          </div>
          <section className="border-t border-border py-6 px-0 md:px-6 lg:p-10">
            <h2 className="text-2xl font-medium mb-8">评论</h2>
            <Giscus />
          </section>
          <div className="mt-10">
            <ReadMoreSection
              currentSlug={[slug]}
              currentTags={page.data.tags}
            />
          </div>
        </main>

        <aside className="hidden lg:block w-[350px] flex-shrink-0 p-6 lg:p-10 bg-muted/60 dark:bg-muted/20">
          <div className="sticky top-20 space-y-8">
            {page.data.author && isValidAuthor(page.data.author) && (
              <AuthorCard author={getAuthor(page.data.author)} />
            )}
            <div className="border border-border rounded-lg p-6 bg-card">
              <TableOfContents />
            </div>
          </div>
        </aside>
      </div>

      <MobileTableOfContents />
    </div>
  );
}
