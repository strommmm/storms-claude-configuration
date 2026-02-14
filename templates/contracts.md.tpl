# 模块接口契约文档

> 模块名称：{{MODULE_NAME}}
> 版本：v1.0
> 最后更新：{{DATE}}

---

## 1. Service 接口（暴露给其他模块）

### {{ServiceName}}Service

#### `methodName(params): ReturnType`

- **描述**：
- **参数**：
  ```typescript
  interface MethodParams {
    // 参数定义
  }
  ```
- **返回值**：
  ```typescript
  interface MethodResult {
    // 返回值定义
  }
  ```
- **异常**：
  - `NotFoundError` — 描述
  - `ValidationError` — 描述
- **调用方**：{{调用方模块列表}}

---

## 2. Controller 接口（暴露给前端的 HTTP API）

### `METHOD /api/v1/resource`

- **描述**：
- **认证**：是否需要登录
- **请求参数**：
  ```typescript
  // Query / Path / Body
  interface RequestBody {
    // 请求体定义
  }
  ```
- **成功响应**（200）：
  ```typescript
  interface SuccessResponse {
    code: 0;
    data: {
      // 响应数据定义
    };
  }
  ```
- **错误响应**：
  | HTTP 状态码 | 错误码 | 描述 |
  |-------------|--------|------|
  | 400 | INVALID_PARAMS | 参数错误 |
  | 404 | NOT_FOUND | 资源不存在 |

---

## 3. Events（关键领域事件）

### `{{ModuleName}}.{{EventName}}`

- **触发条件**：
- **负载（Payload）**：
  ```typescript
  interface EventPayload {
    // 事件数据定义
  }
  ```
- **订阅方**：{{订阅方模块列表}}
- **处理说明**：

---

## 4. 依赖的外部接口

### 依赖模块：{{ModuleName}}

| 接口 | 用途 | 是否可选 |
|------|------|----------|
| `ServiceName.methodName()` | 描述 | 是/否 |

### 订阅的外部事件

| 事件 | 来源模块 | 处理说明 |
|------|----------|----------|
| `Module.EventName` | {{ModuleName}} | 描述 |

---

## 变更记录

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
| {{DATE}} | v1.0 | 初始版本 | Architect |
