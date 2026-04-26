<template>
  <div class="chapter-page">
    <div v-if="loading" class="chapter-loading">加载中...</div>
    <article v-else-if="chapter" class="chapter-content">
      <div class="chapter-meta">
        <span class="chapter-number">第 {{ chapter.chapter }} 章</span>
        <span v-if="prevChapter" class="chapter-nav-link" @click="$router.push(prevChapter)">
          ← 上一章
        </span>
        <span v-if="nextChapter" class="chapter-nav-link" @click="$router.push(nextChapter)">
          下一章 →
        </span>
      </div>

      <h1 class="chapter-title">{{ chapter.title }}</h1>

      <MindMap v-if="mindmapContent" :markdown="mindmapContent" />

      <div class="chapter-body" v-html="renderedHtml"></div>

      <div class="chapter-footer">
        <div class="footer-nav">
          <router-link v-if="prevChapter" :to="prevChapter" class="footer-nav-btn prev">
            ← {{ prevLabel }}
          </router-link>
          <div v-else></div>
          <router-link v-if="nextChapter" :to="nextChapter" class="footer-nav-btn next">
            {{ nextLabel }} →
          </router-link>
        </div>
      </div>
    </article>
    <div v-else class="chapter-not-found">
      <h2>章节未找到</h2>
      <router-link to="/">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import MindMap from '@/components/MindMap.vue'
import MarkdownIt from 'markdown-it'

const route = useRoute()

const loading = ref(true)
const chapter = ref(null)
const renderedHtml = ref('')
const mindmapContent = ref('')

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

const chapterList = [
  { num: '00', slug: 'foreword', title: '前言' },
  { num: '01', slug: 'environment', title: '环境搭建' },
  { num: '02', slug: 'routing', title: '路由与请求处理' },
  { num: '03', slug: 'middleware', title: '中间件与拦截器' },
  { num: '04', slug: 'database', title: '数据库与 ORM' },
  { num: '05', slug: 'auth', title: '认证与授权' },
  { num: '06', slug: 'deployment', title: '部署与运维' },
  { num: '07', slug: 'mq', title: '消息队列' },
  { num: '08', slug: 'es', title: '搜索引擎' },
  { num: '09', slug: 'redis', title: '缓存与 Redis' },
  { num: '10', slug: 'graphql', title: 'API 设计进阶 (GraphQL)' },
  { num: '11', slug: 'advanced-api', title: '接口进阶实战' },
  { num: '12', slug: 'microservice', title: '微服务基础' },
  { num: '13', slug: 'testing', title: '测试与质量保障' },
]

const currentIndex = computed(() => {
  if (!chapter.value) return -1
  const ch = String(chapter.value.chapter).padStart(2, '0')
  return chapterList.findIndex(c => c.num === ch)
})

const prevChapter = computed(() => {
  const idx = currentIndex.value
  if (idx <= 0) return null
  const prev = chapterList[idx - 1]
  return `/chapter/${prev.num}-${prev.slug}`
})

const nextChapter = computed(() => {
  const idx = currentIndex.value
  if (idx < 0 || idx >= chapterList.length - 1) return null
  const next = chapterList[idx + 1]
  return `/chapter/${next.num}-${next.slug}`
})

const prevLabel = computed(() => {
  const idx = currentIndex.value
  if (idx <= 0) return ''
  return chapterList[idx - 1].title
})

const nextLabel = computed(() => {
  const idx = currentIndex.value
  if (idx < 0 || idx >= chapterList.length - 1) return ''
  return chapterList[idx + 1].title
})

async function loadChapter() {
  loading.value = true
  try {
    const modules = import.meta.glob('@/content/*.md', { query: '?raw', import: 'default' })
    const meta = route.meta
    const contentPath = meta.contentPath

    if (contentPath && modules[contentPath]) {
      const raw = await modules[contentPath]()
      const content = typeof raw === 'string' ? raw : raw.default || ''

      // Parse frontmatter
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
      if (fmMatch) {
        const frontmatter = {}
        fmMatch[1].split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':')
          if (key && valueParts.length) {
            frontmatter[key.trim()] = valueParts.join(':').trim().replace(/^['"]|['"]$/g, '')
          }
        })

        chapter.value = {
          title: frontmatter.title || '未命名章节',
          chapter: frontmatter.chapter || '0',
          mindmap: frontmatter.mindmap || '',
        }

        // Load mindmap
        if (chapter.value.mindmap) {
          try {
            const mindmapModules = import.meta.glob('@/content/mindmaps/*.md', { query: '?raw', import: 'default' })
            const mmPath = `/src/content/mindmaps/${chapter.value.mindmap.split('/').pop()}`
            if (mindmapModules[mmPath]) {
              const mmRaw = await mindmapModules[mmPath]()
              mindmapContent.value = typeof mmRaw === 'string' ? mmRaw : mmRaw.default || ''
            }
          } catch {
            mindmapContent.value = ''
          }
        }

        renderedHtml.value = md.render(fmMatch[2])
      } else {
        renderedHtml.value = md.render(content)
        chapter.value = { title: '未命名章节', chapter: '0' }
      }

    }
  } catch (err) {
    console.error('Failed to load chapter:', err)
    chapter.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadChapter)
watch(() => route.path, loadChapter)
</script>

<style scoped>
.chapter-page {
  max-width: 100%;
}

.chapter-loading {
  text-align: center;
  padding: 4rem;
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

.chapter-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.8125rem;
}

.chapter-number {
  padding: 0.25rem 0.75rem;
  background: var(--color-accent-light);
  color: var(--color-accent-dark);
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.75rem;
}

.chapter-nav-link {
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color 0.2s;
}

.chapter-nav-link:hover {
  color: var(--color-accent);
}

.chapter-title {
  font-size: 2.25rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  margin-bottom: 2rem;
  line-height: 1.2;
  color: var(--color-text-primary);
}

.chapter-body {
  font-size: 0.9375rem;
  line-height: 1.8;
}

.chapter-body :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 3rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border);
}

.chapter-body :deep(h3) {
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.chapter-body :deep(p) {
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
}

.chapter-body :deep(ul),
.chapter-body :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
  color: var(--color-text-secondary);
}

.chapter-body :deep(li) {
  margin-bottom: 0.5rem;
}

.chapter-body :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 1rem 1.25rem;
  border-left: 3px solid var(--color-accent);
  background: var(--color-accent-light);
  border-radius: 0 8px 8px 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.chapter-body :deep(pre) {
  margin: 1.5rem 0;
}

.chapter-body :deep(code:not(pre code)) {
  font-family: var(--font-mono);
  font-size: 0.85em;
  padding: 0.125rem 0.375rem;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-accent-dark);
}

.chapter-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.875rem;
}

.chapter-body :deep(th),
.chapter-body :deep(td) {
  padding: 0.625rem 1rem;
  border: 1px solid var(--color-border);
  text-align: left;
}

.chapter-body :deep(th) {
  background: var(--color-bg-secondary);
  font-weight: 600;
}

.chapter-body :deep(strong) {
  color: var(--color-text-primary);
  font-weight: 600;
}

/* ===== Footer Nav ===== */
.chapter-footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.footer-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.footer-nav-btn {
  padding: 0.75rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.footer-nav-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-light);
}

.footer-nav-btn.next {
  margin-left: auto;
}

.chapter-not-found {
  text-align: center;
  padding: 4rem;
  color: var(--color-text-muted);
}
</style>