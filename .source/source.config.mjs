// source.config.ts
import { defineConfig, defineDocs, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";
var source_config_default = defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    remarkImageOptions: false
  }
});
var { docs, meta } = defineDocs({
  dir: "content",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string(),
      tags: z.array(z.string()).optional(),
      featured: z.boolean().optional().default(false),
      readTime: z.string().optional(),
      author: z.string().optional(),
      thumbnail: z.string().optional()
    })
  }
});
export {
  source_config_default as default,
  docs,
  meta
};
