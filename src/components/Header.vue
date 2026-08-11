<template>
  <header :class="['site-header', { 'scrolled': isScrolled, 'menu-open': isMobileMenuOpen }]">
    <div class="header-container">
      <div class="header-left">
        <a :href="getLocalHref('#kv')" class="logo-link" @click="scrollToSection($event, 'kv')">
          <img :src="btLogo" alt="今周刊" class="logo-bt" />
        </a>
        <div class="logo-divider"></div>
        <a :href="getLocalHref('#kv')" class="logo-link" @click="scrollToSection($event, 'kv')">
          <img :src="electionLogo" alt="2026九合一大選" class="logo-election" />
        </a>
      </div>

      <div class="header-right">
        <nav class="desktop-nav">
          <ul class="desktop-nav-list">
            <li
              v-for="item in navItems"
              :key="item.id"
              class="desktop-nav-item"
            >
              <a
                :href="getLocalHref(item.href)"
                :class="['nav-link', { 'active': isNavItemActive(item) }]"
                @click="navigateToItem($event, item)"
              >
                {{ item.label }}
              </a>
              <ul v-if="item.children?.length" class="desktop-subnav">
                <li v-for="child in item.children" :key="child.id">
                  <a
                    :href="getLocalHref(child.href)"
                    :class="['subnav-link', { 'active': activeSection === child.id }]"
                    @click="navigateToItem($event, child)"
                  >
                    {{ child.label }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
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
          <ul class="mobile-nav-list">
            <li
              v-for="item in navItems"
              :key="item.id"
              class="mobile-nav-item"
            >
              <a
                :href="getLocalHref(item.href)"
                :class="['mobile-link', { 'active': isNavItemActive(item) }]"
                @click="navigateToItem($event, item)"
              >
                {{ item.label }}
              </a>
              <ul v-if="item.children?.length" class="mobile-subnav">
                <li v-for="child in item.children" :key="child.id">
                  <a
                    :href="getLocalHref(child.href)"
                    :class="['mobile-subnav-link', { 'active': activeSection === child.id }]"
                    @click="navigateToItem($event, child)"
                  >
                    {{ child.label }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
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
const localBaseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

const getLocalHref = (href) => {
  if (/^(?:https?:|mailto:|tel:)/.test(href)) return href;

  if (href.startsWith('#')) {
    return `${localBaseUrl}/${href}`;
  }

  const path = href.replace(/^\/+/, '');
  return path === 'index' ? `${localBaseUrl}/` : `${localBaseUrl}/${path}`;
};

const normalizePath = (path) => path.replace(/\/+$/, '') || '/';

const getHomePath = () => normalizePath(`${localBaseUrl}/`);

const isHomePage = () => normalizePath(window.location.pathname) === getHomePath();

const isNavItemActive = (item) => (
  activeSection.value === item.id ||
  item.children?.some((child) => activeSection.value === child.id)
);

const getElementTop = (id) => {
  const el = document.getElementById(id);
  if (!el) return 0;
  let top = 0;
  let currentEl = el;
  while (currentEl) {
    top += currentEl.offsetTop;
    currentEl = currentEl.offsetParent;
  }
  return top;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 30;

  if (!isHomePage()) return;

  const scrollPosition = window.scrollY + 120;
  const pollsTop = getElementTop('polls');
  const tagsTop = getElementTop('tags');
  const flashTop = getElementTop('flash-news');

  if (pollsTop && scrollPosition >= pollsTop) {
    activeSection.value = 'polls';
  } else if (tagsTop && scrollPosition >= tagsTop) {
    activeSection.value = 'tags';
  } else if (flashTop && scrollPosition >= flashTop) {
    activeSection.value = 'flash-news';
  } else {
    activeSection.value = 'kv';
  }
};

const setActivePage = () => {
  const pageId = normalizePath(window.location.pathname).split('/').pop();
  activeSection.value = isHomePage() ? 'kv' : pageId;
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

const navigateToItem = (event, item) => {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';

  const destination = new URL(getLocalHref(item.href), window.location.origin);
  const isCurrentPage = normalizePath(destination.pathname) === normalizePath(window.location.pathname);
  const target = isCurrentPage ? document.getElementById(item.id) : null;

  if (target && destination.hash) {
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', destination.hash);
    activeSection.value = item.id;
  }
};

const scrollToSection = (event, id) => {
  navigateToItem(event, { id, href: `#${id}` });
};

onMounted(() => {
  setActivePage();
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
}

.desktop-nav-list {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.desktop-nav-item {
  position: relative;
}

.nav-link {
  position: relative;
  font-size: 1.1rem;
  font-weight: 500;
  color: #6B5C4B;
  padding: 0.5rem 0.3rem;
  letter-spacing: 0.05em;
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover {
  color: #DD2A2A;
}

.nav-link.active,
.subnav-link.active {
  color: #DD2A2A;
}

.desktop-subnav {
  position: absolute;
  top: 100%;
  left: 50%;
  min-width: 132px;
  padding: 0.75rem;
  background: rgba(252, 248, 244, 0.96);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(107, 92, 75, 0.12);
  opacity: 0;
  visibility: hidden;
  transform: translate(-50%, 8px);
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.2s;
}

.desktop-nav-item:hover .desktop-subnav,
.desktop-nav-item:focus-within .desktop-subnav {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, 0);
}

.subnav-link {
  display: block;
  white-space: nowrap;
  color: #6B5C4B;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-align: center;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
}

.subnav-link:hover {
  color: #DD2A2A;
  background: #F1EAE3;
}

.social-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.social-icon {
  display: block;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  background: var(--color-coffee-50);
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
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
  padding-top: 10vh;
  overflow-y: auto;
}

.mobile-nav-item {
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.mobile-nav-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.mobile-nav-item + .mobile-nav-item {
  border-top: 1px solid rgba(107, 92, 75, 0.15);
}

.mobile-link {
  display: block;
  width: 100%;
  max-width: 480px;
  font-size: 1.35rem;
  font-weight: 500;
  color: #6B5C4B;
  padding: 1.5rem 0;
  letter-spacing: 0.08em;
  text-align: center;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-link:hover {
  opacity: 0.8;
}

.mobile-link.active,
.mobile-subnav-link.active {
  color: #DD2A2A;
}

.mobile-subnav {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 0 1rem;
}

.mobile-subnav > li {
  width: 100%;
}

.mobile-subnav-link {
  display: block;
  width: 100%;
  color: #6B5C4B;
  font-size: 1.05rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  padding: 0.65rem 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-subnav-link:hover {
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
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
