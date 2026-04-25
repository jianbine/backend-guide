import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// Use ?raw to import markdown as raw strings, not as JS modules
const chapters = import.meta.glob('@/content/*.md', { query: '?raw', import: 'default' })

const chapterRoutes = Object.keys(chapters).map((path) => {
  const name = path.match(/\/(\d+)-(.+)\.md$/)
  if (!name) return null
  return {
    path: `/chapter/${name[1]}-${name[2]}`,
    name: `chapter-${name[1]}`,
    component: () => import('@/views/Chapter.vue'),
    meta: {
      chapter: parseInt(name[1]),
      slug: name[2],
      contentPath: path,
    },
  }
}).filter(Boolean)

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/Home.vue'),
      },
      ...chapterRoutes,
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

export default router
