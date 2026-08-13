import { computed, onMounted, onUnmounted, ref } from 'vue';
import { PHASE_NAV_NO, getPhase, getPhaseComponentFlags } from '../utils/schedule.js';

// How often to re-check the clock against the schedule while a tab stays
// open. The schedule only has two boundaries, so this doesn't need to be
// tighter than the smallest gap a user should notice a switch within.
const CHECK_INTERVAL_MS = 15000;

// Live-updating election phase (default/start/end) shared by Header.vue's
// nav and every time-gated section, so an already-open tab flips over on
// its own the moment the clock crosses 11/28 16:00 or 11/29 00:00.
export function usePhase() {
  const phase = ref(getPhase());
  const navNo = computed(() => PHASE_NAV_NO[phase.value]);
  const componentFlags = computed(() => getPhaseComponentFlags(phase.value));

  let timer = null;

  const refresh = () => {
    const nextPhase = getPhase();
    if (nextPhase !== phase.value) phase.value = nextPhase;
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
