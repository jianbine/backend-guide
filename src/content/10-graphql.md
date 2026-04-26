---
title: API 设计进阶 (GraphQL)
chapter: 10
---

# API 设计进阶 (GraphQL)

## 核心概念

### 什么是 GraphQL？

GraphQL 是一种用于 API 的查询语言，由 Facebook 于 2015 年开源。与 REST 不同，GraphQL 允许客户端**精确指定**需要的数据字段，避免过度获取（over-fetching）和不足获取（under-fetching）的问题。

### REST vs GraphQL 对比

| 维度 | REST | GraphQL |
|------|------|---------|
| 数据获取 | 多个端点，固定返回结构 | 单一端点，客户端自定义返回 |
| 过度获取 | 常见（返回多余字段） | 不会（按需获取） |
| 不足获取 | 需要多次请求 | 一次请求获取所有数据 |
| 版本管理 | URL 版本化（/v1, /v2） | Schema 演进，无需版本化 |
| 文档 | Swagger / OpenAPI | Schema 即文档 |
| 缓存 | HTTP 缓存友好 | 缓存较复杂 |
| 适用场景 | 简单 CRUD | 复杂关联查询、移动端 |

### GraphQL 核心概念

| 概念 | 说明 | 类比 |
|------|------|------|
| Schema | 类型定义系统 | API 契约 |
| Query | 查询操作 | GET |
| Mutation | 修改操作 | POST/PUT/DELETE |
| Subscription | 实时订阅 | WebSocket |
| Resolver | 数据获取函数 | Controller 方法 |
| Fragment | 可复用的字段组合 | 组件 |

## Node.js 实现

### Apollo Server

```bash
npm install @apollo/server graphql
```

```javascript
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

// 类型定义
const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    createdAt: String!
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
    post(id: ID!): Post
    posts(limit: Int, offset: Int): [Post!]!
  }

  type Mutation {
    createPost(title: String!, content: String!): Post!
    updatePost(id: ID!, title: String, content: String): Post!
    deletePost(id: ID!): Boolean!
  }

  type Subscription {
    postCreated: Post!
  }
`

// 模拟数据
const users = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
]

const posts = [
  { id: '1', title: 'First Post', content: 'Hello World', authorId: '1', createdAt: '2024-01-01' },
  { id: '2', title: 'Second Post', content: 'GraphQL Guide', authorId: '1', createdAt: '2024-01-02' },
]

// Resolver
const resolvers = {
  Query: {
    user: (_, { id }) => users.find(u => u.id === id),
    users: () => users,
    post: (_, { id }) => posts.find(p => p.id === id),
    posts: (_, { limit = 10, offset = 0 }) => posts.slice(offset, offset + limit),
  },
  Mutation: {
    createPost: (_, { title, content }) => {
      const post = { id: String(posts.length + 1), title, content, authorId: '1', createdAt: new Date().toISOString() }
      posts.push(post)
      return post
    },
  },
  User: {
    posts: (parent) => posts.filter(p => p.authorId === parent.id),
  },
  Post: {
    author: (parent) => users.find(u => u.id === parent.authorId),
  },
}

const server = new ApolloServer({ typeDefs, resolvers })
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } })
console.log(`Server ready at ${url}`)
```

### 客户端查询示例

```graphql
# 查询用户及其文章
query GetUserWithPosts($userId: ID!) {
  user(id: $userId) {
    name
    email
    posts {
      id
      title
      createdAt
    }
  }
}

# 变量
{ "userId": "1" }
```

```graphql
# 创建文章
mutation CreatePost($title: String!, $content: String!) {
  createPost(title: $title, content: $content) {
    id
    title
    author {
      name
    }
  }
}
```

### 与 Express 集成

```javascript
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const server = new ApolloServer({ typeDefs, resolvers })
await server.start()

app.use('/graphql', expressMiddleware(server))

app.listen(3000, () => console.log('Server running on port 3000'))
```

## Spring Boot 实现

### 依赖配置

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-graphql</artifactId>
</dependency>
```

### Schema 定义

```graphql
# src/main/resources/graphql/schema.graphqls

type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  createdAt: String!
}

type Query {
  user(id: ID!): User
  users: [User!]!
  post(id: ID!): Post
  posts(limit: Int, offset: Int): [Post!]!
}

type Mutation {
  createPost(title: String!, content: String!): Post!
  updatePost(id: ID!, title: String, content: String): Post!
  deletePost(id: ID!): Boolean!
}
```

### 实体类

```java
public class User {
    private String id;
    private String name;
    private String email;
    // getter/setter
}

public class Post {
    private String id;
    private String title;
    private String content;
    private String authorId;
    private String createdAt;
    // getter/setter
}
```

### Controller

```java
@Controller
public class PostController {

    @Autowired
    private PostService postService;

    @QueryMapping
    public List<Post> posts(@Argument int limit, @Argument int offset) {
        return postService.findAll(limit, offset);
    }

    @QueryMapping
    public Post post(@Argument String id) {
        return postService.findById(id);
    }

    @MutationMapping
    public Post createPost(@Argument String title, @Argument String content) {
        return postService.create(title, content);
    }

    @MutationMapping
    public boolean deletePost(@Argument String id) {
        return postService.delete(id);
    }
}
```

### 自定义 DataFetcher

```java
@Controller
public class UserResolver {

    @Autowired
    private PostService postService;

    @SchemaMapping(typeName = "User", field = "posts")
    public List<Post> posts(User user) {
        return postService.findByAuthorId(user.getId());
    }
}
```

### 配置

```properties
spring.graphql.graphqls.path=classpath:graphql/
spring.graphql.graphiql.enabled=true
spring.graphql.websocket.path=/graphql
```

## 知识迁移要点

### 相似点

| 概念 | Node.js (Apollo) | Spring Boot (Spring GraphQL) |
|------|-------------------|------------------------------|
| Schema | typeDefs 字符串 | `.graphqls` 文件 |
| 查询处理 | Query resolver | @QueryMapping |
| 修改操作 | Mutation resolver | @MutationMapping |
| 字段解析 | 嵌套 resolver | @SchemaMapping |
| 集成方式 | Apollo Server / Express 中间件 | spring-boot-starter-graphql |
| 调试工具 | Apollo Sandbox | GraphiQL |

### 差异点

| 维度 | Node.js | Spring Boot |
|------|---------|-------------|
| Schema 定义 | 代码内字符串 | 独立 `.graphqls` 文件 |
| Resolver 注册 | 同一对象 | @QueryMapping / @SchemaMapping 分离 |
| 数据获取 | 手动查询 | 结合 @Autowired 注入 Service |
| 类型安全 | 需要额外工具（TypeScript） | Schema 自动映射 Java 类型 |
| 测试 | Apollo Server 测试工具 | @GraphQlTest 注解 |

## 小结

- GraphQL 解决了 REST 的**过度获取**和**不足获取**问题
- Node.js 生态推荐 **Apollo Server**（功能全面、社区活跃）
- Spring Boot 使用 **Spring GraphQL**（官方支持、与 Spring 生态无缝集成）
- GraphQL 不是 REST 的替代品，应根据场景选择：简单 CRUD 用 REST，复杂关联查询用 GraphQL
- Schema 即文档的理念让前后端协作更加高效
