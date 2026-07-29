declare const __BUILD_ID__: string;
export const SITE_ICON = `https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=140&t=${__BUILD_ID__}`;
export const SITE_NAME = '二叉树树';

export interface NavLink { label: string; icon: string; href: string; badge?: string; sameTab?: boolean; }
export interface NavSet { links: NavLink[]; primary: string[]; tools: string[]; external: string[]; home: string; }

// 博客导航：只放自己的 logo+标题，入口就是 /posts
const BLOG: NavSet = {
  links: [{ label: '全部文章', icon: 'mdi:post-outline', href: '/posts' }],
  primary: ['全部文章'], tools: [], external: [], home: '/posts',
};

export function navForTarget(): NavSet { return BLOG; }
