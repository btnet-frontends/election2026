<template>
  <header :class="['site-header', { 'scrolled': isScrolled, 'menu-open': isMobileMenuOpen }]">
    <div class="header-container">
      <div class="header-left">
        <a href="#kv" class="logo-link" @click="scrollToSection($event, 'kv')">
          <img :src="btLogo" alt="今周刊" class="logo-bt" />
        </a>
        <div class="logo-divider"></div>
        <a href="#kv" class="logo-link" @click="scrollToSection($event, 'kv')">
          <img :src="electionLogo" alt="2026九合一大選" class="logo-election" />
        </a>
      </div>

      <div class="header-right">
        <nav class="desktop-nav">
          <a
            v-for="item in navItems"
            :key="item.id"
            :href="item.href"
            :class="['nav-link', { 'active': activeSection === item.id }]"
            @click="scrollToSection($event, item.id)"
          >
            {{ item.label }}
          </a>
        </nav>

        <div class="social-block">
          <a href="https://www.facebook.com/BToday/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="social-icon">
            <span class="icon-circle">
              <img :src="logoFb" alt="Facebook" />
            </span>
          </a>
          <a href="https://www.instagram.com/btoday_ig/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="social-icon">
            <span class="icon-circle">
              <img :src="logoIg" alt="Instagram" />
            </span>
          </a>
          <a href="https://line.me/R/ti/p/%40btoday" target="_blank" rel="noopener noreferrer" aria-label="Line" class="social-icon">
            <span class="icon-circle">
              <img :src="logoLine" alt="Line" />
            </span>
          </a>
        </div>
      </div>

      <button
        class="burger-btn"
        @click="toggleMobileMenu"
        :aria-expanded="isMobileMenuOpen"
        aria-label="Toggle Menu"
      >
        <span class="burger-line line-1"></span>
        <span class="burger-line line-2"></span>
        <span class="burger-line line-3"></span>
      </button>
    </div>

    <transition name="drawer">
      <div v-if="isMobileMenuOpen" class="mobile-drawer">
        <div class="mobile-drawer-header">
          <button class="mobile-close-btn" @click="toggleMobileMenu" aria-label="關閉選單">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#4A3F35" stroke-width="2.2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav class="mobile-nav">
          <a
            v-for="item in navItems"
            :key="item.id"
            :href="item.href"
            :class="['mobile-link', { 'active': activeSection === item.id }]"
            @click="scrollToSection($event, item.id)"
          >
            {{ item.label }}
          </a>
        </nav>
        <div class="mobile-socials">
          <a href="https://www.facebook.com/BToday/" target="_blank" rel="noopener noreferrer" class="mobile-social-icon">
            <span class="mobile-icon-circle">
              <img :src="logoFb" alt="Facebook" />
            </span>
          </a>
          <a href="https://www.instagram.com/btoday_ig/" target="_blank" rel="noopener noreferrer" class="mobile-social-icon">
            <span class="mobile-icon-circle">
              <img :src="logoIg" alt="Instagram" />
            </span>
          </a>
          <a href="https://line.me/R/ti/p/%40btoday" target="_blank" rel="noopener noreferrer" class="mobile-social-icon">
            <span class="mobile-icon-circle">
              <img :src="logoLine" alt="LINE" />
            </span>
          </a>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import btLogo from '../assets/images/BT_logo.svg?url';
import electionLogo from '../assets/images/2026_logo.svg?url';
import logoFb from '../assets/images/logo-fb.svg?url';
import logoIg from '../assets/images/logo-ig.svg?url';
import logoLine from '../assets/images/logo-line.svg?url';
import config from '../json/data.json';

const navItems = config.header.navItems;

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const activeSection = ref('kv');

const handleScroll = () => {
  isScrolled.value = window.scrollY > 30;

  const scrollPosition = window.scrollY + 120;
  const newsSection = document.getElementById('news');
  const pollsSection = document.getElementById('polls');

  if (pollsSection && scrollPosition >= pollsSection.offsetTop) {
    activeSection.value = 'polls';
  } else if (newsSection && scrollPosition >= newsSection.offsetTop) {
    activeSection.value = 'news';
  } else {
    activeSection.value = 'kv';
  }
};

const handleResize = () => {
  if (window.innerWidth > 991) {
    isMobileMenuOpen.value = false;
    document.body.style.overflow = '';
  }
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : '';
};

const scrollToSection = (event, id) => {
  event.preventDefault();
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';

  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    activeSection.value = id;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleResize);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.site-header {
  position: fixed;
  top: 20px;
  left: 0;
  width: 100%;
  z-index: 1000;
  pointer-events: none;
  transition: all var(--transition-normal);
}

.site-header.scrolled {
  top: 10px;
}

.header-container {
  pointer-events: auto;
  width: calc(100% - 40px);
  max-width: 1000px;
  margin: 0 auto;
  height: 76px;
  padding: 0 2.5rem;
  background: rgba(252, 248, 244, 0.35);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  box-shadow: 0 8px 32px rgba(107, 92, 75, 0.08), 0 2px 8px rgba(107, 92, 75, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background var(--transition-normal), box-shadow var(--transition-normal);
}

.site-header.scrolled .header-container {
  background: rgba(252, 248, 244, 0.55);
  box-shadow: 0 8px 32px rgba(107, 92, 75, 0.12), 0 2px 8px rgba(107, 92, 75, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.logo-link {
  display: flex;
  align-items: center;
}

.logo-bt {
  height: 34px;
  width: auto;
  display: block;
}

.logo-election {
  height: 34px;
  width: auto;
  display: block;
}

.logo-divider {
  width: 1px;
  height: 34px;
  background-color: #917F6B;
  border-radius: 999px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 2.2rem;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  position: relative;
  font-size: 1.1rem;
  font-weight: 500;
  color: #6B5C4B;
  padding: 0.5rem 0.3rem;
  letter-spacing: 0.05em;
  transition: color var(--transition-fast);
}

.nav-link:hover {
  color: #DD2A2A;
}

.social-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.social-icon {
  display: block;
  transition: transform var(--transition-fast);
}

.social-icon:hover {
  transform: translateY(-2px);
}

.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #F1EAE3;
  transition: background-color var(--transition-fast);
}

.icon-circle img {
  width: 30px;
  height: 30px;
  display: block;
}

.social-icon:hover .icon-circle {
  background-color: #e6dcce;
}

.burger-btn {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 26px;
  height: 18px;
  z-index: 1100;
  pointer-events: auto;
}

.burger-line {
  width: 100%;
  height: 2px;
  background-color: #6B5C4B;
  border-radius: 2px;
  transition: all var(--transition-normal);
}

.menu-open .burger-line.line-1 {
  transform: translateY(8px) rotate(45deg);
  background-color: var(--color-primary);
}
.menu-open .burger-line.line-2 {
  opacity: 0;
}
.menu-open .burger-line.line-3 {
  transform: translateY(-8px) rotate(-45deg);
  background-color: var(--color-primary);
}

.mobile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: var(--color-coffee-lightest);
  z-index: 1050;
  padding: 0 2rem 3rem 2rem;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

.mobile-drawer-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1.5rem 0.5rem 0.5rem 0.5rem;
  margin-bottom: 0.5rem;
}

.mobile-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
  padding: 0;
}

.mobile-close-btn:hover {
  opacity: 0.7;
}

.mobile-close-btn svg {
  display: block;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  padding: 0 1rem;
  padding-top: 18vh;
}

.mobile-link {
  width: 100%;
  max-width: 480px;
  font-size: 1.35rem;
  font-weight: 500;
  color: #6B5C4B;
  padding: 1.5rem 0;
  letter-spacing: 0.08em;
  text-align: center;
  transition: opacity var(--transition-fast);
}

.mobile-link + .mobile-link {
  border-top: 1px solid rgba(107, 92, 75, 0.15);
}

.mobile-link:hover {
  opacity: 0.8;
}

.mobile-socials {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding-top: 2rem;
  margin-top: auto;
  border-top: 1px solid rgba(107, 92, 75, 0.15);
  width: 100%;
  max-width: 480px;
  align-self: center;
}

.mobile-icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #E6DFD7;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
}

.mobile-icon-circle img {
  width: 40px;
  height: 40px;
  display: block;
}

.mobile-social-icon:hover .mobile-icon-circle {
  background-color: #DCD2C6;
  transform: translateY(-2px);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(-100%);
}

@media (max-width: 991px) {
  .header-container {
    width: calc(100% - 24px);
    padding: 0 1.5rem;
    height: 66px;
  }
  .site-header {
    top: 12px;
  }
  .site-header.scrolled {
    top: 8px;
  }
  .site-header.scrolled .header-container {
    height: 60px;
  }
  .logo-bt, .logo-election, .logo-divider {
    height: 28px;
  }
  .site-header.scrolled .logo-bt,
  .site-header.scrolled .logo-election,
  .site-header.scrolled .logo-divider {
    height: 24px;
  }
  .desktop-nav, .social-block {
    display: none;
  }
  .burger-btn {
    display: flex;
  }
}
</style>