export const ORIGINS = { blog: 'https://blog.2x.nz' } as const;
export type Business = keyof typeof ORIGINS;
export const HOME_PATH: Partial<Record<Business, string>> = { blog: '/posts' };
export function absUrl(biz: Business, path?: string): string { return ORIGINS[biz] + (path ?? HOME_PATH[biz] ?? '/'); }
export interface PortalLink { name: string; url: string; icon: string; color?: string; desc?: string; }
export const PORTAL_SERVICES: PortalLink[] = [];
export const PORTAL_TOOLS: PortalLink[] = [];
