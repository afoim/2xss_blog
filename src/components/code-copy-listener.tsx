'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * 代码块复制按钮的全局点击委托。
 * 按钮本体由 renderMarkdown 注入（.code-copy），此处只挂一个 document 级监听，
 * 对动态渲染/边缘预渲染的内容一律生效，无需每个页面自己接线。
 */
export function CodeCopyListener() {
  useEffect(() => {
    const onClick = async (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest?.('.code-copy');
      if (!(btn instanceof HTMLElement)) return;
      const code = btn.parentElement?.querySelector('code')?.textContent ?? '';
      try {
        await navigator.clipboard.writeText(code);
        btn.textContent = '✓ copied';
        setTimeout(() => {
          btn.textContent = 'copy';
        }, 1500);
      } catch {
        toast.error('复制失败');
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
