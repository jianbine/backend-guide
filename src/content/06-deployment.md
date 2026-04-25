---
title: 部署与运维
chapter: 6
mindmap: ./mindmaps/06-deployment.md
---

# 部署与运维

开发完成的应用需要部署到生产环境才能被用户访问。本章将对比 Node.js 和 Spring Boot 的部署方式，涵盖进程管理、容器化、环境变量、日志和监控等内容。

## 部署方式概览

| 部署方式 | Node.js | Spring Boot | 适用场景 |
|---------|---------|-------------|---------|
| 进程管理器 | PM2 | - | 传统服务器部署 |
| JAR 包部署 | - | `java -jar` | 传统服务器部署 |
| Docker 容器化 | Dockerfile | Dockerfile | 云原生部署 |
| 平台即服务 | Railway / Render / Vercel | Railway / Render | 快速部署 |
| Kubernetes | K8s Deployment | K8s Deployment | 大规模集群 |

## Node.js 部署

### PM2 进程管理

[PM2](https://pm2.keymetrics.io/) 是 Node.js 最流行的生产环境进程管理器。

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start index.js --name "my-api"

# 启动并指定集群模式（利用多核 CPU）
pm2 start index.js --name "my-api" -i max

# 查看运行状态
pm2 status
pm2 logs my-api

# 重启 / 停止
pm2 restart my-api
pm2 stop my-api
pm2 delete my-api

# 开机自启动
pm2 startup
pm2 save
```

```javascript
// ecosystem.config.js - PM2 配置文件
module.exports = {
  apps: [{
    name: 'my-api',
    script: './index.js',
    instances: 'max',          // 集群模式，使用所有 CPU 核心
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    merge_logs: true,
    max_memory_restart: '500M', // 内存超过 500M 自动重启
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

```bash
# 使用配置文件启动
pm2 start ecosystem.config.js --env production
```

### Nginx 反向代理

```nginx
# /etc/nginx/sites-available/my-api
server {
    listen 80;
    server_name api.example.com;

    # 请求体大小限制
    client_max_body_size 10M;

    # 代理到 Node.js 应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件（如果有）
    location /static/ {
        alias /var/www/my-api/static/;
        expires 30d;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/my-api /etc/nginx/sites-enabled/
sudo nginx -t          # 测试配置
sudo systemctl reload nginx
```

## Spring Boot 部署

### JAR 包部署

Spring Boot 应用可以打包为可执行的 "Fat JAR"（包含所有依赖）。

```bash
# 使用 Maven 打包
mvn clean package -DskipTests

# 生成的 JAR 文件位于 target/ 目录
ls target/*.jar
# target/my-app-1.0.0.jar

# 运行 JAR
java -jar target/my-app-1.0.0.jar

# 指定配置文件
java -jar target/my-app-1.0.0.jar --spring.profiles.active=prod

# 指定端口
java -jar target/my-app-1.0.0.jar --server.port=8080

# 后台运行
nohup java -jar target/my-app-1.0.0.jar > app.log 2>&1 &
```

```xml
<!-- pom.xml 中的打包配置 -->
<build>
    <finalName>my-app</finalName>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <executable>true</executable>  <!-- 使 JAR 可直接执行 -->
            </configuration>
        </plugin>
    </plugins>
</build>
```

### systemd 服务（Linux）

```ini
# /etc/systemd/system/my-app.service
[Unit]
Description=My Spring Boot Application
After=network.target

[Service]
Type=simple
User=appuser
Group=appuser
WorkingDirectory=/opt/my-app
ExecStart=/usr/bin/java -jar /opt/my-app/my-app.jar --spring.profiles.active=prod
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=my-app

# JVM 参数优化
Environment=JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC

[Install]
WantedBy=multi-user.target
```

```bash
# 管理服务
sudo systemctl daemon-reload
sudo systemctl start my-app
sudo systemctl status my-app
sudo systemctl stop my-app
sudo systemctl restart my-app
sudo systemctl enable my-app    # 开机自启

# 查看日志
sudo journalctl -u my-app -f
```

### Nginx 反向代理（Spring Boot）

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Docker 容器化

### Node.js Dockerfile

```dockerfile
# 多阶段构建
# 阶段一：安装依赖
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 阶段二：构建应用
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build  # 如果有 TypeScript 编译步骤

# 阶段三：运行
FROM node:20-alpine
WORKDIR /app

# 复制依赖和构建产物
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# 使用非 root 用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
USER appuser

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
```

### Spring Boot Dockerfile

```dockerfile
# 多阶段构建
# 阶段一：Maven 构建
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline  # 先下载依赖（利用 Docker 缓存）
COPY src ./src
RUN mvn clean package -DskipTests

# 阶段二：运行
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 复制 JAR 文件
COPY --from=builder /app/target/*.jar app.jar

# 使用非 root 用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
USER appuser

EXPOSE 8080

# JVM 参数优化
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:+UseContainerSupport"

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Node.js 应用
  node-app:
    build:
      context: ./node-app
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=3306
      - DB_NAME=myapp
      - DB_USER=root
      - DB_PASSWORD=password
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  # Spring Boot 应用
  spring-app:
    build:
      context: ./spring-app
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/myapp
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=password
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  # MySQL 数据库
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: myapp
    ports:
      - "3306:3306"
    volumes:
      - db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - node-app
      - spring-app
    restart: unless-stopped

volumes:
  db-data:
```

```bash
# 启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f

# 停止所有服务
docker compose down

# 停止并清除数据
docker compose down -v
```

## 环境变量管理

### Node.js 环境变量

```javascript
// 使用 dotenv 加载 .env 文件（开发环境）
// npm install dotenv
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'myapp',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
};
```

```bash
# .env 文件（不要提交到 Git）
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=myapp_dev
DB_USER=root
DB_PASSWORD=dev_password
JWT_SECRET=your-dev-secret
JWT_EXPIRES_IN=7d
```

```bash
# .env.production（生产环境）
PORT=3000
DB_HOST=prod-db.example.com
DB_NAME=myapp_prod
DB_USER=app_user
DB_PASSWORD=strong_production_password
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=1h
```

### Spring Boot 环境变量

```properties
# application.properties（默认配置）
server.port=8080
spring.application.name=my-app

# 使用环境变量占位符
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/myapp}
spring.datasource.username=${DB_USER:root}
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET:default-secret}
```

```properties
# application-prod.properties（生产环境配置）
spring.datasource.url=jdbc:mysql://prod-db:3306/myapp_prod
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
logging.level.root=WARN
logging.level.com.example.demo=INFO
```

```yaml
# application.yml（推荐 YAML 格式）
server:
  port: ${SERVER_PORT:8080}

spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  datasource:
    url: ${DB_URL:jdbc:mysql://localhost:3306/myapp}
    username: ${DB_USER:root}
    password: ${DB_PASSWORD}
```

### 环境变量管理对照

| 特性 | Node.js | Spring Boot |
|------|---------|-------------|
| 加载 .env 文件 | `dotenv` 库 | 无需（Spring Boot 原生支持） |
| 配置文件 | `.env` / `config/` | `application-{profile}.properties/yml` |
| Profile 切换 | `NODE_ENV=production` | `--spring.profiles.active=prod` |
| 默认值语法 | `process.env.PORT \|\| 3000` | `${PORT:8080}` |
| 类型转换 | 手动转换 | 自动转换（String/Int/Boolean） |
| 配置优先级 | 环境变量 > .env 文件 | 命令行参数 > 环境变量 > 配置文件 |

> **提示：** Spring Boot 的配置优先级（从高到低）：命令行参数 > 环境变量 > `application-{profile}.yml` > `application.yml`。这个优先级设计非常合理，方便在不同环境中覆盖配置。

## 日志配置

### Node.js 日志

```javascript
// 使用 winston 日志库
// npm install winston
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'my-api' },
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // 错误日志文件
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    // 所有日志文件
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// 使用
logger.info('Server started', { port: 3000 });
logger.warn('Deprecated API called', { endpoint: '/api/v1/users' });
logger.error('Database connection failed', { error: err.message, stack: err.stack });
```

### Spring Boot 日志

```yaml
# application.yml
logging:
  level:
    root: INFO
    com.example.demo: DEBUG
    org.springframework.web: INFO
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE

  file:
    name: logs/application.log
    max-size: 10MB
    max-history: 30

  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

```xml
<!-- pom.xml 添加 Logback 依赖（Spring Boot 默认已包含） -->
<!-- 如需使用 Log4j2，排除默认的 Logback -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```

```java
// 使用日志
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    public User createUser(User user) {
        log.info("Creating user: {}", user.getUsername());
        log.debug("User details: {}", user);
        log.warn("User created with default role");
        log.error("Failed to create user", exception);
        return user;
    }
}
```

### 日志配置对照

| 特性 | Node.js (winston) | Spring Boot (SLF4J + Logback) |
|------|-------------------|-------------------------------|
| 日志级别 | `error` < `warn` < `info` < `debug` | `ERROR` < `WARN` < `INFO` < `DEBUG` < `TRACE` |
| 日志格式 | 自定义 `format` | `logging.pattern.console/file` |
| 日志文件 | `File` transport | `logging.file.name` |
| 日志轮转 | `winston-daily-rotate-file` | 内置（`max-size` / `max-history`） |
| 结构化日志 | JSON 格式 | 自定义 Encoder |
| 上下文信息 | `defaultMeta` | MDC (Mapped Diagnostic Context) |

## 健康检查和监控

### Node.js 健康检查

```javascript
// routes/health.js
const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  };

  // 检查数据库连接
  try {
    await sequelize.authenticate();
    health.database = 'connected';
  } catch (err) {
    health.status = 'error';
    health.database = 'disconnected';
    return res.status(503).json(health);
  }

  // 检查内存使用
  const memUsage = process.memoryUsage();
  health.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
  };

  res.json(health);
});

module.exports = router;
```

### Spring Boot Actuator

Spring Boot Actuator 提供了开箱即用的监控端点。

```xml
<!-- pom.xml 添加 Actuator 依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```yaml
# application.yml - Actuator 配置
management:
  endpoints:
    web:
      exposure:
        include: health, info, metrics, env
      base-path: /actuator
  endpoint:
    health:
      show-details: always
      show-components: always
  info:
    env:
      enabled: true

info:
  app:
    name: My API
    version: 1.0.0
    description: Spring Boot API Application
```

```java
// 自定义健康检查
@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    private final DataSource dataSource;

    public DatabaseHealthIndicator(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public Health health() {
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(2)) {
                return Health.up()
                        .withDetail("database", "MySQL")
                        .withDetail("status", "connected")
                        .build();
            }
        } catch (SQLException e) {
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
        return Health.down().build();
    }
}
```

```bash
# 访问监控端点
curl http://localhost:8080/actuator/health
# {"status":"UP","components":{"db":{"status":"UP"},"diskSpace":{"status":"UP"}}}

curl http://localhost:8080/actuator/info
# {"app":{"name":"My API","version":"1.0.0"}}

curl http://localhost:8080/actuator/metrics
# {"names":["jvm.memory.used","http.server.requests",...]}
```

### 监控端点对照

| 监控项 | Node.js（需自行实现） | Spring Boot Actuator |
|--------|---------------------|---------------------|
| 健康检查 | 自定义 `/health` 路由 | `/actuator/health` |
| 应用信息 | 自定义 | `/actuator/info` |
| 环境信息 | `process.env` | `/actuator/env` |
| JVM/进程指标 | `process.memoryUsage()` | `/actuator/metrics` |
| 线程信息 | - | `/actuator/threaddump` |
| Bean 信息 | - | `/actuator/beans` |
| HTTP 请求追踪 | 自定义中间件 | `/actuator/httpexchanges` |

> **提示：** Spring Boot Actuator 是其一大优势，开箱即用的监控能力可以节省大量开发时间。Node.js 项目可以考虑使用 [prom-client](https://github.com/siimon/prom-client) 配合 Prometheus 实现类似功能。

## CI/CD 基础概念

### CI/CD 流程

```
代码提交 → 自动测试 → 代码检查 → 构建打包 → 部署到测试环境 → 部署到生产环境
  │            │           │           │              │                │
  ▼            ▼           ▼           ▼              ▼                ▼
 GitHub      Jest/       ESLint/     npm build/    部署到          部署到
 Push        Mocha       Prettier    mvn package   Staging         Production
```

### GitHub Actions 示例

```yaml
# .github/workflows/ci.yml - Node.js 项目
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Build and Push Docker Image
        run: |
          docker build -t my-api:${{ github.sha }} .
          docker push my-api:${{ github.sha }}
```

```yaml
# .github/workflows/ci.yml - Spring Boot 项目
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'maven'
      - name: Run tests
        run: mvn test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'maven'
      - name: Build
        run: mvn clean package -DskipTests
      - name: Build Docker Image
        run: docker build -t my-spring-api:${{ github.sha }} .
      - name: Push Docker Image
        run: docker push my-spring-api:${{ github.sha }}
```

### 部署流程对照

| 步骤 | Node.js | Spring Boot |
|------|---------|-------------|
| 测试 | `npm test` (Jest/Mocha) | `mvn test` (JUnit) |
| 代码检查 | `npm run lint` (ESLint) | `mvn checkstyle:check` / SpotBugs |
| 构建 | `npm run build` (TypeScript 编译) | `mvn clean package` |
| 产物 | `dist/` 目录 | `target/*.jar` |
| Docker 构建 | `docker build` | `docker build` |
| 部署 | PM2 / Docker / PaaS | JAR / Docker / PaaS |

## 小结

本章对比了 Node.js 和 Spring Boot 的部署与运维方式：

- **Node.js** 使用 PM2 进行进程管理，配合 Nginx 反向代理即可完成基本部署
- **Spring Boot** 打包为可执行 JAR，配合 systemd 服务管理，部署方式更加标准化
- **Docker 容器化**是两个框架通用的部署方案，推荐在生产环境中使用
- **环境变量管理**方面，Spring Boot 的 Profile 机制比 Node.js 的 dotenv 更加完善
- **日志和监控**方面，Spring Boot Actuator 提供了开箱即用的监控能力，这是 Spring Boot 的一大优势
- **CI/CD** 流程在两个框架中基本一致，都是测试 -> 构建 -> 部署的标准流程

> **恭喜你完成了全部教程！** 通过这 7 个章节的学习，你已经掌握了从 Node.js 迁移到 Java Spring Boot 所需的核心知识。记住，编程语言和框架只是工具，理解背后的设计思想和架构模式才是最重要的。祝你在后端开发的道路上越走越远！
