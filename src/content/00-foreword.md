---
title: 前言
chapter: 0
mindmap: ./mindmaps/00-foreword.md
---

# 前言

## 为什么要写这个教程？

作为一名前端开发者，你可能已经熟练掌握了 Node.js、Express、TypeScript 等技术栈。但随着项目规模扩大、团队架构调整，或者个人职业发展需要，越来越多的前端工程师需要了解甚至掌握后端开发。而 Java Spring Boot 作为企业级后端开发的主流选择，自然成为了重要的学习目标。

然而，直接从零开始学习 Java Spring Boot 往往效率不高——你已经理解了 HTTP、RESTful API、中间件、ORM 等核心概念，只是需要把这些知识"翻译"到 Java 生态中。

**本教程的核心思路：不是从零教 Java，而是帮你把已有的 Node.js 后端知识迁移到 Spring Boot。**

## 教程目标

完成本教程后，你将能够：

- 理解 Node.js 与 Java Spring Boot 在后端开发中的对应关系
- 独立搭建 Spring Boot 项目并完成基本的 API 开发
- 将现有的 Node.js 后端项目思路迁移到 Spring Boot
- 具备阅读和参与 Java 后端项目开发的信心

## 适合人群

本教程假设你具备以下基础：

| 前置知识 | 要求程度 |
|---------|---------|
| JavaScript / TypeScript | 熟练 |
| Node.js 基础 | 熟练 |
| Express / Koa 等框架 | 了解基本用法 |
| HTTP 协议基础 | 了解请求方法、状态码、Header |
| SQL 基础 | 了解基本 CRUD 操作 |
| Java 语言 | 不要求，教程中会讲解必要的语法 |

> **提示：** 如果你完全没有 Java 语言基础，建议先花 1-2 天了解 Java 的基本语法（变量、类、接口、泛型、异常处理），这会让后续章节的学习更加顺畅。

## 学习路线

本教程共分为 7 个章节，按照从易到难的顺序组织：

```
前言 → 环境搭建 → 路由与请求处理 → 中间件与拦截器 → 数据库与 ORM → 认证与授权 → 部署与运维
```

| 章节 | 内容 | 预计用时 |
|------|------|---------|
| 00 - 前言 | 教程介绍与学习路线 | 10 分钟 |
| 01 - 环境搭建 | 开发环境配置与 Hello World | 30 分钟 |
| 02 - 路由与请求处理 | RESTful API 与请求响应 | 45 分钟 |
| 03 - 中间件与拦截器 | 请求处理链与横切关注点 | 40 分钟 |
| 04 - 数据库与 ORM | 数据持久化与关联关系 | 60 分钟 |
| 05 - 认证与授权 | JWT、Session 与权限控制 | 50 分钟 |
| 06 - 部署与运维 | 打包、容器化与监控 | 40 分钟 |

## 教程特色

### 1. 代码对比驱动

每个知识点都会同时给出 Node.js 和 Spring Boot 的实现代码，让你直观地看到两者的异同：

```javascript
// Node.js / Express
app.get('/api/users/:id', (req, res) => {
  const id = req.params.id;
  res.json({ id, name: 'Alice' });
});
```

```java
// Java / Spring Boot
@GetMapping("/api/users/{id}")
public ResponseEntity<User> getUser(@PathVariable String id) {
    User user = new User(id, "Alice");
    return ResponseEntity.ok(user);
}
```

### 2. 思维导图辅助理解

每章配有思维导图，帮助你建立知识框架，快速把握核心概念之间的关系。思维导图文件位于各章节对应的 `mindmaps/` 目录下。

### 3. 知识迁移对照表

通过精心设计的对照表，将 Node.js 生态中的概念一一映射到 Spring Boot 生态：

| Node.js | Spring Boot |
|---------|-------------|
| Express | Spring MVC |
| middleware | Interceptor / Filter |
| npm | Maven / Gradle |
| Sequelize / Prisma | Spring Data JPA |
| jsonwebtoken | Spring Security JWT |
| PM2 | Docker / systemd |

### 4. 实战导向

所有代码示例都可以直接运行。每章都围绕一个统一的示例项目展开，让你在实践中理解概念。

## 环境要求

在开始学习之前，请确保你的开发环境满足以下要求：

### 硬件要求

- 内存：至少 8 GB（推荐 16 GB）
- 磁盘空间：至少 5 GB 可用空间

### 软件要求

| 工具 | 版本要求 | 用途 |
|------|---------|------|
| Node.js | >= 16.x | 运行 Node.js 示例 |
| npm / pnpm | >= 7.x | Node.js 包管理 |
| JDK | >= 17 | Java 开发环境 |
| Maven / Gradle | 最新稳定版 | Java 构建工具 |
| IDE | VS Code 或 IntelliJ IDEA | 代码编辑 |
| Git | 最新版 | 版本控制 |
| Docker（可选） | 最新版 | 容器化部署 |

> **注意：** JDK 17 是 Spring Boot 3.x 的最低要求。如果你使用的是 Spring Boot 2.x，JDK 11 也可以。

## 如何使用本教程

1. **按顺序学习** — 章节之间有递进关系，建议按照编号顺序学习
2. **动手实践** — 每个代码示例都请亲自运行一遍，不要只看不练
3. **善用对照表** — 遇到不理解的 Java 概念时，先在对照表中找到对应的 Node.js 概念
4. **参考思维导图** — 学完每章后，回顾思维导图，检查是否掌握了所有核心概念

## 小结

本教程的核心理念是**知识迁移**——利用你已经掌握的 Node.js 后端知识，快速理解和掌握 Java Spring Boot。通过代码对比、概念对照和实战练习，你将发现从 Node.js 迁移到 Spring Boot 并没有想象中那么困难。

准备好了吗？让我们从环境搭建开始吧！
