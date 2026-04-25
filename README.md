# 前端进阶后端 — Node.js 到 Spring Boot 知识迁移指南

交互式网页教程，帮助有 Node.js 基础的前端开发者快速掌握后端开发知识，并通过知识点迁移映射到 Java Spring Boot 主流框架。

## 环境要求

| 工具 | 版本 | 说明 |
|------|------|------|
| **Node.js** | ≥ 18.0 | 推荐 v20+ LTS 版本 |
| **npm** | ≥ 9.0 | 推荐 v10+ |
| **操作系统** | Windows / macOS / Linux | 跨平台支持 |

> 当前开发环境：Node.js v22.22.2 / npm 10.9.4

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 技术栈

| 层面 | 选型 |
|------|------|
| 构建工具 | Vite |
| UI 框架 | Vue 3 (Composition API) |
| 样式方案 | Tailwind CSS |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |
| 代码高亮 | Shiki |
| 思维导图 | markmap |
| 内容渲染 | markdown-it |

## 项目结构

```
src/
├── components/       # 通用组件（CodeCompare、MindMap 等）
├── composables/      # Vue 组合式函数
├── content/          # Markdown 教程内容
│   └── mindmaps/     # 思维导图源文件
├── layouts/          # 页面布局
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── views/            # 页面视图
└── styles/           # 全局样式
```

## 章节目录

| 编号 | 章节 | 内容 |
|------|------|------|
| 00 | 前言 | 教程介绍与学习路线 |
| 01 | 环境搭建 | Node.js vs JDK + Maven/Gradle + IDEA |
| 02 | 路由与请求处理 | Express 路由 → Spring MVC 注解 |
| 03 | 中间件与拦截器 | Express 中间件 → Spring Interceptor/Filter |
| 04 | 数据库与 ORM | Sequelize/Prisma → Spring Data JPA |
| 05 | 认证与授权 | JWT/Session → Spring Security |
| 06 | 部署与运维 | PM2 + Nginx → Docker + JAR 部署 |

## 部署

本项目为纯静态站点，可部署到任意静态托管服务：

- **Vercel**: `npm i -g vercel && vercel`
- **GitHub Pages**: 推送到 `gh-pages` 分支
- **Nginx**: 将 `dist/` 目录托管即可
