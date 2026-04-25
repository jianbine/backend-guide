var e=`---
title: 路由与请求处理
chapter: 2
mindmap: ./mindmaps/02-routing.md
---

# 路由与请求处理

## RESTful API 设计原则

### RESTful 设计规范

| HTTP 方法 | 操作 | URL 示例 | 说明 |
|-----------|------|----------|------|
| GET | 查询 | /api/users | 获取用户列表 |
| GET | 查询 | /api/users/1 | 获取单个用户 |
| POST | 创建 | /api/users | 创建新用户 |
| PUT | 全量更新 | /api/users/1 | 更新用户全部信息 |
| PATCH | 部分更新 | /api/users/1 | 更新用户部分信息 |
| DELETE | 删除 | /api/users/1 | 删除用户 |

## Express 路由

```javascript
const express = require('express')
const app = express()

// GET 路由
app.get('/api/users', (req, res) => {
  res.json({ users: [] })
})

// POST 路由
app.post('/api/users', (req, res) => {
  const { name, email } = req.body
  res.status(201).json({ id: 1, name, email })
})

// 路径参数
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params
  res.json({ id })
})

// 查询参数
app.get('/api/search', (req, res) => {
  const { q, page } = req.query
  res.json({ query: q, page })
})

app.listen(3000)
```

## Spring MVC 路由

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    public List<User> getUsers() {
        return userService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }

    @GetMapping("/search")
    public Page<User> search(
        @RequestParam String q,
        @RequestParam(defaultValue = "0") int page
    ) {
        return userService.search(q, page);
    }
}
```

## 路由定义对比

| 概念 | Express | Spring MVC |
|------|---------|-------------|
| 路由前缀 | router = express.Router() + app.use('/api/users', router) | @RequestMapping("/api/users") |
| GET 路由 | router.get('/path', handler) | @GetMapping("/path") |
| POST 路由 | router.post('/path', handler) | @PostMapping("/path") |
| PUT 路由 | router.put('/path', handler) | @PutMapping("/path") |
| DELETE 路由 | router.delete('/path', handler) | @DeleteMapping("/path") |
| 路径参数 | req.params.id | @PathVariable Long id |
| 查询参数 | req.query.page | @RequestParam int page |
| 请求体 | req.body | @RequestBody |
| 返回 JSON | res.json(data) | 返回对象，自动序列化为 JSON |
| 设置状态码 | res.status(201).json(data) | ResponseEntity.status(201).body(data) |

## HTTP 方法映射详解

### GET 请求

::: code-group

```javascript[Express]
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id))
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json(user)
})
```

```java[Spring Boot]
@GetMapping("/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    User user = userService.findById(id);
    if (user == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(user);
}
```

:::

### POST 请求

::: code-group

```javascript[Express]
app.post('/api/users', (req, res) => {
  const { name, email } = req.body
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' })
  }
  const user = { id: nextId++, name, email }
  users.push(user)
  res.status(201).json(user)
})
```

```java[Spring Boot]
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public User create(@RequestBody User user) {
    if (user.getName() == null || user.getEmail() == null) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }
    return userService.save(user);
}
```

:::

### PUT / PATCH 请求

::: code-group

```javascript[Express]
app.put('/api/users/:id', (req, res) => {
  const { name, email } = req.body
  const user = users.find(u => u.id === parseInt(req.params.id))
  if (!user) return res.status(404).json({ error: 'Not found' })
  Object.assign(user, { name, email })
  res.json(user)
})
```

```java[Spring Boot]
@PutMapping("/{id}")
public User update(@PathVariable Long id, @RequestBody User data) {
    User user = userService.findById(id);
    if (user == null) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    user.setName(data.getName());
    user.setEmail(data.getEmail());
    return userService.save(user);
}
```

:::

### DELETE 请求

::: code-group

```javascript[Express]
app.delete('/api/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  users.splice(idx, 1)
  res.status(204).send()
})
```

```java[Spring Boot]
@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void delete(@PathVariable Long id) {
    if (!userService.existsById(id)) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    userService.deleteById(id);
}
```

:::

## 参数获取方式对比

### 路径参数（Path Parameter）

::: code-group

```javascript[Express]
// /api/users/:id
req.params.id  // "42"（字符串）
```

```java[Spring Boot]
// /api/users/{id}
@PathVariable Long id  // 42L（Long 类型）
```

:::

### 查询参数（Query Parameter）

::: code-group

```javascript[Express]
// /api/users?page=1&size=10
req.query.page    // "1"
req.query.size    // "10"
```

```java[Spring Boot]
// /api/users?page=1&size=10
@RequestParam(defaultValue = "0") int page
@RequestParam(defaultValue = "10") int size
```

:::

### 请求头（Header）

::: code-group

```javascript[Express]
req.headers['authorization']  // "Bearer xxx"
```

```java[Spring Boot]
@RequestHeader("Authorization") String auth
```

:::

### 请求体（Body）

::: code-group

```javascript[Express]
app.use(express.json())  // 需要中间件解析
req.body  // { name: "张三", email: "zhangsan@example.com" }
```

```java[Spring Boot]
@RequestBody User user  // 自动反序列化为 User 对象
```

:::

## 请求/响应对象对比

### 请求对象

| 功能 | Express (req) | Spring MVC |
|------|-------------|-------------|
| 路径参数 | req.params.id | @PathVariable |
| 查询参数 | req.query.page | @RequestParam |
| 请求头 | req.headers['key'] | @RequestHeader |
| 请求体 | req.body | @RequestBody |
| 请求方法 | req.method | 注解指定（@GetMapping 等）|
| 请求路径 | req.path | HttpServletRequest.getRequestURI() |
| 客户端 IP | req.ip | HttpServletRequest.getRemoteAddr() |
| Cookies | req.cookies | @CookieValue |

### 响应对象

| 功能 | Express (res) | Spring MVC |
|------|-------------|-------------|
| 返回 JSON | res.json(data) | 返回对象（自动序列化）|
| 设置状态码 | res.status(201) | ResponseEntity.status(201) |
| 设置响应头 | res.set('X-Custom', 'value') | @ResponseHeader 或 HttpHeaders |
| 重定向 | res.redirect('/new-url') | RedirectView 或 redirect:/new-url |
| 设置 Cookie | res.cookie('key', 'value') | @CookieValue 或 HttpServletResponse |
| 发送文件 | res.sendFile(path) | ResponseEntity<Resource> |

### 响应方式对比

::: code-group

```javascript[Express - 多种响应方式]
// 返回 JSON
res.json({ success: true })

// 返回状态码
res.status(201).json({ id: 1 })

// 重定向
res.redirect('/users')

// 返回文件
res.sendFile(path.join(__dirname, 'report.pdf'))

// 返回错误
res.status(500).json({ error: 'Internal error' })
```

```java[Spring Boot - 多种响应方式]
// 返回 JSON（直接返回对象）
@GetMapping
public User getUser() { return user; }

// 使用 ResponseEntity 控制响应
@GetMapping("/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    return ResponseEntity.ok(user);
}

// 重定向
@GetMapping("/old")
public String redirect() { return "redirect:/new"; }

// 返回文件
@GetMapping("/report")
public ResponseEntity<Resource> getReport() {
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .body(new FileSystemResource("report.pdf"));
}

// 返回错误
@GetMapping("/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    return ResponseEntity.notFound().build();
}
```

:::

## 中间件/拦截器链概念引入

> 📌 在 Express 中，请求通过一系列中间件处理后到达路由处理函数。在 Spring Boot 中，类似的概念是拦截器（Interceptor）和过滤器（Filter）。下一章将详细对比。

## 路由模块化组织

### Express 路由模块化

```javascript
// routes/userRoutes.js
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => res.json({ users: [] }))
router.get('/:id', (req, res) => res.json({ id: req.params.id }))
router.post('/', (req, res) => res.status(201).json({ created: true }))

module.exports = router

// app.js
const userRoutes = require('./routes/userRoutes')
app.use('/api/users', userRoutes)
```

### Spring Boot 控制器分层

```java
// Controller 层
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAll() { return userService.findAll(); }

    @PostMapping
    public User create(@RequestBody User user) {
        return userService.save(user);
    }
}

// Service 层
@Service
public class UserService {
    private final UserRepository repo;

    @Autowired
    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public List<User> findAll() { return repo.findAll(); }
    public User save(User user) { return repo.save(user); }
}
```

## 路由模块化组织对比

| 组织方式 | Express | Spring Boot |
|---------|---------|-------------|
| 路由定义 | routes/ 目录下的独立文件 | @RestController 注解的类 |
| 业务逻辑 | 通常写在路由处理函数中 | 独立的 @Service 层 |
| 数据访问 | 直接调用 ORM 或 Repository | 独立的 @Repository 层 |
| 依赖注入 | 手动 require() 或 DI 容器 | Spring IoC 容器自动注入 |

## 小结

- RESTful API 设计原则在两个框架中通用
- Express 使用函数式 API（router.get、req.params），Spring Boot 使用注解式 API（@GetMapping、@PathVariable）
- 参数获取方式一一对应：路径参数、查询参数、请求头、请求体
- ResponseEntity 是 Spring Boot 中控制响应的利器，等价于 Express 的 res 对象
- 两者都支持路由模块化，但 Spring Boot 的分层架构更加明确

> 🚀 **下一步**：[中间件与拦截器](/chapter/03-middleware)
`
export default{render(){return{}}};