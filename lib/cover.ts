export interface CoverSource {
  coverImage?: string;
  thumbnail?: string;
}

/**
 * 取文章封面图。迁移过来的文章用 coverImage，模板旧字段 thumbnail 作为兼容。
 * 没有封面图时返回 undefined，由调用方决定占位方式。
 */
export function getCover(data: CoverSource): string | undefined {
  return data.coverImage || data.thumbnail || undefined;
}
