import { computed, onMounted, onUnmounted, ref } from 'vue';
import { PHASE_NAV_NO, getPhase, getPhaseComponentFlags } from '../utils/schedule.js';
import { useLiveVoteResult } from './useLiveVoteResult.js';

// The clock controls the start; the shared live API controls the end.
const CHECK_INTERVAL_MS = 15000;

export function usePhase() {
  const { result } = useLiveVoteResult();
  const now = ref(Date.now());
  const phase = computed(() => getPhase(now.value, result.value?.showSearchBar));
  const navNo = computed(() => PHASE_NAV_NO[phase.value]);
  const componentFlags = computed(() => getPhaseComponentFlags(phase.value));

  let timer = null;

  const refresh = () => {
    now.value = Date.now();
  };

  onMounted(() => {
    refresh();
    timer = setInterval(refresh, CHECK_INTERVAL_MS);
  });

  onUnmounted(() => {
    clearInterval(timer);
  });

  const isComponentVisible = (name) => componentFlags.value[name] ?? true;

  return { phase, navNo, isComponentVisible };
}
