import { Metadata } from "next";
import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { siteConfig } from "@/lib/site";
import { getCover } from "@/lib/cover";

const DEFAULT_AUTHOR = "AcoFork";

const blogSource = loader({
  baseUrl: "/posts",
  source: createMDXSource(docs, meta),
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;

    if (!slug || slug.length === 0) {
      return {
        title: "文章不存在",
        description: "找不到你要访问的文章。",
      };
    }

    const page = blogSource.getPage([slug]);

    if (!page) {
      return {
        title: "文章不存在",
        description: "找不到你要访问的文章。",
      };
    }

    const ogUrl = `${siteConfig.url}/posts/${slug}`;
    // 静态导出（output: export）没有动态 OG 图路由，只有文章封面可用
    const cover = getCover(page.data);

    return {
      title: page.data.title,
      description: page.data.description,
      keywords: [
        page.data.title,
        ...(page.data.tags || []),
        "Blog",
        "Article",
        "Web Development",
        "Programming",
        "Technology",
        "Software Engineering",
      ],
      authors: [
        {
          name: page.data.author || DEFAULT_AUTHOR,
          url: siteConfig.url,
        },
      ],
      creator: page.data.author || DEFAULT_AUTHOR,
      publisher: siteConfig.name,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      openGraph: {
        title: page.data.title,
        description: page.data.description,
        type: "article",
        url: ogUrl,
        publishedTime: page.data.date,
        authors: [page.data.author || DEFAULT_AUTHOR],
        tags: page.data.tags,
        ...(cover
          ? {
              images: [
                {
                  url: cover,
                  alt: page.data.title,
                },
              ],
            }
          : {}),
        siteName: siteConfig.name,
      },
      twitter: {
        card: cover ? "summary_large_image" : "summary",
        title: page.data.title,
        description: page.data.description,
        ...(cover ? { images: [cover] } : {}),
      },
      alternates: {
        canonical: ogUrl,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "文章不存在",
      description: "找不到你要访问的文章。",
    };
  }
}
