---
title: 'TypeScript 中的字面量类型拓宽'
date: '2020-12-14'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/literal-type-widening-in-typescript'
---

在我上一篇谈 Typesript 2.1 更好的类型推断的文章中，我解释了 Typescript 如何将初始化了字面量值的 `const` 变量和 `readyonly` 属性推断为字面量类型。在这篇文章中，我会继续讨论并区分拓宽和非拓宽的字面量类型。

### 拓宽的字面量类型

当你用 `const` 关键字声明了一个局部变量，并且初始化了一个字面量值，Typescript 会将其推断为字面量类型：

```ts
const stringLiteral = 'https' // Type "https"
const numericLiteral = 42 // Type 42
const booleanLiteral = true // Type true
```

因为有 `const` 关键字，上面的每一个变量值都不能被改变，所以推断为字面量类型是非常合适的。它保留了赋值的准确类型信息。

如果你将上面的这些常量赋值给 `let` 声明的变量，每一个字面量类型会被拓宽为相应的拓宽类型：

```ts
let widenedStringLiteral = stringLiteral // Type string
let widenedNumericLiteral = numericLiteral // Type number
let widenedBooleanLiteral = booleanLiteral // Type boolean
```

和 `const` 关键字声明的变量不同，`let` 关键字声明的变量初始化之后还是可以被修改的。它们通常会被初始化一个值，并且之后会被修改。如果 Typescript 将每一个 `let` 变量都推断为字面量类型，那么之后如果想给它赋值初始值以外的值都会导致编译时报错。

基于这个原因，`let` 变量会被推断为拓宽后的类型。对于枚举类型同样也如此：

```ts
enum FlexDirection {
  Row,
  Column,
}

const enumLiteral = FlexDirection.Row // Type FlexDirection.Row
let widenedEnumLiteral = enumLiteral // Type FlexDirection
```

总结一下，下面是字面量类型拓宽的规则：

- 字符串字面量类型会被拓宽为字符串类型
- 数字字面量类型会被拓宽为数字类型
- 布尔字面量类型会被拓宽为布尔类型
- 枚举字面量类型会被拓宽为枚举类型

目前为止，我们学习了字面量类型如果在需要的时候被自动拓宽。现在我们再来看下非拓宽的字面量类型，正如其名所示，它们不会被自动拓宽。

### 非拓宽的字面量类型

你可以显式地给一个变量标注字面量类型来新建一个非拓宽字面量类型的变量：

```ts
const stringLiteral: 'https' = 'https' // Type "https" (non-widening)
const numericLiteral: 42 = 42 // Type 42 (non-widening)
```

当把一个非拓宽字面量类型的变量赋值给另一个变量的时候，字面量类型不会被拓宽：

```ts
let widenedStringLiteral = stringLiteral // Type "https" (non-widening)
let widenedNumericLiteral = numericLiteral // Type 42 (non-widening)
```

注意，类型依然是 `https` 和 `42`。和之前不同，之前会被分别拓宽为 `string` 和 `number` 类型。

### 非拓宽字面量类型的用处

为了更好地理解非拓宽字面量是有用的，让我们再来看一看拓宽字面量类型。在下面的例子中，使用了两个拓宽后的字符串字面量类型的变量构建了一个数组：

```ts
const http = 'http' // Type "http" (widening)
const https = 'https' // Type "https" (widening)

const protocols = [http, https] // Type string[]

const first = protocols[0] // Type string
const second = protocols[1] // Type string
```

Typescript 会将这个数组推断为 `string[]`。因此，数组的元素比如 `first` 和 `second` 都会被推断为 `string` 类型。`http` 和 `https` 的字面量类型信息在拓宽的过程中丢失了。

如果你显式地将这两个常量标注为 `http` 和 `https` 类型，`protocols` 数组会被推断为 `("http" | "https")[]`，这表示这个数组只能包含字符串 `"http"` 或者 `"https"`。

```ts
const http: 'http' = 'http' // Type "http" (non-widening)
const https: 'https' = 'https' // Type "https" (non-widening)

const protocols = [http, https] // Type ("http" | "https")[]

const first = protocols[0] // Type "http" | "https"
const second = protocols[1] // Type "http" | "https"
```

现在 `first` 和 `second` 都被推断为 `"http" | "https"` 类型。这是因为数组类型并没有区分索引 0 和索引 1 位置的 `"http"` 和 `"https"` 具体类型，数组只知道元素不管在哪个索引位置，只能包含这两个字面量类型。

如果出于某些原因，你想保留数组中字符串字面量类型的位置信息，你可以显式地将这个数组标注为拥有两个元素的元组类型：

```ts
const http = 'http' // Type "http" (widening)
const https = 'https' // Type "https" (widening)

const protocols: ['http', 'https'] = [http, https] // Type ["http", "https"]

const first = protocols[0] // Type "http" (non-widening)
const second = protocols[1] // Type "https" (non-widening)
```

现在，`first` 和 `second` 被推断为他们各自非拓宽的字符串字面量类型。

### 更多的阅读

如果你想了解更多关于拓宽和非拓宽类型背后的理论依据，你可以阅读下面这些 GitHub 上的讨论和 PR：

- [https://github.com/Microsoft/TypeScript/pull/10676](https://github.com/Microsoft/TypeScript/pull/10676)
- [https://github.com/Microsoft/TypeScript/pull/11126](https://github.com/Microsoft/TypeScript/pull/11126)
- [https://github.com/Microsoft/TypeScript/issues/10938#issuecomment-247476364](https://github.com/Microsoft/TypeScript/issues/10938#issuecomment-247476364)
