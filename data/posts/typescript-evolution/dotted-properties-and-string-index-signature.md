---
title: 'TypeScript 中的点操作符属性和字符串索引签名'
date: '2021-01-04'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/dotted-properties-and-string-index-signatures-in-typescript'
---

在 Typescript 2.2 之前，你如果想访问一个包含字符串索引签名类型上的任意属性，你必须使用 `[]` 的方式，而不能使用 `.` 操作符：

```ts
interface Dictionary<T> {
  [key: string]: T
}

const portNumbers: Dictionary<number> = {}

// OK
portNumbers['http'] = 80

// Error: Property 'http' does not exist on type 'Dictionary<number>'.
portNumbers.http = 80
```

Typescript 2.2 移除了这个限制。现在你既可以用点操作符也可以用方括号的形式来访问属性，编译器不会再对你咆哮了。在很多场景下，你不再需要使用下面这种不愉快的曲折迂回的方式：

```ts
// Awkward!
;(portNumbers as any).http = 80
```

注意你需要通过字符串索引签名的方式显式地声明对象的类型，才能以类型安全的方式通过点运算符访问属性。对于下面的代码，Typescript 2.2 依然会给出一个编译时错误：

```ts
const portNumbers = {}

// OK
portNumbers['http'] = 80

// Error: Property 'http' does not exist on type '{}'.
portNumbers.http = 80
```

如果你仔细思考你会发现这么做是有意义的：对于上面的代码，如果 Typescript 不报错，属性名拼写错误不会有任何保护。在 Javascript 中你多数时候会使用点操作符来访问属性，但如果需要，你永远可以使用方括号的方式作为替代。

因为相对更宽松的限制，使得在 Typescript 使用 Javascript 中的又一个惯常写法变得更容易。这对于从一个已有的 Javascript 代码库迁移到 Typescript 的场景中尤其有用。只要有适当的字符串索引签名，你可以减少在这些场景下的类型错误，并且你再也不需要仅仅为了让编译器开心而去给点操作符属性添加冗余的类型标记。
