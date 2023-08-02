---
title: 'TypeScript 中的 keyof 和类型查询'
date: '2020-11-23'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/keyof-and-lookup-types-in-typescript'
---

Javascript 是高度动态的语言。所以想要在一个静态类型系统中捕获某些操作的语义并不是件容易的事。比如下面的 `prop` 函数：

```ts
function prop(obj, key) {
  return obj[key]
}
```

它接受一个对象和一个 key 作为入参，然后返回对应的属性的值。对象中不同属性的值可能有完全不同的类型，并且，我们甚至不知道 `obj` 的类型是怎样的。

那么我们在 Typescript 中如何给这个函数添加类型信息呢？这是最初的尝试：

```ts
function prop(obj: {}, key: string) {
  return obj[key]
}
```

添加了这两个类型标记以后，`obj` 必须是一个对象，同时 `key` 必须是一个字符串。我们限制了两个入参值的类型范围，但是函数的返回类型还是 `any`：

```ts
const todo = {
  id: 1,
  text: 'Buy milk',
  due: new Date(2016, 11, 31),
}

const id = prop(todo, 'id') // any
const text = prop(todo, 'text') // any
const due = prop(todo, 'due') // any
```

如果没有更多的信息，Typescript 并不知道传入函数的 `key` 的值究竟是什么，所以它不能推断出 `prop` 函数更具体的返回类型。因此我们需要提供更多的类型信息来得到更具体的返回类型。

### keyof 操作符

现在就来说说 Typescript 2.1 中的新的 `keyof` 操作符。它会查询一个给定类型的 key 集合，这是为什么它也被称为索引类型查询的原因。假设我们定义了以下的 `Todo` 接口：

```ts
interface Todo {
  id: number
  text: string
  due: Date
}
```

我们可以将 `keyof` 操作符应用于 `Todo` 类型以此得到一个代表了所有属性 key 的类型，在这里它是一个字符串字面量的联合类型：

```ts
type TodoKeys = keyof Todo // "id" | "text" | "due"
```

我们当然也可以手动写出 `"id" | "text" | "due"` 这个联合类型，而不使用 `keyof`，但这样做显然是比较愚蠢、容易出错，并且极难维护的。另外，这样做并不是一种通用的方式，而只是针对 `Todo` 类型的一种解决办法。

### 索引访问类型（Indexed Access Types）

使用了 `keyof` 之后，我们就能改善 `prop` 函数的类型标注。我们不再把 `key` 参数作为任意的字符串类型，相应的，我们要求这个 key 一定是存在于传入的 object 对象类型中的：

```ts
function prop<T, K extends keyof T>(obj: T, key: K) {
  return obj[key]
}
```

Typescript 现在会推断 `prop` 函数有一个 `T[k]` 的返回类型，这就是所谓的索引访问类型或者叫查询类型（lookup type）。它代表了类型 `T` 的属性 `K` 的类型。现在如果我们通过 `prop` 函数来访问这三个 todo 属性，每一个都会得到正确的类型：

```ts
const todo = {
  id: 1,
  text: 'Buy milk',
  due: new Date(2016, 11, 31),
}

const id = prop(todo, 'id') // number
const text = prop(todo, 'text') // string
const due = prop(todo, 'due') // Date
```

假如我们传入一个 `todo` 对象上不存在的 key 的会怎么样呢？

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_invalid_keyof_parameter-2x.ctrzy3emr6.imm.png)

编译器会报错，这很不错，它能阻止我们去访问一个并不存在的属性。

再举一个更实际的例子，我们看一下 Typescript 编译器内置的 lib.es2017.object.d.ts 类型声明文件中的 `Object.entries()` 方法是如何声明类型的：

```ts
interface ObjectConstructor {
  // ...
  entries<T extends { [key: string]: any }, K extends keyof T>(
    o: T
  ): [keyof T, T[K]][]
  // ...
}
```

`entries` 方法会返回一组数组，每一个包含了属性 key 和对象的值。返回类型中的确包含了太多的方括号，不过，它拥有了我们想要的类型安全！
