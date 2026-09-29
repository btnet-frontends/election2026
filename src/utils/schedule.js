// 2026 election-night schedule.
//
// Three phases drive which header nav set (navNo) is shown and which
// time-sensitive sections are visible, entirely on the client so an
// already-open tab switches automatically at the exact moment — no reload.
//
//   default (navNo 1): before polls close — pre-election homepage.
//   start   (navNo 2): SCHEDULE_START <= now < SCHEDULE_END — polls closed,
//                       votes are being counted live.
//   end     (navNo 3): now >= SCHEDULE_END — results are settled.
//
// Matches the anchors each navNo's navItems already point to in data.json
// (navNo 1 has no live-streaming/vote/referendum/elected-search links at
// all; navNo 2 links to live-streaming instead of elected-search; navNo 3
// links to elected-search instead of live-streaming).
export const SCHEDULE_START = '2026-11-28T16:00:00+08:00';
export const SCHEDULE_END = '2026-11-29T00:00:00+08:00';

// 本屆選舉年份：SCHEDULE_START 前各資料區塊隱藏此年份，之後顯示
// （API 尚無該年資料時內容為「尚未開票」）。
export const ELECTION_YEAR = 2026;

const startTime = new Date(SCHEDULE_START).getTime();
const endTime = new Date(SCHEDULE_END).getTime();

export const PHASE_NAV_NO = { default: 1, start: 2, end: 3 };

// Components whose visibility switches with the phase, layered on top of
// (i.e. still subject to) the manual on/off flags in data.json's top-level
// "components" object. Any component not listed here is unaffected by the
// phase and stays governed purely by that manual flag.
const PHASE_COMPONENT_FLAGS = {
  default: { LiveStreaming: false, Vote: false, Referendum: false, ElectedSearch: false, FlashNews: true, NewsReport: true, PollsChart: false },
  start: { LiveStreaming: true, Vote: true, Referendum: true, ElectedSearch: false, FlashNews: false, NewsReport: false, PollsChart: false },
  end: { LiveStreaming: false, Vote: true, Referendum: true, ElectedSearch: true, FlashNews: false, NewsReport: false, PollsChart: false }
};

export function getPhase(now = Date.now()) {
  if (now >= endTime) return 'end';
  if (now >= startTime) return 'start';
  return 'default';
}

export function getActiveNavNo(now = Date.now()) {
  return PHASE_NAV_NO[getPhase(now)];
}

export function getPhaseComponentFlags(phase) {
  return PHASE_COMPONENT_FLAGS[phase] ?? PHASE_COMPONENT_FLAGS.default;
}

export function isPhaseComponentVisible(name, now = Date.now()) {
  const flags = getPhaseComponentFlags(getPhase(now));
  return name in flags ? flags[name] : true;
}
