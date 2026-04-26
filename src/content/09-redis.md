---
title: Redis 缓存
chapter: 9
---

# Redis 缓存

## 核心概念

### 什么是 Redis？

Redis（Remote Dictionary Server）是一个开源的内存数据结构存储系统，可以用作**数据库、缓存和消息代理**。它支持多种数据结构：String、Hash、List、Set、Sorted Set、Stream 等。

### 为什么需要 Redis？

| 场景 | 没有 Redis | 有 Redis |
|------|-----------|----------|
| 热点数据查询 | 每次查数据库，响应慢 | 内存读取，毫秒级响应 |
| 会话管理 | 存数据库或文件，IO 开销大 | 内存操作，速度快 |
| 排行榜 | 每次排序计算，性能差 | Sorted Set 实时更新 |
| 限流/计数 | 数据库计数，并发差 | `INCR` 原子操作，高性能 |
| 分布式锁 | 数据库锁，性能差 | `SETNX` + 过期时间 |

### Redis 数据结构对比

| 数据结构 | 类比 | 典型场景 |
|---------|------|---------|
| String | `Map<String, String>` | 缓存、计数器、Session |
| Hash | `Map<String, Map<String, String>>` | 对象存储、用户信息 |
| List | 双向链表 | 消息队列、最新列表 |
| Set | 哈希集合 | 标签、去重、共同好友 |
| Sorted Set | 跳表 + 哈希 | 排行榜、延迟队列 |
| Stream | 消息流 | 消息队列（替代 Pub/Sub） |

## Node.js 实现

### 安装与连接

```bash
npm install redis
```

```javascript
const redis = require('redis')

const client = redis.createClient({
  url: 'redis://localhost:6379',
})

client.on('error', (err) => console.log('Redis Error:', err))

async function connect() {
  await client.connect()
  console.log('Redis connected')
}
```

### String 操作

```javascript
await client.set('user:1:name', 'Alice')
await client.set('user:1:age', 25)

await client.set('session:abc123', JSON.stringify({ userId: 1 }), {
  EX: 3600,
})

const name = await client.get('user:1:name')

await client.incr('page:views')
await client.incrBy('page:views', 10)

await client.set('rate:ip:192.168.1.1', 1, { EX: 60, NX: true })
```

### Hash 操作

```javascript
await client.hSet('user:1', {
  name: 'Alice',
  email: 'alice@example.com',
  age: 25,
})

const user = await client.hGetAll('user:1')
const name = await client.hGet('user:1', 'name')
await client.hDel('user:1', 'age')
```

### List 操作

```javascript
await client.lPush('task:queue', JSON.stringify({ id: 1, task: 'send email' }))
await client.lPush('task:queue', JSON.stringify({ id: 2, task: 'process image' }))

const task = await client.rPop('task:queue')
const len = await client.lLen('task:queue')
```

### Set 操作

```javascript
await client.sAdd('article:1:tags', ['redis', 'cache', 'backend'])
const tags = await client.sMembers('article:1:tags')
const common = await client.sInter('user:1:following', 'user:2:following')
const allTags = await client.sUnion('article:1:tags', 'article:2:tags')
```

### Sorted Set（排行榜）

```javascript
await client.zAdd('leaderboard', [
  { score: 100, value: 'Alice' },
  { score: 200, value: 'Bob' },
  { score: 150, value: 'Charlie' },
])

await client.zIncrBy('leaderboard', 10, 'Alice')

const top10 = await client.zRevRange('leaderboard', 0, 9, {
  WITHSCORES: true,
})

const rank = await client.zRevRank('leaderboard', 'Alice')
```

### 缓存模式

```javascript
async function getUser(id) {
  const cacheKey = `user:${id}`
  const cached = await client.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const user = await db.query('SELECT * FROM users WHERE id = ?', [id])
  await client.set(cacheKey, JSON.stringify(user), { EX: 300 })

  return user
}

async function getUserWithBloomFilter(id) {
  const exists = await client.get(`bloom:user:${id}`)
  if (exists === null) return null
  return getUser(id)
}
```

## Spring Boot 实现

### 依赖配置

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

```properties
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.database=0
```

### RedisTemplate 配置

```java
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

### String 操作

```java
@Service
public class CacheService {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public void setCache(String key, Object value, long minutes) {
        redisTemplate.opsForValue().set(key, value, minutes, TimeUnit.MINUTES);
    }

    public Object getCache(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    public Long increment(String key) {
        return stringRedisTemplate.opsForValue().increment(key);
    }
}
```

### Hash 操作

```java
public void saveUser(User user) {
    redisTemplate.opsForHash().putAll(
        "user:" + user.getId(),
        Map.of(
            "name", user.getName(),
            "email", user.getEmail(),
            "age", String.valueOf(user.getAge())
        )
    );
}

public Map<Object, Object> getUser(String userId) {
    return redisTemplate.opsForHash().entries("user:" + userId);
}
```

### Sorted Set（排行榜）

```java
public void addScore(String leaderboard, String member, double score) {
    redisTemplate.opsForZSet().add(leaderboard, member, score);
}

public Set<ZSetOperations.TypedTuple<Object>> getTopN(String leaderboard, int n) {
    return redisTemplate.opsForZSet()
        .reverseRangeWithScores(leaderboard, 0, n - 1);
}

public Long getRank(String leaderboard, String member) {
    return redisTemplate.opsForZSet().reverseRank(leaderboard, member);
}
```

### 注解式缓存

```java
@Service
@CacheConfig(cacheNames = "articles")
public class ArticleService {

    @Autowired
    private ArticleRepository repository;

    @Cacheable(key = "#id")
    public Article getById(String id) {
        return repository.findById(id).orElse(null);
    }

    @CachePut(key = "#article.id")
    public Article update(Article article) {
        return repository.save(article);
    }

    @CacheEvict(key = "#id")
    public void delete(String id) {
        repository.deleteById(id);
    }

    @CacheEvict(allEntries = true)
    public void clearAllCache() {
    }
}
```

## 知识迁移要点

### 相似点

| 概念 | Node.js (ioredis/redis) | Spring Boot (Spring Data Redis) |
|------|--------------------------|-------------------------------|
| 连接 | `createClient({ url })` | `application.properties` |
| String | `client.set()` / `get()` | `opsForValue().set()` / `get()` |
| Hash | `client.hSet()` / `hGetAll()` | `opsForHash().putAll()` / `entries()` |
| List | `client.lPush()` / `rPop()` | `opsForList().leftPush()` / `rightPop()` |
| Set | `client.sAdd()` / `sMembers()` | `opsForSet().add()` / `members()` |
| Sorted Set | `client.zAdd()` / `zRevRange()` | `opsForZSet().add()` / `reverseRangeWithScores()` |
| 过期时间 | `{ EX: 3600 }` | `TimeUnit.MINUTES` |
| 缓存注解 | 无（手动管理） | `@Cacheable` / `@CachePut` / `@CacheEvict` |

### 差异点

| 维度 | Node.js | Spring Boot |
|------|---------|-------------|
| API 风格 | Promise 异步 | 同步（或 Reactive 异步） |
| 序列化 | 手动 `JSON.stringify/parse` | 自动 JSON 序列化 |
| 缓存管理 | 手动控制 | `@Cacheable` 注解自动管理 |
| 连接池 | 内置 | Lettuce（默认）/ Jedis |
| 事务 | `MULTI/EXEC` | `@Transactional` + `SessionCallback` |

## 小结

- Redis 是**高性能内存数据库**，适合缓存、排行榜、会话管理等场景
- Node.js 使用 `redis` / `ioredis` 包，API 简洁直观
- Spring Boot 使用 `Spring Data Redis`，支持 `@Cacheable` 注解自动管理缓存
- 常见缓存模式：**Cache-Aside**、**Read-Through**、**Write-Through**
- 注意缓存问题：**穿透**（布隆过滤器）、**击穿**（互斥锁）、**雪崩**（随机过期时间）
