'use client';

import { useEffect } from 'react';
import { siteConfig } from '@/lib/config/site';

export function Analytics() {
  // Cookie 同意横幅已移除（见 app/client-chrome.tsx），原来分析类追踪器要等
  // 'cookie-consent-updated' 事件才注入 —— 横幅没了就永远等不到，所以改成
  // 无条件加载。恢复同意机制时这里要跟着改回去。
  useEffect(() => {
    loadUmami();
    loadCloudflare();
    loadBaidu();
    loadGoogle();
    loadClarity();
  }, []);

  return null;
}

function loadUmami() {
  const src = siteConfig.analytics.umami.src;
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = src;
  script.setAttribute('data-website-id', siteConfig.analytics.umami.websiteId);
  document.head.appendChild(script);
}

function loadCloudflare() {
  const src = 'https://static.cloudflareinsights.com/beacon.min.js';
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = src;
  script.setAttribute(
    'data-cf-beacon',
    JSON.stringify({ token: siteConfig.analytics.cfWebAnalytics.token }),
  );
  document.head.appendChild(script);
}


function loadBaidu() {
  const id = siteConfig.analytics.baidu.id;
  if (document.querySelector(`script[src*="hm.baidu.com"]`)) return;
  const script = document.createElement('script');
  script.innerHTML = `
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?${id}";
      var s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(hm, s);
    })();
  `;
  document.head.appendChild(script);
}

function loadGoogle() {
  const id = siteConfig.analytics.google.measurementId;
  if (document.querySelector(`script[src*="googletagmanager"]`)) return;

  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(gtagScript);

  const initScript = document.createElement('script');
  initScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}');
  `;
  document.head.appendChild(initScript);
}

function loadClarity() {
  const id = siteConfig.analytics.clarity.projectId;
  if (document.querySelector(`script[src*="clarity.ms"]`)) return;
  const script = document.createElement('script');
  script.innerHTML = `
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${id}");
  `;
  document.head.appendChild(script);
}
