const DATA_ORIGIN = 'https://doqvf81n9htmm.cloudfront.net';

// CDN 已提供 Access-Control-Allow-Origin: *，靜態 build 可直接跨網域更新。
// 僅開發模式的瀏覽器走 Vite proxy；build、preview 及部署後均使用 CDN。
export async function fetchStatisticsJson(endpoint, signal = AbortSignal.timeout(10000)) {
  const origin = typeof window !== 'undefined' && import.meta.env?.DEV ? '' : DATA_ORIGIN;
  const response = await fetch(`${origin}/files/2026election/uat/${endpoint}?v=${Date.now()}`, {
    cache: 'no-store',
    signal
  });
  if (!response.ok) throw new Error(`選情統計 ${endpoint} API 回應 ${response.status}`);
  return response.json();
}
