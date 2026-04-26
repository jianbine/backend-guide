---
title: 接口进阶实战
chapter: 11
---

# 接口进阶实战

## 核心概念

### 为什么需要进阶？

前几章学习了基础的 CRUD 和认证，但在实际项目中，你还会遇到这些高频场景：

| 场景 | 说明 | 频率 |
|------|------|------|
| 实时通信 | 聊天、通知、实时数据推送 | ⭐⭐⭐⭐⭐ |
| 文件上传 | 头像、附件、导入导出 | ⭐⭐⭐⭐⭐ |
| 接口限流 | 防止恶意请求、保护服务 | ⭐⭐⭐⭐ |
| 全局异常处理 | 统一错误格式、日志记录 | ⭐⭐⭐⭐⭐ |
| 参数校验 | 防止非法输入、数据安全 | ⭐⭐⭐⭐⭐ |
| 接口文档 | 团队协作、前后端对接 | ⭐⭐⭐⭐ |

## WebSocket 实时通信

### Node.js 实现（Socket.io）

```bash
npm install socket.io
```

```javascript
const { Server } = require('socket.io')

const io = new Server(httpServer, {
  cors: { origin: '*' },
})

// 连接管理
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  // 加入房间
  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-joined', { userId: socket.id })
  })

  // 发送消息
  socket.on('send-message', ({ roomId, message }) => {
    io.to(roomId).emit('new-message', {
      userId: socket.id,
      message,
      timestamp: Date.now(),
    })
  })

  // 断开连接
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
  })
})
```

### Spring Boot 实现（STOMP over WebSocket）

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/chat").withSockJS();
    }
}
```

```java
@Controller
public class ChatController {

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return message;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage message,
                               SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", message.getSender());
        return message;
    }
}
```

## 文件上传

### Node.js 实现（Multer）

```bash
npm install multer
```

```javascript
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, allowed.includes(ext))
  },
})

// 单文件上传
app.post('/upload', upload.single('avatar'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` })
})

// 多文件上传
app.post('/upload/multiple', upload.array('files', 10), (req, res) => {
  const urls = req.files.map(f => `/uploads/${f.filename}`)
  res.json({ urls })
})
```

### Spring Boot 实现

```java
@RestController
@RequestMapping("/api")
public class FileController {

    @Value("${upload.path}")
    private String uploadPath;

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> upload(
            @RequestParam("file") MultipartFile file) throws IOException {

        // 文件校验
        if (file.isEmpty()) {
            throw new BadRequestException("文件不能为空");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("文件大小不能超过 5MB");
        }

        // 保存文件
        String filename = UUID.randomUUID() + getExtension(file);
        Path path = Paths.get(uploadPath, filename);
        Files.createDirectories(path.getParent());
        file.transferTo(path);

        return ResponseEntity.ok(new UploadResponse("/uploads/" + filename));
    }

    @PostMapping("/upload/multiple")
    public ResponseEntity<List<UploadResponse>> uploadMultiple(
            @RequestParam("files") MultipartFile[] files) throws IOException {
        List<UploadResponse> results = new ArrayList<>();
        for (MultipartFile file : files) {
            String filename = UUID.randomUUID() + getExtension(file);
            Path path = Paths.get(uploadPath, filename);
            Files.createDirectories(path.getParent());
            file.transferTo(path);
            results.add(new UploadResponse("/uploads/" + filename));
        }
        return ResponseEntity.ok(results);
    }
}
```

```properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=50MB
upload.path=./uploads
```

## 接口限流

### Node.js 实现（express-rate-limit）

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit')

// 全局限流
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个IP最多100次请求
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', globalLimiter)

// 针对登录接口的严格限流
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 15分钟内最多5次登录尝试
  message: { error: '登录尝试过多，请15分钟后再试' },
})

app.post('/api/login', loginLimiter, loginHandler)
```

### Spring Boot 实现（Bucket4j）

```xml
<dependency>
  <groupId>com.github.vladimir-bukhtoyarov</groupId>
  <artifactId>bucket4j-core</artifactId>
  <version>7.6.0</version>
</dependency>
```

```java
@Configuration
public class RateLimitConfig {

    @Bean
    public Bucket bucket() {
        return Bucket.builder()
            .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(15))))
            .build();
    }
}
```

```java
@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private Bucket bucket;

    @GetMapping("/data")
    public ResponseEntity<?> getData() {
        if (bucket.tryConsume(1)) {
            return ResponseEntity.ok(dataService.findAll());
        }
        return ResponseEntity.status(429).body(Map.of("error", "请求过于频繁，请稍后再试"));
    }
}
```

## 全局异常处理

### Node.js 实现

```javascript
// 统一错误类
class AppError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
  }
}

// 全局错误中间件（必须放在所有路由之后）
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})
```

### Spring Boot 实现

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.toList());
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "参数校验失败", errors));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse(404, ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(500)
            .body(new ErrorResponse(500, "服务器内部错误"));
    }
}
```

## 参数校验

### Node.js 实现（Zod）

```bash
npm install zod
```

```javascript
const { z } = require('zod')

const createUserSchema = z.object({
  name: z.string().min(2, '名称至少2个字符').max(50),
  email: z.string().email('邮箱格式不正确'),
  age: z.number().int().min(1).max(150).optional(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
})

// 在路由中使用
app.post('/api/users', (req, res) => {
  const result = createUserSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      error: '参数校验失败',
      details: result.error.flatten().fieldErrors,
    })
  }
  // result.data 是校验后的安全数据
  const user = userService.create(result.data)
  res.status(201).json(user)
})
```

### Spring Boot 实现（Bean Validation）

```java
public class CreateUserRequest {

    @NotBlank(message = "名称不能为空")
    @Size(min = 2, max = 50, message = "名称长度为2-50个字符")
    private String name;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @Min(value = 1, message = "年龄最小为1")
    @Max(value = 150, message = "年龄最大为150")
    private Integer age;

    @Pattern(regexp = "admin|user|guest", message = "角色值不合法")
    private String role = "user";
}
```

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @PostMapping
    public ResponseEntity<User> create(@Valid @RequestBody CreateUserRequest request) {
        // 校验通过后才会执行
        User user = userService.create(request);
        return ResponseEntity.status(201).body(user);
    }
}
```

## 接口文档

### Node.js（Swagger / OpenAPI）

```bash
npm install swagger-ui-express swagger-jsdoc
```

```javascript
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'My API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.js'],
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(options)))
```

### Spring Boot（Springdoc OpenAPI）

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.3.0</version>
</dependency>
```

```java
@Tag(name = "用户管理", description = "用户相关接口")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Operation(summary = "获取用户列表", description = "分页获取所有用户")
    @GetMapping
    public ResponseEntity<Page<User>> getUsers(
            @Parameter(description = "页码") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.findAll(page, size));
    }
}
```

访问 `http://localhost:8080/swagger-ui.html` 查看文档。

## 知识迁移要点

### 相似点

| 概念 | Node.js | Spring Boot |
|------|---------|-------------|
| WebSocket | Socket.io | STOMP over WebSocket |
| 文件上传 | Multer | MultipartFile |
| 限流 | express-rate-limit | Bucket4j |
| 异常处理 | 错误中间件 | @RestControllerAdvice |
| 参数校验 | Zod / Joi | Bean Validation |
| 接口文档 | swagger-jsdoc | Springdoc OpenAPI |

### 差异点

| 维度 | Node.js | Spring Boot |
|------|---------|-------------|
| WebSocket | Socket.io 自动重连、房间 | STOMP 协议更标准 |
| 文件处理 | Stream 流式处理 | MultipartFile 内存/磁盘 |
| 限流粒度 | 中间件级别 | 注解 + AOP 更灵活 |
| 校验方式 | Schema 库（Zod） | 注解驱动（@Valid） |
| 文档集成 | 需要手动配置 | 自动扫描注解生成 |

## 小结

- **WebSocket**：Node.js 用 Socket.io（更简单），Spring Boot 用 STOMP（更标准）
- **文件上传**：注意文件大小限制、类型校验、存储路径安全
- **接口限流**：保护服务的第一道防线，推荐按接口分级限流
- **全局异常处理**：统一错误格式，避免敏感信息泄露
- **参数校验**：永远不要信任客户端输入，前后端都要校验
- **接口文档**：Swagger/OpenAPI 是团队协作的标配
