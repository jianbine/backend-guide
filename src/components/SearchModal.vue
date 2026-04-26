<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="search-overlay" @click.self="close">
        <div class="search-modal">
          <div class="search-input-wrap">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              class="search-input"
              placeholder="搜索章节、关键词..."
              @keydown.down.prevent="moveDown"
              @keydown.up.prevent="moveUp"
              @keydown.enter.prevent="selectCurrent"
              @keydown.esc="close"
            />
            <kbd class="search-esc">ESC</kbd>
          </div>

          <div v-if="query.trim()" class="search-results">
            <div v-if="results.length === 0" class="search-empty">
              <span>没有找到匹配的结果</span>
            </div>
            <div
              v-for="(item, index) in results"
              :key="item.id"
              :class="['search-result-item', { active: index === activeIndex }]"
              @click="goTo(item)"
              @mouseenter="activeIndex = index"
            >
              <span class="result-icon">{{ item.icon }}</span>
              <div class="result-content">
                <div class="result-title" v-html="highlight(/^\d+$/.test(item.num) ? item.num + ' ' + item.title : item.title)"></div>
                <div class="result-desc" v-html="highlight(item.desc)"></div>
              </div>
            </div>
          </div>

          <div v-else class="search-hint">
            <div class="hint-title">快速跳转</div>
            <div
              v-for="item in chapters"
              :key="item.id"
              class="search-result-item"
              @click="goTo(item)"
            >
              <span class="result-icon">{{ item.icon }}</span>
              <div class="result-content">
                <div class="result-title">{{ /^\d+$/.test(item.num) ? item.num + ' ' + item.title : item.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const router = useRouter()
const query = ref('')
const activeIndex = ref(0)
const inputRef = ref(null)

const chapters = [
  { id: 'foreword', num: '📖', title: '前言', desc: '教程介绍、学习目标、适用人群', icon: '📖', path: '/chapter/00-foreword' },
  { id: '01-environment', num: '01', title: '环境搭建', desc: '配置 Node.js 与 Java Spring Boot 开发环境，搭建项目脚手架', icon: '🔧', path: '/chapter/01-environment' },
  { id: '02-routing', num: '02', title: '路由与请求处理', desc: 'RESTful API 设计、Express 路由与 Spring MVC 注解映射', icon: '🔀', path: '/chapter/02-routing' },
  { id: '03-middleware', num: '03', title: '中间件与拦截器', desc: 'Express 中间件链与 Spring 拦截器/过滤器对比', icon: '🔗', path: '/chapter/03-middleware' },
  { id: '04-database', num: '04', title: '数据库与 ORM', desc: 'Sequelize/Prisma 与 Spring Data JPA/Hibernate 使用方式', icon: '🗄️', path: '/chapter/04-database' },
  { id: '05-auth', num: '05', title: '认证与授权', desc: 'JWT 与 Session 认证、Spring Security 核心概念', icon: '🔐', path: '/chapter/05-auth' },
  { id: '06-deployment', num: '06', title: '部署与运维', desc: '进程管理、反向代理、Docker 容器化部署', icon: '🚀', path: '/chapter/06-deployment' },
  { id: '07-mq', num: '07', title: '消息队列', desc: 'RabbitMQ、Kafka、BullMQ 与 Spring AMQP/Kafka 对比', icon: '📨', path: '/chapter/07-mq' },
  { id: '08-es', num: '08', title: '搜索引擎', desc: 'Elasticsearch 全文搜索、Spring Data Elasticsearch 实战', icon: '🔍', path: '/chapter/08-es' },
  { id: '09-redis', num: '09', title: '缓存与 Redis', desc: 'Redis 数据结构、缓存策略、Spring Data Redis 与 @Cacheable', icon: '⚡', path: '/chapter/09-redis' },
  { id: '10-graphql', num: '10', title: 'API 设计进阶 (GraphQL)', desc: 'GraphQL Schema、Resolver、Apollo Server 与 Spring GraphQL 对比', icon: '🔮', path: '/chapter/10-graphql' },
  { id: '11-advanced-api', num: '11', title: '接口进阶实战', desc: 'WebSocket、文件上传、限流、全局异常处理、参数校验、接口文档', icon: '🛠️', path: '/chapter/11-advanced-api' },
  { id: '12-microservice', num: '12', title: '微服务基础', desc: '服务注册发现、API 网关、配置中心、分布式事务（Saga/Seata）', icon: '🌐', path: '/chapter/12-microservice' },
  { id: '13-testing', num: '13', title: '测试与质量保障', desc: 'Jest/JUnit 单元测试、集成测试、Mock、TDD、覆盖率', icon: '✅', path: '/chapter/13-testing' },
]

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return chapters.filter(ch => {
    const text = `${ch.title} ${ch.desc} ${ch.num}`.toLowerCase()
    return text.includes(q)
  })
})

watch(() => props.visible, (val) => {
  if (val) {
    query.value = ''
    activeIndex.value = 0
    nextTick(() => inputRef.value?.focus())
  }
})

watch(results, () => {
  activeIndex.value = 0
})

function moveDown() {
  if (results.value.length) {
    activeIndex.value = (activeIndex.value + 1) % results.value.length
  }
}

function moveUp() {
  if (results.value.length) {
    activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length
  }
}

function selectCurrent() {
  if (query.value.trim() && results.value.length) {
    goTo(results.value[activeIndex.value])
  } else if (!query.value.trim()) {
    // Quick jump: use activeIndex on chapters list
    goTo(chapters[activeIndex.value])
  }
}

function goTo(item) {
  close()
  router.push(item.path)
}

function close() {
  emit('close')
}

function highlight(text) {
  if (!query.value.trim()) return text
  const q = query.value.trim()
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// Global keyboard shortcut
function onKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (props.visible) {
      close()
    } else {
      emit('open')
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style>
/* Not scoped — Teleport renders outside component */
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  backdrop-filter: blur(4px);
}

.search-modal {
  width: 560px;
  max-width: 90vw;
  max-height: 420px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.search-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  color: var(--color-text-primary);
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-esc {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-muted);
  background: var(--color-bg-secondary);
}

.search-results,
.search-hint {
  overflow-y: auto;
  padding: 0.5rem;
}

.search-empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.hint-title {
  padding: 0.5rem 0.75rem 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.search-result-item:hover,
.search-result-item.active {
  background: var(--color-sidebar-hover);
}

.result-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.result-title mark {
  background: var(--color-accent-light);
  color: var(--color-accent-dark);
  border-radius: 2px;
  padding: 0 2px;
}

.result-desc {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-desc mark {
  background: var(--color-accent-light);
  color: var(--color-accent-dark);
  border-radius: 2px;
  padding: 0 2px;
}

.result-num {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>