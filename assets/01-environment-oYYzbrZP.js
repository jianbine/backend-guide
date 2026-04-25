var e=`---
title: 环境搭建
chapter: 1
mindmap: ./mindmaps/01-environment.md
---

# 环境搭建

## 为什么环境搭建是第一步？

在开始学习 Spring Boot 之前，我们需要先搭建好开发环境。Node.js 和 Java 的生态差异很大，工具链也完全不同。理解这些差异有助于后续学习。

## Node.js 环境回顾

### 安装 Node.js

```bash
# 使用 nvm 安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts
```

### 包管理器

```bash
# npm（Node.js 自带）
npm init -y

# yarn
npm install -g yarn

# pnpm（推荐，更快更省空间）
npm install -g pnpm
```

### 项目初始化

```bash
# 创建 Express 项目
mkdir my-api && cd my-api
npm init -y
npm install express
```

## Java + Spring Boot 环境

### 安装 JDK

```bash
# macOS
brew install openjdk@17

# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# Windows
# 下载安装包：https://adoptium.net/
```

验证安装：

```bash
java -version
# openjdk version "17.0.8" 2023-07-18
javac -version
# javac 17.0.8
```

### 安装 Maven

```bash
# macOS
brew install maven

# Ubuntu/Debian
sudo apt install maven
```

验证安装：

```bash
mvn -version
# Apache Maven 3.9.4
```

### 安装 IDE

| IDE | 说明 | 推荐度 |
|-----|------|--------|
| **IntelliJ IDEA** | JetBrains 出品，Java 开发首选 | ⭐⭐⭐⭐⭐ |
| VS Code + Extensions | 轻量级，前端开发者熟悉 | ⭐⭐⭐ |
| Eclipse | 免费开源 | ⭐⭐ |

> 💡 **建议**：如果你是前端开发者，推荐使用 IntelliJ IDEA（Community 版免费），它的智能提示和代码补全对 Java 开发帮助很大。

## 创建第一个 Spring Boot 项目

### 方式一：Spring Initializr（推荐）

访问 [start.spring.io](https://start.spring.io)，选择：

- **Project**: Maven
- **Language**: Java
- **Spring Boot**: 3.x (LTS)
- **Group**: com.example
- **Artifact**: demo
- **Dependencies**: Spring Web

### 方式二：Maven 命令行

```bash
mvn archetype:generate \
  -DgroupId=com.example \
  -DartifactId=demo \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DinteractiveMode=false
```

### 方式三：Spring Boot CLI

```bash
# 安装 Spring Boot CLI
sdk install springboot

# 创建项目
spring init --dependencies=web demo
```

## 项目结构对比

### Node.js (Express) 项目结构

```
my-express-app/
├── package.json        # 项目配置 & 依赖
├── node_modules/       # 依赖包
├── src/
│   ├── index.js        # 入口文件
│   ├── routes/         # 路由
│   ├── middleware/      # 中间件
│   ├── models/         # 数据模型
│   └── utils/          # 工具函数
└── .env                # 环境变量
```

### Spring Boot 项目结构

```
my-spring-app/
├── pom.xml             # Maven 配置（类似 package.json）
├── src/
│   ├── main/
│   │   ├── java/com/example/demo/
│   │   │   ├── DemoApplication.java  # 启动类
│   │   │   ├── controller/            # 控制器（类似 routes）
│   │   │   ├── service/               # 业务逻辑
│   │   │   ├── repository/            # 数据访问
│   │   │   ├── model/                 # 数据模型
│   │   │   └── config/                # 配置类
│   │   └── resources/
│   │       ├── application.properties # 配置文件（类似 .env）
│   │       └── static/                # 静态资源
│   └── test/
│       └── java/                       # 测试代码
└── target/            # 编译输出（类似 dist/）
```

## 关键配置文件对比

### package.json vs pom.xml

::: code-group

```javascript[Node.js - package.json]
{
  "name": "my-express-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
```

```xml[Java - pom.xml]
<project>
  <groupId>com.example</groupId>
  <artifactId>demo</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.1.0</version>
  </parent>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
  </dependencies>
</project>
```

:::

### .env vs application.properties

::: code-group

```ini[Node.js - .env]
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
NODE_ENV=development
```

```properties[Java - application.properties]
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=postgres
spring.datasource.password=secret
spring.profiles.active=dev
```

:::

## 运行项目对比

### Node.js

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产模式
node src/index.js
```

### Spring Boot

```bash
# 编译打包
mvn clean package -DskipTests

# 运行
java -jar target/demo-0.0.1-SNAPSHOT.jar

# 或者直接用 Maven 运行
mvn spring-boot:run
```

## 常见问题

### Q: JDK 版本选择？
A: 推荐 JDK 17（Spring Boot 3.x 的最低要求），LTS 版本稳定可靠。

### Q: Maven 和 Gradle 选哪个？
A: 初学者推荐 Maven（更成熟、文档更多），进阶后可以尝试 Gradle（更灵活、构建更快）。

### Q: 需要先学 Java 基础吗？
A: 不需要！本教程假设你有 JavaScript 基础，会通过对比帮助你理解 Java 语法。

## 小结

- Node.js 和 Java 的工具链差异较大，但核心概念相通
- `package.json` ≈ `pom.xml`，`.env` ≈ `application.properties`
- Spring Boot 项目结构更规范，分层更明确
- 推荐使用 IntelliJ IDEA + Maven 进行开发

> 🚀 **下一步**：[路由与请求处理](/chapter/02-routing)
`
export default{render(){return{}}};