---
title: 'TypeScript 中的 never 类型'
date: '2020-10-18'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/the-never-type-in-typescript'
---

Typescript 2.0 中引入了一个新的原始类型 `never`。它代表了某种不可能发生的值的类型。`never` 类型通常在以下两种场景中被使用。

- 作为没有返回值的函数的返回类型
- 在类型守卫中不可能有正确类型的值的类型

下面是 `never` 类型具体的一些特征，详细内容见[这里](https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#the-never-type):

- `never` 是任意类型的子类型，并且可以赋值给任意类型
- 没有类型是 `never` 的子类型，也不能赋值给 `never` 类型（除了 `never` 本身）
- 如果一个函数表达式、箭头函数没有返回值类型标注也没有 `return` 语句或者`return`语句的表达式返回值类型是 `never`，同时函数体不能被正常执行完成（由控制流分析决定），那么这个函数的返回值会被推断为 `never`。
- 如果一个函数有显式的 `never` 返回类型，那么所有的`return`语句（如果有）的表达式都应为`never`类型，并且函数体不能被正常执行完成。

让我们举一些实际的例子，看看在什么地方可以用`never`类型。

### 永远不会返回的函数

下面是一个永远不会返回的函数：

```ts
// Type () => never
const sing = function () {
  while (true) {
    console.log('Never gonna give you up')
    console.log('Never gonna let you down')
    console.log('Never gonna run around and desert you')
    console.log('Never gonna make you cry')
    console.log('Never gonna say goodbye')
    console.log('Never gonna tell a lie and hurt you')
  }
}
```

函数体包含了一个无限循环语句块，其中没有 `break` 或 `return` 语句。考虑到`console.log`语句不会抛异常，所以这里没有办法跳出循环。因此，这个函数的返回类型被推断为`never`。

类似的，下面的函数返回值类型也被推断为`never`：

```ts
// Type (message: string) => never
const failwith = (message: string) => {
  throw new Error(message)
}
```

Typescript 之所以将其推断为`never`类型，是因为这个函数没有标注它的返回值类型，同时基于控制流分析不能正常执行完成。

### 不可能有正确类型的变量

另一个被推断为`never`类型的场景发生在永远不正确的类型守卫中。在下面的例子中，条件语句检查 `value` 的值既是 string 也是 number 类型，这显然不可能：

```ts
function impossibleTypeGuard(value: any) {
  if (typeof value === 'string' && typeof value === 'number') {
    value // Type never
  }
}
```

这个例子过于人工造作了，我们来看另一个更实际的使用场景。下面的例子显示 Typescript 基于类型守卫的控制流分析收窄了联合类型的变量类型。直白地说，因为有类型守卫，类型检查器会认为 value 只可能是 string 或 number 类型中的一种。

```ts
function controlFlowAnalysisWithNever(value: string | number) {
  if (typeof value === 'string') {
    value // Type string
  } else if (typeof value === 'number') {
    value // Type number
  } else {
    value // Type never
  }
}
```

最后一个 `else` 从句中的 value 既不可能是 string 也不可能是 number 类型。因为我们标记 `value` 是 `string | number` 这个联合类型，所以 Typescript 将它推断为 `never` 类型，也就是说，除了 string 或 number，`value` 不可能是其他类型。

当控制流分析将 string 和 number 这两个候选类型都排除后，类型检查器就将`value`推断为 `never` 类型，这是剩下的唯一可能的类型。`never` 类型对于我们没有任何帮助，我们的编辑器工具不会提示任何自动补全建议：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_never_type_no_autocompletion-2x.ag4qykritm.imm.png)

### never 和 void 的不同之处

你可能会疑惑，既然已经有了 `void` 类型，Typescript 为什么还需要一个 `never` 类型。尽管这两个类型看起来很相似，但它们代表了不同的概念：

- 在 Javascript 中，一个函数没有显式返回值会隐式返回 `undefined`。所以虽然我们说这样的函数“没有返回值”，其实它有返回，只不过我们通常会忽略这种情况下的返回值。在 Typescript 中此类函数会被推断为有 `void` 类型的返回值。
- 一个有 `never` 返回类型的函数根本不会返回。它也不会返回 `undefined`。这种函数不会正常结束，这意味着它可能抛异常或者不会结束执行。

如果你对类型理论感兴趣，`never` 类型是一种底层类型（bottom type），也被称为零类型（zero type）或者空类型（empty type）。它通常被标记为 ⊥ ，并传递了一种信号：调用者不会得到计算后的结果。与此不同的是，`void` 类型是一个单元类型（unit type）,即只允许一种值的类型，且没有相关联的操作。

### 函数声明的类型推断

还有一点需要补充的是函数声明返回类型推断的问题。如果你仔细阅读了文章最上面的 `never` 类型具体特征的列表，你可能会发现这样的表述：

```
如果一个函数表达式、箭头函数没有返回值类型标注......
```

它提到了函数表达式和箭头函数，但没有提到函数声明。也就是说，函数表达式返回值类型推断可能和函数声明的返回值类型推断不同：

```ts
// Return type: void
function failwith1(message: string) {
  throw new Error(message)
}

// Return type: never
const failwith2 = function (message: string) {
  throw new Error(message)
}
```

这种现象的原因是为了做到向后兼容，具体[解释在这里](https://stackoverflow.com/questions/40251524/typescript-never-type-inference)。如果你想让一个函数声明有 `never` 返回值，你可以显式地标注它：

```ts
function failwith1(message: string): never {
  throw new Error(message)
}
```
