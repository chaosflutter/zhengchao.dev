---
title: 'TypeScript 中针对 ES3/ES5 的迭代降级'
date: '2021-02-14'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/downlevel-iteration-for-es3-es5-in-typescript'
---

Typescript 2.3 引入了一个新的 `--downlevelIteration` 选项，支持将 ES2015 的迭代协议（iteration protocol）编译为 ES3 和 ES5 代码。`for...of` 循环现在能够被降级编译为带有正确语义的代码。

### 使用 for...of 迭代数组

假定对于后面的 Typescript 代码示例，我们使用以下简单的 `tsconfig.json` 配置文件。它只包含了一个编译选项，即我们编译后的 ESMAScript 语言版本目标——在这个例子中，是 ES5：

```ts
{
  "compilerOptions": {
    "target": "es5"
  }
}
```

我们再来看下面的 `index.ts` 文件。没有什么特别的，只是声明了一个数字数组，然后使用 ES2015 的 `for...of`循环来迭代这个数组，并打印每一个数字：

```ts
const numbers = [4, 8, 15, 16, 23, 42]

for (const number of numbers) {
  console.log(number)
}
```

我们可以直接执行 `index.ts` 文件，而不用先经过 Typescript 编译器编译，因为它没有包含任何 Typescript 特定的语法。

```sh
$ node index.ts
4
8
15
16
23
42
```

我们现在将 `index.ts` 编译为 `index.js`：

```sh
$ tsc -p .
```

看一看编译生成的代码，我们可以看到 Typescript 编译器生成了传统的基于索引对数组进行迭代的 `for` 循环。

```ts
var numbers = [4, 8, 15, 16, 23, 42]
for (var _i = 0, numbers_1 = numbers; _i < numbers_1.length; _i++) {
  var number = numbers_1[_i]
  console.log(number)
}
```

如果我们运行以上的代码，它也能按预期工作：

```sh
$ node index.js
4
8
15
16
23
42
```

执行 `node index.ts` 和 `node index.js` 观察到的输出结果是一样的，也应该如此。这意味着通过 Typescript 编译后程序的行为并没有被改变。很好。

### 使用 for...of 迭代字符串

下面是另一个 `for...of` 循环，这一次，我们迭代的是字符串而不是数组：

```ts
const text = 'Booh! 👻'

for (const char of text) {
  console.log(char)
}
```

再一次，我们可以直接运行 `node index.ts` 因为我们的代码只包含 ES2015 语法，没有什么是 Typescript 特有的。下面是程序执行的输出：

```ts
$ node index.ts
B
o
o
h
!

👻
```

现在我们再把 `index.ts` 编译为 `index.js`。当编译目标是 ES3 或者 ES5 的时候，Typescript 编译器会愉快地生成基于索引的 `for` 循环代码：

```ts
var text = 'Booh! 👻'
for (var _i = 0, text_1 = text; _i < text_1.length; _i++) {
  var char = text_1[_i]
  console.log(char)
}
```

不幸的是，生成的 Javascript 代码执行结果和原始的 Typescript 版本并不一样：

```sh
$ node index.js
B
o
o
h
!

�
�
```

鬼魂 emoji——或者更准确地说，码位(code point) `U+1F47B`——是由两个编码单元(code units) `U+D83D` 和 `U+DC7B` 组成。因为通过索引迭代字符串会返回当前索引的编码单元（而不是码位），所以 `for` 循环将鬼混 emoji 拆分成了两个独立的编码单元。

另一方面，字符串的迭代协议会迭代字符串的码位（code point），所以导致这两个程序最终的输出不一致。你可以通过对比字符串的 `length` 以及通过字符串迭代器生成的序列长度来验证这一点：

```ts
const ghostEmoji = '\u{1F47B}'

console.log(ghostEmoji.length) // 2
console.log([...ghostEmoji].length) // 1
```

长话短说：使用 for...of 迭代字符串如果编译为 ES3 或者 ES5，执行结果可能并不正确。这就是 Typescript 2.3 为什么要引入 `--downlevelIteration` 标识的原因。

### --downlevelIteration 标识

下面的 `index.ts` 和之前的一样：

```ts
const text = 'Booh! 👻'

for (const char of text) {
  console.log(char)
}
```

现在我们修改一下 `tsconfig.json` 文件，将新的 `downlevelIteration` 编译选项设置为 `true`：

```ts
{
  "compilerOptions": {
    "target": "es5",
    "downlevelIteration": true
  }
}
```

如果我们运行一次编译，会生成下面的 Javascript 代码：

```ts
var __values =
  (this && this.__values) ||
  function (o) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator],
      i = 0
    if (m) return m.call(o)
    return {
      next: function () {
        if (o && i >= o.length) o = void 0
        return { value: o && o[i++], done: !o }
      },
    }
  }
var text = 'Booh! 👻'
try {
  for (
    var text_1 = __values(text), text_1_1 = text_1.next();
    !text_1_1.done;
    text_1_1 = text_1.next()
  ) {
    var char = text_1_1.value
    console.log(char)
  }
} catch (e_1_1) {
  e_1 = { error: e_1_1 }
} finally {
  try {
    if (text_1_1 && !text_1_1.done && (_a = text_1.return)) _a.call(text_1)
  } finally {
    if (e_1) throw e_1.error
  }
}
var e_1, _a
```

你可以看到，生成的代码比之前简单的 `for` 循环要复杂得多。这是因为它包含了迭代协议适当的实现：

- `__values` 帮助函数会寻找 `[Symbol.iterator]` 方法，如果存在就调用它。如果没有，它会创建一个模拟迭代器，以数组的方式迭代这个对象。
- 和迭代每一个编码单元不一样，这里的 `for` 循环调用了迭代器的 `next()` 方法直到结束，也就是返回的 `done` 为 `true` 的时候。
- 为了根据 ECMAScript 规范实现正确的迭代协议，生成了 `try/catch/finally` 代码块来处理异常情况。

如果我们现在再一次执行 `index.js`，我们会得到正确的输出：

```sh
$ node index.js
B
o
o
h
!

👻
```

注意当你的代码在一个没有原生支持 symbol 的环境中执行的时候，你依然需要 `Symbol.iterator` 的垫片代码（shim）。如果 `Symbol.iterator` 没有定义 ，`__values` 帮助函数会创建一个模拟的数组迭代器，但它并没有实现正确的迭代协议。

### ES2015 集合类型使用降级迭代

ES2015 给标准库增加了两个新的集合类型 `Map` 和 `Set`。在这一部分，我会讲解如何使用 `for...of` 循环来迭代 `Map`。

下面的代码示例中，我们创建了一个数字到它对应英文名的映射。我给这个 `Map` 构造函数初始化了 10 个键值对（用二维数组的方式表示）。然后，我使用 `for...of` 循环以及数组的解构赋值模式来将每一个键值对解构为 `digit` 和 `name`：

```ts
const digits = new Map([
  [0, 'zero'],
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
  [4, 'four'],
  [5, 'five'],
  [6, 'six'],
  [7, 'seven'],
  [8, 'eight'],
  [9, 'nine'],
])

for (const [digit, name] of digits) {
  console.log(`${digit} -> ${name}`)
}
```

这是完全正确的 ES2015 代码，并且能如预期一样执行：

```sh
$ node index.ts
0 -> zero
1 -> one
2 -> two
3 -> three
4 -> four
5 -> five
6 -> six
7 -> seven
8 -> eight
9 -> nine
```

然而，Typescript 编译器并不开心，它抱怨找不到 `Map`：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_cannot_find_map-2x.e3tn2k3p2j.imm.png)

这是因为我们的编译目标是 ES5，它并没有实现 `Map` 类型的集合。那我们该如何让这个代码顺利通过编译，假定我们提供了 `Map` 的 polyfill 所以程序能够在运行时正常工作？

解决方案是给`tsconfig.json` 中的 `lib` 编译选项添加 `es2015.collection` 和 `es2015.iterable` 两个值。这会告诉 Typescript 编译器，它能够在运行时找到 ES2015 集合以及 `Symbol.iterator` symbol 的实现。 不过，一旦你显式地设定了 `lib` 选项，它的默认值将被覆盖。因此，你应该同时添加 `dom` 和 `es5`，这样你就可以访问其他的标准库方法。

下面是最终的 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "es5",
    "downlevelIteration": true,
    "lib": ["dom", "es5", "es2015.collection", "es2015.iterable"]
  }
}
```

现在 Typescript 编译器不再抱怨，并且生成了以下的 Javascript 代码：

```ts
var __values =
  (this && this.__values) ||
  function (o) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator],
      i = 0
    if (m) return m.call(o)
    return {
      next: function () {
        if (o && i >= o.length) o = void 0
        return { value: o && o[i++], done: !o }
      },
    }
  }
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator]
    if (!m) return o
    var i = m.call(o),
      r,
      ar = [],
      e
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value)
    } catch (error) {
      e = { error: error }
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i)
      } finally {
        if (e) throw e.error
      }
    }
    return ar
  }
var digits = new Map([
  [0, 'zero'],
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
  [4, 'four'],
  [5, 'five'],
  [6, 'six'],
  [7, 'seven'],
  [8, 'eight'],
  [9, 'nine'],
])
try {
  for (
    var digits_1 = __values(digits), digits_1_1 = digits_1.next();
    !digits_1_1.done;
    digits_1_1 = digits_1.next()
  ) {
    var _a = __read(digits_1_1.value, 2),
      digit = _a[0],
      name_1 = _a[1]
    console.log(digit + ' -> ' + name_1)
  }
} catch (e_1_1) {
  e_1 = { error: e_1_1 }
} finally {
  try {
    if (digits_1_1 && !digits_1_1.done && (_b = digits_1.return))
      _b.call(digits_1)
  } finally {
    if (e_1) throw e_1.error
  }
}
var e_1, _b
```

你可以自己试一试，这个代码会打印出正确的结果。

还有一点我们需要注意，现在生成的 Javascript 代码中包含了两个帮助函数，`__values` 和 `__read`，这明显增加了代码体积。让我们来解决这个问题。

### 使用 --importHelpers 和 tslib 来减少代码体积

在上面的示例代码中，`__values` 和 `__read` 帮助函数内联到了生成的 Javascript 代码中。这么做显然不好，如果你要编译一个包含很多文件的 Typescript 项目。因为每一个生成的 Javascript 文件都会包含所有必需的帮助文件，这回极大地增加代码量。

在一个典型的项目设置中，你通常会使用一个打包器比如 webpack 来将所有模块打包在一起。如果帮助函数被引入不止一次，那最终打包的文件会增加大量不必要的代码。

解决方案是使用 `--importHelpers` 编译选项以及 `tslib` 这个包。当设置以后，`--importHelpers` 会使 Typescript 编译器从 `tslib` 中导入所需的帮助函数。打包器比如 webpack 能够只将这个包内联一次，避免引入重复代码。

为了证明 `--importHelpers` 的效果，我首先将 `index.ts` 文件转成了一个模块，导出了一个函数：

```ts
const digits = new Map([
  [0, 'zero'],
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
  [4, 'four'],
  [5, 'five'],
  [6, 'six'],
  [7, 'seven'],
  [8, 'eight'],
  [9, 'nine'],
])

export function printDigits() {
  for (const [digit, name] of digits) {
    console.log(`${digit} -> ${name}`)
  }
}
```

现在我们需要修改编译选项，将 `importHelpers` 设置为 `true`。这是最终的 `tsconfig.json` 文件：

```json
{
  "compilerOptions": {
    "target": "es5",
    "downlevelIteration": true,
    "importHelpers": true,
    "lib": ["dom", "es5", "es2015.collection", "es2015.iterable"]
  }
}
```

这是重新编译后生成的 Javascript 代码：

```ts
'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var tslib_1 = require('tslib')
var digits = new Map([
  [0, 'zero'],
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
  [4, 'four'],
  [5, 'five'],
  [6, 'six'],
  [7, 'seven'],
  [8, 'eight'],
  [9, 'nine'],
])
function printDigits() {
  try {
    for (
      var digits_1 = tslib_1.__values(digits), digits_1_1 = digits_1.next();
      !digits_1_1.done;
      digits_1_1 = digits_1.next()
    ) {
      var _a = tslib_1.__read(digits_1_1.value, 2),
        digit = _a[0],
        name_1 = _a[1]
      console.log(digit + ' -> ' + name_1)
    }
  } catch (e_1_1) {
    e_1 = { error: e_1_1 }
  } finally {
    try {
      if (digits_1_1 && !digits_1_1.done && (_b = digits_1.return))
        _b.call(digits_1)
    } finally {
      if (e_1) throw e_1.error
    }
  }
  var e_1, _b
}
exports.printDigits = printDigits
```

注意，上面的代码不再内联帮助函数，而是在最上面导入了 `tslib` 这个包。

好了，我们终于得到了兼容规范的降级编译成的 `for...of` 循环，它完全支持迭代协议，并且没有任何多余的 Typescript 帮助函数。
