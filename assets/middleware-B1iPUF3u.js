var e=`# 中间件与拦截器
## 核心概念
### 请求处理管道 (Pipeline)
### 中间件执行顺序
### 请求/响应生命周期
### 错误处理机制
### 横切关注点 (Cross-cutting Concerns)
## Node.js 实现
### Express 中间件函数 (req, res, next)
### 应用级中间件 (app.use)
### 路由级中间件 (router.use)
### 错误处理中间件 (4 个参数)
### 第三方中间件 (cors, morgan, helmet)
### 代码模式: 中间件组合与链式调用
## Spring Boot 实现
### HandlerInterceptor (preHandle/postHandle/afterCompletion)
### OncePerRequestFilter
### @Component + WebMvcConfigurer 注册
### @Order 控制执行顺序
### 全局异常处理 (@ControllerAdvice)
### 代码模式: 拦截器注册与配置类
## 知识迁移要点
### 相似点
### 差异点
`;export{e as default};