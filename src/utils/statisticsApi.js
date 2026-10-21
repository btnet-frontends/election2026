const DATA_ORIGIN = 'https://doqvf81n9htmm.cloudfront.net';

// 正式站的 /files 與資料 CDN 指向同一份資料；瀏覽器走同網域以避免 CORS。
// 本機開發由 Vite proxy 轉送；Astro build 則直接讀取 CDN。
export async function fetchStatisticsJson(endpoint, signal = AbortSignal.timeout(10000)) {
  const origin = typeof window === 'undefined' ? DATA_ORIGIN : '';
  const response = await fetch(`${origin}/files/2026election/${endpoint}?v=${Date.now()}`, {
    cache: 'no-store',
    signal
  });
  if (!response.ok) throw new Error(`選情統計 ${endpoint} API 回應 ${response.status}`);
  return response.json();
}
