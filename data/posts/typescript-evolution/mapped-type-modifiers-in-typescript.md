---
title: 'TypeScript 中的映射类型修饰符'
date: '2021-05-02'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/mapped-type-modifiers-in-typescript'
---

在 2016 年 12 月 Typescript 2.1 的时候，映射类型被添加到了这门语言中。作为 Typescript 2.8 的一部分，映射类型增加了给属性添加或删除特定修饰符的能力。在这之前，我们只能给属性添加修饰符，而不能移除它们。

### ? 属性修饰符

你可以在一个对象类型声明的任意属性后添加 `?` 修饰符来使得该属性变成可选属性：

```ts
interface TodoItem {
  description: string
  priority?: 'high' | 'medium' | 'low'
}
```

添加了 `?` 之后，在创建一个 `TodoItem` 类型的对象时可以设置也可以不设置 `priority` 属性：

```ts
// We can set the `priority` property to one of the 3 values
const todo1: TodoItem = {
  description: 'Mow the lawn',
  priority: 'high',
}

// Or we can leave it out entirely (since it's optional)
const todo2: TodoItem = {
  description: 'Mow the lawn',
}

// Or we can explicitly set the value `undefined`
const todo3: TodoItem = {
  description: 'Mow the lawn',
  priority: undefined,
}
```

我们已经知道如何将一个特定对象类型的特定属性变为可选属性。现在我们来看一看如何在泛型中运用 `?` 修饰符来让一个给定类型的所有属性变成可选。

### `Partial<T>` 映射类型

转换一个给定类型的所有属性是映射类型典型的使用场景。一个映射类型定义了类型的转换程序。也就是，它可以得到一个已存在类型的所有属性，然后根据映射规则转换它们，最后创造一个由这些转换后属性组成的新类型。

让我们来定义一个 `Partial<T>` 映射类型，给泛型 `T` 的所有属性添加 `?` 修饰符：

```ts
type Partial<T> = {
  [P in keyof T]?: T[P]
}
```

我们的 `Partial<T>` 类型使用了 `keypf` 操作符来得到 `T` 类型定义的所有属性。它同时使用了索引访问类型`T[P]`来查询`T` 的每一个 `P` 属性的类型。最后，通过 `?`修饰符把每一个属性变成了可选。

如果我们将 `Partial<T>` 应用于前面的 `TodoItem` 类型，结果类型会得到两个可选的属性：

```ts
type PartialTodoItem = Partial<TodoItem>
// {
//   description?: string | undefined;
//   priority?: "high" | "medium" | "low" | undefined;
// }
```

可以发现 `Partial<T>` 在很多应用中都非常有用，所以 Typescript 团队决定将它包括在 lib.es5.d.ts 文件中，作为 typescript 这个 npm 包的一部分一起发布。

```ts
/**
 * Make all properties in T optional
 */
type Partial<T> = {
  [P in keyof T]?: T[P]
}
```

### 移除 ？映射类型修饰符

我们已经知道如何通过`Partial<T>`给一个给定类型 `T` 的所有属性添加 `?` 修饰符。那我们如何从一个给定类型的所有属性中移除 `?` 修饰符呢？

在 Typescript 2.8 中，你可以给 `?` 修饰符添加 `-` 前缀来移除它。一个移除了 `?` 修饰符的属性会变成一个必需的属性。lib.es5.d.ts 文件现在包含了一个新定义的 `Required<T>` 类型来做这件事：

```ts
/**
 * Make all properties in T required
 */
type Required<T> = {
  [P in keyof T]-?: T[P]
}
```

我们可以使用 `Required<T>` 来使得 `TodoItem` 类型的所有属性都变成必需：

```ts
type RequiredTodoItem = Required<TodoItem>
// {
//   description: string;
//   priority: "high" | "medium" | "low";
// }
```

注意，在经过这个转换后，`priority` 属性不再是可选的。

### 添加 ? 映射类型修饰符

我们已经知道通过 `-?` 移除 `?` 修饰符。为了保持对称和一致性，Typescript 允许你通过 `+?` 来给属性添加 `?` 修饰符。所以你也可以像下面这样定义 `Partial<T>` 类型：

```ts
type Partial<T> = {
  [P in keyof T]+?: T[P]
}
```

注意一个不包含 `+` 或者 `-` 前缀的属性修饰符和添加了 `+` 前缀的属性修饰符效果是一样的。写 `+?` 相比 `?` 并没有什么额外的好处。我建议你还是继续使用 `?`，它是你在一个接口或类型别名中定义可选属性所使用的语法。

### readonly 属性修饰符

你可以在映射类型中使用 `readonly` 修饰符来使得属性变成只读：

```ts
type ReadonlyTodoItem = Readonly<TodoItem>
// {
//   readonly description?: string | undefined;
//   readonly priority?: "high" | "medium" | "low" | undefined;
// }
```

如果你给一个只读属性赋值编译器会提示错误：

```ts
const todo: ReadonlyTodoItem = {
  description: 'Mow the lawn',
  priority: 'high',
}

// Error: Cannot assign to 'priority'
// because it is a read-only property.
todo.priority = 'medium'
```

### 移除 readonly 映射类型修饰符

和通过 `-?` 移除 `?` 修饰符类似，你可以通过 `-readonly` 移除 `readonly` 修饰符。让我们来定义一个 `Mutable<T>` 类型，帮助我们移除 `T` 类型中的所有属性的 `readonly` 修饰符：

```ts
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}
```

现在，下面的代码变成类型正确了，编译器不会再抱怨说不能给一个只读属性赋值：

```ts
const todo: Mutable<ReadonlyTodoItem> = {
  description: 'Mow the lawn',
  priority: 'high',
}

todo.priority = 'medium'
```

### 添加 readyonly 映射类型修饰符

和通过 `+?` 给属性添加 `?` 修饰符类似，你也可以通过 `+readonly` 给属性添加 `readonly` 修饰符。所以你可以像下面这样重写预定义的 `Readonly<T>` 映射类型：

```ts
type Readonly<T> = {
  +readonly [P in keyof T]: T[P]
}
```

再一次，我建议你继续使用普通的 `readonly`，因为使用 `+readonly` 并没有什么额外的好处。
