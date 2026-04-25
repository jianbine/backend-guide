var e=`---
title: 认证与授权
chapter: 5
mindmap: ./mindmaps/05-auth.md
---

# 认证与授权

认证（Authentication）和授权（Authorization）是 API 安全的两大支柱。认证解决"你是谁"的问题，授权解决"你能做什么"的问题。本章将对比 Node.js 和 Spring Boot 中的认证授权实现方式。

## 核心概念

| 概念 | 说明 | 类比 |
|------|------|------|
| 认证（Authentication） | 验证用户身份 | 查验身份证 |
| 授权（Authorization） | 验证用户权限 | 检查门禁卡权限 |
| 身份凭证（Credentials） | 用户名/密码、Token 等 | 身份证、门禁卡 |
| 会话（Session） | 服务端维护的用户登录状态 | 登记表 |
| 令牌（Token） | 客户端持有的身份证明 | 临时通行证 |

## JWT 认证实现

JWT（JSON Web Token）是目前最流行的无状态认证方案。它由三部分组成：Header（头部）、Payload（载荷）、Signature（签名）。

### Node.js / jsonwebtoken 实现

\`\`\`bash
# 安装依赖
npm install jsonwebtoken bcryptjs
\`\`\`

\`\`\`javascript
// utils/jwt.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

// 生成 JWT
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// 验证 JWT
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// 密码哈希
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// 密码比对
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { generateToken, verifyToken, hashPassword, comparePassword };
\`\`\`

\`\`\`javascript
// middleware/auth.js
const { verifyToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;  // 将用户信息挂载到请求对象
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// 可选认证（不强制要求登录）
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = verifyToken(token);
    } catch (err) {
      // 忽略无效 token
    }
  }
  next();
}

module.exports = { authMiddleware, optionalAuth };
\`\`\`

\`\`\`javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const { generateToken, hashPassword, comparePassword } = require('../utils/jwt');
const { authMiddleware } = require('../middleware/auth');

// 模拟用户数据库
const users = [];

// POST /api/auth/register - 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 检查用户是否已存在
    if (users.find(u => u.username === username)) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const user = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      role: 'user'
    };
    users.push(user);

    const token = generateToken({ id: user.id, username: user.username, role: user.role });
    res.status(201).json({ token, user: { id: user.id, username, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login - 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, username: user.username, role: user.role });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me - 获取当前用户信息
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
\`\`\`

### Spring Boot / Spring Security JWT 实现

\`\`\`xml
<!-- pom.xml 添加依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
</dependency>
\`\`\`

\`\`\`java
// src/main/java/com/example/demo/security/JwtUtil.java
package com.example.demo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("\${jwt.secret}")
    private String secret;

    @Value("\${jwt.expiration}")
    private long expirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // 生成 JWT
    public String generateToken(String username, Long userId, String role) {
        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // 验证并解析 JWT
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // 从 Token 中提取用户名
    public String getUsername(String token) {
        return parseToken(token).getSubject();
    }

    // 验证 Token 是否有效
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
\`\`\`

\`\`\`java
// src/main/java/com/example/demo/security/JwtAuthenticationFilter.java
package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractToken(request);

        if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
            Claims claims = jwtUtil.parseToken(token);

            // 构建认证对象
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    claims.getSubject(),  // principal（用户名）
                    null,                 // credentials（不需要密码）
                    List.of()             // authorities（权限列表）
                );

            // 设置到安全上下文
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
\`\`\`

\`\`\`java
// src/main/java/com/example/demo/security/SecurityConfig.java
package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 禁用 CSRF（前后端分离项目不需要）
            .csrf(csrf -> csrf.disable())
            // 无状态会话（JWT 不需要 Session）
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 配置访问权限
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()       // 认证接口公开
                .requestMatchers("/api/public/**").permitAll()    // 公开接口
                .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()  // GET 公开
                .requestMatchers("/api/admin/**").hasRole("ADMIN") // 仅管理员
                .anyRequest().authenticated()                     // 其他需要认证
            )
            // 添加 JWT 过滤器
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
\`\`\`

\`\`\`java
// src/main/java/com/example/demo/controller/AuthController.java
package com.example.demo.controller;

import com.example.demo.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String email = body.get("email");

        // 检查用户是否已存在（实际项目中查询数据库）
        // if (userRepository.existsByUsername(username)) { ... }

        String hashedPassword = passwordEncoder.encode(password);
        // 保存用户到数据库...

        String token = jwtUtil.generateToken(username, 1L, "USER");
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "token", token,
            "user", Map.of("id", 1, "username", username, "email", email)
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        // 查询用户（实际项目中查询数据库）
        // User user = userRepository.findByUsername(username).orElseThrow();

        // 验证密码
        // if (!passwordEncoder.matches(password, user.getPassword())) { ... }

        String token = jwtUtil.generateToken(username, 1L, "USER");
        return ResponseEntity.ok(Map.of(
            "token", token,
            "user", Map.of("id", 1, "username", username, "role", "USER")
        ));
    }
}
\`\`\`

### JWT 实现对照

| 功能 | Node.js (jsonwebtoken) | Spring Boot (jjwt + Spring Security) |
|------|----------------------|--------------------------------------|
| 生成 Token | \`jwt.sign(payload, secret, options)\` | \`Jwts.builder()...signWith().compact()\` |
| 验证 Token | \`jwt.verify(token, secret)\` | \`Jwts.parser().verifyWith().build().parseSignedClaims()\` |
| 密码哈希 | \`bcrypt.hash(password, salt)\` | \`BCryptPasswordEncoder.encode()\` |
| 密码比对 | \`bcrypt.compare(password, hash)\` | \`BCryptPasswordEncoder.matches()\` |
| 认证中间件 | 自定义 \`authMiddleware\` | \`JwtAuthenticationFilter\` |
| 权限配置 | 手动检查 \`req.user.role\` | \`@PreAuthorize\` / \`SecurityFilterChain\` |
| Token 过期处理 | 捕获 \`TokenExpiredError\` | 捕获 \`ExpiredJwtException\` |

## Session 认证对比

### Node.js / express-session

\`\`\`javascript
const session = require('express-session');

app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,  // 24 小时
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  },
  store: new RedisStore({ client: redisClient })  // 生产环境使用 Redis
}));

// 登录
app.post('/login', (req, res) => {
  // 验证用户...
  req.session.userId = user.id;
  req.session.userRole = user.role;
  res.json({ message: 'Login successful' });
});

// 获取会话信息
app.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ userId: req.session.userId, role: req.session.userRole });
});

// 登出
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});
\`\`\`

### Spring Boot Session

\`\`\`java
// application.properties
spring.session.store-type=jdbc
spring.session.jdbc.initialize-schema=always
# 或使用 Redis
# spring.session.store-type=redis
# spring.data.redis.host=localhost
# spring.data.redis.port=6379
\`\`\`

\`\`\`java
// SecurityConfig.java 中启用 Session
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .sessionManagement(session ->
            session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                  .maximumSessions(1)  // 限制单设备登录
                  .maxSessionsPreventsLogin(false)  // 新登录踢掉旧会话
        );
    return http.build();
}
\`\`\`

### Session vs JWT 对比

| 特性 | Session | JWT |
|------|---------|-----|
| 状态 | 有状态（服务端存储） | 无状态（客户端存储） |
| 存储位置 | 服务端（内存/Redis/数据库） | 客户端（LocalStorage/Cookie） |
| 扩展性 | 需要共享存储（Redis） | 天然支持水平扩展 |
| 安全性 | 可随时使会话失效 | 无法主动使 Token 失效（除非使用黑名单） |
| 跨域 | 需要配置 Cookie 跨域 | 天然支持跨域 |
| 适用场景 | 传统 Web 应用 | 前后端分离 / 移动端 API |

> **提示：** 对于前后端分离的项目，推荐使用 JWT。对于传统的服务端渲染项目，Session 更简单直接。

## Spring Security 过滤器链

Spring Security 的核心是一个过滤器链（Filter Chain），每个请求都会经过一系列的安全过滤器：

\`\`\`
HTTP Request
    │
    ▼
┌─────────────────────────────────┐
│ SecurityFilterChain              │
│                                  │
│  1. DisableEncodeUrlFilter       │
│  2. WebAsyncManagerIntegration   │
│  3. SecurityContextHolderFilter  │
│  4. CorsFilter                   │
│  5. CsrfFilter                   │
│  6. LogoutFilter                 │
│  7. UsernamePasswordAuthFilter   │
│  8. BasicAuthFilter              │
│  9. JwtAuthenticationFilter ←─── 自定义 JWT 过滤器插入位置
│ 10. ExceptionTranslationFilter   │
│ 11. SessionManagementFilter      │
└─────────────────────────────────┘
    │
    ▼
HTTP Response
\`\`\`

> **注意：** 自定义的 \`JwtAuthenticationFilter\` 应该添加在 \`UsernamePasswordAuthenticationFilter\` 之前，这样 JWT 认证才能在默认的表单认证之前生效。

## 角色权限控制

### Node.js 实现

\`\`\`javascript
// middleware/rbac.js
function checkRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// 使用
app.delete('/users/:id',
  authMiddleware,                    // 先验证身份
  checkRole('admin'),                // 再检查权限
  (req, res) => {
    res.json({ message: 'User deleted' });
  }
);

// 资源所有权检查
function checkOwnership(model) {
  return async (req, res, next) => {
    const resource = await model.findByPk(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Not found' });
    if (resource.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not the owner' });
    }
    req.resource = resource;
    next();
  };
}
\`\`\`

### Spring Boot 实现

\`\`\`java
// 方式一：在 SecurityConfig 中配置
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(auth -> auth
        .requestMatchers("/api/admin/**").hasRole("ADMIN")
        .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
        .requestMatchers("/api/public/**").permitAll()
    );
    return http.build();
}

// 方式二：使用 @PreAuthorize 注解（更灵活）
@RestController
@RequestMapping("/api/posts")
public class PostController {

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        // 仅管理员可删除
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        // 普通用户和管理员都可创建
        return ResponseEntity.ok(post);
    }

    // 获取当前登录用户
    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(Map.of("username", userDetails.getUsername()));
    }
}

// 方式三：自定义权限检查
@Component("postSecurity")
public class PostSecurity {

    public boolean canModify(Long postId, String username) {
        // 检查用户是否是文章作者或管理员
        Post post = postRepository.findById(postId).orElseThrow();
        return post.getAuthor().getUsername().equals(username)
            || post.getAuthor().getRole() == Role.ADMIN;
    }
}

// 在 Controller 中使用
@PreAuthorize("@postSecurity.canModify(#id, authentication.name)")
@PutMapping("/{id}")
public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Post post) {
    return ResponseEntity.ok(post);
}
\`\`\`

### 权限控制对照

| 功能 | Node.js | Spring Boot |
|------|---------|-------------|
| 角色检查 | 自定义中间件 \`checkRole()\` | \`hasRole()\` / \`@PreAuthorize\` |
| 多角色检查 | \`checkRole('admin', 'moderator')\` | \`hasAnyRole('ADMIN', 'MODERATOR')\` |
| 资源所有权 | 自定义 \`checkOwnership()\` | \`@PreAuthorize\` + SpEL 表达式 |
| 获取当前用户 | \`req.user\` | \`@AuthenticationPrincipal\` / \`SecurityContextHolder\` |
| 权限拒绝响应 | \`res.status(403)\` | 自动返回 403（可自定义） |
| 未认证响应 | \`res.status(401)\` | 自动返回 401（可自定义） |

## 认证流程完整对比

### Node.js JWT 认证流程

\`\`\`
客户端                          服务器
  │                               │
  │  POST /api/auth/login         │
  │  { username, password }       │
  │ ─────────────────────────────>│
  │                               │  1. 查询用户
  │                               │  2. 验证密码 (bcrypt.compare)
  │                               │  3. 生成 JWT (jwt.sign)
  │  { token: "eyJhbG..." }       │
  │ <─────────────────────────────│
  │                               │
  │  GET /api/users               │
  │  Authorization: Bearer eyJ..  │
  │ ─────────────────────────────>│
  │                               │  1. 提取 Token
  │                               │  2. 验证 Token (jwt.verify)
  │                               │  3. 挂载用户信息 (req.user)
  │                               │  4. 执行路由处理函数
  │  { users: [...] }             │
  │ <─────────────────────────────│
\`\`\`

### Spring Boot JWT 认证流程

\`\`\`
客户端                          服务器
  │                               │
  │  POST /api/auth/login         │
  │  { username, password }       │
  │ ─────────────────────────────>│
  │                               │  1. 查询用户 (UserDetailsService)
  │                               │  2. 验证密码 (PasswordEncoder.matches)
  │                               │  3. 生成 JWT (JwtUtil.generateToken)
  │  { token: "eyJhbG..." }       │
  │ <─────────────────────────────│
  │                               │
  │  GET /api/users               │
  │  Authorization: Bearer eyJ..  │
  │ ─────────────────────────────>│
  │                               │  1. JwtAuthenticationFilter
  │                               │  2. 提取并验证 Token
  │                               │  3. 设置 SecurityContext
  │                               │  4. 检查权限 (authorizeHttpRequests)
  │                               │  5. 执行 Controller 方法
  │  { users: [...] }             │
  │ <─────────────────────────────│
\`\`\`

## 小结

本章对比了 Node.js 和 Spring Boot 的认证授权实现：

- **JWT 认证**在两个框架中实现思路一致：登录时签发 Token，后续请求携带 Token 验证身份
- **Spring Security** 提供了完整的安全框架，包括过滤器链、会话管理、权限控制等，但学习曲线较陡
- **Node.js** 的认证实现更加灵活和轻量，适合快速开发
- Spring Boot 的 \`@PreAuthorize\` 和 SpEL 表达式提供了比 Node.js 更声明式的权限控制方式
- 生产环境中，两个框架都需要配合 Redis 实现 Token 黑名单（用于登出和强制下线）

> **下一步：** 最后一章将学习部署与运维，让你的应用从开发环境走向生产环境。
`;export{e as default};