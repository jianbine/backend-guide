# Changelog

所有重要更改均记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)。

---

## [Unreleased]

### 新增 (Added)

- 新增 **第 10 章 - API 设计进阶 (GraphQL)**：REST vs GraphQL 对比、Apollo Server、Spring GraphQL
- 新增 **第 11 章 - 接口进阶实战**：WebSocket、文件上传、限流、全局异常处理、参数校验、接口文档
- 新增 **第 12 章 - 微服务基础**：服务注册发现、API 网关、配置中心、分布式事务（Saga/Seata）
- 新增 **第 13 章 - 测试与质量保障**：Jest/JUnit 单元测试、集成测试、Mock、TDD、覆盖率
- 侧边栏导航、搜索功能、首页章节卡片同步支持 13 个章节

### 变更 (Changed)

- 更新 README.md，精简为项目简介 + 在线访问地址 + 本地开发指南

### 移除 (Removed)

- 移除学习进度追踪功能（顶部进度徽章、侧边栏进度条、首页进度卡片、章节已读标记）
- 移除首页底部 Footer 文字
- 移除章节内容中的 "🚀 **下一步**" 和 "恭喜你完成了全部教程！" 提示语

### 修复 (Fixed)

- 修复章节导航（上一章/下一章）跳转失败的问题：frontmatter `chapter` 字段补零匹配
