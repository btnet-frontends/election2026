<template>
  <div class="tags-section">
    <div class="tags-header">
      <span class="tags-title">
        <span class="tags-hash">#</span> 熱門標籤
      </span>
      <div class="tags-divider"></div>
      <span class="tags-hint">▼ 點擊篩選文章</span>
    </div>
    <div class="tags-inner-container">
      <button
        v-for="tag in tags"
        :key="getTagKey(tag)"
        :class="['tag-btn', { active: isActive(tag) }]"
        @click="selectTag(tag)"
      >
        {{ getTagLabel(tag) }}
        <span v-if="isActive(tag)" class="tag-remove">×</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { getTagApi, getTagLabel } from '../utils/newsApi.js';

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  tags: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const isActive = (tag) => {
  return props.modelValue === getTagLabel(tag);
};

const getTagKey = (tag) => {
  return getTagApi(tag)?.tagName || getTagLabel(tag);
};

const selectTag = (tag) => {
  const tagLabel = getTagLabel(tag);
  const defaultLabel = getTagLabel(props.tags[0]);
  emit('update:modelValue', props.modelValue === tagLabel ? defaultLabel : tagLabel);
};
</script>

<style scoped>
.tags-section {
  margin-bottom: 3rem;
  text-align: left;
}

.tags-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.tags-hash {
  color: var(--color-coffee-accent);
}
.tags-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-coffee-900);
  white-space: nowrap;
  flex-shrink: 0;
}

.tags-divider {
  flex: 1;
  height: 1.5px;
  background: var(--color-coffee-300);
}

.tags-hint {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-coffee-300);
  white-space: nowrap;
  flex-shrink: 0;
}

.tags-inner-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tag-btn {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-coffee-600);
  background: transparent;
  border: 1.5px solid var(--color-coffee-600);
  padding: 0.55rem 1.3rem;
  border-radius: 50px;
  white-space: nowrap;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tag-btn::before {
  content: '';
  position: absolute;
  inset: -1.5px;
  border-radius: 50px;
  padding: 1.5px;
  background: linear-gradient(90deg, #7CFFB0, #29D9CA, #227EFF);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tag-btn:hover::before,
.tag-btn.active::before {
  opacity: 1;
}

.tag-btn.active {
  background: var(--color-coffee-50);
  border-color: transparent;
  color: var(--color-coffee-600);
  font-weight: 700;
}

.tag-btn:hover:not(.active) {
  border-color: transparent;
}

.tag-remove {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  line-height: 1;
  color: var(--color-coffee-600);
  flex-shrink: 0;
}

@media (max-width: 576px) {
  .tags-hint {
    display: none;
  }
}
</style>
