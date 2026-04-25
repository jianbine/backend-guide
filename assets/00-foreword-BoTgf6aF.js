var e=`---
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
- 具备阅读和参与 Java 后端项目的能力

## 适用人群

- 有 1 年以上 Node.js/Express 开发经验的前端工程师
- 熟悉 HTTP 协议、RESTful API 设计
- 了解基本的数据库操作（SQL、ORM）
- 想要学习 Java 后端但不想从零开始

## 如何使用本教程

1. **按顺序学习**：章节按照从易到难的顺序编排，建议按顺序阅读
2. **动手实践**：每个章节都有代码示例，建议在本地运行
3. **对比理解**：重点理解 Node.js 和 Spring Boot 的对应关系
4. **参考查阅**：学完后可作为日常开发的参考手册

## 技术栈对比概览

| 维度 | Node.js | Java Spring Boot |
|------|---------|------------------|
| 语言 | JavaScript/TypeScript | Java |
| 运行时 | V8 引擎 | JVM |
| 框架 | Express/Koa/NestJS | Spring Boot |
| 类型系统 | TypeScript（可选） | Java（强类型）|
| 包管理 | npm/yarn/pnpm | Maven/Gradle |
| ORM | Sequelize/Prisma | Spring Data JPA |
| 模板引擎 | EJS/Pug/Handlebars | Thymeleaf |

## 学习路线图

```mermaid
graph LR
    A[Node.js 基础] --> B[环境搭建]
    B --> C[路由与请求处理]
    C --> D[中间件与拦截器]
    D --> E[数据库与 ORM]
    E --> F[认证与授权]
    F --> G[部署与运维]
```

> 💡 **提示**：如果你已经有一定的 Java 基础，可以直接跳到对应章节查漏补缺。

## 开始学习

准备好了吗？让我们从 [环境搭建](/chapter/01-environment) 开始吧！
`
export default{render(){return{}}};