---
title: "TypeScript 高级类型编程：实战设计模式"
date: 2026-03-08
description: "深入探索 TypeScript 类型系统的高级特性，包括条件类型、映射类型、模板字面量类型等，结合实际设计模式展示类型体操的威力。"
tags:
  - TypeScript
  - 设计模式
  - 类型系统
  - 前端
coverImage: ./cover.jpg
---

# TypeScript 高级类型编程：实战设计模式

TypeScript 的类型系统是图灵完备的，这意味着你可以在类型层面实现复杂的逻辑。本文将通过实际的设计模式案例，展示高级类型编程的强大能力。

## 条件类型与推断

### 基础：Infer 关键字

```typescript
// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取 Promise 内部类型
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

// 提取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never;
```

### 实战：API 响应类型推断

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

type ExtractData<T> = T extends ApiResponse<infer D> ? D : never;

// 使用
interface User {
  id: string;
  name: string;
  email: string;
}

type UserResponse = ApiResponse<User>;
type UserData = ExtractData<UserResponse>; // User
```

## 映射类型与键重映射

### 深度可选

```typescript
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

interface Config {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
}

type PartialConfig = DeepPartial<Config>;
// 所有嵌套属性都变为可选
```

### 键重映射：前缀添加

```typescript
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K];
};

interface Actions {
  login: () => void;
  logout: () => void;
  refresh: () => void;
}

type PrefixedActions = Prefixed<Actions, 'on'>;
// { onLogin: () => void; onLogout: () => void; onRefresh: () => void }
```

## 模板字面量类型

### 路由类型安全

```typescript
type PathParams<Path extends string> =
  Path extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof PathParams<Rest>]: string }
    : Path extends `${infer _Start}:${infer Param}`
      ? { [K in Param]: string }
      : {};

// 使用
type UserRouteParams = PathParams<'/users/:userId/posts/:postId'>;
// { userId: string; postId: string }

function navigate<T extends string>(
  path: T,
  params: PathParams<T>
): void {
  // 类型安全的路由导航
}

navigate('/users/:userId', { userId: '123' }); // ✅
navigate('/users/:userId', { id: '123' }); // ❌ 类型错误
```

### 事件系统类型

```typescript
type EventHandler<T extends string> = `on${Capitalize<T>}`;

type EventMap = {
  click: MouseEvent;
  keydown: KeyboardEvent;
  scroll: Event;
};

type EventHandlers = {
  [K in keyof EventMap as EventHandler<K>]: (event: EventMap[K]) => void;
};
// { onClick: (e: MouseEvent) => void; onKeydown: (e: KeyboardEvent) => void; ... }
```

## 设计模式实现

### Builder 模式

```typescript
type Builder<T, Keys extends keyof T = never> = {
  [K in Exclude<keyof T, Keys>]: (
    value: T[K]
  ) => Builder<T, Keys | K>;
} & (Keys extends keyof T ? { build: () => T } : {});

function createBuilder<T>(): Builder<T> {
  const result: Partial<T> = {};
  
  return new Proxy({} as Builder<T>, {
    get(_, prop: string) {
      if (prop === 'build') {
        return () => result as T;
      }
      return (value: unknown) => {
        (result as any)[prop] = value;
        return createBuilder<T>();
      };
    },
  });
}

// 使用
interface User {
  name: string;
  age: number;
  email: string;
}

const user = createBuilder<User>()
  .name('Alice')
  .age(25)
  .email('alice@example.com')
  .build();
```

### 状态机类型

```typescript
type StateMachine<
  States extends string,
  Events extends string,
  Transitions extends { [K in States]?: { [E in Events]?: States } }
> = {
  current: States;
  transition: <E extends Events>(
    event: E
  ) => Transitions[States] extends { [K in E]?: infer Next }
    ? Next extends States
      ? StateMachine<States, Events, Transitions>
      : never
    : never;
};

// 定义状态机
type TrafficLight = StateMachine<
  'green' | 'yellow' | 'red',
  'timer' | 'emergency',
  {
    green: { timer: 'yellow'; emergency: 'red' };
    yellow: { timer: 'red'; emergency: 'red' };
    red: { timer: 'green'; emergency: 'red' };
  }
>;
```

## 实用工具类型库

```typescript
// 深度只读
type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

// 类型安全的 Pick
type StrictPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 非空属性提取
type NonNullableProps<T> = {
  [K in keyof T as T[K] extends null | undefined ? never : K]: T[K];
};

// 函数重载联合
type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
```

## 总结

TypeScript 的类型系统远比表面看起来的更加强大。通过掌握条件类型、映射类型、模板字面量类型等高级特性，你可以：

1. **编译时验证**：在代码运行前捕获错误
2. **更好的 IDE 支持**：精准的自动补全和类型提示
3. **自文档化代码**：类型即文档

类型体操虽然烧脑，但一旦掌握，将极大提升代码的健壮性和开发体验。
