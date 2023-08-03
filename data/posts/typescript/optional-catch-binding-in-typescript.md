---
title: 'TypeScript 中的 Optional catch Binding'
date: '2021-03-21'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/optional-catch-binding-in-typescript'
---

Typescript 2.5 实现了 [optional catch binding](https://github.com/tc39/proposal-optional-catch-binding) 提案，该提案修改了 ECMAScript 语法，允许 `catch` 从句可以没有绑定的错误变量。也就是，你现在可以忽略这个错误变量以及包裹它的圆括号：

```ts
try {
  // ...
} catch {
  // ...
}
```

在此之前，你必须声明这个变量即便你根本用不到它：

```ts
try {
  // ...
} catch (error) {
  // ...
}
```

### 生成的 Javascript 代码

如果作为你构建目标的 ECMAScript 版本不支持 optional catch binding（比如 ES5 或者 ES2015），Typescript 编译器会给每一个没有变量的 `catch` 从句添加一个变量，这样生成的代码就是语法正确的。

这是我们之前展示过的 `try/catch` 语句：

```ts
try {
  // ...
} catch {
  // ...
}
```

这是当构建目标为 ES5 时编译生成的 Javascript 代码：

```ts
try {
  // ...
} catch (_a) {
  // ...
}
```

假如我们使用 `--target esnext` 来编译我们的代码，没有变量的 `catch` 从句生成的代码不会有变化：

```ts
try {
  // ...
} catch {
  // ...
}
```

### ECMAScript 官方提案

在 2018 年一月的写作当下，ECMAScript 官方提案在 TC39 流程的阶段 3。因此 optional catch binding 不会是 ECMAScript 2018 最终特性集的一部分，它很可能会作为 ECMAScript 2019 的一部分被标准化。

好消息是，因为有了 Typescript 的支持，我们今天就可以使用 optional catch binding 而不用等各种相关的 Javascript 引擎实现这个提案。

### Optional catch Binding 的使用场景

你通常不希望静默地忽略应用中的错误。至少，你会想把它们打印到 console 中。然而，在一些有限的场景中，你可能并不需要这个绑定的错误变量。

比如你尝试将一个错误打印到控制台，然后出于某些原因，日志代码本身可能会引起另一个错误。你不希望你的日志代码抛出异常，所以在这个案例中，一个不带变量的 `catch` 从句可能是有意义的：

```ts
function log(error) {
  try {
    console.error(error)
  } catch {
    // There's not much more we can do
  }
}
```

我推荐你读一下 Axel Rauschmayer 的 [关于 optional catch binding 的博客文章](https://2ality.com/2017/08/optional-catch-binding.html)，以便更深入地理解实际的使用场景。
