var e=`# 认证与授权
## 核心概念
### 认证 (Authentication) vs 授权 (Authorization)
### 无状态认证 (Stateless)
### 有状态认证 (Stateful / Session)
### Token 机制
### 密码加密与哈希
### RBAC 角色权限模型
## Node.js 实现
### jsonwebtoken 库 (JWT 签发/验证)
### express-session 会话管理
### bcrypt 密码哈希
### passport.js 认证策略
### 中间件级别的权限守卫
### 代码模式: JWT 中间件 + 路由守卫
## Spring Boot 实现
### Spring Security 核心架构
### SecurityFilterChain 配置
### JwtAuthenticationFilter
### @PreAuthorize / @Secured 注解
### UserDetailsService 接口
### 代码模式: SecurityConfig + JWT 过滤器链
## 知识迁移要点
### 相似点
### 差异点
`;export{e as default};