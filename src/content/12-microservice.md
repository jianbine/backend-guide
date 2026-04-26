---
title: 微服务基础
chapter: 12
---

# 微服务基础

## 核心概念

### 什么是微服务？

微服务架构是一种将应用程序构建为一组小型、独立服务的方式，每个服务运行在自己的进程中，通过轻量级机制（通常是 HTTP API）进行通信。

### 单体 vs 微服务

| 维度 | 单体架构 | 微服务架构 |
|------|---------|-----------|
| 代码库 | 单一代码库 | 每个服务独立代码库 |
| 部署 | 整体部署 | 独立部署 |
| 扩展 | 整体扩展 | 按需独立扩展 |
| 技术栈 | 统一技术栈 | 可异构技术栈 |
| 团队协作 | 大团队协作困难 | 小团队独立开发 |
| 复杂度 | 低（初期） | 高（运维、网络） |
| 适用场景 | 初创项目、小型应用 | 大型项目、高并发 |

### 微服务核心组件

| 组件 | 作用 | 常见方案 |
|------|------|---------|
| 服务注册发现 | 服务自动注册与发现 | Nacos、Consul、Eureka |
| API 网关 | 统一入口、路由、限流 | Spring Cloud Gateway、Kong |
| 配置中心 | 集中管理配置 | Nacos Config、Apollo |
| 服务间通信 | 服务之间调用 | OpenFeign、gRPC |
| 负载均衡 | 请求分发 | Ribbon、LoadBalancer |
| 熔断降级 | 防止级联故障 | Sentinel、Resilience4j |
| 分布式事务 | 跨服务数据一致性 | Seata、Saga |
| 链路追踪 | 请求链路追踪 | SkyWalking、Zipkin |

## Node.js 实现

### NestJS 模块化架构

NestJS 是 Node.js 生态中最接近 Spring Boot 的框架，天然支持模块化（微服务友好）。

```bash
npm install @nestjs/core @nestjs/common @nestjs/microservices
```

```typescript
// app.module.ts
@Module({
  imports: [
    UsersModule,
    OrdersModule,
    ProductsModule,
  ],
})
export class AppModule {}

// users/users.module.ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// users/users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id)
  }
}
```

### 服务间通信（TCP）

```typescript
// 订单服务 - 客户端
@Client({ transport: Transport.TCP, options: { port: 3001 } })
private client: ClientProxy;

async createOrder(userId: string, productId: string) {
  // 调用用户服务验证用户
  const user = await this.client.send('user.findById', userId).toPromise();
  if (!user) throw new NotFoundException('用户不存在');

  // 调用商品服务查询库存
  const product = await this.client.send('product.findById', productId).toPromise();
  if (product.stock < 1) throw new BadRequestException('库存不足');

  return this.orderService.create(userId, productId);
}
```

```typescript
// 用户服务 - 服务端
@Controller()
export class UsersController {
  @MessagePattern('user.findById')
  findById(@Payload() id: string) {
    return this.usersService.findById(id);
  }
}
```

### Consul 服务注册

```bash
npm install consul
```

```javascript
const consul = require('consul')()

// 服务注册
consul.agent.service.register({
  name: 'users-service',
  address: process.env.HOST || 'localhost',
  port: parseInt(process.env.PORT) || 3001,
  check: {
    http: `http://localhost:${process.env.PORT}/health`,
    interval: '10s',
    timeout: '5s',
  },
}, (err) => {
  if (err) throw err
  console.log('Service registered with Consul')
})

// 服务发现
async function getUserServiceUrl() {
  const services = await new Promise((resolve, reject) => {
    consul.agent.service.list((err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
  const instances = services['users-service']
  if (!instances || instances.length === 0) {
    throw new Error('User service not available')
  }
  const instance = instances[Math.floor(Math.random() * instances.length)]
  return `http://${instance.Address}:${instance.Port}`
}
```

## Spring Boot 实现

### Spring Cloud Gateway

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

```yaml
# application.yml
server:
  port: 8080

spring:
  cloud:
    gateway:
      routes:
        - id: users-service
          uri: lb://users-service
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1
        - id: orders-service
          uri: lb://orders-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1
```

### Nacos 服务注册与发现

```xml
<dependency>
  <groupId>com.alibaba.cloud</groupId>
  <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
<dependency>
  <groupId>com.alibaba.cloud</groupId>
  <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

```properties
spring.application.name=users-service
spring.cloud.nacos.discovery.server-addr=localhost:8848
spring.cloud.nacos.config.server-addr=localhost:8848
spring.cloud.nacos.config.file-extension=yaml
```

```java
@SpringBootApplication
@EnableDiscoveryClient
public class UsersServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UsersServiceApplication.class, args);
    }
}
```

### OpenFeign 服务间调用

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

```java
// 订单服务中调用用户服务
@FeignClient(name = "users-service", fallback = UserClientFallback.class)
public interface UserClient {

    @GetMapping("/users/{id}")
    User findById(@PathVariable("id") String id);
}

// 熔断降级
@Component
public class UserClientFallback implements UserClient {

    @Override
    public User findById(String id) {
        return new User(id, "降级用户", "fallback@example.com");
    }
}

// 在订单服务中使用
@Service
public class OrderService {

    @Autowired
    private UserClient userClient;

    public OrderDTO createOrder(String userId, String productId) {
        User user = userClient.findById(userId);
        // ... 创建订单逻辑
    }
}
```

### Nacos 配置中心

```yaml
# bootstrap.yaml
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
        shared-configs:
          - data-id: common.yaml
            refresh: true
```

```yaml
# Nacos 中的 users-service.yaml
server:
  port: 3001

database:
  url: jdbc:mysql://localhost:3306/users_db
  username: root
  password: ${DB_PASSWORD}
```

```java
@RefreshScope
@RestController
public class ConfigController {

    @Value("${database.url}")
    private String dbUrl;

    @GetMapping("/config/db-url")
    public String getDbUrl() {
        return dbUrl;
    }
}
```

## 分布式事务（Saga 模式）

### 问题场景

创建订单需要同时：扣减库存、扣减余额、创建订单。如果某一步失败，需要补偿。

### Node.js 实现

```javascript
class CreateOrderSaga {
  async execute(orderData) {
    const sagaId = uuid()
    try {
      // Step 1: 创建订单（初始状态）
      const order = await this.orderService.create({ ...orderData, status: 'PENDING' })

      // Step 2: 扣减库存
      try {
        await this.inventoryService.deduct(order.productId, order.quantity)
      } catch (err) {
        // 补偿：取消订单
        await this.orderService.cancel(order.id)
        throw err
      }

      // Step 3: 扣减余额
      try {
        await this.paymentService.deduct(order.userId, order.totalAmount)
      } catch (err) {
        // 补偿：恢复库存 + 取消订单
        await this.inventoryService.restore(order.productId, order.quantity)
        await this.orderService.cancel(order.id)
        throw err
      }

      // 全部成功
      await this.orderService.confirm(order.id)
      return order
    } catch (err) {
      throw new Error(`订单创建失败: ${err.message}`)
    }
  }
}
```

### Spring Boot + Seata

```java
@Service
public class OrderService {

    @Autowired
    private InventoryClient inventoryClient;

    @Autowired
    private PaymentClient paymentClient;

    @GlobalTransactional(name = "create-order", rollbackFor = Exception.class)
    public Order createOrder(CreateOrderRequest request) {
        // 1. 创建订单
        Order order = orderRepository.save(
            new Order(request.getUserId(), request.getProductId(), request.getQuantity())
        );

        // 2. 扣减库存
        inventoryClient.deduct(request.getProductId(), request.getQuantity());

        // 3. 扣减余额
        paymentClient.deduct(request.getUserId(), order.getTotalAmount());

        // 4. 更新订单状态
        order.setStatus(OrderStatus.CONFIRMED);
        return orderRepository.save(order);
    }
}
```

## 知识迁移要点

### 相似点

| 概念 | Node.js | Spring Boot |
|------|---------|-------------|
| 模块化 | NestJS Modules | Spring Boot 多模块 |
| 服务注册 | Consul SDK | Nacos / Eureka |
| API 网关 | Express Gateway | Spring Cloud Gateway |
| 配置中心 | Consul KV | Nacos Config / Apollo |
| 服务调用 | TCP / HTTP | OpenFeign / gRPC |
| 熔断降级 | 手动实现 | Sentinel / Resilience4j |

### 差异点

| 维度 | Node.js | Spring Boot |
|------|---------|-------------|
| 生态成熟度 | 需要手动组合 | Spring Cloud 全家桶 |
| 服务治理 | 较弱（需自建） | 完善（Nacos + Sentinel + Seata） |
| 学习曲线 | 较低 | 较高 |
| 性能 | 轻量、启动快 | 相对较重 |
| 适用规模 | 中小型 | 中大型 |

## 小结

- 微服务不是银弹，**不要过早拆分**，先从单体开始
- Node.js 生态推荐 **NestJS + Consul** 组合
- Spring Boot 生态推荐 **Spring Cloud Alibaba（Nacos + Gateway + Seata + Sentinel）**
- 核心挑战不是技术选型，而是**服务拆分粒度**和**分布式事务处理**
- 建议学习路径：单体 → 模块化单体 → 微服务，循序渐进
