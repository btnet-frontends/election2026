import { onMounted, onUnmounted, shallowRef } from 'vue';

// 保留 build 時的資料作為首屏；載入、每分鐘及回到分頁時取得最新資料。
export function useLiveStatistics(initialData, fetchData) {
  const data = shallowRef(initialData);
  let timer;
  let controller;
  let stopped = false;

  const refresh = async () => {
    if (stopped || controller || document.hidden) return;
    const request = new AbortController();
    controller = request;
    const timeout = setTimeout(() => request.abort(), 10000);
    try {
      const latest = await fetchData(request.signal);
      if (!stopped && !request.signal.aborted && latest != null) data.value = latest;
    } catch (error) {
      if (!request.signal.aborted) console.error('選情統計更新失敗:', error);
    } finally {
      clearTimeout(timeout);
      controller = null;
    }
  };

  onMounted(() => {
    refresh();
    timer = setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
  });

  onUnmounted(() => {
    stopped = true;
    clearInterval(timer);
    document.removeEventListener('visibilitychange', refresh);
    controller?.abort();
  });

  return data;
}
