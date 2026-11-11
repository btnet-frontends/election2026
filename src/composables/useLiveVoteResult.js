import { onMounted, onUnmounted, ref } from 'vue';
import { fetchInvoicingResult, INVOICING_RESULT_URL } from '../utils/invoicingResultApi.js';

let browserState;

function createState(initialResult) {
  const result = ref(initialResult);
  const refreshFailed = ref(false);
  let users = 0;
  let timer;
  let controller;

  const refresh = async () => {
    if (!users || controller || document.hidden) return;
    clearTimeout(timer);
    const request = new AbortController();
    controller = request;
    const timeout = setTimeout(() => request.abort(), 10000);
    try {
      const url = import.meta.env?.DEV ? '/api/invoicing-result' : INVOICING_RESULT_URL;
      const latest = await fetchInvoicingResult(url, request.signal);
      if (users && !request.signal.aborted) {
        result.value = latest;
        refreshFailed.value = false;
      }
    } catch (error) {
      if (users) {
        refreshFailed.value = true;
        console.error('更新開票資料失敗:', error);
      }
    } finally {
      clearTimeout(timeout);
      controller = null;
      if (users) timer = setTimeout(refresh, 30000);
    }
  };

  return {
    result,
    refreshFailed,
    start() {
      if (++users !== 1) return;
      document.addEventListener('visibilitychange', refresh);
      refresh();
    },
    stop() {
      if (--users) return;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', refresh);
      controller?.abort();
      browserState = undefined;
    }
  };
}

// SSR 各自使用首屏資料，瀏覽器內的 Vue islands 共用資料與單一更新排程。
export function useLiveVoteResult(initialResult = null) {
  const state = typeof window === 'undefined'
    ? createState(initialResult)
    : (browserState ??= createState(initialResult));
  onMounted(state.start);
  onUnmounted(state.stop);
  return { result: state.result, refreshFailed: state.refreshFailed };
}
