import { siteConfig } from "@/lib/site";

export interface Author {
  name: string;
  position: string;
  avatar: string;
}

export const authors: Record<string, Author> = {
  acofork: {
    name: "二叉树树",
    position: "全栈开发 / 运维",
    avatar: siteConfig.avatar,
  },
} as const;

export type AuthorKey = keyof typeof authors;

export function getAuthor(key: AuthorKey): Author {
  return authors[key];
}

export function isValidAuthor(key: string): key is AuthorKey {
  return key in authors;
}
