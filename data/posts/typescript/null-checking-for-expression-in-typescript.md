---
title: 'TypeScript 中表达式操作数的空检查'
date: '2021-01-11'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/null-checking-for-expression-operands-in-typescript'
---

Typescript 2.2 中，空检查（null checking）又得到了改善。Typescript 现在会识别操作数可能为空的表达式，并报编译时错误。

当遇到以下的情况，Typescript 会将可能为空的表达式操作数标记为错误。内容引用自[发布记录](https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#better-checking-for-nullundefined-in-operands-of-expressions)：

```
- 如果 + 操作符任意一个操作数可能为空，并且没有一个操作数是`any`或`string`类型。
- 如果 -, \*, \*\*, /, %, <<, >>, >>>, &, |, 或者 ^ 操作符任意一个操作数可能为空。
- 如果 <, >, <=, >=, 或者 in 操作符任意一个操作数可能为空。
- 如果 instanceof 操作符的右操作数可能为空
- 如果 +, -, ~, ++, 或 -- 一元操作符的操作数可能为空。
```

我们来看有哪些场景如果不注意会被可能为空的表达式操作数绊一脚。在 Typescript 2.2 之前，下面的函数能够通过编译：

```ts
function isValidPasswordLength(password: string, min: number, max?: number) {
  return password.length >= min && password.length <= max
}
```

注意 `max` 参数是可选的。这意味着我们调用 `isValidPasswordLength` 可以传两个也可以传三个参数：

```ts
isValidPasswordLength('open sesame', 6, 128) // true
isValidPasswordLength('open sesame', 6, 8) // false
```

密码“open sesame”是 10 个字符长度。因此 `[6, 128]` 入参会返回 `true`，`[6, 8]` 入参会返回 `false`，目前来看，这没问题。

如果我们调用 `isValidPasswordLength` 的时候没有传 `max` 参数， 且密码的长度超过了 `min` 的值，我们很可能期望返回 `true`。然而，并不如所愿：

```ts
isValidPasswordLength('open sesame', 6) // false
```

问题出在 `<= max` 这个比较。如果 `max` 是 `undefined`，`<= max` 结果将永远是 `false`。在这种情况下，`isValidPasswordLength` 永远不会返回 `true`。

在 Typescript 2.2 中，`password.length <= max` 不再是类型安全的，当然前提是你的应用是以严格 null 检查模式（strict null checking mode）运行的（你应该这么做）：

```ts
function isValidPasswordLength(password: string, min: number, max?: number) {
  return password.length >= min && password.length <= max // Error: Object is possibly 'undefined'.
}
```

所以我们该怎么修改以使得程序是类型正确的？一种可能的解决方法是给 `max` 参数提供一个默认的值，当 `undefined` 传入的时候这个默认值就会起作用。这样做，`max` 参数依然是可选的，但永远是一个数字类型的值：

```ts
function isValidPasswordLength(
  password: string,
  min: number,
  max: number = Number.MAX_VALUE
) {
  return password.length >= min && password.length <= max
}
```

当然还有其他的方式可以选择，不过上面的处理已经不错了。只要我们不再去比较 `max` 和 `undefined`，就不会有问题了。
