---
title: 'TypeScript 中的 Omit 帮助类型'
date: '2021-06-20'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/the-omit-helper-type-in-typescript'
---

在 3.5 版本中， Typescript 增加了 `Omit<T, K>` 帮助类型，作为 lib.es5.d.ts 类型定义文件的一部分和 Typescript 编译器一起发布。`Omit<T, K>` 允许我们通过从一个对象中删除特定的属性来创建一个新的对象类型。

```ts
type User = {
  id: string
  name: string
  email: string
}

type UserWithoutEmail = Omit<User, 'email'>

// This is equivalent to:
type UserWithoutEmail = {
  id: string
  name: string
}
```

`Omit<T, K>` 在 lib.es5.d.ts 文件中被定义如下：

```ts
/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
```

为了拆解这个定义，并且理解它是如何工作的，我们先来思考如何自己实现 `Omit<T, K>`。

### 定义 `Omit<T, K>` 帮助类型

让我们从上面定义的 `User` 类型开始：

```ts
type User = {
  id: string
  name: string
  email: string
}
```

首先，我们需要获取 `User` 类型所有的的 key。我们可以使用 `keyof` 操作符来获取这个对象类型所有属性的 key，它是一个字符串字面量的联合类型：

```ts
type UserKeys = keyof User

// This is equivalent to:
type UserKeys = 'id' | 'name' | 'email'
```

接着，我们需要从这个字符串字面量联合类型中移除特定的字符串字面量类型。在我们的 `User` 类型例子中，我们需要从 `"id" | "name" | "email"` 联合类型中移除 `"email"` 类型。我们可以使用 `Exclude<T, U>` 帮助类型来实现：

```ts
type UserKeysWithoutEmail = Exclude<UserKeys, 'email'>

// This is equivalent to:
type UserKeysWithoutEmail = Exclude<'id' | 'name' | 'email', 'email'>

// This is equivalent to:
type UserKeysWithoutEmail = 'id' | 'name'
```

`Exclude<T, U>` 类型在 lib.es5.d.ts 中被定义如下：

```ts
/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T
```

它使用了[条件类型](https://chaosflutter.com/ts-evolution/conditional-types-in-typescript) 以及 never 类型。通过使用 `Exclude<T, U>`，我们移除了 `"id" | "name" | "email"` 联合类型中可以赋值给 `"email"` 的类型。在这里只有类型 `"email"` 自己可以赋值给 `"email"` 类型，所以我们得到了最终的 `"id | "name"` 联合类型。

最后，我们需要创建一个包含了 `User` 类型属性子集的对象类型。准确地说，我们要创建一个对象类型，它只包含 `UserKeysWithoutEmail` 联合类型中能够找到的属性 key。我们可以使用 `Pick<T, K>` 帮助类型来从 `User` 类型中选出这些属性。

```ts
type UserWithoutEmail = Pick<User, UserKeysWithoutEmail>

// This is equivalent to:
type UserWithoutEmail = Pick<User, 'id' | 'name'>

// This is equivalent to:
type UserWithoutEmail = {
  id: string
  name: string
}
```

`Pick<T, K>` 在 lib.es5.d.ts 中定义如下：

```ts
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
```

`Pick<T, K>` 类型是一个映射类型，它使用了 `keyof` 操作符和索引访问类型 `T[P]` 来从对象类型 `T` 中获取属性 `P` 的类型。

现在我们来将我们使用的 `keyof`, `Exclude<T, U>`, 和 `Pick<T, K>` 结合在一个类型声明中：

```ts
type UserWithoutEmail = Pick<User, Exclude<keyof User, 'email'>>
```

注意这个类型只适用于我们的 `User` 类型，让我们通过泛型来使得它变得更通用。

```ts
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
```

现在我们可以使用这个类型来计算我们的 `UserWithoutEmail` 类型：

```ts
type UserWithoutEmail = Omit<User, 'email'>
```

因为对象的 key 只能是字符串、数字和 symbol 类型，我们可以给 `Omit<T, K>` 的参数 `K` 添加泛型约束，只允许 `string`、`number` 和 `symbol` 类型的 key：

```ts
type Omit<T, K extends string | number | symbol> = Pick<T, Exclude<keyof T, K>>
```

`extends string | number | symbol` 这个泛型约束略微有点啰嗦。我们可以用 `keyof any` 来替代 `string | number | symbol` 联合类型，这两个类型是等价的：

```ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
```

完成！我们最终得到了和 lib.es5.d.ts 类型定义文件中 `Omit<T, K>` 帮助类型相同的定义。

```ts
/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
```

### 展开 `Omit<User, "email">`

下面展示了如何一步一步展开 `Omit<User, "email">` 类型。可以尝试跟踪每一步来理解 Typescript 是如何计算出最终类型的：

```ts
type User = {
  id: string
  name: string
  email: string
}

type UserWithoutEmail = Omit<User, 'email'>

// This is equivalent to:
type UserWithoutEmail = Pick<User, Exclude<keyof User, 'email'>>

// This is equivalent to:
type UserWithoutEmail = Pick<User, Exclude<'id' | 'name' | 'email', 'email'>>

// This is equivalent to:
type UserWithoutEmail = Pick<
  User,
  | ('id' extends 'email' ? never : 'id')
  | ('name' extends 'email' ? never : 'name')
  | ('email' extends 'email' ? never : 'email')
>

// This is equivalent to:
type UserWithoutEmail = Pick<User, 'id' | 'name' | never>

// This is equivalent to:
type UserWithoutEmail = Pick<User, 'id' | 'name'>

// This is equivalent to:
type UserWithoutEmail = {
  [P in 'id' | 'name']: User[P]
}

// This is equivalent to:
type UserWithoutEmail = {
  id: User['id']
  name: User['name']
}

// This is equivalent to:
type UserWithoutEmail = {
  id: string
  name: string
}
```

拿好了，这就是我们的 `UserWithoutEmail` 类型。
