---
title: 部署与运维
chapter: 6
mindmap: ./mindmaps/06-deployment.md
---

# 部署与运维

## 核心概念

### 为什么需要关注部署？

| 场景 | 开发环境 | 生产环境 |
|------|---------|---------|
| 代码变更 | 随时重启 | 零停机部署 |
| 错误处理 | 控制台输出 | 日志收集 + 告警 |
| 资源管理 | 不限 | 限制 CPU/内存 |
| 访问控制 | 无 | HTTPS + 防火墙 |
| 扩展性 | 单实例 | 负载均衡 + 水平扩展 |

## Node.js 部署

### PM2 进程管理

```bash
npm install -g pm2
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-api',
    script: './src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    max_memory_restart: '1G',
  }],
}
```

```bash
pm2 start ecosystem.config.js
pm2 monit
pm2 logs
pm2 reload my-api
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker 部署

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
```

```bash
docker build -t my-api .
docker run -d -p 3000:3000 --name my-api my-api
```

## Spring Boot 部署

### 打包

```bash
./mvnw clean package -DskipTests
java -jar target/my-app-1.0.0.jar
```

### 配置分离

```properties
# application-prod.properties
server.port=8080
spring.datasource.url=jdbc:mysql://prod-db:3306/mydb
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
logging.level.root=WARN
logging.file.name=/var/log/myapp/app.log
```

```bash
java -jar my-app.jar --spring.profiles.active=prod
```

### Systemd 服务

```ini
[Unit]
Description=My Spring Boot App
After=syslog.target network.target

[Service]
User=appuser
ExecStart=/usr/bin/java -jar /opt/myapp/myapp.jar --spring.profiles.active=prod
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Docker 部署

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/myapp.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```dockerfile
# 多阶段构建
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/myapp.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Docker Compose 编排

### Node.js 项目

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
      - redis

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: mydb
    volumes:
      - db_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  db_data:
```

### Spring Boot 项目

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '8080:8080'
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/mydb
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: mydb
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

## 日志与监控

### Node.js 日志

```javascript
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})
```

### Spring Boot Actuator

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```properties
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=always
```

```java
@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired
    private HealthIndicator dbHealthIndicator;

    @GetMapping("/health/custom")
    public ResponseEntity<Map<String, Object>> customHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", Instant.now().toString());
        health.put("uptime", ManagementFactory.getRuntimeMXBean().getUptime());
        return ResponseEntity.ok(health);
    }
}
```

## CI/CD

### GitHub Actions - Node.js

```yaml
name: Deploy Node.js
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Deploy
        run: |
          ssh deploy@server "cd /opt/myapp && git pull && npm ci && pm2 reload myapp"
```

### GitHub Actions - Spring Boot

```yaml
name: Deploy Spring Boot
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - name: Build
        run: ./mvnw clean package -DskipTests
      - name: Deploy
        run: |
          scp target/myapp.jar deploy@server:/opt/myapp/
          ssh deploy@server "sudo systemctl restart myapp"
```

## 知识迁移要点

### 相似点

| 概念 | Node.js | Spring Boot |
|------|---------|-------------|
| 进程管理 | PM2 | Systemd / Docker |
| 反向代理 | Nginx | Nginx（相同） |
| 容器化 | Dockerfile | Dockerfile（相似） |
| 环境变量 | `.env` + `dotenv` | `application-{profile}.properties` |
| 日志 | Winston / Pino | Logback / SLF4J |
| 健康检查 | 自定义 `/health` | Actuator `/actuator/health` |

### 差异点

| 维度 | Node.js | Spring Boot |
|------|---------|-------------|
| 部署产物 | 源代码 + node_modules | JAR（内嵌 Tomcat） |
| 启动方式 | `node index.js` | `java -jar app.jar` |
| 集群模式 | PM2 cluster | Kubernetes Pod 副本 |
| 配置管理 | 环境变量为主 | Profile + 环境变量 |
| 监控能力 | 需要第三方工具 | Actuator 开箱即用 |
| **环境变量管理**方面，Spring Boot 的 Profile 机制比 Node.js 的 dotenv 更加完善 |
| **日志和监控**方面，Spring Boot Actuator 提供了开箱即用的监控能力，这是 Spring Boot 的一大优势 |
| **CI/CD** 流程在两个框架中基本一致，都是测试 -> 构建 -> 部署的标准流程 |