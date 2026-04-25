var e=`---
title: 路由与请求处理
chapter: 2
mindmap: ./mindmaps/02-routing.md
---

# 路由与请求处理

路由是后端 API 的骨架，定义了客户端如何与服务器交互。本章将从 RESTful API 设计原则出发，对比 Express 和 Spring MVC 的路由实现方式。

## RESTful API 设计原则

REST（Representational State Transfer）是一种 API 设计风格，核心思想是**用 HTTP 方法表达操作意图，用 URL 表达资源**。

### RESTful 设计规范

| HTTP 方法 | 操作 | URL 示例 | 说明 |
|-----------|------|---------|------|
| GET | 查询 | \`/api/users\` | 获取用户列表 |
| GET | 查询 | \`/api/users/1\` | 获取单个用户 |
| POST | 创建 | \`/api/users\` | 创建新用户 |
| PUT | 全量更新 | \`/api/users/1\` | 更新用户全部信息 |
| PATCH | 部分更新 | \`/api/users/1\` | 更新用户部分信息 |
| DELETE | 删除 | \`/api/users/1\` | 删除用户 |

> **提示：** URL 中使用名词复数形式表示资源集合（如 \`users\` 而不是 \`user\`），避免在 URL 中使用动词（如 \`/api/getUser\` 是不推荐的写法）。

## Express 路由

Express 使用简洁的函数式 API 定义路由：

\`\`\`javascript
// routes/users.js
const express = require('express');
const router = express.Router();

// GET /api/users - 获取用户列表
router.get('/', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  res.json({
    data: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
    page: Number(page),
    limit: Number(limit)
  });
});

// GET /api/users/:id - 获取单个用户
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id, name: 'Alice', email: 'alice@example.com' });
});

// POST /api/users - 创建用户
router.post('/', (req, res) => {
  const { name, email } = req.body;
  const newUser = { id: 3, name, email };
  res.status(201).json(newUser);
});

// PUT /api/users/:id - 更新用户
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  res.json({ id, name, email });
});

// DELETE /api/users/:id - 删除用户
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(204).send();
});

module.exports = router;
\`\`\`

\`\`\`javascript
// app.js
const express = require('express');
const app = express();

app.use(express.json()); // 解析 JSON 请求体
app.use('/api/users', require('./routes/users'));

app.listen(3000);
\`\`\`

## Spring MVC 路由

Spring Boot 使用注解来定义路由，功能等价于 Express 的路由系统：

\`\`\`java
// src/main/java/com/example/demo/controller/UserController.java
package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    // GET /api/users - 获取用户列表
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        List<Map<String, Object>> users = List.of(
            Map.of("id", 1, "name", "Alice"),
            Map.of("id", 2, "name", "Bob")
        );

        return ResponseEntity.ok(Map.of(
            "data", users,
            "page", page,
            "limit", limit
        ));
    }

    // GET /api/users/{id} - 获取单个用户
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable Long id) {
        Map<String, Object> user = Map.of(
            "id", id,
            "name", "Alice",
            "email", "alice@example.com"
        );
        return ResponseEntity.ok(user);
    }

    // POST /api/users - 创建用户
    @PostMapping
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        Map<String, Object> newUser = Map.of("id", 3, "name", name, "email", email);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    // PUT /api/users/{id} - 更新用户
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Map<String, Object> updatedUser = Map.of(
            "id", id,
            "name", body.get("name"),
            "email", body.get("email")
        );
        return ResponseEntity.ok(updatedUser);
    }

    // DELETE /api/users/{id} - 删除用户
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
}
\`\`\`

## 路由定义对比

| 概念 | Express | Spring MVC |
|------|---------|------------|
| 路由前缀 | \`router = express.Router()\` + \`app.use('/api/users', router)\` | \`@RequestMapping("/api/users")\` |
| GET 路由 | \`router.get('/path', handler)\` | \`@GetMapping("/path")\` |
| POST 路由 | \`router.post('/path', handler)\` | \`@PostMapping("/path")\` |
| PUT 路由 | \`router.put('/path', handler)\` | \`@PutMapping("/path")\` |
| DELETE 路由 | \`router.delete('/path', handler)\` | \`@DeleteMapping("/path")\` |
| 路径参数 | \`req.params.id\` | \`@PathVariable Long id\` |
| 查询参数 | \`req.query.page\` | \`@RequestParam int page\` |
| 请求体 | \`req.body\` | \`@RequestBody\` |
| 返回 JSON | \`res.json(data)\` | 返回对象，自动序列化为 JSON |
| 设置状态码 | \`res.status(201).json(data)\` | \`ResponseEntity.status(201).body(data)\` |

## HTTP 方法映射详解

### GET 请求

\`\`\`javascript
// Express - 获取查询参数
app.get('/search', (req, res) => {
  const keyword = req.query.keyword;  // /search?keyword=java
  const page = req.query.page || 1;
  res.json({ keyword, page });
});
\`\`\`

\`\`\`java
// Spring Boot - 获取查询参数
@GetMapping("/search")
public ResponseEntity<Map<String, Object>> search(
        @RequestParam String keyword,
        @RequestParam(defaultValue = "1") int page) {
    return ResponseEntity.ok(Map.of("keyword", keyword, "page", page));
}
\`\`\`

### POST 请求

\`\`\`javascript
// Express - 获取请求体
app.post('/users', (req, res) => {
  const { name, email, age } = req.body;
  // 创建用户逻辑...
  res.status(201).json({ name, email, age, id: 1 });
});
\`\`\`

\`\`\`java
// Spring Boot - 使用 DTO 接收请求体
public record CreateUserRequest(String name, String email, int age) {}

@PostMapping("/users")
public ResponseEntity<User> createUser(@RequestBody CreateUserRequest request) {
    User user = new User(request.name(), request.email(), request.age());
    user.setId(1L);
    return ResponseEntity.status(HttpStatus.CREATED).body(user);
}
\`\`\`

> **提示：** Spring Boot 推荐使用 DTO（Data Transfer Object）或 Java Record 来接收请求体，而不是直接使用 \`Map\`。这样可以获得类型安全和自动参数校验。

### PUT / PATCH 请求

\`\`\`javascript
// Express
app.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  res.json({ id, ...updates });
});
\`\`\`

\`\`\`java
// Spring Boot
@PutMapping("/users/{id}")
public ResponseEntity<User> updateUser(
        @PathVariable Long id,
        @RequestBody UpdateUserRequest request) {
    User updated = userService.update(id, request);
    return ResponseEntity.ok(updated);
}
\`\`\`

### DELETE 请求

\`\`\`javascript
// Express
app.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  // 删除逻辑...
  res.status(204).send();
});
\`\`\`

\`\`\`java
// Spring Boot
@DeleteMapping("/users/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.delete(id);
    return ResponseEntity.noContent().build();
}
\`\`\`

## 参数获取方式对比

### 路径参数（Path Parameter）

\`\`\`javascript
// Express: /api/users/123/posts/456
app.get('/users/:userId/posts/:postId', (req, res) => {
  const { userId, postId } = req.params;
  res.json({ userId, postId });
});
\`\`\`

\`\`\`java
// Spring Boot: /api/users/123/posts/456
@GetMapping("/users/{userId}/posts/{postId}")
public ResponseEntity<Map<String, Long>> getPost(
        @PathVariable Long userId,
        @PathVariable Long postId) {
    return ResponseEntity.ok(Map.of("userId", userId, "postId", postId));
}
\`\`\`

### 查询参数（Query Parameter）

\`\`\`javascript
// Express: /api/users?role=admin&sort=name&order=asc
app.get('/users', (req, res) => {
  const role = req.query.role;       // "admin"
  const sort = req.query.sort;       // "name"
  const order = req.query.order;     // "asc"
  res.json({ role, sort, order });
});
\`\`\`

\`\`\`java
// Spring Boot: /api/users?role=admin&sort=name&order=asc
@GetMapping("/users")
public ResponseEntity<Map<String, String>> getUsers(
        @RequestParam(required = false) String role,
        @RequestParam(defaultValue = "id") String sort,
        @RequestParam(defaultValue = "asc") String order) {
    return ResponseEntity.ok(Map.of("role", role, "sort", sort, "order", order));
}
\`\`\`

### 请求头（Header）

\`\`\`javascript
// Express
app.get('/profile', (req, res) => {
  const token = req.headers.authorization;
  const userAgent = req.headers['user-agent'];
  res.json({ token, userAgent });
});
\`\`\`

\`\`\`java
// Spring Boot
@GetMapping("/profile")
public ResponseEntity<Map<String, String>> getProfile(
        @RequestHeader(value = "Authorization", required = false) String token,
        @RequestHeader("User-Agent") String userAgent) {
    return ResponseEntity.ok(Map.of("token", token, "userAgent", userAgent));
}
\`\`\`

### 请求体（Body）

\`\`\`javascript
// Express - 需要中间件解析
app.use(express.json());

app.post('/data', (req, res) => {
  const { title, content, tags } = req.body;
  res.json({ title, content, tags });
});
\`\`\`

\`\`\`java
// Spring Boot - 自动解析 JSON
public record ArticleRequest(String title, String content, List<String> tags) {}

@PostMapping("/data")
public ResponseEntity<ArticleRequest> createArticle(@RequestBody ArticleRequest request) {
    return ResponseEntity.ok(request);
}
\`\`\`

## 请求/响应对象对比

### 请求对象

| 功能 | Express (\`req\`) | Spring MVC |
|------|-----------------|------------|
| 路径参数 | \`req.params.id\` | \`@PathVariable\` |
| 查询参数 | \`req.query.page\` | \`@RequestParam\` |
| 请求头 | \`req.headers['key']\` | \`@RequestHeader\` |
| 请求体 | \`req.body\` | \`@RequestBody\` |
| 请求方法 | \`req.method\` | 注解指定（\`@GetMapping\` 等） |
| 请求路径 | \`req.path\` | \`HttpServletRequest.getRequestURI()\` |
| 客户端 IP | \`req.ip\` | \`HttpServletRequest.getRemoteAddr()\` |
| Cookies | \`req.cookies\` | \`@CookieValue\` |

### 响应对象

| 功能 | Express (\`res\`) | Spring MVC |
|------|-----------------|------------|
| 返回 JSON | \`res.json(data)\` | 返回对象（自动序列化） |
| 设置状态码 | \`res.status(201)\` | \`ResponseEntity.status(201)\` |
| 设置响应头 | \`res.set('X-Custom', 'value')\` | \`@ResponseHeader\` 或 \`HttpHeaders\` |
| 重定向 | \`res.redirect('/new-url')\` | \`RedirectView\` 或 \`redirect:/new-url\` |
| 设置 Cookie | \`res.cookie('key', 'value')\` | \`@CookieValue\` 或 \`HttpServletResponse\` |
| 发送文件 | \`res.sendFile(path)\` | \`ResponseEntity<Resource>\` |

### 响应方式对比

\`\`\`javascript
// Express - 多种响应方式
// 1. 返回 JSON
res.json({ message: 'success' });

// 2. 返回带状态码的 JSON
res.status(201).json({ id: 1, name: 'Alice' });

// 3. 返回纯文本
res.send('Hello World');

// 4. 重定向
res.redirect('/login');

// 5. 设置响应头
res.set('X-Custom-Header', 'my-value').json({ ok: true });
\`\`\`

\`\`\`java
// Spring Boot - 多种响应方式
// 1. 返回对象（自动序列化为 JSON，状态码 200）
@GetMapping("/simple")
public Map<String, String> simple() {
    return Map.of("message", "success");
}

// 2. 使用 ResponseEntity 控制状态码和响应头
@PostMapping("/created")
public ResponseEntity<Map<String, Object>> created() {
    Map<String, Object> body = Map.of("id", 1, "name", "Alice");
    return ResponseEntity
            .status(HttpStatus.CREATED)
            .header("X-Custom-Header", "my-value")
            .body(body);
}

// 3. 重定向
@GetMapping("/old-url")
public RedirectView redirect() {
    return new RedirectView("/login");
}

// 4. 返回纯文本
@GetMapping("/text")
public ResponseEntity<String> text() {
    return ResponseEntity.ok("Hello World");
}
\`\`\`

## 中间件/拦截器链概念引入

在 Express 中，请求会经过一系列中间件函数组成的"处理链"：

\`\`\`javascript
// Express 中间件链
app.use((req, res, next) => {
  console.log('1. 请求日志');
  next();
});

app.use((req, res, next) => {
  console.log('2. 认证检查');
  next();
});

app.get('/api/data', (req, res) => {
  console.log('3. 路由处理');
  res.json({ data: 'hello' });
});
// 输出顺序: 1 -> 2 -> 3
\`\`\`

Spring Boot 中也有类似的概念，通过 Filter 和 Interceptor 实现：

\`\`\`java
// Spring Boot - Filter（类似 Express 中间件）
@Component
public class LoggingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        System.out.println("1. 请求日志 (Filter)");
        chain.doFilter(request, response);  // 类似 next()
        System.out.println("1. 响应日志 (Filter)");
    }
}
\`\`\`

> **注意：** 中间件/拦截器的详细对比将在下一章深入讲解。这里只需要理解：两者都采用"链式处理"模式，请求按顺序经过多个处理步骤。

## 路由模块化组织

### Express 路由模块化

\`\`\`javascript
// routes/users.js
const router = require('express').Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

// app.js
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
\`\`\`

### Spring Boot 控制器分层

\`\`\`java
// Controller 层 - 处理 HTTP 请求
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // 构造器注入（类似 Node.js 的依赖注入）
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.findById(id);
    }
}

// Service 层 - 业务逻辑
@Service
public class UserService {
    public List<User> findAll() { /* ... */ }
    public User findById(Long id) { /* ... */ }
}
\`\`\`

| 组织方式 | Express | Spring Boot |
|---------|---------|-------------|
| 路由定义 | \`routes/\` 目录下的独立文件 | \`@RestController\` 注解的类 |
| 业务逻辑 | 通常写在路由处理函数中 | 独立的 \`@Service\` 层 |
| 数据访问 | 直接调用 ORM 或 Repository | 独立的 \`@Repository\` 层 |
| 依赖注入 | 手动 \`require()\` 或 DI 容器 | Spring IoC 容器自动注入 |

## 小结

本章学习了路由与请求处理的核心知识：

- **RESTful API** 设计原则在两个框架中通用
- **Express** 使用函数式 API（\`router.get\`、\`req.params\`），**Spring Boot** 使用注解式 API（\`@GetMapping\`、\`@PathVariable\`）
- 参数获取方式一一对应：路径参数、查询参数、请求头、请求体
- **ResponseEntity** 是 Spring Boot 中控制响应的利器，等价于 Express 的 \`res\` 对象
- 两者都支持路由模块化，但 Spring Boot 的分层架构更加明确

> **下一步：** 下一章我们将深入探讨中间件与拦截器，学习如何在请求处理链中添加日志、认证、错误处理等横切关注点。
`;export{e as default};