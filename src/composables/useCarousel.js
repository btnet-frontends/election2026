import { ref, computed, onMounted, onUnmounted } from 'vue';

/**
 * @param {import('vue').Ref<Array>} newsList - 新聞列表 ref（取前 3 筆作為輪播）
 */
export function useCarousel(newsList) {
  const activeSlide = ref(0);
  const isMounted = ref(false);
  let carouselTimer = null;

  const carouselItems = computed(() => newsList.value.slice(0, 3));

  const startCarouselTimer = () => {
    carouselTimer = setInterval(() => {
      if (carouselItems.value.length === 0) return;
      activeSlide.value = (activeSlide.value + 1) % carouselItems.value.length;
    }, 5000);
  };

  const resetCarouselTimer = () => {
    clearInterval(carouselTimer);
    startCarouselTimer();
  };

  const setSlide = (index) => {
    activeSlide.value = index;
    resetCarouselTimer();
  };

  onMounted(() => {
    isMounted.value = true;
    startCarouselTimer();
  });

  onUnmounted(() => {
    clearInterval(carouselTimer);
  });

  return {
    activeSlide,
    isMounted,
    carouselItems,
    setSlide,
  };
}
