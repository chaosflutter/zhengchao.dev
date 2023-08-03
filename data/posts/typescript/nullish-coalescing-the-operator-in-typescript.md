---
title: 'TypeScript 中的 ?? 空值合并运算符'
date: '2021-06-27'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/nullish-coalescing-the-operator-in-typescript'
---

Typescript 3.7 中增加了对 `??` 运算符的支持，它被称为空值合并运算符（nullish coalescing operator）。我们可以使用这个操作符来给可能是 `null` 或者 `undefined` 的值提供一个备用值（fallback）。

### Javascript 中的真值和假值

在我们深入研究 `??` 操作符之前，我们来复习一下 Javascript 的真值和假值：当转换为布尔类型的时候，一个值会转换为 `true` 或者 `false`。在 Javascript 中，以下的这些值被认为是假值：

- false
- 0
- -0
- 0n
- NaN
- ""
- null
- undefined

除此以外，其他所有的值在转为布尔类型的时候都会是 `true`，所以被认为是真值。

### 通过 `??` 操作符提供备选值

`??` 操作符可以给一个可能为 `null` 或者 `undefined` 的值提供一个备选的值。它有两个操作数，写法如下：

```ts
value ?? fallbackValue
```

如果左边的操作数是 `null` 或者 `undefined`，`??` 表达式会返回右边操作数的值：

```ts
null ?? 'n/a'
// "n/a"

undefined ?? 'n/a'
// "n/a"
```

否则，`??` 表达式会返回左边操作数的值：

```ts
false ?? true
// false

0 ?? 100
// 0

'' ?? 'n/a'
// ""

NaN ?? 0
// NaN
```

注意上面的例子中左边的操作数都是假值。如果我们使用的是 `||` 而不是 `??`，所有的表达式都会返回右操作数的值。

```ts
false || true
// true

0 || 100
// 100

'' || 'n/a'
// "n/a"

NaN || 0
// 0
```

这就是为什么你不应该使用 `||` 操作符来给一个 nullable 提供备用值。因为对于某些假值，可能产生的结果并不是你想要或期望的。思考下面的例子：

```ts
type Options = {
  prettyPrint?: boolean
}

function serializeJSON(value: unknown, options: Options): string {
  const prettyPrint = options.prettyPrint ?? true
  // ...
}
```

`options.prettyPrint ?? true` 表达式允许我们在 `prettyPrint` 属性包含 `null` 或者 `undefined` 的时候提供 `true` 这个默认值。如果 `prettyPrint` 的值是 `false`，表达式 `false ?? true` 仍然会返回 `false`，这就是我们确切想要的行为。

注意这个例子中如果使用 `||` 操作符，会导致错误的结果。当值是 `null` 或者 `undefinded` 时，`options.prettyPrint || true` 会计算为 `true`，但当值是 `false` 的时候，返回的结果就不是我们想要的了。我不止一次在实践中发现过这种问题，所以请记住这个例子，并且使用 `??` 操作符而非 `||`。

### 编译输出：ES2020 以及更高版本

空值合并运算符已经到了 TC39 流程的阶段 4（最终阶段），并且是 ES2020 的一部分。因此，当你 tsconfig.json 中的构建目标是 "ES2020"（或者更高的语言版本）或者 "ESNEXT"，Typescript 编译器会直接输出 `??` 操作符而不会做任何的降级处理：

```ts
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020"
  }
}
```

所以这个例子会被原样输出：

```ts
value ?? fallbackValue
```

如果你计划使用 `??` 操作符，建议去 [caniuse.com](https://caniuse.com/#feat=mdn-javascript_operators_nullish_coalescing) 以及 [node.green](https://node.green/#ES2020-features--nullish-coalescing-operator-----) 看一看，确保你需要支持的所有 Javascript 引擎都已经实现了这个操作符。

### 编译后的 Javascript 输出： ES2019 以及更低版本

如果你 tsconfig.json 文件中的构建目标是 "ES2019" 或者更低的版本，Typescript 编译器会重写空值合并操作符为条件表达式。这样，我们现在就能使用 `??` 操作符，并且在更老的 Javascript 引擎中正确解析和执行相关的编译后代码。

让我们再来看一下 `??` 表达式：

```ts
value ?? fallbackValue
```

假设我们的构建目标是 "ES2019" 或更低的语言版本，Typescript 编译器会产出以下的 Javascript 代码：

```ts
value !== null && value !== void 0 ? value : fallbackValue
```

`value` 会和 `null` 和 `undefined`（表达式 `void 0` 的计算结果）分别进行比较。如果两个比较都是 `false`，则表达式的值是 `value`，否则是 `fallbackValue`。

现在我们再来看一个相对更复杂的例子。相比于使用简单的 `value` 变量，我们使用了一个 `getValue()` 函数调用表达式作为 `??` 操作符的左操作数：

```ts
const value = getValue() ?? fallbackValue
```

在这个例子中，编译器会产出以下的 Javascript 代码（忽略空格的不同）：

```ts
var _a
const value = (_a = getValue()) !== null && _a !== void 0 ? _a : fallbackValue
```

你可以看到编译器会使用一个临时的 `_a` 变量来存储 `getValue()` 调用返回的值。然后 `_a` 变量会分别和 `null` 以及 `void 0` 进行比较，并且有可能作为整个表达式的返回值。这个临时变量是有用的，因为这样我们只需要调用 `getValue` 函数一次。

### 编译输出：检查 null 和 undefined

你可能会疑惑，为什么编译器输出以下的表达式来检查 `value` 是否是 `null` 和 `undefined`：

```ts
value !== null && value !== void 0
```

难道编译器不能输出以下更简短的检查代码：

```ts
value != null
```

不幸的是，我们并不能通过不牺牲正确性的前提下这样做。对于 Javascript 中的大部分值，`value == null` 的比较和 `value === null || value === undefined` 是等价的。对于这些值，反向比较 `value != null` 和 `value !== null && value !== undefined` 也是等价的。然而，有一个值会使得这两个表达式并不等价，这个值就是 `document.all`：

```ts
document.all === null
// false

document.all === undefined
// false

document.all == null
// true

document.all == undefined
// true
```

`document.all` 并不严格等于（===） `null` 或 `undefined`，但却被认为是等于（==）`null` 和 `undefined` 的。因为这个反常的特例，Typescript 编译器不能简单地使用 `value != null` 检查，因为当 value 是 `document.all` 的时候会产生错误的结果。

如果你想阅读更多关于这个有趣行为的内容，可以阅读 Stack Overflow 上这个问题 [Why is document.all falsy? ](https://stackoverflow.com/a/10394873/362634) 的回答。
