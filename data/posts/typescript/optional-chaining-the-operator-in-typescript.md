---
title: 'TypeScript 中的 ?. 可选链操作符'
date: '2021-07-04'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/optional-chaining-the-operator-in-typescript'
---

Typescript 3.7 增加了对 `?.` 操作符的支持，也被称为可选链操作符。我们可以使用可选链链式地访问一个对象上可能为 `null` 或 `undefined` 的属性，并且不用检查中间的属性是否为空。

可选链不是 Typescript 中特定的语法。`?.` 操作符已经作为 ES2020 的一部分添加到了 ECMAScript 语言标准中。所有的现代浏览器都原生支持了可选链（不包括 IE11）。

在这篇文章中，我会详细介绍下面三个可选链操作符，并且解释为什么我们可能需要在我们的 Typescript 或 Javascript 代码中使用它们：

- `?.`
- `?.[]`
- `?.()`

### 缘由

我们来看一个可选链能派上用场的真实世界的例子。我定义了一个 `serializeJSON` 函数，可以接收任意的值，并且将它作为 JSON 序列化。我传了一个包含两个属性的对象给这个函数：

```ts
function serializeJSON(value: any) {
  return JSON.stringify(value)
}

const user = {
  name: 'Marius Schulz',
  twitter: 'mariusschulz',
}

const json = serializeJSON(user)

console.log(json)
```

程序会在终端中打印如下的输出：

```ts
{"name":"Marius Schulz","twitter":"mariusschulz"}
```

现在我们要求函数的调用者指定缩进水平。我们会定义一个 `SerializationOptions` 类型，然后给我们的 `serializeJSON` 函数添加一个 `options` 参数。我们会从 `options.formatting.indent` 属性中接收缩进水平：

```ts
type SerializationOptions = {
  formatting: {
    indent: number
  }
}

function serializeJSON(value: any, options: SerializationOptions) {
  const indent = options.formatting.indent
  return JSON.stringify(value, null, indent)
}
```

我们现在可以像下面这样调用 `serializeJSON` 并且设定两个空格的缩进水平：

```ts
const user = {
  name: 'Marius Schulz',
  twitter: 'mariusschulz',
}

const json = serializeJSON(user, {
  formatting: {
    indent: 2,
  },
})

console.log(json)
```

就如我们所期望的，JSON 被缩进了两个空格，并且以多行打印出来：

```json
{
  "name": "Marius Schulz",
  "twitter": "mariusschulz"
}
```

像我们上面引入的 `options` 参数通常是可选的。函数的调用者可以传 options 对象，但并不一定非得传。让我们来调整一下函数签名，通过给参数名后加上问号来使得 `options` 参数变为可选：

```ts
function serializeJSON(value: any, options?: SerializationOptions) {
  const indent = options.formatting.indent
  return JSON.stringify(value, null, indent)
}
```

假如我们的 Typescript 项目开启了 `--stricNullChecks` 选项（它是 `--strict` 编译选项家族的一员），Typescript 就会对我们的 `options.formatting.indent` 表达式报告以下的类型错误：

```sh
Object is possibly 'undefined'.
```

因为 `optional` 参数是可选的，所以它的值很可能是 `undefined`。我们在访问 `options.formatting` 之前应该先检查 `options` 是否是 `undefined`，否则很可能在运行时出错：

```ts
function serializeJSON(value: any, options?: SerializationOptions) {
  const indent = options !== undefined ? options.formatting.indent : undefined
  return JSON.stringify(value, null, indent)
}
```

我们应该做更宽泛的空值检查，同时检查 `null` 和 `undefined`——注意我们这里特意使用了 `!=` 而不是 `!==`：

```ts
function serializeJSON(value: any, options?: SerializationOptions) {
  const indent = options != null ? options.formatting.indent : undefined
  return JSON.stringify(value, null, indent)
}
```

现在类型错误消失了，我们可以调用 `serializeJSON` 函数，并且给它传递一个显式设定了缩进水平的选项对象：

```ts
const json = serializeJSON(user, {
  formatting: {
    indent: 2,
  },
})
```

或者，我们也可以不传选项对象，此时 `indent` 变量的值是 `undefined`，`JSON.stringify` 会使用零缩进水平这个默认值：

```ts
const json = serializeJSON(user)
```

上面的两种调用方式都是类型正确的。但假如我们也想像下面这样调用我们的 `serializeJSON` 函数呢？

```ts
const json = serializeJSON(user, {})
```

这是你会遇到的另一种通用模式。选项对象倾向于将它的部分或全部属性声明为可选，这样函数的调用者可以根据需要来设定多个或少数的选项。我们需要将 `SerializationOptions` 类型的 `formatting` 属性设定为可选以支持这种模式：

```ts
type SerializationOptions = {
  formatting?: {
    indent: number
  }
}
```

注意 `formatting` 属性后面添加了问号标记。现在 `serializeJSON(user, {})` 调用是类型正确的了，但 Typescript 在访问 `options.formatting.indent` 时会报另外一个错误：

```sh
Object is possibly 'undefined'.
```

我们需要再添加一层检查，因为 `options.formatting` 的值现在可能是 `undefined`：

```ts
function serializeJSON(value: any, options?: SerializationOptions) {
  const indent =
    options != null
      ? options.formatting != null
        ? options.formatting.indent
        : undefined
      : undefined
  return JSON.stringify(value, null, indent)
}
```

代码现在是类型正确了，它可以安全地访问 `options.formatting.indent` 属性。但这些嵌套的空检查非常的繁琐笨重，现在让我们来看看如何使用可选链来简化这个属性访问。

### ?.操作符：点标记

我们可以使用 `?.` 操作符来访问 `options.formatting.indent`，它会检查属性链每一层可能的空值：

```ts
function serializeJSON(value: any, options?: SerializationOptions) {
  const indent = options?.formatting?.indent
  return JSON.stringify(value, null, indent)
}
```

[ECMAScript 规范](https://tc39.es/ecma262/multipage/) 对可选链的描述如下：

```sh
可选链是属性访问和函数调用操作符，在访问值/调用函数是空的情况下提前返回。
```

Javascript 运行时会这样计算 `options?.formatting?.indent` 表达式：

- 如果 `options` 的值是 `null` 或者 `undefined`，会返回 `undefined` 值。
- 否则，如果 `options.formatting` 的值是 `null` 或者 `undefined`，会返回 `undefined` 值。
- 否则，会返回 `options.formatting.indent` 的值。

注意 `?.` 操作符总会返回 `undefined` 值如果它不能继续沿属性链访问，即便它遇到了 `null`。Typescript 将这种行为记入了它的类型系统中。在下面的例子中，Typescript 会将 `indent` 这个局部变量推断为 `number | undefined` 类型：

```ts
function serializeJSON(value: any, options?: SerializationOptions) {
  const indent = options?.formatting?.indent
  return JSON.stringify(value, null, indent)
}
```

感谢可选链，上面的代码要精炼得多，并且和之前一样也是类型安全的。

### ?.[] 操作符：方括号标记

下面我们再来看一下 `?.[]` 操作符，另一个可选链家族中的操作符。

假设我们 `SerializationOptions` 类型的 `indent` 属性重新命名为 `indent-level`。我们需要给属性添加引号，因为它的名字中间有中划线：

```ts
type SerializationOptions = {
  formatting?: {
    'indent-level': number
  }
}
```

当我们调用 `serializeJSON` 函数的时候可以这样设置 `indent-level` 属性的值：

```ts
const json = serializeJSON(user, {
  formatting: {
    'indent-level': 2,
  },
})
```

然而，下面这种使用可选链访问 `indent-level` 属性的尝试是语法错误的：

```ts
const indent = options?.formatting?."indent-level";
```

我们不能在 `?.` 操作符后直接跟字符串字面量——这不是正确的语法。作为替代，我们可以使用可选链的方括号标记写法，也就是通过 `?.[]` 操作符来访问 `indent-level` 属性：

```ts
const indent = options?.formatting?.['indent-level']
```

这是我们完整的 `serializeJSON` 函数：

```ts
function serializeJSON(value: any, options?: SerializationOptions) {
  const indent = options?.formatting?.['indent-level']
  return JSON.stringify(value, null, indent)
}
```

这和之前的几乎一样，除了我们使用了方括号来访问属性。

### ?.() 操作符：函数调用

第三个也是最后一个可选链家族操作符是 `?.()`。我们可以使用 `?.()` 操作符来调用一个可能不存在的方法。

为了理解这个操作符为何有用，我们再一次修改我们的 `SerializationOptions` 类型。我们会使用 `getIndent` 属性（一个返回数字的无参数函数类型）来替代 `indent` 属性（数字类型）：

```ts
type SerializationOptions = {
  formatting?: {
    getIndent?: () => number
  }
}
```

我们可以像下面这样调用 `serializeJSON` 函数并设置缩进水平：

```ts
const json = serializeJSON(user, {
  formatting: {
    getIndent: () => 2,
  },
})
```

为了得到我们 `serializeJSON` 函数的缩进水平，我们可以使用 `?.()` 操作符来有条件地（只有它被定义的时候）调用 `getIndent` 方法。

```ts
const indent = options?.formatting?.getIndent?.()
```

如果 `getIndent` 方法没有定义，Typescript 不会尝试去调用这个方法。在这种情况下，整个属性链表达式会返回 `undefined`，避免臭名远播的 "getIndent is not a function" 错误。

再一次，下面是我们完整的 `serializeJSON` 函数：

```ts
function serializeJSON(value: any, options?: SerializationOptions) {
  const indent = options?.formatting?.getIndent?.()
  return JSON.stringify(value, null, indent)
}
```

### 编译可选链到低版本 Javascript

我们已经看到可选链是如何工作以及它们是如何做类型检查，现在我们再来看看当编译目标是低版本的 Javascript，编译器会产生出什么样的 Javascript 代码。

下面是 Typescript 编译器输出的 Javascript 代码，考虑可读性调整了空格：

```js
function serializeJSON(value, options) {
  var _a, _b
  var indent =
    (_b =
      (_a =
        options === null || options === void 0
          ? void 0
          : options.formatting) === null || _a === void 0
        ? void 0
        : _a.getIndent) === null || _b === void 0
      ? void 0
      : _b.call(_a)
  return JSON.stringify(value, null, indent)
}
```

它为了给 `indent` 变量赋值真的执行了很多检查逻辑。让我们一步一步来简化代码。我们先将局部变量 `_a` 和 `_b` 分别替换为 `formatting` 和 `getIndent`：

```ts
function serializeJSON(value, options) {
  var formatting, getIndent
  var indent =
    (getIndent =
      (formatting =
        options === null || options === void 0
          ? void 0
          : options.formatting) === null || formatting === void 0
        ? void 0
        : formatting.getIndent) === null || getIndent === void 0
      ? void 0
      : getIndent.call(formatting)
  return JSON.stringify(value, null, indent)
}
```

接着来处理 `void 0` 表达式。`void` 操作符总会返回 `undefined` 值，无论给它传什么值。我们可以直接使用 `undefined` 来替换 `void 0` 表达式：

```ts
function serializeJSON(value, options) {
  var formatting, getIndent
  var indent =
    (getIndent =
      (formatting =
        options === null || options === undefined
          ? undefined
          : options.formatting) === null || formatting === undefined
        ? undefined
        : formatting.getIndent) === null || getIndent === undefined
      ? undefined
      : getIndent.call(formatting)
  return JSON.stringify(value, null, indent)
}
```

下面我们将 `formatting` 变量的赋值抽离到一个单独的语句中：

```ts
function serializeJSON(value, options) {
  var formatting =
    options === null || options === undefined ? undefined : options.formatting

  var getIndent
  var indent =
    (getIndent =
      formatting === null || formatting === undefined
        ? undefined
        : formatting.getIndent) === null || getIndent === undefined
      ? undefined
      : getIndent.call(formatting)
  return JSON.stringify(value, null, indent)
}
```

我们再对 `getIndent` 赋值做同样的操作，并且添加一些空格：

```ts
function serializeJSON(value, options) {
  var formatting =
    options === null || options === undefined ? undefined : options.formatting

  var getIndent =
    formatting === null || formatting === undefined
      ? undefined
      : formatting.getIndent

  var indent =
    getIndent === null || getIndent === undefined
      ? undefined
      : getIndent.call(formatting)

  return JSON.stringify(value, null, indent)
}
```

最后，我们将 `null` 和 `undefined` 的 `===` 判断结合为一个 `==` 操作。除非我们需要在 null 检查中处理特殊的 [document.all](https://chaosflutter.com/ts-evolution/nullish-coalescing-the-operator-in-typescript)，否则它俩是等价的：

```ts
function serializeJSON(value, options) {
  var formatting = options == null ? undefined : options.formatting

  var getIndent = formatting == null ? undefined : formatting.getIndent

  var indent = getIndent == null ? undefined : getIndent.call(formatting)

  return JSON.stringify(value, null, indent)
}
```

现在的代码结构比之前清晰多了。你可以看到，如果我们不能使用可选链操作符，我们就要自己写 Typescript 编译输出的这么多 null 检查。
