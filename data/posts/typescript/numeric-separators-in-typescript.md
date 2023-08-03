---
title: 'TypeScript 中的数字分隔符'
date: '2021-04-04'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/numeric-separators-in-typescript'
---

Typescript 2.7 支持了数字分隔符，具体内容在 [Numberic Separators](https://github.com/tc39/proposal-numeric-separator) 这个 ECMAScript 提案中有陈述。有了这个特性，你可以在数字字面量中添加下划线作为分隔符来分组数字：

```ts
const worldPopulationIn2017 = 7_600_000_000
const leastSignificantByteMask = 0b1111_1111
const papayawhipColorHexCode = 0xff_ef_d5
```

分隔符不会改变数字字面量的值，但是通过这种逻辑分组可以帮助人们更快地阅读这个数字。可以看一看 Axel Rauschmayer 的 [ES Proposal: Numeric Separators](https://2ality.com/2018/02/numeric-separators.html) 文章了解更多详细的信息以及数字分隔符的一些限制。

### 带分隔符数字字面量的降级方案

当我们的编译目标是 `ES2015` 时，Typescript 会将上面的代码编译为以下的 Javascript 代码：

```ts
const worldPopulationIn2017 = 7600000000
const leastSignificantByteMask = 255
const papayawhipColorHexCode = 16773077
```

在写作的当下，不管我们将 `target` 设置成哪个语言版本（包括 `--target esnext`），Typescript 都不会在生成的代码中包含分隔符。同时，如果你使用了数字分隔符，生成的数字字面量是十进制的，即便你的目标 ECMAScript 版本支持二进制，八进制或者十六进制的字面量（比如 ES2015 就支持）。

不过，Typescript 团队在考虑可以生成带分隔符的数字字面量（根据 `--target` 语言版本支持的情况），所以在未来，生成的 Javascript 代码会和原始的 Typescript 代码更接近。
