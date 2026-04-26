import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // Theme
  const isDark = ref(false)

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  function initTheme() {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      isDark.value = true
      document.documentElement.classList.add('dark')
    }
  }

  // Progress
  const readChapters = ref(new Set(JSON.parse(localStorage.getItem('readChapters') || '[]')))

  const progress = computed(() => {
    const total = 14 // 00-13
    return Math.round((readChapters.value.size / total) * 100)
  })

  function markChapterRead(chapterId) {
    readChapters.value.add(chapterId)
    localStorage.setItem('readChapters', JSON.stringify([...readChapters.value]))
  }

  function isChapterRead(chapterId) {
    return readChapters.value.has(chapterId)
  }

  // Sidebar
  const sidebarOpen = ref(true)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  return {
    isDark,
    toggleTheme,
    initTheme,
    readChapters,
    progress,
    markChapterRead,
    isChapterRead,
    sidebarOpen,
    toggleSidebar,
  }
})
