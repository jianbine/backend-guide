---
title: 数据库与 ORM
chapter: 4
mindmap: ./mindmaps/04-database.md
---

# 数据库与 ORM

数据持久化是后端开发的核心任务之一。本章将对比 Node.js 和 Spring Boot 中的数据库操作方式，重点讲解 ORM 框架的使用。

## ORM 概念对照

ORM（Object-Relational Mapping，对象关系映射）让你用面向对象的方式操作数据库，而不需要直接编写 SQL。

| 概念 | Node.js 生态 | Spring Boot 生态 |
|------|-------------|-----------------|
| ORM 框架 | Sequelize / Prisma / TypeORM | Spring Data JPA / Hibernate |
| 模型/实体 | Model / Schema | Entity |
| 数据库连接 | 连接池配置 | DataSource 配置 |
| 查询构建 | Query Builder / 方法链 | Repository 接口 / JPQL |
| 数据迁移 | migration 文件 | Flyway / Liquibase |

> **提示：** 本教程的 Node.js 示例使用 Sequelize（最流行的 Node.js ORM 之一），Spring Boot 示例使用 Spring Data JPA（Spring 官方推荐）。

## 数据库连接配置

### Node.js / Sequelize 配置

```javascript
// config/database.js
module.exports = {
  development: {
    username: 'root',
    password: 'password',
    database: 'myapp_dev',
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log
  },
  test: {
    username: 'root',
    password: 'password',
    database: 'myapp_test',
    host: 'localhost',
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
};
```

```javascript
// models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env]);

module.exports = sequelize;
```

### Spring Boot / JPA 配置

```properties
# src/main/resources/application.properties

# 数据库连接配置
spring.datasource.url=jdbc:mysql://localhost:3306/myapp_dev?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate 配置
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true
```

```yaml
# 或者使用 application.yml（YAML 格式，更推荐）
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/myapp_dev?useSSL=false&serverTimezone=UTC
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true
```

### 连接配置对照

| 配置项 | Sequelize | Spring Data JPA |
|--------|-----------|-----------------|
| 数据库地址 | `host` + `database` | `spring.datasource.url` |
| 用户名 | `username` | `spring.datasource.username` |
| 密码 | `password` | `spring.datasource.password` |
| 驱动 | `dialect: 'mysql'` | `driver-class-name` |
| 连接池 | 内置（可配置） | HikariCP（默认） |
| SQL 日志 | `logging: console.log` | `spring.jpa.show-sql=true` |
| 表结构管理 | `sync` / migration | `ddl-auto: update` |

> **注意：** `ddl-auto: update` 和 Sequelize 的 `sync` 仅适合开发环境。生产环境应使用数据库迁移工具管理表结构变更。

## 模型/实体定义

### Node.js / Sequelize 模型

```javascript
// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  age: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 150
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'user', 'guest'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'  // 映射到数据库列名
  }
}, {
  tableName: 'users',
  timestamps: true,       // 自动管理 createdAt / updatedAt
  underscored: true       // 列名使用下划线命名
});

module.exports = User;
```

### Spring Boot / JPA 实体

```java
// src/main/java/com/example/demo/entity/User.java
package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "username"),
    @UniqueConstraint(columnNames = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    @Email
    private String email;

    @Column(defaultValue = "0")
    @Min(0)
    @Max(150)
    private Integer age = 0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Role role = Role.USER;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // JPA 生命周期回调
    @PrePersist
    protected void onCreate() {
        // 创建前的操作
    }

    @PreUpdate
    protected void onUpdate() {
        // 更新前的操作
    }

    // Getter 和 Setter（或使用 Lombok @Data）
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}

// 枚举定义
public enum Role {
    ADMIN, USER, GUEST
}
```

### 模型定义对照

| 特性 | Sequelize | Spring Data JPA |
|------|-----------|-----------------|
| 主键 | `primaryKey: true, autoIncrement: true` | `@Id @GeneratedValue` |
| 非空约束 | `allowNull: false` | `@Column(nullable = false)` |
| 唯一约束 | `unique: true` | `@Column(unique = true)` 或 `@UniqueConstraint` |
| 默认值 | `defaultValue: value` | `@Column(defaultValue = "value")` |
| 字段映射 | `field: 'db_column'` | `@Column(name = "db_column")` |
| 枚举 | `DataTypes.ENUM(...)` | `@Enumerated(EnumType.STRING)` |
| 字符串长度 | `DataTypes.STRING(n)` | `@Column(length = n)` |
| 验证 | `validate: { ... }` | `@Min`, `@Max`, `@Email` 等 |
| 时间戳 | `timestamps: true` | `@CreatedDate`, `@LastModifiedDate` |

> **提示：** 在 Spring Boot 中，推荐使用 [Lombok](https://projectlombok.org/) 的 `@Data` 注解来自动生成 Getter/Setter，减少样板代码。

## CRUD 操作对比

### Create（创建）

```javascript
// Node.js / Sequelize
// 创建单条记录
const user = await User.create({
  username: 'alice',
  email: 'alice@example.com',
  age: 25
});

// 批量创建
const users = await User.bulkCreate([
  { username: 'alice', email: 'alice@example.com' },
  { username: 'bob', email: 'bob@example.com' }
]);
```

```java
// Spring Boot / JPA
// Repository 接口
public interface UserRepository extends JpaRepository<User, Long> {
}

// Service 中使用
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 创建单条记录
    public User createUser(User user) {
        return userRepository.save(user);
    }

    // 批量创建
    public List<User> createUsers(List<User> users) {
        return userRepository.saveAll(users);
    }
}
```

### Read（查询）

```javascript
// Node.js / Sequelize

// 根据 ID 查询
const user = await User.findByPk(1);

// 查询所有
const users = await User.findAll();

// 条件查询
const admins = await User.findAll({
  where: { role: 'admin', isActive: true }
});

// 分页查询
const { rows, count } = await User.findAndCountAll({
  limit: 10,
  offset: 0,
  order: [['createdAt', 'DESC']]
});

// 查询特定字段
const names = await User.findAll({
  attributes: ['id', 'username'],
  where: { isActive: true }
});

// 使用运算符
const { Op } = require('sequelize');
const adults = await User.findAll({
  where: {
    age: { [Op.gte]: 18 },
    username: { [Op.like]: '%alice%' }
  }
});
```

```java
// Spring Boot / JPA

// 根据 ID 查询（JpaRepository 内置）
User user = userRepository.findById(1L).orElse(null);

// 查询所有
List<User> users = userRepository.findAll();

// 条件查询 - 方式一：使用方法名派生查询
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByRoleAndIsActive(String role, Boolean isActive);
    List<User> findByAgeGreaterThanEqual(Integer age);
    List<User> findByUsernameContaining(String keyword);
}

// 使用
List<User> admins = userRepository.findByRoleAndIsActive("ADMIN", true);
List<User> adults = userRepository.findByAgeGreaterThanEqual(18);

// 分页查询
Pageable pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
Page<User> page = userRepository.findAll(pageable);
List<User> users = page.getContent();     // 当前页数据
long total = page.getTotalElements();      // 总记录数

// 查询特定字段
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT new com.example.demo.dto.UserDto(u.id, u.username) FROM User u WHERE u.isActive = true")
    List<UserDto> findActiveUserNames();
}

// 使用 @Query 自定义查询
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.age >= :minAge AND u.username LIKE %:keyword%")
    List<User> findByAgeAndName(@Param("minAge") int minAge, @Param("keyword") String keyword);
}
```

### Update（更新）

```javascript
// Node.js / Sequelize

// 先查后改
const user = await User.findByPk(1);
user.age = 26;
await user.save();

// 直接更新
await User.update(
  { age: 26, role: 'admin' },
  { where: { id: 1 } }
);

// 批量更新
await User.update(
  { isActive: false },
  { where: { role: 'guest' } }
);
```

```java
// Spring Boot / JPA

// 先查后改
User user = userRepository.findById(1L).orElseThrow();
user.setAge(26);
userRepository.save(user);

// 使用 @Modifying + @Query 直接更新
@Modifying
@Query("UPDATE User u SET u.age = :age, u.role = :role WHERE u.id = :id")
int updateUser(@Param("id") Long id, @Param("age") int age, @Param("role") Role role);

// 使用 Specification 动态查询更新
// 批量更新
userRepository.updateActiveStatusByRole(Role.GUEST, false);
```

### Delete（删除）

```javascript
// Node.js / Sequelize

// 删除单条
const user = await User.findByPk(1);
await user.destroy();

// 条件删除
await User.destroy({
  where: { isActive: false }
});

// 根据主键删除
await User.destroy({ where: { id: 1 } });
```

```java
// Spring Boot / JPA

// 删除单条
userRepository.deleteById(1L);

// 删除实体
User user = userRepository.findById(1L).orElseThrow();
userRepository.delete(user);

// 条件删除
@Modifying
@Query("DELETE FROM User u WHERE u.isActive = false")
int deleteInactiveUsers();
```

### CRUD 方法对照

| 操作 | Sequelize | Spring Data JPA |
|------|-----------|-----------------|
| 创建 | `Model.create(data)` | `repository.save(entity)` |
| 批量创建 | `Model.bulkCreate(data)` | `repository.saveAll(entities)` |
| 按 ID 查询 | `Model.findByPk(id)` | `repository.findById(id)` |
| 查询全部 | `Model.findAll()` | `repository.findAll()` |
| 条件查询 | `Model.findAll({ where })` | 方法名派生 / `@Query` |
| 分页 | `Model.findAndCountAll({ limit, offset })` | `repository.findAll(Pageable)` |
| 更新 | `instance.save()` / `Model.update()` | `repository.save(entity)` |
| 删除 | `instance.destroy()` / `Model.destroy()` | `repository.deleteById(id)` |
| 计数 | `Model.count()` | `repository.count()` |
| 存在判断 | `Model.findOne({ where })` | `repository.existsById(id)` |

## 关联关系

### 一对多（One-to-Many）

一个用户可以有多篇文章。

```javascript
// Node.js / Sequelize

// models/User.js
const User = sequelize.define('User', { /* ... */ });

// models/Post.js
const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  content: { type: DataTypes.TEXT }
});

// 定义关联
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// 使用关联查询
const userWithPosts = await User.findByPk(1, {
  include: [{ model: Post, as: 'posts' }]
});

// 创建关联记录
const post = await userWithPosts.createPost({
  title: 'My First Post',
  content: 'Hello World'
});
```

```java
// Spring Boot / JPA

// User.java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<Post> posts = new ArrayList<>();

    // 便捷方法
    public void addPost(Post post) {
        posts.add(post);
        post.setAuthor(this);
    }

    // getters...
}

// Post.java
@Entity
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    // getters & setters...
}

// 使用关联查询
// 方式一：EntityGraph 预加载
@EntityGraph(attributePaths = {"posts"})
User userWithPosts = userRepository.findById(1L).orElseThrow();

// 方式二：JPQL 联合查询
@Query("SELECT u FROM User u LEFT JOIN FETCH u.posts WHERE u.id = :id")
Optional<User> findByIdWithPosts(@Param("id") Long id);
```

### 多对多（Many-to-Many）

一篇文章可以有多个标签，一个标签可以属于多篇文章。

```javascript
// Node.js / Sequelize

// models/Post.js
const Post = sequelize.define('Post', { /* ... */ });

// models/Tag.js
const Tag = sequelize.define('Tag', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true }
});

// 多对多关联（Sequelize 自动创建中间表）
Post.belongsToMany(Tag, { through: 'PostTags', as: 'tags' });
Tag.belongsToMany(Post, { through: 'PostTags', as: 'posts' });

// 使用
const post = await Post.findByPk(1, { include: [{ model: Tag, as: 'tags' }] });
const tag = await Tag.findByPk(1, { include: [{ model: Post, as: 'posts' }] });

// 添加关联
await post.addTag(tag);
await post.setTags([tag1, tag2, tag3]);
```

```java
// Spring Boot / JPA

// Post.java
@Entity
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "post_tags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    public void addTag(Tag tag) {
        tags.add(tag);
        tag.getPosts().add(this);
    }
}

// Tag.java
@Entity
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToMany(mappedBy = "tags")
    private Set<Post> posts = new HashSet<>();
}
```

### 关联关系对照

| 关联类型 | Sequelize | Spring Data JPA |
|---------|-----------|-----------------|
| 一对一 | `hasOne` / `belongsTo` | `@OneToOne` |
| 一对多 | `hasMany` / `belongsTo` | `@OneToMany` / `@ManyToOne` |
| 多对多 | `belongsToMany` | `@ManyToMany` |
| 外键 | `foreignKey: 'userId'` | `@JoinColumn(name = "user_id")` |
| 预加载 | `include: [{ model }]` | `@EntityGraph` / `JOIN FETCH` |
| 级联操作 | `onDelete: 'CASCADE'` | `cascade = CascadeType.ALL` |
| 中间表 | `through: 'table_name'` | `@JoinTable(name = "table_name")` |

> **注意：** Spring Boot 中默认使用延迟加载（`FetchType.LAZY`），访问关联属性时需要确保在事务上下文中。而 Sequelize 默认不加载关联，需要显式使用 `include`。

## 数据库迁移

数据库迁移（Migration）用于版本化管理数据库表结构的变更。

### Node.js / Sequelize CLI

```bash
# 安装 Sequelize CLI
npm install --save-dev sequelize-cli

# 初始化迁移
npx sequelize init

# 创建迁移文件
npx sequelize migration:generate --name create-users-table
```

```javascript
// migrations/20240101000000-create-users-table.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
```

```bash
# 执行迁移
npx sequelize db:migrate

# 回滚迁移
npx sequelize db:migrate:undo
```

### Spring Boot / Flyway

```xml
<!-- pom.xml 添加 Flyway 依赖 -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-mysql</artifactId>
</dependency>
```

```sql
-- src/main/resources/db/migration/V1__create_users_table.sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    age INT DEFAULT 0,
    role VARCHAR(20) DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

```sql
-- src/main/resources/db/migration/V2__add_posts_table.sql
CREATE TABLE posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    author_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
```

```bash
# Flyway 在应用启动时自动执行迁移
# 手动执行（使用 Maven）
mvn flyway:migrate

# 查看迁移状态
mvn flyway:info
```

### 迁移工具对照

| 特性 | Sequelize CLI | Flyway |
|------|--------------|--------|
| 迁移文件格式 | JavaScript | SQL |
| 命名规则 | `YYYYMMDDHHMMSS-name.js` | `V{version}__description.sql` |
| 执行方式 | 手动 CLI 命令 | 应用启动时自动执行 |
| 回滚 | `db:migrate:undo` | `flyway:undo`（需配置） |
| 版本追踪 | `SequelizeMeta` 表 | `flyway_schema_history` 表 |
| 优势 | 可编写复杂逻辑 | 纯 SQL，简单直观 |

> **提示：** Flyway 也支持 Java 迁移（编写 Java 类），适合需要复杂逻辑的迁移场景。但大多数情况下，SQL 迁移文件更直观、更易于审查。

## 事务管理

```javascript
// Node.js / Sequelize - 托管事务
const result = await sequelize.transaction(async (t) => {
  const user = await User.create({ username: 'alice' }, { transaction: t });
  const post = await Post.create({
    title: 'First Post',
    authorId: user.id
  }, { transaction: t });
  return { user, post };
});
// 如果任何操作失败，事务自动回滚
```

```java
// Spring Boot / JPA - 声明式事务
@Service
public class UserService {

    @Transactional
    public User createUserWithPost(User user, Post post) {
        User savedUser = userRepository.save(user);
        post.setAuthor(savedUser);
        postRepository.save(post);
        return savedUser;
        // 如果方法抛出异常，事务自动回滚
    }

    // 只读事务（优化查询性能）
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
```

| 特性 | Sequelize | Spring Data JPA |
|------|-----------|-----------------|
| 事务方式 | `sequelize.transaction()` | `@Transactional` 注解 |
| 自动回滚 | Promise reject 时 | 方法抛出异常时 |
| 只读事务 | 不支持 | `@Transactional(readOnly = true)` |
| 传播行为 | 不支持 | `@Transactional(propagation = ...)` |
| 隔离级别 | 可配置 | `@Transactional(isolation = ...)` |

## 小结

本章对比了 Node.js 和 Spring Boot 的数据库操作方式：

- **Sequelize** 使用 JavaScript 定义模型，**Spring Data JPA** 使用 Java 注解定义实体
- **JPA Repository** 通过方法名派生查询极大减少了样板代码，这是 Spring Boot 的一大优势
- 关联关系在两个框架中的概念一致，但 Spring Boot 需要更多注解配置
- **Flyway** 使用 SQL 迁移文件，比 Sequelize 的 JS 迁移更直观
- Spring Boot 的 `@Transactional` 声明式事务管理比 Sequelize 的手动事务更加优雅

> **下一步：** 下一章将学习认证与授权，这是保护 API 安全的核心知识。
