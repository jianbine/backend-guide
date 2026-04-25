var e=`---
title: 环境搭建
chapter: 1
mindmap: ./mindmaps/01-environment.md
---

# 环境搭建

工欲善其事，必先利其器。本章将带你完成 Node.js 和 Java Spring Boot 的开发环境搭建，并编写第一个 Hello World 程序。

## Node.js 环境搭建

### 使用 nvm 安装 Node.js

[nvm](https://github.com/nvm-sh/nvm)（Node Version Manager）是 Node.js 的版本管理工具，可以方便地安装和切换不同版本的 Node.js。

\`\`\`bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc  # 或 source ~/.zshrc

# 安装最新的 LTS 版本
nvm install --lts

# 验证安装
node -v    # v20.x.x
npm -v     # 10.x.x
\`\`\`

### 包管理器选择

| 工具 | 特点 | 推荐场景 |
|------|------|---------|
| npm | Node.js 自带，生态最完善 | 通用场景 |
| pnpm | 硬链接节省磁盘空间，安装速度快 | monorepo / 多项目 |
| yarn | Facebook 出品，确定性安装 | 团队协作 |

\`\`\`bash
# 安装 pnpm（推荐）
npm install -g pnpm

# 验证
pnpm -v
\`\`\`

> **提示：** 本教程中的 Node.js 示例使用 npm 作为包管理器，但你完全可以使用 pnpm 或 yarn，只需将 \`npm install\` 替换为 \`pnpm install\` 或 \`yarn\` 即可。

## Java 环境搭建

### 安装 JDK

Spring Boot 3.x 要求 JDK 17 或更高版本。推荐安装 JDK 17（LTS）或 JDK 21（LTS）。

**macOS（使用 Homebrew）：**

\`\`\`bash
brew install openjdk@17

# 配置环境变量
echo 'export PATH="/usr/local/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 验证
java -version
# openjdk version "17.0.x"
\`\`\`

**Linux（Ubuntu/Debian）：**

\`\`\`bash
sudo apt update
sudo apt install openjdk-17-jdk

# 验证
java -version
javac -version
\`\`\`

**Windows：**

1. 从 [Adoptium](https://adoptium.net/) 下载 JDK 17 安装包
2. 运行安装程序，按默认设置安装
3. 配置环境变量：
   - 新建 \`JAVA_HOME\` = \`C:\\Program Files\\Eclipse Adoptium\\jdk-17.x.x\`
   - 将 \`%JAVA_HOME%\\bin\` 添加到 \`Path\`

### 环境变量说明

| 变量 | 说明 | 示例值 |
|------|------|--------|
| \`JAVA_HOME\` | JDK 安装根目录 | \`/usr/lib/jvm/java-17-openjdk\` |
| \`PATH\` | 添加 \`$JAVA_HOME/bin\` | 包含 javac、java 命令 |
| \`CLASSPATH\` | 类搜索路径（通常不需要手动设置） | - |

\`\`\`bash
# 验证环境变量
echo $JAVA_HOME
echo $PATH | grep java
\`\`\`

> **注意：** 如果系统中存在多个 Java 版本，确保 \`JAVA_HOME\` 指向正确的版本。可以使用 \`update-alternatives\`（Linux）或 \`jenv\` 来管理多版本。

## 构建工具对比

Node.js 和 Java 生态中的构建工具承担着类似的职责：依赖管理、项目构建、脚本执行等。

### 核心概念对照

| 概念 | Node.js (npm) | Java (Maven) | Java (Gradle) |
|------|---------------|--------------|---------------|
| 配置文件 | \`package.json\` | \`pom.xml\` | \`build.gradle\` |
| 依赖仓库 | npmjs.com | Maven Central | Maven Central + 其他 |
| 依赖目录 | \`node_modules/\` | \`~/.m2/repository/\` | \`~/.gradle/caches/\` |
| 锁文件 | \`package-lock.json\` | - | \`gradle.lockfile\` |
| 运行脚本 | \`npm run dev\` | \`mvn spring-boot:run\` | \`gradle bootRun\` |
| 安装依赖 | \`npm install\` | \`mvn install\` | \`gradle build\` |
| 打包 | \`npm pack\` | \`mvn package\` | \`gradle jar\` |

### Maven 安装

\`\`\`bash
# macOS
brew install maven

# Linux
sudo apt install maven

# 验证
mvn -version
\`\`\`

### Gradle 安装

\`\`\`bash
# macOS
brew install gradle

# Linux
sudo apt install gradle

# 验证
gradle -version
\`\`\`

> **提示：** Spring Boot 官方推荐使用 Maven。如果你是初学者，建议先使用 Maven，等熟悉后再尝试 Gradle。本教程后续示例均使用 Maven。

### package.json vs pom.xml

\`\`\`json
// Node.js - package.json
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  },
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
\`\`\`

\`\`\`xml
<!-- Java - pom.xml -->
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0.0</version>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
\`\`\`

## IDE 推荐

| 特性 | VS Code | IntelliJ IDEA |
|------|---------|---------------|
| 价格 | 免费 | Community 免费版 / Ultimate 付费版 |
| Java 支持 | 需安装扩展包 | 原生支持，功能最强 |
| Node.js 支持 | 原生支持良好 | 支持良好 |
| 启动速度 | 快 | 较慢（但功能强大） |
| 插件生态 | 丰富 | 丰富 |
| Spring Boot 支持 | 通过扩展支持 | Ultimate 版最佳 |
| 内存占用 | 较低 | 较高 |

### VS Code 推荐扩展

\`\`\`bash
# 安装 Java 扩展包
code --install-extension vscjava.vscode-java-pack
code --install-extension vmware.vscode-spring-boot
code --install-extension vscjava.vscode-maven

# Node.js 开发扩展
code --install-extension dbaeumer.vscode-eslint
\`\`\`

### IntelliJ IDEA 配置

1. 下载 [IntelliJ IDEA Community](https://www.jetbrains.com/idea/download/)（免费版即可满足基本需求）
2. 安装后进入 \`Settings > Plugins\`，搜索并安装 "Spring Boot Assistant"
3. 配置 JDK：\`File > Project Structure > SDKs\`，添加 JDK 17

> **提示：** 如果你主要做 Java/Spring Boot 开发，强烈推荐使用 IntelliJ IDEA Ultimate（付费版），它对 Spring Boot 的支持是无与伦比的。社区版也足够完成本教程的所有示例。

## 第一个 Hello World

### Node.js / Express 版本

\`\`\`bash
# 创建项目目录
mkdir node-hello && cd node-hello

# 初始化项目
npm init -y

# 安装 Express
npm install express

# 创建入口文件
\`\`\`

\`\`\`javascript
// index.js
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
});
\`\`\`

\`\`\`bash
# 启动服务
node index.js
# Server is running on http://localhost:3000

# 测试
curl http://localhost:3000/
# {"message":"Hello, World!"}
\`\`\`

### Java / Spring Boot 版本

**方式一：使用 Spring Initializr（推荐）**

1. 访问 [start.spring.io](https://start.spring.io/)
2. 选择配置：
   - Project: Maven
   - Language: Java
   - Spring Boot: 3.2.x
   - Group: \`com.example\`
   - Artifact: \`hello\`
   - Packaging: Jar
   - Java: 17
   - Dependencies: Spring Web
3. 点击 "Generate" 下载项目压缩包
4. 解压并用 IDE 打开

**方式二：使用 Maven 命令行**

\`\`\`bash
# 创建项目目录
mkdir spring-hello && cd spring-hello

# 创建 pom.xml（内容见上方构建工具对比章节）
# 创建源代码目录
mkdir -p src/main/java/com/example/hello
mkdir -p src/main/resources
\`\`\`

\`\`\`java
// src/main/java/com/example/hello/HelloApplication.java
package com.example.hello;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HelloApplication {
    public static void main(String[] args) {
        SpringApplication.run(HelloApplication.class, args);
    }
}
\`\`\`

\`\`\`java
// src/main/java/com/example/hello/HelloController.java
package com.example.hello;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HelloController {

    @GetMapping("/")
    public Map<String, String> hello() {
        return Map.of("message", "Hello, World!");
    }
}
\`\`\`

\`\`\`bash
# 编译并启动
mvn spring-boot:run

# 测试
curl http://localhost:8080/
# {"message":"Hello, World!"}
\`\`\`

### Hello World 对比分析

| 对比项 | Node.js / Express | Java / Spring Boot |
|--------|-------------------|---------------------|
| 代码量 | ~10 行 | ~25 行（两个文件） |
| 启动方式 | \`node index.js\` | \`mvn spring-boot:run\` |
| 默认端口 | 3000（自定义） | 8080（默认） |
| 返回 JSON | \`res.json()\` | 返回 Map 自动序列化 |
| 注解/装饰器 | 无（函数式） | \`@RestController\`、\`@GetMapping\` |
| 热重载 | 需要 nodemon | spring-boot-devtools |
| 启动速度 | 毫秒级 | 秒级（2-5 秒） |

> **注意：** Spring Boot 的启动速度比 Node.js 慢，这是因为 JVM 需要加载和优化。但在实际生产环境中，Spring Boot 的运行性能通常优于 Node.js，尤其是在 CPU 密集型任务上。

## 项目结构对比

\`\`\`
Node.js 项目                    Spring Boot 项目
node-hello/                     spring-hello/
├── index.js                    ├── pom.xml
├── package.json                ├── src/
├── package-lock.json           │   ├── main/
├── node_modules/               │   │   ├── java/
└── ...                         │   │   │   └── com/example/hello/
                                │   │   │       ├── HelloApplication.java
                                │   │   │       └── HelloController.java
                                │   │   └── resources/
                                │   │       └── application.properties
                                │   └── test/
                                │       └── java/
                                └── target/
\`\`\`

| 目录/文件 | Node.js 对应 | Spring Boot 对应 | 说明 |
|-----------|-------------|-----------------|------|
| 入口文件 | \`index.js\` | \`*Application.java\` | 程序启动入口 |
| 依赖配置 | \`package.json\` | \`pom.xml\` | 依赖和构建配置 |
| 源代码 | 根目录或 \`src/\` | \`src/main/java/\` | Java 源代码 |
| 配置文件 | \`.env\` 或 \`config/\` | \`src/main/resources/\` | 应用配置 |
| 测试代码 | \`__tests__/\` 或 \`*.test.js\` | \`src/test/java/\` | 单元测试 |
| 依赖目录 | \`node_modules/\` | \`~/.m2/repository/\` | 依赖包存储 |

## 小结

本章完成了 Node.js 和 Java Spring Boot 的开发环境搭建，并通过 Hello World 程序初步体验了两个框架的差异：

- **Node.js** 更加轻量和灵活，适合快速原型开发
- **Spring Boot** 结构更加规范，适合大型企业级项目
- 两者的核心概念（路由、中间件、依赖管理）是相通的

> **下一步：** 环境准备就绪，下一章我们将深入学习路由与请求处理，这是后端开发最核心的内容之一。
`;export{e as default};