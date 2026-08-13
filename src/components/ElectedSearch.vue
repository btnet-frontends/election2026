<template>
  <section id="elected-search" class="elected-search-section">
    <div class="container elected-search-container">
      <div class="section-header">
        <h2 class="elected-search-title">
          <img :src="searchIcon" alt="" class="search-icon" />
          當選快搜
        </h2>
        <div class="elected-search-divider"></div>
      </div>

      <div class="elected_search_area">
        <div class="search-panel">
          <div class="search-tabs" role="tablist" aria-label="當選人員查詢方式">
            <button
              v-for="tab in tabs"
              :id="`elected-tab-${tab.id}`"
              :key="tab.id"
              type="button"
              role="tab"
              class="search-tab"
              :class="{ 'is-active': activeTab === tab.id }"
              :aria-selected="activeTab === tab.id"
              :aria-controls="`elected-panel-${tab.id}`"
              :tabindex="activeTab === tab.id ? 0 : -1"
              @click="setActiveTab(tab.id)"
              @keydown.left.prevent="focusAdjacentTab(-1)"
              @keydown.right.prevent="focusAdjacentTab(1)"
              @keydown.home.prevent="focusTabAt(0)"
              @keydown.end.prevent="focusTabAt(tabs.length - 1)"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="search-form-area" :class="`search-form-area--${activeTab}`">
            <form
              v-show="activeTab === 'office'"
              id="elected-panel-office"
              class="search-form office-form"
              role="tabpanel"
              aria-labelledby="elected-tab-office"
              @submit.prevent="applySearch"
            >
              <div class="form-field">
                <label class="field-label" for="elected-office-type">公職人員類型</label>
                <select id="elected-office-type" v-model="draft.office.officeTypeId">
                  <option v-for="office in officeTypes" :key="office.id" :value="office.id">
                    {{ office.label }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label class="field-label" for="elected-city">縣、市</label>
                <select id="elected-city" v-model="draft.office.cityId">
                  <option v-for="city in cities" :key="city.id" :value="city.id">
                    {{ city.label }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label class="field-label" for="elected-district">鄉鎮市區</label>
                <select id="elected-district" v-model="draft.office.districtId">
                  <option value="all">全部行政區</option>
                  <option v-for="district in cityDistricts" :key="district.id" :value="district.id">
                    {{ district.label }}
                  </option>
                </select>
              </div>

              <label class="checkbox-control" for="elected-office-only">
                <input id="elected-office-only" v-model="draft.office.onlyElected" type="checkbox" />
                <span>只看當選</span>
              </label>

              <button class="query-button" type="submit">查詢</button>
            </form>

            <form
              v-show="activeTab === 'party'"
              id="elected-panel-party"
              class="search-form party-form"
              role="tabpanel"
              aria-labelledby="elected-tab-party"
              @submit.prevent="applySearch"
            >
              <div class="form-field">
                <label class="field-label" for="elected-party">政黨</label>
                <select id="elected-party" v-model="draft.party.partyId">
                  <option v-for="party in parties" :key="party.id" :value="party.id">
                    {{ party.label }}
                  </option>
                </select>
              </div>

              <label class="checkbox-control" for="elected-party-only">
                <input id="elected-party-only" v-model="draft.party.onlyElected" type="checkbox" />
                <span>只看當選</span>
              </label>

              <button class="query-button" type="submit">查詢</button>
            </form>

            <form
              v-show="activeTab === 'name'"
              id="elected-panel-name"
              class="search-form name-form"
              role="tabpanel"
              aria-labelledby="elected-tab-name"
              @submit.prevent="applySearch"
            >
              <div class="form-field">
                <label class="field-label" for="elected-name">姓名</label>
                <input
                  id="elected-name"
                  v-model="draft.name"
                  type="search"
                  inputmode="search"
                  autocomplete="off"
                  placeholder="請輸入候選人姓名"
                />
              </div>

              <button class="query-button" type="submit">查詢</button>
            </form>
          </div>

          <div class="search-divider" aria-hidden="true"></div>

          <section class="query-results" aria-labelledby="elected-results-title">
            <div class="results-heading">
              <h3 id="elected-results-title" class="results-title">查詢結果</h3>
              <p v-if="dataNotice" class="data-notice">{{ dataNotice }}</p>
            </div>
            <p class="sr-only" role="status" aria-live="polite">{{ resultAnnouncement }}</p>

            <template v-if="filteredCandidates.length">
              <div class="candidate-grid candidate-grid--desktop">
                <ElectedCandidateCard
                  v-for="candidate in desktopCandidates"
                  :key="candidate.id"
                  :candidate="candidate"
                  :party="partyFor(candidate.partyId)"
                  :city-label="cityLabelFor(candidate.cityId)"
                  :constituency-label="constituencyLabelFor(candidate)"
                  :administrative-areas="administrativeAreasFor(candidate)"
                  :elected-icon="electedIcon"
                />
              </div>

              <div class="candidate-grid candidate-grid--mobile">
                <ElectedCandidateCard
                  v-for="candidate in mobileCandidates"
                  :key="candidate.id"
                  :candidate="candidate"
                  :party="partyFor(candidate.partyId)"
                  :city-label="cityLabelFor(candidate.cityId)"
                  :constituency-label="constituencyLabelFor(candidate)"
                  :administrative-areas="administrativeAreasFor(candidate)"
                  :elected-icon="electedIcon"
                />
              </div>

              <nav v-if="totalPages > 1" class="desktop-pagination" aria-label="查詢結果分頁">
                <button
                  type="button"
                  class="page-button page-arrow"
                  :disabled="currentPage === 1"
                  aria-label="上一頁"
                  @click="goToPage(currentPage - 1)"
                >
                  ‹
                </button>
                <template v-for="pageItem in pageItems" :key="pageItem">
                  <span
                    v-if="typeof pageItem === 'string'"
                    class="page-ellipsis"
                    aria-hidden="true"
                  >
                    …
                  </span>
                  <button
                    v-else
                    type="button"
                    class="page-button"
                    :class="{ 'is-current': currentPage === pageItem }"
                    :aria-current="currentPage === pageItem ? 'page' : undefined"
                    :aria-label="`第 ${pageItem} 頁`"
                    @click="goToPage(pageItem)"
                  >
                    {{ pageItem }}
                  </button>
                </template>
                <button
                  type="button"
                  class="page-button page-arrow"
                  :disabled="currentPage === totalPages"
                  aria-label="下一頁"
                  @click="goToPage(currentPage + 1)"
                >
                  ›
                </button>
              </nav>

              <button
                v-if="mobileVisibleCount < filteredCandidates.length"
                type="button"
                class="load-more-button"
                @click="loadMore"
              >
                <span>展開更多</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6.5 9 5.5 5.5L17.5 9" />
                </svg>
              </button>
            </template>

            <div v-else class="empty-state">
              <svg class="empty-illustration" viewBox="0 0 240 240" aria-hidden="true">
                <circle cx="120" cy="120" r="116" fill="#f3f1ef" />
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M68 69h104a8 8 0 0 1 8 8v70a8 8 0 0 1-8 8H68a8 8 0 0 1-8-8V77a8 8 0 0 1 8-8Z" stroke-width="3" />
                  <path d="M60 88h120" stroke-width="3" />
                  <circle cx="73" cy="79" r="4" fill="currentColor" stroke="none" />
                  <circle cx="86" cy="79" r="4" fill="currentColor" stroke="none" />
                  <circle cx="99" cy="79" r="4" fill="currentColor" stroke="none" />
                  <circle cx="98" cy="111" r="7" fill="currentColor" stroke="none" />
                  <path d="M86 129c1-9 6-14 12-14s11 5 12 14H86Z" fill="currentColor" stroke="none" />
                  <path d="M126 107h32M126 123h25M78 139h61" stroke="#e2ddd8" stroke-width="7" />
                  <circle cx="165" cy="157" r="18" fill="#ffffff" stroke-width="7" />
                  <path d="m178 170 17 17" stroke-width="7" />
                  <path d="m193 53 11-8M199 61l14-1M187 47l1-14M48 177l-12 6M55 183l-5 13M42 169l-13-3" stroke-width="2" />
                </g>
              </svg>
              <strong>{{ emptyState.title }}</strong>
              <p>{{ emptyState.description }}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import config from '../json/data.json';
import electedIcon from '../assets/images/elected.png?url';
import searchIcon from '../assets/images/search_icon.svg?url';
import ElectedCandidateCard from './ElectedCandidateCard.vue';

const searchData = config.electedSearch;
const supportedTabIds = new Set(['office', 'party', 'name']);
const tabs = searchData.tabs.filter((tab) => supportedTabIds.has(tab.id));
const officeTypes = searchData.officeTypes;
const parties = searchData.parties;
const cities = searchData.cities;
const constituencies = searchData.constituencies ?? [];
const candidates = searchData.candidates;
const emptyState = searchData.emptyState;
const dataNotice = searchData.dataStatus === 'demo' ? searchData.dataNotice : '';
const toPositiveInteger = (value, fallback) => {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};
const desktopPageSize = toPositiveInteger(searchData.pagination?.desktopPageSize, 6);
const mobileBatchSize = toPositiveInteger(searchData.pagination?.mobileBatchSize, 3);

const initialTab = tabs.some((tab) => tab.id === searchData.defaultTab)
  ? searchData.defaultTab
  : (tabs[0]?.id || 'office');
const activeTab = ref(initialTab);
const appliedQuery = ref(null);
const currentPage = ref(1);
const mobileVisibleCount = ref(mobileBatchSize);

const draft = reactive({
  office: {
    officeTypeId: searchData.defaults.officeTypeId,
    cityId: searchData.defaults.cityId,
    districtId: searchData.defaults.districtId || 'all',
    onlyElected: false
  },
  party: {
    partyId: searchData.defaults.partyId,
    onlyElected: false
  },
  name: ''
});

const partyMap = new Map(parties.map((party) => [party.id, party]));
const cityMap = new Map(cities.map((city) => [city.id, city]));
const constituencyMap = new Map(constituencies.map((constituency) => [
  constituency.id,
  constituency
]));
const districtMap = new Map(
  cities.flatMap((city) => (city.districts || []).map((district) => [district.id, district.label]))
);

const cityDistricts = computed(() => cityMap.get(draft.office.cityId)?.districts ?? []);

watch(() => draft.office.cityId, () => {
  if (
    draft.office.districtId !== 'all'
    && !cityDistricts.value.some((district) => district.id === draft.office.districtId)
  ) {
    draft.office.districtId = 'all';
  }
});

const normalizeName = (value) => String(value || '')
  .normalize('NFKC')
  .toLocaleLowerCase('zh-Hant-TW')
  .replace(/[\s·‧・．.]/g, '');

const districtIdsFor = (candidate) => (
  constituencyMap.get(candidate.constituencyId)?.districtIds
  ?? candidate.districtIds
  ?? []
);

const filteredCandidates = computed(() => {
  const query = appliedQuery.value;

  if (!query || query.tab !== activeTab.value) {
    return candidates;
  }

  return candidates.filter((candidate) => {
    if (query.tab === 'office') {
      const matchesOffice = candidate.officeTypeId === query.officeTypeId;
      const matchesCity = candidate.cityId === query.cityId;
      const matchesDistrict = query.districtId === 'all'
        || districtIdsFor(candidate).includes(query.districtId);
      const matchesElected = !query.onlyElected || candidate.resultStatus === 'elected';
      return matchesOffice && matchesCity && matchesDistrict && matchesElected;
    }

    if (query.tab === 'party') {
      const matchesParty = candidate.partyId === query.partyId;
      const matchesElected = !query.onlyElected || candidate.resultStatus === 'elected';
      return matchesParty && matchesElected;
    }

    if (query.tab === 'name') {
      const keyword = normalizeName(query.name);
      return !keyword || normalizeName(candidate.name).includes(keyword);
    }

    return true;
  });
});

const totalPages = computed(() => Math.max(
  1,
  Math.ceil(filteredCandidates.value.length / desktopPageSize)
));

const pageItems = computed(() => {
  if (totalPages.value <= 7) {
    return Array.from({ length: totalPages.value }, (_, index) => index + 1);
  }

  const current = currentPage.value;
  const pages = new Set([1, totalPages.value, current - 1, current, current + 1]);
  const sortedPages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages.value)
    .sort((a, b) => a - b);
  const items = [];

  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) {
      items.push(`ellipsis-${page}`);
    }
    items.push(page);
  });

  return items;
});

const desktopCandidates = computed(() => {
  const start = (currentPage.value - 1) * desktopPageSize;
  return filteredCandidates.value.slice(start, start + desktopPageSize);
});

const mobileCandidates = computed(() => (
  filteredCandidates.value.slice(0, mobileVisibleCount.value)
));

const resultAnnouncement = computed(() => (
  filteredCandidates.value.length
    ? `共找到 ${filteredCandidates.value.length} 位人員，桌機目前為第 ${currentPage.value} 頁，小螢幕目前顯示 ${Math.min(mobileVisibleCount.value, filteredCandidates.value.length)} 位`
    : `${emptyState.title}，${emptyState.description}`
));

const resetResultWindow = () => {
  currentPage.value = 1;
  mobileVisibleCount.value = mobileBatchSize;
};

const setActiveTab = (tabId) => {
  if (activeTab.value === tabId) return;
  activeTab.value = tabId;
  appliedQuery.value = null;
  if (tabId === 'office') {
    draft.office.officeTypeId = searchData.defaults.officeTypeId;
    draft.office.cityId = searchData.defaults.cityId;
    draft.office.districtId = searchData.defaults.districtId || 'all';
    draft.office.onlyElected = false;
  } else if (tabId === 'party') {
    draft.party.partyId = searchData.defaults.partyId;
    draft.party.onlyElected = false;
  } else {
    draft.name = '';
  }
  resetResultWindow();
};

const focusTabAt = (index) => {
  const nextIndex = (index + tabs.length) % tabs.length;
  const nextTab = tabs[nextIndex];
  setActiveTab(nextTab.id);
  requestAnimationFrame(() => document.getElementById(`elected-tab-${nextTab.id}`)?.focus());
};

const focusAdjacentTab = (offset) => {
  const currentIndex = tabs.findIndex((tab) => tab.id === activeTab.value);
  focusTabAt(currentIndex + offset);
};

const applySearch = () => {
  if (activeTab.value === 'office') {
    appliedQuery.value = {
      tab: 'office',
      officeTypeId: draft.office.officeTypeId,
      cityId: draft.office.cityId,
      districtId: draft.office.districtId,
      onlyElected: draft.office.onlyElected
    };
  } else if (activeTab.value === 'party') {
    appliedQuery.value = {
      tab: 'party',
      partyId: draft.party.partyId,
      onlyElected: draft.party.onlyElected
    };
  } else {
    appliedQuery.value = {
      tab: 'name',
      name: draft.name
    };
  }

  resetResultWindow();
};

const goToPage = (page) => {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
};

const loadMore = () => {
  mobileVisibleCount.value = Math.min(
    mobileVisibleCount.value + mobileBatchSize,
    filteredCandidates.value.length
  );
};

const partyFor = (partyId) => partyMap.get(partyId) || {
  label: '其他',
  fullLabel: '其他',
  badge: '其',
  color: '#9b9b9b'
};

const cityLabelFor = (cityId) => cityMap.get(cityId)?.label || '';

const constituencyLabelFor = (candidate) => {
  if (candidate.hideConstituencyLabel) return '';
  return constituencyMap.get(candidate.constituencyId)?.label || candidate.constituencyLabel || '';
};

const administrativeAreasFor = (candidate) => districtIdsFor(candidate)
  .map((districtId) => districtMap.get(districtId))
  .filter(Boolean);
</script>

<style scoped>
.elected-search-section {
  padding: 6rem 0 7rem;
  background: var(--color-coffee-50);
}

.container.elected-search-container {
  position: relative;
  z-index: 1;
  max-width: 1100px;
}

.section-header {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 0;
  margin-bottom: 3.5rem;
  text-align: center;
}

.search-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.elected-search-title {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0.75rem;
  margin: 0 auto;
  color: var(--color-coffee-900);
  font-size: 2rem;
  font-weight: 600;
  white-space: nowrap;
}

.elected-search-divider {
  width: 13rem;
  height: 2px;
  background-color: var(--color-coffee-300);
}

.elected_search_area {
  margin-top: 2.5rem;
}

.search-panel {
  overflow: hidden;
  border-radius: 0.75rem;
  background: var(--color-coffee-0);
}

.search-tabs {
  display: grid;
  grid-template-columns: 1fr 1.1fr 1fr;
  background: var(--color-coffee-200);
}

.search-tab {
  position: relative;
  min-width: 0;
  min-height: 4.1rem;
  padding: 0.65rem 1rem;
  color: var(--color-coffee-600);
  font-size: clamp(1.08rem, 2vw, 1.35rem);
  font-weight: 700;
  line-height: 1.2;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.search-tab + .search-tab::before {
  position: absolute;
  top: 22%;
  left: 0;
  width: 1px;
  height: 56%;
  background: var(--color-coffee-300);
  content: '';
}

.search-tab.is-active,
.search-tab.is-active:hover {
  background: var(--color-coffee-600);
  color: var(--color-coffee-0);
}

.search-tab.is-active::before,
.search-tab.is-active + .search-tab::before {
  display: none;
}

.search-tab:not(.is-active):hover {
  background: color-mix(in srgb, var(--color-coffee-200) 72%, #ffffff);
}

.search-tab:focus-visible,
.query-button:focus-visible,
.page-button:focus-visible {
  outline: 3px solid #111111;
  outline-offset: 3px;
}

.load-more-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 3px;
}

.search-form-area {
  padding: 2.25rem 3rem 2.5rem;
}

.search-form {
  display: grid;
  align-items: end;
  justify-content: start;
  gap: 1rem;
}

.office-form {
  grid-template-columns: repeat(3, 13.5rem) auto minmax(0, 1fr) auto;
}

.office-form .query-button {
  grid-column: 6;
}

.party-form {
  grid-template-columns: minmax(13rem, 14rem) auto auto;
}

.name-form {
  grid-template-columns: minmax(18rem, 19rem) auto;
}

.form-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  color: var(--color-coffee-600);
  font-size: 1rem;
  line-height: 1.3;
}

.form-field select,
.form-field input {
  width: 100%;
  height: 2.4rem;
  min-width: 0;
  border: 1px solid var(--color-coffee-100);
  border-radius: 0.48rem;
  background: var(--color-coffee-0);
  color: #111111;
  font: inherit;
  font-size: 1rem;
  line-height: 1;
}

.form-field select {
  padding: 0.25rem 2.25rem 0.25rem 0.8rem;
  cursor: pointer;
}

.form-field input {
  padding: 0.25rem 0.8rem;
}

.form-field input::placeholder {
  color: #756c65;
}

.form-field select:focus-visible,
.form-field input:focus-visible,
.checkbox-control input:focus-visible {
  outline: 3px solid var(--color-coffee-600);
  outline-offset: 2px;
}

.checkbox-control {
  display: inline-flex;
  align-items: center;
  align-self: end;
  gap: 0.55rem;
  min-height: 2.4rem;
  color: #111111;
  font-size: 1rem;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
}

.checkbox-control input {
  width: 1.05rem;
  height: 1.05rem;
  margin: 0;
  accent-color: var(--color-coffee-300);
  cursor: pointer;
}

.query-button {
  align-self: end;
  min-width: 5rem;
  height: 2.5rem;
  padding: 0 1rem;
  border-radius: 0.72rem;
  background: var(--color-coffee-600);
  color: var(--color-coffee-0);
  font-size: 1.2rem;
  line-height: 1;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.query-button:hover {
  background: var(--color-coffee-600);
}

.query-button:active {
  transform: translateY(1px);
}

.search-divider {
  height: 1px;
  margin: 0 1.75rem;
  background: var(--color-coffee-100);
}

.query-results {
  padding: 2.05rem 2.75rem 2.5rem;
}

.results-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 0 0.95rem 0.45rem;
}

.results-title {
  margin: 0;
  color: var(--color-coffee-300);
  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1.3;
}

.data-notice {
  color: var(--color-coffee-600);
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.4;
  text-align: right;
}

.data-notice::before {
  content: '※ ';
}

.candidate-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem 1.6rem;
}

.candidate-grid--mobile {
  display: none;
}

.desktop-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2.25rem;
}

.page-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  border: 1px solid var(--color-coffee-200);
  background: var(--color-coffee-0);
  color: var(--color-coffee-600);
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1;
}

.page-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1.8rem;
  color: var(--color-coffee-600);
  line-height: 1;
}

.page-button.is-current {
  border-color: var(--color-coffee-600);
  background: var(--color-coffee-600);
  color: var(--color-coffee-0);
}

.page-button:disabled {
  border-color: var(--color-coffee-200);
  background: var(--color-coffee-200);
  color: var(--color-coffee-300);
  cursor: not-allowed;
  opacity: 0.75;
}

.page-arrow {
  border-color: var(--color-coffee-200);
  background: var(--color-coffee-200);
  font-size: 1.15rem;
  font-weight: 400;
}

.load-more-button {
  display: none;
}

.empty-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  min-height: 24rem;
  padding: 1.8rem 1rem 4rem;
  color: var(--color-coffee-600);
  text-align: center;
}

.empty-illustration {
  width: min(14.25rem, 72vw);
  height: auto;
  margin-bottom: 0.4rem;
  color: var(--color-coffee-300);
}

.empty-state strong {
  font-size: clamp(1.8rem, 3vw, 2.1rem);
  line-height: 1.3;
}

.empty-state p {
  margin-top: 0.55rem;
  font-size: clamp(1.08rem, 2.2vw, 1.5rem);
  font-weight: 500;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 1059px) and (min-width: 769px) {
  .search-form-area {
    padding-right: 2rem;
    padding-left: 2rem;
  }

  .office-form {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .office-form .checkbox-control {
    grid-column: 2;
    justify-self: end;
  }

  .office-form .query-button {
    grid-column: 3;
    justify-self: start;
  }

  .candidate-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .elected-search-section {
    padding: 4.5rem 0 5rem;
  }

  .container.elected-search-container {
    padding-right: 0.75rem;
    padding-left: 0.75rem;
  }

  .section-header {
    margin-bottom: 2.5rem;
  }

  .elected-search-title {
    font-size: 1.7rem;
  }

  .elected_search_area {
    margin-top: 1.75rem;
  }

  .search-panel {
    border-radius: 0.25rem;
  }

  .search-tab {
    min-height: 2.85rem;
    padding: 0.45rem 0.35rem;
    font-size: clamp(0.83rem, 4vw, 1rem);
    white-space: nowrap;
  }

  .search-tab + .search-tab::before {
    top: 25%;
    height: 50%;
  }

  .search-form-area {
    padding: 1.7rem 1.25rem 1.15rem;
  }

  .search-form,
  .office-form,
  .party-form,
  .name-form {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.7rem;
  }

  .field-label {
    font-size: 0.87rem;
  }

  .form-field select,
  .form-field input {
    height: 2.35rem;
    font-size: 0.93rem;
  }

  .search-form-area--office {
    padding-top: 1.4rem;
    padding-bottom: 1rem;
  }

  .search-form-area--party {
    padding-top: 1rem;
    padding-bottom: 0.65rem;
  }

  .office-form,
  .party-form {
    gap: 0.5rem;
  }

  .office-form .form-field select,
  .party-form .form-field select {
    height: 2rem;
  }

  .office-form .checkbox-control,
  .party-form .checkbox-control {
    min-height: 1.5rem;
  }

  .office-form .query-button,
  .party-form .query-button {
    grid-column: auto;
    height: 2.125rem;
  }

  .checkbox-control {
    justify-self: center;
    min-height: 1.8rem;
    margin-top: 0.2rem;
    font-size: 0.95rem;
  }

  .query-button {
    justify-self: center;
    min-width: 4.2rem;
    height: 2.25rem;
    margin-top: -0.05rem;
    padding: 0 0.8rem;
    border-radius: 0.55rem;
    font-size: 1.05rem;
  }

  .name-form .query-button {
    margin-top: 0.25rem;
  }

  .search-divider {
    margin: 0 0.65rem;
    background: var(--color-coffee-200);
  }

  .query-results {
    padding: 1.25rem 1.25rem 2.6rem;
  }

  .results-title {
    font-size: 1.4rem;
  }

  .results-heading {
    gap: 0.5rem;
    margin: 0 0 1.3rem;
  }

  .data-notice {
    max-width: 12rem;
    font-size: 0.72rem;
  }

  .candidate-grid--desktop,
  .desktop-pagination {
    display: none;
  }

  .candidate-grid--mobile {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1.5rem;
  }

  .load-more-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-width: 9.7rem;
    height: 3rem;
    margin: 2.2rem auto 0;
    padding: 0 1rem;
    border: 1.5px solid var(--color-primary);
    border-radius: 999px;
    background: var(--color-coffee-0);
    color: var(--color-primary);
    font-size: 1.18rem;
    line-height: 1;
  }

  .load-more-button svg {
    width: 1.25rem;
    height: 1.25rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  .load-more-button:active {
    background: var(--color-primary);
    color: var(--color-coffee-0);
  }

  .empty-state {
    min-height: 31rem;
    padding: 1.7rem 0 4rem;
  }

  .empty-illustration {
    margin-bottom: 0.55rem;
  }

  .empty-state strong {
    font-size: 1.85rem;
  }

  .empty-state p {
    font-size: clamp(1rem, 5.6vw, 1.5rem);
  }
}

@media (max-width: 380px) {
  .search-form-area,
  .query-results {
    padding-right: 1rem;
    padding-left: 1rem;
  }
}
</style>
