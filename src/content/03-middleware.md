---
title: 中间件与拦截器
chapter: 3
mindmap: ./mindmaps/03-middleware.md
---

# 中间件与拦截器

中间件（Middleware）和拦截器（Interceptor）是后端框架中处理横切关注点的核心机制。它们可以在不修改业务代码的情况下，为请求添加日志记录、身份认证、CORS 处理、错误处理等功能。

## 核心概念对比

| 概念 | Express | Spring Boot |
|------|---------|-------------|
| 中间件 | Middleware 函数 | Filter / Interceptor |
| 调用下一个 | `next()` | `chain.doFilter()` / `handlerInterceptor.preHandle()` |
| 请求前处理 | 在 `next()` 之前 | `doFilter()` 之前 / `preHandle()` |
| 请求后处理 | 在 `next()` 之后 | `doFilter()` 之后 / `postHandle()` |
| 错误处理 | `(err, req, res, next)` | `HandlerExceptionResolver` |
| 作用范围 | 全局 / 路由级 | 全局 / Controller 级 |

> **注意：** Spring Boot 中有两层拦截机制——Filter（Servlet 级别）和 Interceptor（Spring MVC 级别）。Filter 更底层，Interceptor 更贴近 Controller。大多数场景下使用 Interceptor 即可。

## Express 中间件机制

### 基本中间件

Express 中间件是一个接收 `req`、`res`、`next` 三个参数的函数：

```javascript
// 基本中间件结构
function myMiddleware(req, res, next) {
  // 请求前处理
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

  // 调用 next() 将控制权传递给下一个中间件
  next();

  // 请求后处理（在 next() 之后，响应发送之前）
  console.log('Response completed');
}

// 使用中间件
app.use(myMiddleware);
```

### 应用级中间件

```javascript
// 应用于所有路由
app.use((req, res, next) => {
  console.log('Global middleware');
  next();
});

// 应用于特定路径
app.use('/api', (req, res, next) => {
  console.log('API middleware');
  next();
});

// 应用于特定路由
app.get('/users', (req, res, next) => {
  console.log('Route-specific middleware');
  next();
}, (req, res) => {
  res.json({ users: [] });
});
```

### 错误处理中间件

```javascript
// 错误处理中间件 - 必须有 4 个参数
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 在路由中抛出错误
app.get('/users/:id', (req, res, next) => {
  const user = findUser(req.params.id);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    return next(error);  // 传递给错误处理中间件
  }
  res.json(user);
});
```

### 第三方中间件

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// 安全相关
app.use(helmet());           // 设置安全相关的 HTTP 头
app.use(cors());             // 处理跨域请求

// 日志
app.use(morgan('combined')); // HTTP 请求日志

// 解析请求体
app.use(express.json());     // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码请求体
```

## Spring Boot Filter 机制

### 实现 Filter

Spring Boot 中的 Filter 是 Servlet 规范的一部分，与 Express 中间件最为接近：

```java
package com.example.demo.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // 请求前处理
        long startTime = System.currentTimeMillis();
        System.out.printf("[%s] %s %s%n",
            java.time.Instant.now(),
            httpRequest.getMethod(),
            httpRequest.getRequestURI());

        // 调用下一个 Filter（等价于 Express 的 next()）
        chain.doFilter(request, response);

        // 请求后处理
        long duration = System.currentTimeMillis() - startTime;
        System.out.printf("Status: %d, Duration: %dms%n",
            httpResponse.getStatus(), duration);
    }
}
```

### Filter 注册方式

```java
// 方式一：使用 @Component 注解（自动注册，应用于所有路由）
@Component
public class MyFilter implements Filter { /* ... */ }

// 方式二：使用 FilterRegistrationBean（更灵活，可配置路径和顺序）
@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<LoggingFilter> loggingFilter() {
        FilterRegistrationBean<LoggingFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new LoggingFilter());
        registration.addUrlPatterns("/api/*");  // 仅应用于 /api 路径
        registration.setOrder(1);               // 设置执行顺序
        return registration;
    }
}
```

## Spring Boot Interceptor 机制

Interceptor 是 Spring MVC 提供的更高级别的拦截机制，可以访问 Controller 的处理方法和异常信息。

### 实现 HandlerInterceptor

```java
package com.example.demo.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {
        // 请求前处理（等价于 Express 中间件在 next() 之前的代码）
        String token = request.getHeader("Authorization");

        if (token == null || !token.startsWith("Bearer ")) {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized\"}");
            return false;  // 返回 false 中断请求链
        }

        // 验证 token...
        request.setAttribute("userId", extractUserId(token));
        return true;  // 返回 true 继续执行
    }

    @Override
    public void postHandle(HttpServletRequest request,
                           HttpServletResponse response,
                           Object handler,
                           org.springframework.ui.Model model) throws Exception {
        // 请求处理后，视图渲染前（REST API 中较少使用）
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler,
                                Exception ex) throws Exception {
        // 请求完成后（无论成功或失败），适合做资源清理
        System.out.println("Request completed");
    }
}
```

### 注册 Interceptor

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    public WebMvcConfig(AuthInterceptor authInterceptor) {
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")           // 拦截的路径
                .excludePathPatterns("/api/auth/**",  // 排除的路径
                                     "/api/public/**");
    }
}
```

## Filter vs Interceptor 对比

| 特性 | Filter | Interceptor |
|------|--------|-------------|
| 规范 | Servlet 规范 | Spring MVC 规范 |
| 作用范围 | 所有 Servlet 请求 | 仅 Spring MVC 控制的请求 |
| 注入 Spring Bean | 需要额外配置 | 直接支持 |
| 访问 Controller 信息 | 不能 | 可以（handler 参数） |
| 异常处理 | 需要在 Filter 内部处理 | 可以通过 afterCompletion 获取 |
| 执行顺序 | 在 Interceptor 之前 | 在 Filter 之后 |
| 适用场景 | CORS、编码、日志 | 认证、权限、性能监控 |

> **提示：** 简单记忆——Filter 是 Servlet 层面的"门卫"，Interceptor 是 Spring MVC 层面的"安检"。Filter 先执行，Interceptor 后执行。

## 常见应用场景对比

### 1. 请求日志

```javascript
// Express - 使用 morgan 中间件
const morgan = require('morgan');
app.use(morgan(':method :url :status :response-time ms'));
```

```java
// Spring Boot - 自定义 Filter
@Component
public class RequestLoggingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        long start = System.currentTimeMillis();

        chain.doFilter(request, response);

        System.out.printf("%s %s -> %d (%dms)%n",
            req.getMethod(), req.getRequestURI(),
            ((HttpServletResponse) response).getStatus(),
            System.currentTimeMillis() - start);
    }
}
```

### 2. CORS 处理

```javascript
// Express - 使用 cors 中间件
const cors = require('cors');

// 简单配置
app.use(cors());

// 自定义配置
app.use(cors({
  origin: ['https://example.com', 'https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400  // 预检请求缓存时间（秒）
}));
```

```java
// Spring Boot - 实现 WebMvcConfigurer
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("https://example.com", "https://app.example.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("Content-Type", "Authorization")
                .allowCredentials(true)
                .maxAge(86400);
    }
}
```

### 3. 认证检查

```javascript
// Express - 自定义认证中间件
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// 应用于需要认证的路由
app.use('/api/protected', authMiddleware);
```

```java
// Spring Boot - 使用 Interceptor
@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {
        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            sendError(response, 401, "No token provided");
            return false;
        }

        try {
            String token = header.substring(7);
            // 验证 JWT...
            request.setAttribute("userId", extractUserId(token));
            return true;
        } catch (Exception e) {
            sendError(response, 401, "Invalid token");
            return false;
        }
    }

    private void sendError(HttpServletResponse response, int status, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write(
            "{\"error\":\"" + message + "\"}"
        );
    }
}
```

### 4. 错误处理

```javascript
// Express - 全局错误处理中间件
// 注意：必须放在所有路由之后，且有 4 个参数
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // 开发环境返回详细错误
  if (process.env.NODE_ENV === 'development') {
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack
    });
  } else {
    // 生产环境返回简洁错误
    res.status(err.status || 500).json({
      error: 'Internal Server Error'
    });
  }
});
```

```java
// Spring Boot - 全局异常处理
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 处理特定异常
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    // 处理参数校验异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .toList();
        return ResponseEntity.badRequest()
                .body(Map.of("errors", errors));
    }

    // 兜底处理所有未捕获异常
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal Server Error"));
    }
}

// 自定义异常类
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long id) {
        super("User not found: " + id);
    }
}
```

### 5. 请求耗时统计

```javascript
// Express
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

```java
// Spring Boot - 使用 Interceptor
@Component
public class PerformanceInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(PerformanceInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        request.setAttribute("startTime", System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler,
                                Exception ex) {
        long start = (Long) request.getAttribute("startTime");
        long duration = System.currentTimeMillis() - start;
        log.info("{} {} - {}ms", request.getMethod(), request.getRequestURI(), duration);
    }
}
```

## 执行顺序对比

理解中间件/拦截器的执行顺序对于调试和开发非常重要。

### Express 执行顺序

```
请求 → 全局中间件1 → 全局中间件2 → 路由中间件 → 路由处理函数 → 路由中间件 → 全局中间件2 → 全局中间件1 → 响应
```

```javascript
app.use((req, res, next) => {
  console.log('A - before');
  next();
  console.log('A - after');
});

app.use((req, res, next) => {
  console.log('B - before');
  next();
  console.log('B - after');
});

app.get('/test', (req, res) => {
  console.log('C - handler');
  res.json({ ok: true });
});

// 输出: A-before → B-before → C-handler → B-after → A-after
```

### Spring Boot 执行顺序

```
请求 → Filter1 → Filter2 → Interceptor.preHandle → Controller → Interceptor.postHandle → Interceptor.afterCompletion → Filter2 → Filter1 → 响应
```

```java
// Filter1
@Component
@Order(1)
public class Filter1 implements Filter {
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        System.out.println("Filter1 - before");
        chain.doFilter(req, res);
        System.out.println("Filter1 - after");
    }
}

// Filter2
@Component
@Order(2)
public class Filter2 implements Filter {
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        System.out.println("Filter2 - before");
        chain.doFilter(req, res);
        System.out.println("Filter2 - after");
    }
}

// Interceptor
@Component
public class MyInterceptor implements HandlerInterceptor {
    public boolean preHandle(...) { System.out.println("Interceptor - preHandle"); return true; }
    public void postHandle(...) { System.out.println("Interceptor - postHandle"); }
    public void afterCompletion(...) { System.out.println("Interceptor - afterCompletion"); }
}

// 输出: Filter1-before → Filter2-before → Interceptor-preHandle → Controller
//       → Interceptor-postHandle → Interceptor-afterCompletion → Filter2-after → Filter1-after
```

### 完整执行顺序对照表

| 阶段 | Express | Spring Boot |
|------|---------|-------------|
| 1 | 全局中间件 | Filter（按 @Order 排序） |
| 2 | 路由级中间件 | Interceptor.preHandle() |
| 3 | 路由处理函数 | Controller 方法 |
| 4 | 路由级中间件（next 之后） | Interceptor.postHandle() |
| 5 | 全局中间件（next 之后） | Interceptor.afterCompletion() |
| 6 | - | Filter（逆序返回） |

> **提示：** 注意 Express 的中间件和 Spring Boot 的 Filter/Interceptor 在"请求后处理"的时机上有差异。Express 中 `next()` 之后的代码在响应发送前执行，而 Spring Boot 的 `afterCompletion()` 在响应发送后执行。

## 小结

本章深入对比了 Express 中间件和 Spring Boot 拦截机制：

- **Express 中间件**通过 `next()` 函数传递控制权，简洁灵活
- **Spring Boot** 提供两层拦截：**Filter**（Servlet 级别）和 **Interceptor**（Spring MVC 级别）
- 常见场景（日志、认证、CORS、错误处理）在两个框架中都有成熟的解决方案
- Spring Boot 的 `@RestControllerAdvice` 提供了比 Express 更精细的异常分类处理能力
- 理解执行顺序是调试中间件问题的关键

> **下一步：** 下一章将进入数据持久化领域，对比 Node.js 和 Spring Boot 的数据库操作与 ORM 框架。
