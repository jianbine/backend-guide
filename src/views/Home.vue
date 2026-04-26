<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="hero-gradient"></div>
        <div class="hero-pattern"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span>前端开发者后端进阶指南</span>
        </div>
        <h1 class="hero-title">
          <span class="title-highlight">前端进阶后端</span>
        </h1>
        <p class="hero-subtitle">从 Node.js 到 Spring Boot 的知识迁移指南</p>
        <p class="hero-description">
          利用你已有的前端知识体系，系统学习后端开发核心概念。
          通过对比学习法，快速掌握 Java Spring Boot 后端开发。
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">13</span>
            <span class="stat-label">核心章节</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">2</span>
            <span class="stat-label">技术栈对比</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">60+</span>
            <span class="stat-label">知识点</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Mindmap Section -->
    <section class="mindmap-section">
      <div class="section-header">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          全局学习路线
        </h2>
        <p class="section-desc">点击查看完整知识体系结构</p>
      </div>
      <MindMap :markdown="overviewMindmap" />
    </section>

    <!-- Chapter Cards Section -->
    <section class="chapters-section">
      <div class="section-header">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          章节导航
        </h2>
        <p class="section-desc">循序渐进，从基础到实战</p>
      </div>

      <div class="chapters-grid">
        <router-link
          v-for="(chapter, index) in chapters"
          :key="chapter.path"
          :to="chapter.path"
          class="chapter-card"
          :style="{ '--card-index': index, '--card-color': chapter.color }"
        >
          <div class="card-glow"></div>
          <div class="card-header">
            <div class="card-icon" :style="{ background: chapter.iconBg }">
              <span v-html="chapter.icon"></span>
            </div>
            <div class="card-number">0{{ index + 1 }}</div>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ chapter.title }}</h3>
            <p class="card-desc">{{ chapter.description }}</p>
          </div>
          <div class="card-footer">
            <div class="card-tags">
              <span
                v-for="tag in chapter.tags"
                :key="tag"
                class="card-tag"
                :class="tag.type"
              >{{ tag.label }}</span>
            </div>
            <svg class="card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </router-link>
      </div>
    </section>


  </div>
</template>

<script setup>
import MindMap from '@/components/MindMap.vue'

const overviewMindmap = `# 前端进阶后端学习路线
## 环境搭建
### Node.js 环境
### Java + Spring Boot 环境
## 路由与请求处理
### RESTful API 设计
### 请求方法映射
### 参数获取方式
## 中间件与拦截器
### Express 中间件
### Spring 拦截器/过滤器
## 数据库与 ORM
### 数据建模
### CRUD 操作
### 关联查询
## 认证与授权
### JWT 认证
### Session 认证
### Spring Security
## 部署与运维
### 进程管理
### 反向代理
### 容器化部署
## 消息队列
### RabbitMQ
### Kafka
### BullMQ
## 搜索引擎
### Elasticsearch CRUD
### 全文搜索
### 聚合分析
## 缓存与 Redis
### Redis 数据结构
### 缓存策略
### Spring Data Redis
## API 设计进阶
### GraphQL Schema
### Apollo Server
### Spring GraphQL
## 接口进阶实战
### WebSocket
### 文件上传
### 限流与校验
## 微服务基础
### 服务注册发现
### API 网关
### 分布式事务
## 测试与质量保障
### 单元测试
### 集成测试
### TDD 实践`

const chapters = [
  {
    path: '/chapter/01-environment',
    chapterId: '01',
    title: '环境搭建',
    description: '配置 Node.js 与 Java Spring Boot 开发环境，搭建项目脚手架，理解两个生态的工具链差异。',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    color: '#0d9488',
    iconBg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)',
    tags: [
      { label: 'Node.js', type: 'node' },
      { label: 'JDK', type: 'java' },
      { label: 'Maven', type: 'java' },
    ],
  },
  {
    path: '/chapter/02-routing',
    chapterId: '02',
    title: '路由与请求处理',
    description: '学习 RESTful API 设计规范，掌握 Express 路由与 Spring MVC 注解驱动的请求映射方式。',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    color: '#8b5cf6',
    iconBg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    tags: [
      { label: 'REST', type: 'node' },
      { label: 'Controller', type: 'java' },
      { label: '参数绑定', type: 'neutral' },
    ],
  },
  {
    path: '/chapter/03-middleware',
    chapterId: '03',
    title: '中间件与拦截器',
    description: '理解请求处理管道的概念，对比 Express 中间件链与 Spring 拦截器/过滤器的实现模式。',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    color: '#f59e0b',
    iconBg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    tags: [
      { label: 'Middleware', type: 'node' },
      { label: 'Filter', type: 'java' },
      { label: 'Interceptor', type: 'java' },
    ],
  },
  {
    path: '/chapter/04-database',
    chapterId: '04',
    title: '数据库与 ORM',
    description: '掌握数据建模与 CRUD 操作，对比 Sequelize/Prisma 与 Spring Data JPA/Hibernate 的使用方式。',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    color: '#ec4899',
    iconBg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
    tags: [
      { label: 'Sequelize', type: 'node' },
      { label: 'JPA', type: 'java' },
      { label: 'Migration', type: 'neutral' },
    ],
  },
  {
    path: '/chapter/05-auth',
    chapterId: '05',
    title: '认证与授权',
    description: '实现 JWT 与 Session 认证方案，学习 Spring Security 框架的核心概念与配置方式。',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    color: '#ef4444',
    iconBg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
    tags: [
      { label: 'JWT', type: 'node' },
      { label: 'OAuth', type: 'neutral' },
      { label: 'Security', type: 'java' },
    ],
  },
  {
    path: '/chapter/06-deployment',
    chapterId: '06',
    title: '部署与运维',
    description: '学习进程管理、反向代理配置与 Docker 容器化部署，将应用从开发环境推向生产环境。',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    color: '#06b6d4',
    iconBg: 'linear-gradient(135deg, #cffafe, #a5f3fc)',
    tags: [
      { label: 'PM2', type: 'node' },
      { label: 'Docker', type: 'neutral' },
      { label: 'Nginx', type: 'neutral' },
    ],
  },
  {
    path: '/chapter/07-mq',
    chapterId: '07',
    title: '消息队列',
    description: '对比 RabbitMQ、Kafka 与 BullMQ，学习消息发布/订阅、点对点模式及 Spring AMQP/Kafka 集成。',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    color: '#f97316',
    iconBg: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
    tags: [
      { label: 'RabbitMQ', type: 'neutral' },
      { label: 'Kafka', type: 'java' },
      { label: 'BullMQ', type: 'node' },
    ],
  },
  {
    path: '/chapter/08-es',
    chapterId: '08',
    title: '搜索引擎',
    description: '掌握 Elasticsearch 全文搜索、聚合分析，对比 Node.js 与 Spring Data Elasticsearch 的使用方式。',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    color: '#10b981',
    iconBg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    tags: [
      { label: 'Elasticsearch', type: 'neutral' },
      { label: '全文搜索', type: 'neutral' },
      { label: '聚合', type: 'java' },
    ],
  },
  {
    path: '/chapter/09-redis',
    chapterId: '09',
    title: '缓存与 Redis',
    description: '学习 Redis 数据结构与缓存策略，掌握 Spring Data Redis、@Cacheable 注解及缓存穿透/击穿解决方案。',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    color: '#ef4444',
    iconBg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
    tags: [
      { label: 'Redis', type: 'neutral' },
      { label: '@Cacheable', type: 'java' },
      { label: 'ioredis', type: 'node' },
    ],
  },
  {
    path: '/chapter/10-graphql',
    chapterId: '10',
    title: 'API 设计进阶 (GraphQL)',
    description: '掌握 GraphQL Schema、Resolver、Mutation，对比 Apollo Server 与 Spring GraphQL 的使用方式。',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    color: '#8b5cf6',
    iconBg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    tags: [
      { label: 'Apollo', type: 'node' },
      { label: 'Spring GraphQL', type: 'java' },
      { label: 'Schema', type: 'neutral' },
    ],
  },
  {
    path: '/chapter/11-advanced-api',
    chapterId: '11',
    title: '接口进阶实战',
    description: '学习 WebSocket 实时通信、文件上传、接口限流、全局异常处理、参数校验与接口文档。',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    color: '#f59e0b',
    iconBg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    tags: [
      { label: 'WebSocket', type: 'neutral' },
      { label: 'Multer', type: 'node' },
      { label: 'Swagger', type: 'neutral' },
    ],
  },
  {
    path: '/chapter/12-microservice',
    chapterId: '12',
    title: '微服务基础',
    description: '理解微服务架构，学习服务注册发现、API 网关、配置中心与分布式事务处理。',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>',
    color: '#06b6d4',
    iconBg: 'linear-gradient(135deg, #cffafe, #a5f3fc)',
    tags: [
      { label: 'Nacos', type: 'java' },
      { label: 'Gateway', type: 'java' },
      { label: 'Consul', type: 'node' },
    ],
  },
  {
    path: '/chapter/13-testing',
    chapterId: '13',
    title: '测试与质量保障',
    description: '掌握 Jest/JUnit 单元测试、Supertest/MockMvc 集成测试、Mock 技术与 TDD 实践。',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    color: '#10b981',
    iconBg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    tags: [
      { label: 'Jest', type: 'node' },
      { label: 'JUnit', type: 'java' },
      { label: 'TDD', type: 'neutral' },
    ],
  },
]

</script>

<style scoped>
.home-page {
  max-width: 100%;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== Hero Section ===== */
.hero-section {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 3rem;
  min-height: 340px;
  display: flex;
  align-items: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    var(--color-accent) 0%,
    var(--color-accent-dark) 40%,
    #1e3a5f 100%
  );
  opacity: 0.95;
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%),
    radial-gradient(circle at 60% 80%, rgba(255,255,255,0.04) 0%, transparent 40%);
  animation: patternShift 8s ease-in-out infinite alternate;
}

@keyframes patternShift {
  0% { transform: scale(1) rotate(0deg); }
  100% { transform: scale(1.05) rotate(1deg); }
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 3rem;
  color: #ffffff;
  max-width: 640px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 100px;
  font-size: 0.8125rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.hero-title {
  font-size: 2.75rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 0.75rem;
  color: #ffffff;
}

.title-highlight {
  background: linear-gradient(135deg, #ffffff 0%, #ccfbf1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.hero-description {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 520px;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.125rem;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
}

/* ===== Section Common ===== */
.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.375rem;
}

.section-title svg {
  color: var(--color-accent);
}

.section-desc {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* ===== Mindmap Section ===== */
.mindmap-section {
  margin-bottom: 3rem;
}

/* ===== Chapters Section ===== */
.chapters-section {
  margin-bottom: 3rem;
}

.chapters-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.chapter-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
}

.chapter-card:hover {
  border-color: var(--card-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--card-color), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.chapter-card:hover .card-glow {
  opacity: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon svg {
  color: var(--color-text-primary);
}

.card-number {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-bg-primary);
  padding: 0.125rem 0.5rem;
  border-radius: 6px;
}

.card-body {
  flex: 1;
}

.card-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.card-desc {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.65;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--color-border);
}

.card-tags {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.card-tag {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 0.01em;
}

.card-tag.node {
  background: var(--color-node-bg);
  color: var(--color-node);
}

.card-tag.java {
  background: var(--color-java-bg);
  color: var(--color-java);
}

.card-tag.neutral {
  background: var(--color-bg-primary);
  color: var(--color-text-muted);
}

.card-arrow {
  color: var(--color-text-muted);
  transition: all 0.3s;
  flex-shrink: 0;
}

.chapter-card:hover .card-arrow {
  color: var(--card-color);
  transform: translateX(3px);
}

/* ===== Responsive ===== */
@media (max-width: 1023px) {
  .chapters-grid {
    grid-template-columns: 1fr;
  }

  .hero-content {
    padding: 2rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-stats {
    gap: 1rem;
  }

  .stat-number {
    font-size: 1.25rem;
  }
}

@media (max-width: 767px) {
  .hero-section {
    min-height: auto;
  }

  .hero-content {
    padding: 1.5rem;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-subtitle {
    font-size: 1.0625rem;
  }

  .hero-description {
    font-size: 0.875rem;
  }

  .chapter-card {
    padding: 1.25rem;
  }
}
</style>