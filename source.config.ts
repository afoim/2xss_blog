import { defineConfig, defineDocs, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";

export default defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    remarkImageOptions: false,
  },
});

export const { docs, meta } = defineDocs({
  dir: "content",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string(),
      tags: z.array(z.string()).optional(),
      featured: z.boolean().optional().default(false),
      readTime: z.string().optional(),
      author: z.string().optional(),
      thumbnail: z.string().optional(),
    }),
  },
});
