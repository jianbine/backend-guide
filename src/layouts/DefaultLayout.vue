<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-left">
        <button class="menu-btn" @click="store.toggleSidebar" aria-label="Toggle sidebar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <router-link to="/" class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">前端进阶后端</span>
        </router-link>
      </div>
      <div class="header-center">
        <div class="search-box" @click="focusSearch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span class="search-placeholder">搜索章节...</span>
          <kbd class="search-kbd">⌘K</kbd>
        </div>
      </div>
      <div class="header-right">
        <div class="progress-badge" :title="`学习进度: ${store.progress}%`">
          <svg width="28" height="28" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-border)" stroke-width="2.5" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-accent)" stroke-width="2.5" stroke-dasharray="97.4" :stroke-dashoffset="97.4 - (97.4 * store.progress / 100)" stroke-linecap="round" transform="rotate(-90 18 18)" style="transition: stroke-dashoffset 0.5s ease" />
          </svg>
          <span class="progress-text">{{ store.progress }}%</span>
        </div>
        <button class="theme-btn" @click="store.toggleTheme" :title="store.isDark ? '切换亮色' : '切换暗色'">
          <svg v-if="store.isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
        </button>
      </div>
    </header>
    <div class="app-body">
      <aside class="app-sidebar" :class="{ collapsed: !store.sidebarOpen }">
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">开始学习</div>
            <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item" :class="{ active: isActive(item.path), read: store.isChapterRead(item.chapter) }">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
              <span v-if="store.isChapterRead(item.chapter)" class="nav-check">✓</span>
            </router-link>
          </div>
          <div class="nav-section">
            <div class="nav-section-title">扩展学习</div>
            <div v-for="item in extItems" :key="item.label" class="nav-item disabled">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
              <span class="nav-badge">即将推出</span>
            </div>
          </div>
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-progress">
            <div class="sidebar-progress-bar"><div class="sidebar-progress-fill" :style="{ width: store.progress + '%' }"></div></div>
            <span class="sidebar-progress-text">{{ store.progress }}% 已完成</span>
          </div>
        </div>
      </aside>
      <main class="app-main">
        <router-view v-slot="{ Component }"><transition name="fade" mode="out-in"><component :is="Component" /></transition></router-view>
      </main>
    </div>
    <SearchModal :visible="searchVisible" @close="searchVisible = false" @open="searchVisible = true" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores'
import SearchModal from '@/components/SearchModal.vue'

const store = useAppStore()
const route = useRoute()
const searchVisible = ref(false)

const navItems = [
  { path: '/', label: '学习路线', icon: '🗺️', chapter: 'home' },
  { path: '/chapter/00-foreword', label: '前言', icon: '📖', chapter: '00' },
  { path: '/chapter/01-environment', label: '环境搭建', icon: '🔧', chapter: '01' },
  { path: '/chapter/02-routing', label: '路由与请求处理', icon: '🔀', chapter: '02' },
  { path: '/chapter/03-middleware', label: '中间件与拦截器', icon: '🔗', chapter: '03' },
  { path: '/chapter/04-database', label: '数据库与 ORM', icon: '🗄️', chapter: '04' },
  { path: '/chapter/05-auth', label: '认证与授权', icon: '🔐', chapter: '05' },
  { path: '/chapter/06-deployment', label: '部署与运维', icon: '🚀', chapter: '06' },
  { path: '/chapter/07-mq', label: '消息队列', icon: '📨', chapter: '07' },
  { path: '/chapter/08-es', label: '搜索引擎', icon: '🔍', chapter: '08' },
  { path: '/chapter/09-redis', label: '缓存与 Redis', icon: '⚡', chapter: '09' },
]

const extItems = []

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function focusSearch() {
  searchVisible.value = true
}
</script>

<style scoped>
.app-layout { min-height: 100vh; display: flex; flex-direction: column; }
.app-header { position: fixed; top: 0; left: 0; right: 0; height: var(--header-height); background: var(--color-sidebar-bg); border-bottom: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between; padding: 0 1.25rem; z-index: 100; backdrop-filter: blur(12px); }
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.menu-btn { display: none; background: none; border: none; color: var(--color-text-secondary); cursor: pointer; padding: 0.5rem; border-radius: 8px; transition: all 0.2s; }
.menu-btn:hover { background: var(--color-sidebar-hover); color: var(--color-text-primary); }
.logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; color: var(--color-text-primary); font-weight: 700; font-size: 1.1rem; }
.logo-icon { font-size: 1.3rem; }
.header-center { flex: 1; max-width: 400px; margin: 0 2rem; }
.search-box { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.875rem; background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 10px; cursor: pointer; transition: all 0.2s; color: var(--color-text-muted); }
.search-box:hover { border-color: var(--color-accent); }
.search-placeholder { flex: 1; font-size: 0.875rem; }
.search-kbd { font-family: var(--font-mono); font-size: 0.7rem; padding: 0.125rem 0.375rem; background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text-muted); }
.header-right { display: flex; align-items: center; gap: 0.75rem; }
.progress-badge { position: relative; display: flex; align-items: center; justify-content: center; cursor: default; }
.progress-text { position: absolute; font-size: 0.6rem; font-weight: 600; color: var(--color-accent); }
.theme-btn { background: none; border: 1px solid var(--color-border); color: var(--color-text-secondary); cursor: pointer; padding: 0.5rem; border-radius: 10px; transition: all 0.2s; display: flex; align-items: center; }
.theme-btn:hover { background: var(--color-sidebar-hover); color: var(--color-text-primary); border-color: var(--color-accent); }
.app-body { display: flex; margin-top: var(--header-height); min-height: calc(100vh - var(--header-height)); }
.app-sidebar { position: fixed; top: var(--header-height); left: 0; bottom: 0; width: var(--sidebar-width); background: var(--color-sidebar-bg); border-right: 1px solid var(--color-border); display: flex; flex-direction: column; overflow-y: auto; transition: transform 0.3s ease; z-index: 50; }
.app-sidebar.collapsed { transform: translateX(-100%); }
.sidebar-nav { flex: 1; padding: 1rem 0.75rem; }
.nav-section { margin-bottom: 1.5rem; }
.nav-section-title { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); padding: 0 0.75rem; margin-bottom: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 0.625rem; padding: 0.5rem 0.75rem; border-radius: 8px; color: var(--color-text-secondary); text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: all 0.15s ease; margin-bottom: 2px; }
.nav-item:hover:not(.disabled) { background: var(--color-sidebar-hover); color: var(--color-text-primary); }
.nav-item.active { background: var(--color-sidebar-active); color: var(--color-accent-dark); font-weight: 600; }
.nav-item.read .nav-check { color: var(--color-accent); font-size: 0.75rem; font-weight: 700; }
.nav-item.disabled { opacity: 0.45; cursor: not-allowed; }
.nav-icon { font-size: 1rem; width: 1.25rem; text-align: center; flex-shrink: 0; }
.nav-label { flex: 1; }
.nav-badge { font-size: 0.65rem; padding: 0.125rem 0.375rem; background: var(--color-bg-secondary); border-radius: 4px; color: var(--color-text-muted); font-weight: 500; }
.sidebar-footer { padding: 1rem 0.75rem; border-top: 1px solid var(--color-border); }
.sidebar-progress { display: flex; flex-direction: column; gap: 0.375rem; }
.sidebar-progress-bar { height: 4px; background: var(--color-bg-secondary); border-radius: 2px; overflow: hidden; }
.sidebar-progress-fill { height: 100%; background: var(--color-accent); border-radius: 2px; transition: width 0.5s ease; }
.sidebar-progress-text { font-size: 0.7rem; color: var(--color-text-muted); text-align: center; }
.app-main { flex: 1; margin-left: var(--sidebar-width); padding: 2rem 3rem 4rem; max-width: 900px; transition: margin-left 0.3s ease; }
@media (max-width: 1023px) {
  .menu-btn { display: flex; }
  .app-sidebar { transform: translateX(-100%); }
  .app-sidebar.collapsed { transform: translateX(-100%); }
  .app-sidebar:not(.collapsed) { transform: translateX(0); box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1); }
  .app-main { margin-left: 0; padding: 1.5rem 1.5rem 3rem; }
  .header-center { display: none; }
}
@media (max-width: 767px) { .app-main { padding: 1rem 1rem 3rem; } }
</style>