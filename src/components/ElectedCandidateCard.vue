<template>
  <article class="candidate-card">
    <div class="candidate-heading" :class="{ 'has-elected-mark': isElected }">
      <span
        class="party-badge"
        :style="{ backgroundColor: party.color }"
        :aria-label="party.fullLabel || party.label"
        :title="party.fullLabel || party.label"
      >
        {{ party.badge }}
      </span>
      <h4 class="candidate-name">{{ candidate.name }}</h4>
    </div>

    <img
      v-if="isElected"
      :src="electedIcon"
      class="elected-mark"
      alt="當選"
      title="當選"
    />

    <dl class="candidate-meta">
      <div class="meta-row">
        <dt class="meta-icon">
          <span class="sr-only">參選地區</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
          </svg>
        </dt>
        <dd>{{ locationText }}</dd>
      </div>
      <div v-if="administrativeAreas.length" class="meta-row">
        <dt class="meta-icon">
          <span class="sr-only">行政區</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 21v-9h5V3h10v18h2v2H2v-2h2Zm3-2h2v-2H7v2Zm0-4h2v-2H7v2Zm5 4h2v-2h-2v2Zm0-5h2v-2h-2v2Zm0-5h2V7h-2v2Zm4 10h2v-2h-2v2Zm0-5h2v-2h-2v2Zm0-5h2V7h-2v2Z" />
          </svg>
        </dt>
        <dd>{{ administrativeAreas.join('、 ') }}</dd>
      </div>
    </dl>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  candidate: {
    type: Object,
    required: true
  },
  party: {
    type: Object,
    required: true
  },
  cityLabel: {
    type: String,
    required: true
  },
  constituencyLabel: {
    type: String,
    default: ''
  },
  administrativeAreas: {
    type: Array,
    required: true
  },
  electedIcon: {
    type: String,
    required: true
  }
});

const isElected = computed(() => props.candidate.resultStatus === 'elected');
const locationText = computed(() => (
  props.constituencyLabel
    ? `${props.cityLabel}・${props.constituencyLabel}`
    : props.cityLabel
));
</script>

<style scoped>
.candidate-card {
  position: relative;
  min-width: 0;
  min-height: 9.8rem;
  padding: 1.15rem 1rem 1rem;
  border: 1px solid var(--color-coffee-200);
  border-radius: 0.65rem;
  background: var(--color-coffee-0);
}

.candidate-heading {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 0.75rem;
  margin-bottom: 0.65rem;
}

.candidate-heading.has-elected-mark {
  padding-right: 2.8rem;
}

.party-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
}

.candidate-name {
  min-width: 0;
  color: #111111;
  font-size: clamp(1.08rem, 1.8vw, 1.35rem);
  font-weight: 700;
  line-height: 1.22;
  overflow-wrap: anywhere;
}

.elected-mark {
  position: absolute;
  top: 1.15rem;
  right: 1rem;
  width: 2.35rem;
  height: 2.35rem;
  object-fit: contain;
}

.candidate-meta {
  display: grid;
  gap: 0.5rem;
  color: var(--color-coffee-600);
  font-size: clamp(1rem, 1.55vw, 1.15rem);
  line-height: 1.4;
}

.meta-row {
  display: grid;
  grid-template-columns: 1.8rem minmax(0, 1fr);
  align-items: start;
  gap: 0.45rem;
}

.meta-row dt,
.meta-row dd {
  margin: 0;
}

.meta-icon {
  display: flex;
  justify-content: center;
}

.meta-icon svg {
  width: 1.45rem;
  height: 1.45rem;
  fill: currentColor;
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

@media (max-width: 768px) {
  .candidate-card {
    min-height: 9.9rem;
    padding: 1.15rem 0.8rem 1rem;
  }

  .candidate-heading {
    gap: 0.75rem;
  }

  .candidate-heading.has-elected-mark {
    padding-right: 2.65rem;
  }

  .party-badge {
    width: 2.45rem;
    height: 2.45rem;
    font-size: 1rem;
  }

  .candidate-name {
    font-size: 1.32rem;
  }

  .candidate-meta {
    font-size: 1.15rem;
  }

  .elected-mark {
    right: 0.9rem;
    width: 2.4rem;
    height: 2.4rem;
  }
}

</style>
