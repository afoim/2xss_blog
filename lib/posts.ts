export interface PostVisibility {
  draft?: boolean;
}

/**
 * 草稿（draft: true）不发布：既不预渲染成页面，也不出现在首页和相关阅读列表里。
 * 所有列举文章的地方都应该过一遍这个函数。
 */
export function isPublished(data: PostVisibility): boolean {
  return !data.draft;
}
