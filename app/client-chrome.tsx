import { FloatingActions } from "@/components/floating-actions";
import { CodeCopyListener } from "@/components/code-copy-listener";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/analytics";

/**
 * 全部浏览器专属的装饰/监听组件集中在此，经 root 的 ClientOnly + lazy 仅在客户端加载，
 * 保证这些模块永不进入服务端求值。
 */
export default function ClientChrome() {
  return (
    <>
      {/* 背景闪烁网格已移除：满屏 canvas 每帧要画 cols×rows 个 fillRect
          （412×823 手机视口约 3500 个），Lighthouse 实测光脚本执行就 2.3s，
          是全站主线程开销第一名。别再加回来 */}
      {/* Cookie 同意横幅已整体移除：分域后 www / blog / forum / ai 是四个
          独立 origin，localStorage 各存各的，同一个人要连点四次同意。
          等做完跨域偏好同步再统一加回来 */}
      <FloatingActions />
      <CodeCopyListener />
      <Toaster />
      <Analytics />
    </>
  );
}
