---
title: 测试与质量保障
chapter: 13
---

# 测试与质量保障

## 核心概念

### 为什么后端测试更重要？

| 维度 | 前端测试 | 后端测试 |
|------|---------|---------|
| 影响范围 | 单个用户 | 所有用户 |
| 数据风险 | UI 展示错误 | 数据丢失/泄露 |
| 回归成本 | 页面刷新即可 | 数据库状态不可逆 |
| 测试价值 | 提升体验 | 保障安全与稳定 |

### 测试金字塔

```
        /  E2E  \
       / 端到端  \\        ← 少量，验证核心流程
      /-----------\\
     /  集成测试   \\       ← 适量，验证模块协作
    /---------------\\
   /    单元测试       \\    ← 大量，验证业务逻辑
  /-------------------\\
```

| 测试类型 | 速度 | 覆盖范围 | 维护成本 | 数量占比 |
|---------|------|---------|---------|--------|
| 单元测试 | ⚡ 极快 | 单个函数/类 | 低 | 70% |
| 集成测试 | 🐢 中等 | 多模块协作 | 中 | 20% |
| E2E 测试 | 🐌 慢 | 完整流程 | 高 | 10% |

## Node.js 实现

### Jest 单元测试

```bash
npm install --save-dev jest @types/jest ts-jest
```

```javascript
// src/utils/validator.js
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

function validatePassword(password) {
  if (password.length < 8) return { valid: false, message: '密码至少8个字符' }
  if (!/[A-Z]/.test(password)) return { valid: false, message: '需要包含大写字母' }
  if (!/[0-9]/.test(password)) return { valid: false, message: '需要包含数字' }
  return { valid: true }
}

module.exports = { validateEmail, validatePassword }
```

```javascript
// src/utils/__tests__/validator.test.js
const { validateEmail, validatePassword } = require('../validator')

describe('validateEmail', () => {
  test('有效邮箱返回 true', () => {
    expect(validateEmail('test@example.com')).toBe(true)
  })

  test('无效邮箱返回 false', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('missing@')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
  })
})

describe('validatePassword', () => {
  test('有效密码返回 valid: true', () => {
    expect(validatePassword('Abc12345')).toEqual({ valid: true })
  })

  test('太短密码返回错误', () => {
    expect(validatePassword('Ab1')).toEqual({ valid: false, message: '密码至少8个字符' })
  })
})
```

### Supertest 集成测试

```bash
npm install --save-dev supertest
```

```javascript
// tests/api/users.test.js
const request = require('supertest')
const app = require('../../src/app')

describe('Users API', () => {
  describe('POST /api/users', () => {
    test('创建用户成功', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Alice', email: 'alice@example.com' })
        .expect(201)

      expect(res.body.name).toBe('Alice')
      expect(res.body).toHaveProperty('id')
    })

    test('缺少必填字段返回 400', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Alice' })
        .expect(400)

      expect(res.body.error).toContain('邮箱')
    })
  })

  describe('GET /api/users/:id', () => {
    test('获取用户成功', async () => {
      const res = await request(app)
        .get('/api/users/1')
        .expect(200)

      expect(res.body).toHaveProperty('id', '1')
    })

    test('用户不存在返回 404', async () => {
      const res = await request(app)
        .get('/api/users/999')
        .expect(404)
    })
  })
})
```

### Mock 技术

```javascript
// 使用 jest.mock 模拟外部依赖
jest.mock('../../src/services/emailService')

const emailService = require('../../src/services/emailService')
const userService = require('../../src/services/userService')

describe('UserService', () => {
  test('注册用户时发送欢迎邮件', async () => {
    // 设置 mock 行为
    emailService.sendWelcomeEmail.mockResolvedValue(true)

    await userService.register('Alice', 'alice@example.com')

    // 验证 mock 被正确调用
    expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
      'alice@example.com',
      'Alice'
    )
    expect(emailService.sendWelcomeEmail).toHaveBeenCalledTimes(1)
  })
})
```

### 测试覆盖率

```bash
npx jest --coverage
```

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

## Spring Boot 实现

### JUnit 5 单元测试

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <scope>test</scope>
</dependency>
```

```java
// src/test/java/com/example/util/ValidatorTest.java
class ValidatorTest {

    @Test
    void validEmailReturnsTrue() {
        assertTrue(Validator.validateEmail("test@example.com"));
    }

    @Test
    void invalidEmailReturnsFalse() {
        assertFalse(Validator.validateEmail("invalid"));
        assertFalse(Validator.validateEmail("missing@"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Abc12345", "Xyz98765", "Test1234"})
    void validPasswords(String password) {
        ValidationResult result = Validator.validatePassword(password);
        assertTrue(result.isValid());
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"short", "nodigits", "NOLOWERCASE"})
    void invalidPasswords(String password) {
        if (password != null) {
            assertFalse(Validator.validatePassword(password).isValid());
        }
    }
}
```

### MockMvc 集成测试

```java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    void getUserById() throws Exception {
        User user = new User("1", "Alice", "alice@example.com");
        when(userService.findById("1")).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Alice"))
            .andExpect(jsonPath("$.email").value("alice@example.com"));
    }

    @Test
    void getUserNotFound() throws Exception {
        when(userService.findById("999")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void createUserSuccess() throws Exception {
        when(userService.create(any())).thenReturn(new User("1", "Alice", "alice@example.com"));

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Alice\",\"email\":\"alice@example.com\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void createUserValidationFail() throws Exception {
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"A\",\"email\":\"invalid\"}"))
            .andExpect(status().isBadRequest());
    }
}
```

### @SpringBootTest 完整集成测试

```java
@SpringBootTest
@AutoConfigureMockMvc
class OrderIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void createOrderFlow() throws Exception {
        // 创建订单
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"1\",\"productId\":\"p1\",\"quantity\":2}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("CONFIRMED"));

        // 验证数据库
        assertEquals(1, orderRepository.findAll().size());
    }
}
```

### Mockito Mock 技术

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    @Test
    void registerUser_sendsWelcomeEmail() {
        // 定义 mock 行为
        when(userRepository.save(any(User.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // 执行
        userService.register("Alice", "alice@example.com");

        // 验证交互
        verify(emailService).sendWelcomeEmail("alice@example.com", "Alice");
        verify(userRepository).save(any(User.class));
        verifyNoMoreInteractions(emailService);
    }

    @Test
    void findById_throwsWhenNotFound() {
        when(userRepository.findById("999")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> userService.findById("999"));
    }
}
```

### TestContainers 数据库测试

```xml
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>junit-jupiter</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>mysql</artifactId>
  <scope>test</scope>
</dependency>
```

```java
@SpringBootTest
@Testcontainers
class UserRepositoryTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired
    private UserRepository userRepository;

    @Test
    void saveAndFindUser() {
        User user = new User(null, "Alice", "alice@example.com");
        userRepository.save(user);

        Optional<User> found = userRepository.findByName("Alice");
        assertTrue(found.isPresent());
        assertEquals("alice@example.com", found.get().getEmail());
    }
}
```

### JaCoCo 覆盖率

```xml
<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <version>0.8.11</version>
  <executions>
    <execution>
      <goals><goal>prepare-agent</goal></goals>
    </execution>
    <execution>
      <id>report</id>
      <phase>test</phase>
      <goals><goal>report</goal></goals>
    </execution>
  </executions>
</plugin>
```

## TDD 实践

### 红 → 绿 → 重构

```
1. 🔴 红：写一个会失败的测试
2. 🟢 绿：写最少的代码让测试通过
3. 🔵 重构：优化代码结构，确保测试仍然通过
```

### Node.js TDD 示例

```javascript
// 1. 红：先写测试
describe('PriceCalculator', () => {
  test('计算折扣价格', () => {
    expect(calculateDiscount(100, 0.2)).toBe(80)
  })

  test('折扣不能为负数', () => {
    expect(() => calculateDiscount(100, -0.1)).toThrow('折扣不能为负数')
  })
})

// 2. 绿：写实现
function calculateDiscount(price, discount) {
  if (discount < 0) throw new Error('折扣不能为负数')
  if (discount > 1) throw new Error('折扣不能大于1')
  return Math.round(price * (1 - discount) * 100) / 100
}
```

### Spring Boot TDD 示例

```java
// 1. 红：先写测试
class PriceCalculatorTest {

    @Test
    void calculateDiscount() {
        assertEquals(80, PriceCalculator.calculate(100, 0.2));
    }

    @Test
    void negativeDiscountThrows() {
        assertThrows(IllegalArgumentException.class,
            () -> PriceCalculator.calculate(100, -0.1));
    }
}

// 2. 绿：写实现
public class PriceCalculator {
    public static double calculate(double price, double discount) {
        if (discount < 0) throw new IllegalArgumentException("折扣不能为负数");
        if (discount > 1) throw new IllegalArgumentException("折扣不能大于1");
        return Math.round(price * (1 - discount) * 100.0) / 100.0;
    }
}
```

## 知识迁移要点

### 相似点

| 概念 | Node.js | Spring Boot |
|------|---------|-------------|
| 测试框架 | Jest | JUnit 5 |
| 断言库 | expect() | assertEquals / assertTrue |
| Mock | jest.mock() | @MockBean / Mockito |
| 集成测试 | Supertest | MockMvc / @SpringBootTest |
| 覆盖率 | c8 / Istanbul | JaCoCo |
| 参数化测试 | test.each() | @ParameterizedTest |
| TDD | 红-绿-重构 | 红-绿-重构 |

### 差异点

| 维度 | Node.js | Spring Boot |
|------|---------|-------------|
| 测试启动 | 快（无需容器） | 较慢（Spring 上下文） |
| Mock 方式 | 自动 mock 模块 | 注解 + 手动配置 |
| 数据库测试 | 内存 SQLite | TestContainers（真实数据库） |
| 测试隔离 | 每个文件独立 | @DirtiesContext 控制上下文 |
| 工具链 | Jest 内置一切 | 需要组合多个工具 |

## 小结

- **测试金字塔**：70% 单元测试 + 20% 集成测试 + 10% E2E 测试
- Node.js 推荐用 **Jest + Supertest**，开箱即用
- Spring Boot 推荐用 **JUnit 5 + Mockito + MockMvc + TestContainers**
- **TDD** 是提升代码质量的有效方法：先写测试，再写实现
- 测试覆盖率是参考指标，**不要盲目追求 100%**，关注核心业务逻辑
- 好的测试应该是**快速、独立、可重复**的
