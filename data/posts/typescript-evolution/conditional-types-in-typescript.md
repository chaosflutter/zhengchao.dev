---
title: 'TypeScript 中的条件类型'
date: '2021-04-25'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/conditional-types-in-typescript'
---

Typescript 2.8 引入了条件类型，它是类型系统强有力的补充。条件类型允许我们表达更灵活的类型映射，也就是，类型转换会根据不同的条件而不同。

### 介绍条件类型

条件类型会先测试一种类型关系，并基于测试结果，选择两种可能类型中的一种。它永远有以下的形式：

```ts
T extends U ? X : Y
```

条件类型使用了熟悉的 `... ? ... : ...` 语法，它在 Javascript 中被用于条件表达式。`T`, `U`, `X` 和 `Y` 代表了任意类型。 其中 `T extends U` 描述了类型关系测试。如果条件满足，类型 `X` 被选择，否则类型 `Y` 被选择。

如果使用人类语言，条件类型可以描述如下：如果类型 `T` 可以赋值给 `U`，选择类型 `X`，否则选择类型 `Y`。

下面的条件类型例子来自于 Typescript lib.es5.d.ts 类型定义文件中预定义的类型：

```ts
/**
 * Exclude null and undefined from T
 */
type NonNullable<T> = T extends null | undefined ? never : T
```

如果类型 `T` 可以赋值给类型 `null` 或者类型 `undefined`，`NonNullable<T>` 类型会选择 `never` 类型，否则它会使用类型 `T`。`never` 类型是 Typescript 的 [bottom type](https://en.wikipedia.org/wiki/Bottom_type)，表示这个类型的值不可能存在。

### 可分配的条件类型

为什么结合条件类型和 `never` 类型是有用的？因为它允许我们从一个联合类型中移除某些类型。如果条件类型关系测试的是原始的泛型参数（naked type parameter，译者注：也就是 T，而不是 [T] 之类），则条件类型被称为可分配的条件类型（见[Distributive conditional types ](https://www.zhihu.com/question/470581497/answer/1985882672)），它会在联合类型实例化的时候基于分配率进行类型分配。

因为 `NonNullable<T>` 检查的是原始泛型参数，它可以基于联合类型比如 `A | B` 根据分配率进行类型分配。这意味着 `NonNullable<A | B>` 最后等同于 `NonNullable<A> | NonNullable<B>`。如果，比如 `NonNullable<A>` 最后运算得到 `never` 类型，我们可以将 `A` 从结果的联合类型中去除，有效地过滤 A 这个空类型。同理，相同规则也适用于 `NonNullable<B>`。

上面的描述相当抽象，让我们来看一个具体的例子。我们定义了一个叫 `EmailAddress` 的类型别名代表不同类型的联合，其中包括了 `null` 和 `undefined` 类型：

```ts
type EmailAddress = string | string[] | null | undefined
```

现在我们将 `NonNullable<T>` 类型应用于 `EmailAddress`，然后一步步得到结果类型：

```ts
type NonNullableEmailAddress = NonNullable<EmailAddress>
```

我们先用联合类型替换 `EmailAddress` 这个类型别名：

```ts
type NonNullableEmailAddress = NonNullable<string | string[] | null | undefined>
```

现在就轮到可分配条件类型出场的时候了。我们给一个联合类型应用了 `NonNullable<T>`，这等同于给联合类型中的所有类型都应用了这个条件类型：

```ts
type NonNullableEmailAddress =
  | NonNullable<string>
  | NonNullable<string[]>
  | NonNullable<null>
  | NonNullable<undefined>
```

现在我们用 `NonNullable<T>` 的定义来替换它：

```ts
type NonNullableEmailAddress =
  | (string extends null | undefined ? never : string)
  | (string[] extends null | undefined ? never : string[])
  | (null extends null | undefined ? never : null)
  | (undefined extends null | undefined ? never : undefined)
```

接着，我们计算得到每一个条件类型的结果类型。`string` 和 `string[]` 都不能赋值给 `null | undefined`，所以前两个条件类型分别选择了 `string` 和 `string[]`。而 `null` 和 `undefined` 都可以赋值给 `null | undefined`，所以后面两种条件类型都选择了 `never`：

```ts
type NonNullableEmailAddress = string | string[] | never | never
```

因为 `never` 是任何类型的子类型，所以我们可以将它从联合类型中去除。这样我们就得到了最终的结果类型：

```ts
type NonNullableEmailAddress = string | string[]
```

而这就是我们期望得到的类型。

### 条件类型和映射类型一起用

现在让我们来看一个更复杂的例子，它结合了条件类型和映射类型。这里我们定义了一个类型，它可以从一个类型中抽取出所有非空属性值类型对应的 key：

```ts
type NonNullablePropertyKeys<T> = {
  [P in keyof T]: null extends T[P] ? never : P
}[keyof T]
```

上面的类型初看可能难以理解。再一次，我尝试通过具体的例子一步一步让它变得更易懂。

假设我们有一个 `User` 类型，并且想使用 `NonNullablePropertyKeys<T>` 类型来找出哪些属性是非空的：

```ts
type User = {
  name: string
  email: string | null
}

type NonNullableUserPropertyKeys = NonNullablePropertyKeys<User>
```

下面就讲解如何分析 `NonNullablePropertyKeys<User>` 类型。首先，我们将 `T` 类型参数替换为具体的 `User` 类型：

```ts
type NonNullableUserPropertyKeys = {
  [P in keyof User]: null extends User[P] ? never : P
}[keyof User]
```

然后，我们接着解析映射类型中的 `keyof User`。`User` 类型包含了两个属性，`name` 和 `email`，所以我们可以得到 `"name"` 和 `"email"` 字符串字面量组成的联合类型：

```ts
type NonNullableUserPropertyKeys = {
  [P in 'name' | 'email']: null extends User[P] ? never : P
}[keyof User]
```

接着，我们将 `P in ...` 映射展开，然后用 `"name"` 和 `"email"` 替换 `P` 类型：

```ts
type NonNullableUserPropertyKeys = {
  name: null extends User['name'] ? never : 'name'
  email: null extends User['email'] ? never : 'email'
}[keyof User]
```

更进一步，我们可以解析索引访问类型 `User["name"]` 和 `User["email"]`，得到 `User` 中 `name` 和 `email` 属性的具体类型：

```ts
type NonNullableUserPropertyKeys = {
  name: null extends string ? never : 'name'
  email: null extends string | null ? never : 'email'
}[keyof User]
```

现在是时候应用我们的条件类型。`null` 并不能赋值给 `string`，但它可以赋值给 `string | null`，我们因此分别得到 `"name"` 和 `never` 类型：

```ts
type NonNullableUserPropertyKeys = {
  name: 'name'
  email: never
}[keyof User]
```

现在映射类型和条件类型都解析完了。再一次，我们解析 `keyof User`：

```ts
type NonNullableUserPropertyKeys = {
  name: 'name'
  email: never
}['name' | 'email']
```

我们现在有一个索引访问类型查询 `name` 和 `email` 属性的类型。Typescript 会分别查询这两个类型，然后创建一个查询结果的联合类型：

```ts
type NonNullableUserPropertyKeys =
  | { name: 'name'; email: never }['name']
  | { name: 'name'; email: never }['email']
```

马上就搞定了！我们现在分别查询 `name` 和 `email` 两个属性的类型，`name` 属性有一个 `"name"` 类型，`email` 属性有一个 `never` 类型：

```ts
type NonNullableUserPropertyKeys = 'name' | never
```

就如之前所示，我们可以将 `never` 类型去掉从而得到最终的结果类型：

```ts
type NonNullableUserPropertyKeys = 'name'
```

完成！`User` 类型中唯一不可能为空的属性对应的 key 就是 `"name"`。

我们把这个例子再往前推一步，定义一个类型来抽取一个给定类型中所有不为空的属性。我们可以使用 `Pick<T, K>`，它在 lib.es5.d.ts 中被定义：

```ts
/**
 * From T, pick a set of properties
 * whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
```

我们可以结合 `NonNullablePropertyKeys<T> ` 类型和 `Pick<T, K>` 类型来定义 `NonNullableProperties<T>`，它就是我们要得到的类型：

```ts
type NonNullableProperties<T> = Pick<T, NonNullablePropertyKeys<T>>

type NonNullableUserProperties = NonNullableProperties<User>
// { name: string }
```

如上所示，这就是我们所期望的：在我们的 `User` 类型中，只有 `name` 属性是非空的。

### 条件类型中的类型推断

另一个条件类型支持的有用特性是通过 `infer` 关键字来推断类型变量的类型。在一个条件类型的 `extends` 从句中，你可以使用 `infer` 关键字来推断一个类型变量，并有效地在类型中运用模式匹配：

```ts
type First<T> = T extends [infer U, ...unknown[]] ? U : never

type SomeTupleType = [string, number, boolean]
type FirstElementType = First<SomeTupleType> // string
```

注意被推断的类型变量（在这里是 `U`）只能在条件类型的 true 分支中被使用。

一个被长期呼吁的 Typescript 应该提供的特性是能够从一个给定的函数中抽离出它的返回值类型。下面是 lib.es5.d.ts 文件中定义的 `ReturnType<T>` 类型的简化版本。它使用了 `infer` 关键字来推断函数类型的返回值类型：

```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any

type A = ReturnType<() => string> // string
type B = ReturnType<() => () => any[]> // () => any[]
type C = ReturnType<typeof Math.random> // number
type D = ReturnType<typeof Array.isArray> // boolean
```

注意我们需要使用 `typeof` 来获取 `Math.random()` 和 `Array.isArray()` 的返回值类型。我们需要给泛型 T 传递一个类型作为参数，而不是一个值。这是为什么直接写 `ReturnType<Math.random>` 和 `ReturnType<Array.isArray>` 是不对的。

如果想了解更多关于 `infer` 是如何工作的，可以看一下这个[pull request](https://github.com/Microsoft/TypeScript/pull/21496)，其中 Anders Hejlsberg 介绍了条件类型中的类型推断。

### 预定义的条件类型

条件类型绝对是 Typescript 类型系统中的高级特性。为了给你更多他们可以被如何使用的例子，我会介绍一些 Typescript lib.es5.d.ts 文件中预定义的条件类型。

### `NonNullable<T>` 条件类型

我们已经见过和使用过 `NonNullable<T>` 类型了，它能过过滤出 `T` 类型中的 `null` 和 `undefined`。

它定义如下：

```ts
/**
 * Exclude null and undefined from T
 */
type NonNullable<T> = T extends null | undefined ? never : T
```

一些例子：

```ts
type A = NonNullable<boolean> // boolean
type B = NonNullable<number | null> // number
type C = NonNullable<string | undefined> // string
type D = NonNullable<null | undefined> // never
```

注意空类型 `D` 是如何被运算为 `never` 的。

### `Extract<T, U>` 条件类型

`Extract<T, U>` 类型可以让我们过滤出所有可以赋值给 U 的 T 类型。

它的定义：

```ts
/**
 * Extract from T those types that are assignable to U
 */
type Extract<T, U> = T extends U ? T : never
```

一些例子：

```ts
type A = Extract<string | string[], any[]> // string[]
type B = Extract<(() => void) | null, Function> // () => void
type C = Extract<200 | 400, 200 | 201> // 200
type D = Extract<number, boolean> // never
```

### `Exclude<T, U>` 条件类型

`Exclude<T, U>` 类型可以让我们过滤出所有不能赋值给 U 的 T 类型。它和 `Extract<T, U>` 是相反的类型。

它的定义：

```ts
/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T
```

一些例子：

```ts
type A = Exclude<string | string[], any[]> // string
type B = Exclude<(() => void) | null, Function> // null
type C = Exclude<200 | 400, 200 | 201> // 400
type D = Exclude<number, boolean> // number
```

### `ReturnType<T>` 条件类型

就如上面我们看到的，`ReturnType<T>` 可以让我们从一个函数类型中抽离出返回值类型。

它的定义：

```ts
/**
 * Obtain the return type of a function type
 */
type ReturnType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : any
```

一些例子：

```ts
type A = ReturnType<() => string> // string
type B = ReturnType<() => () => any[]> // () => any[]
type C = ReturnType<typeof Math.random> // number
type D = ReturnType<typeof Array.isArray> // boolean
```

### `Parameters<T>` 条件类型

`Parameters<T>` 类型让我们从一个函数类型中抽离出所有的参数类型。它会产生一个包含了所有参数类型的元祖类型（或者是类型 `never` 如果 `T` 不是一个函数）。

它的定义：

```ts
/**
 * Obtain the parameters of a function type in a tuple
 */
type Parameters<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never
```

注意 `Parameters<T>` 和 `ReturnType<T>` 类型在结构上几乎是一样的。他们最主要的区别是 `infer` 关键字的位置不同。

一些例子：

```ts
type A = Parameters<() => void> // []
type B = Parameters<typeof Array.isArray> // [any]
type C = Parameters<typeof parseInt> // [string, (number | undefined)?]
type D = Parameters<typeof Math.max> // number[]
```

`Array.isArray()` 方法期望一个任意类型的参数，这是为什么 `B` 类型是 `[any]`，一个只包含一个元素的元祖。`Math.max()` 方法，相反的，期望获得任意多个数字类型的参数（不是单一的一个数组参数），因此，类型 `D` 被推断为 `number[]`（而不是 [number[]]）。

### `ConstructorParameters<T>` 条件类型

`ConstructorParameters<T>` 条件类型让我们可以从一个构造函数中抽取所有参数的类型。它也会产生一个包含了所有参数类型的元祖类型（或者是 `never` 类型如果 `T` 不是函数的话）。

它的定义：

```ts
/**
 * Obtain the parameters of a constructor function type in a tuple
 */
type ConstructorParameters<T extends new (...args: any[]) => any> =
  T extends new (...args: infer P) => any ? P : never
```

注意 `ConstructorParameters<T>` 类型和 `Parameters<T>` 几乎是一样的。唯一的不同是添加了 `new` 关键字来明示这是一个构造函数。

一些例子：

```ts
type A = ConstructorParameters<ErrorConstructor>
// [(string | undefined)?]

type B = ConstructorParameters<FunctionConstructor>
// string[]

type C = ConstructorParameters<RegExpConstructor>
// [string, (string | undefined)?]
```

### `InstanceType<T>` 条件类型

`InstanceType<T>` 让我们可以从一个构造函数类型中抽取返回值类型。它等同于构造函数的 `ReturnType<T>` 类型。

它的定义：

```ts
/**
 * Obtain the return type of a constructor function type
 */
type InstanceType<T extends new (...args: any[]) => any> = T extends new (
  ...args: any[]
) => infer R
  ? R
  : any
```

再一次，注意 `InstanceType<T>` 类型和 `ReturnType<T>` 以及 `ConstructorParameters<T>` 在结构上是非常相似的。

一些例子：

```ts
type A = InstanceType<ErrorConstructor> // Error
type B = InstanceType<FunctionConstructor> // Function
type C = InstanceType<RegExpConstructor> // RegExp
```
