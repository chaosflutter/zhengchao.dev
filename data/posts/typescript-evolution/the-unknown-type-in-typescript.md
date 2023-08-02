---
title: 'TypeScript 中的 unknown 类型'
date: '2021-05-23'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/the-unknown-type-in-typescript'
---

Typescript 3.0 引入了一个新的 `unknown` 类型，它是 `any` 类型的对应类型，且是类型安全的。

`unkonwn` 类型和 `any` 类型最主要的区别是，`unkonw` 类型的使用没有 `any` 那么宽松。对于 `unknown` 类型的值，我们在对它做大部分操作之前都需要经过某种形式的类型检查，但是，如果是 `any` 类型，我们不需要做任何类似检查。

这篇文章会聚焦 `unknown` 类型在实际中的使用，包括它和 `any` 类型的对比。如果想通过代码更全面细致地了解 `unknown` 类型的语法，可以阅读 Anders Hejlsberg 原始的 [pull request](https://github.com/Microsoft/TypeScript/pull/24439)。

### any 类型

为了更好地理解引入 `unknown` 类型背后的动机，我们先来看一下 `any` 类型。

`any` 类型在 2012 年 Typescript 第一次发布的时候就存在。它代表了 Javascript 所有可能的值——原始类型，对象，数组，函数，错误，symbols，以及所有你能想到的。

在 Typescript 中，任何类型都可以赋值给 `any` 类型。这使得 `any` 变成了一个顶层类型（top type），也被认为是该类型系统中的通用超级类型（universal supertype）。

下面是一些可以赋值给 `any` 类型变量的例子：

```ts
let value: any

value = true // OK
value = 42 // OK
value = 'Hello World' // OK
value = [] // OK
value = {} // OK
value = Math.random // OK
value = null // OK
value = undefined // OK
value = new TypeError() // OK
value = Symbol('type') // OK
```

`any` 类型本质上是这个类型系统中的“逃生舱”。作为开发，这给了我们很大的自由：Typescript 允许我们对一个 `any` 类型的值做任意的操作，而不用事先做任何检查。

在上面的例子中，`value` 变量被定义为 `any` 类型。因此，Typescript 认为下面的所有操作都是类型正确的：

```ts
let value: any

value.foo.bar // OK
value.trim() // OK
value() // OK
new value() // OK
value[0][1] // OK
```

在很多时候，这过于宽松了。使用 `any` 类型，你很容易写出类型正确的代码，但是运行时却会有问题。如果我们肆意使用 `any`，我们将不会得到太多来自 Typescript 的保护。

假如有一个顶层类型默认是类型安全的会不会更好？这就是 `unknown` 产生的初衷。

### unknown 类型

就像所有的类型都可以赋值给 `any`，任何类型也都可以赋值给 `unknown`。这使得 `unknown` 成为 Typescript 类型系统中又一个顶层类型（另一个就是 `any`）。

下面变量赋值的示例代码和前面我们看到的是一样的，不过这次变量的类型被定义为 `unknown`：

```ts
let value: unknown

value = true // OK
value = 42 // OK
value = 'Hello World' // OK
value = [] // OK
value = {} // OK
value = Math.random // OK
value = null // OK
value = undefined // OK
value = new TypeError() // OK
value = Symbol('type') // OKc
```

所有给 `value` 的赋值都认为是类型正确的。

但假如我们将一个 `unknown` 类型的值赋值给其他类型的变量会怎样？

```ts
let value: unknown

let value1: unknown = value // OK
let value2: any = value // OK
let value3: boolean = value // Error
let value4: number = value // Error
let value5: string = value // Error
let value6: object = value // Error
let value7: any[] = value // Error
let value8: Function = value // Error
```

`unknown` 类型只能赋值给 `any` 和 `unknown` 类型本身。直觉上很容易理解：一个容器只有能够保存任意类型的值才能保存 `unknown` 类型的值。毕竟，我们完全不知道 `value` 中储存的值的类型。

让我们再来看看如果对 `unknown` 类型的值进行操作会发生什么。下面的操作和前面看到的一样：

```ts
let value: unknown

value.foo.bar // Error
value.trim() // Error
value() // Error
new value() // Error
value[0][1] // Error
```

当 `value` 被定义为 `unknown` 后，所有的这些操作都被认为是类型不安全的。通过把 `any` 修改为 `unknown`，我们使得默认允许所有操作变为几乎不允许任何操作。

这就是 `unknown` 类型主要的价值主张：Typescript 不会允许我们对 `unknown` 类型的值做任意的操作。相反的，我们需要做一些类型检查来收窄我们需要处理的值的类型。

### 收窄 unknown 类型

我们可以通过不同的方式来收窄 `unknown` 类型为一个特定类型，包括 `typeof` 操作符，`instanceof` 操作符，以及自定义的类型守卫函数。所有的这些收窄技术都来自于 Typescript 的[基于控制流的类型分析](https://chaosflutter.com/ts-evolution/control-flow-based-type-analysis-in-typescript)。

下面的例子展示了 `value` 是如何在两个 `if` 语句分支中被收窄为更具体的类型的：

```ts
function stringifyForLogging(value: unknown): string {
  if (typeof value === 'function') {
    // Within this branch, `value` has type `Function`,
    // so we can access the function's `name` property
    const functionName = value.name || '(anonymous)'
    return `[function ${functionName}]`
  }

  if (value instanceof Date) {
    // Within this branch, `value` has type `Date`,
    // so we can call the `toISOString` method
    return value.toISOString()
  }

  return String(value)
}
```

除了使用 `typeof` 和 `instanceof` 操作符，我们还可以使用自定义的类型守卫函数来收窄 `unknown` 的类型：

```ts
/**
 * A custom type guard function that determines whether
 * `value` is an array that only contains numbers.
 */
function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every((element) => typeof element === 'number')
  )
}

const unknownValue: unknown = [15, 23, 8, 4, 42, 16]

if (isNumberArray(unknownValue)) {
  // Within this branch, `unknownValue` has type `number[]`,
  // so we can spread the numbers as arguments to `Math.max`
  const max = Math.max(...unknownValue)
  console.log(max)
}
```

注意 `unknownValue` 是如何在 `if` 语句中被推断为 `number[]` 类型的，即便它一开始被声明为 `unknown` 类型。

### 对 unknown 使用类型断言

在上面的文章中，我们看到如何使用 `typeof`、`instanceof`，以及自定义的类型守卫函数来使 Typescript 编译器相信某个值有特定的类型。我们推荐使用这种安全的方式来收窄 `unknown` 类型为一个特定的类型。

如果你想强制编译器相信 `unknown` 类型的值有一个给定的类型，你可以像下面这样使用类型断言：

```ts
const value: unknown = 'Hello World'
const someString: string = value as string
const otherString = someString.toUpperCase() // "HELLO WORLD"
```

注意，Typescript 不会做任何的特殊检查来确保类型断言是真实有效的。类型检查器会假设你知道得更多，并且相信你在类型断言中使用的类型是正确的。

如果你自己犯了错，设置了一个错误的类型，这很容易导致在运行时抛出一个错误：

```ts
const value: unknown = 42
const someString: string = value as string
const otherString = someString.toUpperCase() // BOOM
```

`value` 变量保存了一个数字，但是我们通过类型断言 `value as string` 假装它是一个字符串。使用类型断言的时候要特别小心！

### 联合类型中的 unknown 类型

我们再来看看如何在联合类型中使用 `unknown` 类型。在后面的文章中，我们也会看一看交集类型（intersection types）。

在联合类型中，`unknown` 类型会吞并所有类型。这意味着，只要组成的类型中有 `unknown`，那么这个联合类型就会被计算为 `unknown` 类型：

```ts
type UnionType1 = unknown | null // unknown
type UnionType2 = unknown | undefined // unknown
type UnionType3 = unknown | string // unknown
type UnionType4 = unknown | number[] // unknown
```

唯一的例外是 `any`。如果有一个组成类型是 `any`，那么联合类型会被计算为 `any`：

```ts
type UnionType5 = unknown | any // any
```

所以为什么 `unknown` 类型会吞并所有类型（除了 `any`）？我们来思考一下 `unknown | string` 类型。这个类型代表所有可以赋值给类型 `unknown` 类型和可以赋值给 `string` 类型的值。正如我们之前所学的，所有的类型都可以赋值给 `unknown`。这包括所有的字符串，因此，`unknown | string` 代表的类型范围和 `unknown` 是一样的。所以，编译器会将这个联合类型简化为 `unknown` 类型。

### 交集类型中的 unknown 类型

在交集类型中，所有的类型都会吞并 `unknown`。这意味着，任何类型和 `unknown` 交集都不会改变该类型：

```ts
type IntersectionType1 = unknown & null // null
type IntersectionType2 = unknown & undefined // undefined
type IntersectionType3 = unknown & string // string
type IntersectionType4 = unknown & number[] // number[]
type IntersectionType5 = unknown & any // any
```

我们来看一看 `IntersectionType3`： `unknown & string` 类型代表了所有可以同时赋值给 `unknown` 和 `string` 的值。因为所有的类型都可以赋值给 `unknown`，在交集类型中包含 `unknown` 并不会改变最终结果。所以这个交集类型会被计算为 `string` 类型。

### 对 unknown 类型的值使用操作符

`unknown` 类型的值不能作为大多数操作符的操作数。这是因为，如果我们不知道我们处理的值的类型，大多数操作符并不会得到有意义的结果。

对于 `unknown` 类型的值，你只能使用以下的四个等于和不等于操作符：

- ===
- ==
- !==
- !=

如果你想对 `unknown` 类型的值使用其他操作符，你需要先收窄它的类型（或者通过类型断言强制编译器相信你）。

### 例子：从 localStorage 中读取 JSON

下面是一个关于如何使用 `unknown` 类型的实际例子。

假设我们要写一个函数，从 localStorage 中读取一个值并作为 JSON 进行反序列化。如果这个值不存在，或者不是合法的 JSON，函数会返回一个错误结果；否则，它应该反序列化后返回正确的值。

因为我们并不知道在我们反序列化 JSON 字符串之后得到的值的类型，我们会将反序列化得到的值的类型定为 `unknown`。这意味着我们函数的调用者在对返回值进行操作之前需要先进行某些类型检查（或者使用类型断言）。

下面是这个函数的实现代码：

```ts
type Result =
  | { success: true; value: unknown }
  | { success: false; error: Error }

function tryDeserializeLocalStorageItem(key: string): Result {
  const item = localStorage.getItem(key)

  if (item === null) {
    // The item does not exist, thus return an error result
    return {
      success: false,
      error: new Error(`Item with key "${key}" does not exist`),
    }
  }

  let value: unknown

  try {
    value = JSON.parse(item)
  } catch (error) {
    // The item is not valid JSON, thus return an error result
    return {
      success: false,
      error,
    }
  }

  // Everything's fine, thus return a success result
  return {
    success: true,
    value,
  }
}
```

`Result` 返回值类型是一个[标签联合类型](https://chaosflutter.com/ts-evolution/tagged-union-types-in-typescript)，或称可辨识联合类型（discriminated union type）。在某些语言中，它也被认知为 `Maybe`，`Option` 或者 `Optional`。我们使用 `Result` 清晰地表达了操作可能的成功或失败的结果。

`tryDeserializeLocalStorageItem` 函数的调用者需要先检查 `success` 属性，然后才能尝试使用 `value` 或 `error` 属性。

```ts
const result = tryDeserializeLocalStorageItem('dark_mode')

if (result.success) {
  // We've narrowed the `success` property to `true`,
  // so we can access the `value` property
  const darkModeEnabled: unknown = result.value

  if (typeof darkModeEnabled === 'boolean') {
    // We've narrowed the `unknown` type to `boolean`,
    // so we can safely use `darkModeEnabled` as a boolean
    console.log('Dark mode enabled: ' + darkModeEnabled)
  }
} else {
  // We've narrowed the `success` property to `false`,
  // so we can access the `error` property
  console.error(result.error)
}
```

注意 `tryDeserializeLocalStorageItem` 函数不能简单地返回 `null` 来表示反序列化失败，因为以下两个原因：

1. `null` 是合法的 JSON 值。因此，我们不能区分是反序列化了 `null` 还是因为某个缺少的元素或语法错误导致整个操作失败了。
2. 如果我们从函数中返回 `null`，我们不能同时返回错误对象。因此，我们函数的调用者就不知道为什么操作失败了。

出于完整性考虑，一个更好的替代方案是使用 [typed decoders](https://mariusschulz.com/blog/the-unknown-type-in-typescript) 来更安全地解析 JSON。解码器（decoder） 允许我们给需要反序列化的值设定期望的 schema。如果 JSON 最终不能匹配这个 schema，解码会以一种优雅的方式失败。通过这种方式，我们的函数要么返回一个有效的值，要么返回一个失败的解码结果，并且我们不再需要使用 `unknown` 类型。
