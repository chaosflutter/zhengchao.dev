---
title: 'TypeScript 中的断言函数'
date: '2022-02-19'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/assertion-functions-in-typescript'
---

Typescript 3.9 在类型系统中实现了对断言函数的支持。断言函数是指当异常发生的时候会抛出错误的函数。通过使用断言签名，我们可以告诉 Typescript 某个函数应该被当做断言函数。

### 一个例子：document.getElementById() 方法

让我们来看一个例子，我们用 `document.getElementById()` 方法来找到 id 为 `root` 的 DOM 元素：

```typescript
const root = document.getElementById('root')

root.addEventListener('click', (e) => {
  /* ... */
})
```

通过 `root.addEventListener`，我们给这个元素绑定了一个点击事件。然后，Typescript 会报一个类型错误：

```typescript
const root = document.getElementById('root')

// Object is possibly null
root.addEventListener('click', (e) => {
  /* ... */
})
```

`root` 变量的类型是 `HTMLElement | null`，这是为什么当我们试图调用 `root.addEventListener()` 的时候 Typescript 会报一个类型错误 "Object is possibly null"。为了能够让我们的程序类型正确，我们需要确保在调用 `root.addEventListener` 之前 `root` 变量不是 null 也不是 undefined。 我们有几种解决办法可选：

1. 使用非空断言 `!`
2. 在代码中判空
3. 实现断言函数

让我们分别来尝试这三种办法。

### 使用非空（Non-null）断言操作符

首先，我们尝试使用非空断言操作符 `!`，它作为后缀被添加到 `document.getElementById()` 方法调用后面：

```typescript
const root = document.getElementById('root')!

root.addEventListener('click', (e) => {
  /* ... */
})
```

非空断言操作符 `!` 告诉 Typescript 可以假定 `document.getElementById()` 返回的值不是 null 也不是 undefined（也即非空的，non-nullish）。Typescript 会从我们添加了 `!` 的表达式返回值类型中去掉 `null` 和 `undefined` 类型。

在这个例子中，`document.getElementById()` 返回的类型是 `HTMLElement | null`，如果我们添加 `!` 操作符，我们得到的是 `HTMLElement` 类型。正如我们前面所见，Typescript 不再报类型错误。

然而，在这个场景中，使用非空操作符可能不是正确的解决办法。`!` 操作符会在 Typescript 编译到 Javascript 的过程中被完全去除：

```typescript
const root = document.getElementById('root')

root.addEventListener('click', (e) => {
  /* ... */
})
```

非空操作符在运行时根本没有任何输出。也就是，Typescript 编译器不会生成判断表达式是否非空的任何校验代码。因此，假如 `document.getElementById()` 没有匹配到任何元素并返回 `null`，`root` 变量的值就是 `null`，那么尝试调用 `root.addEventListener()` 就会失败。

### 在代码中判空

现在让我们来考虑第二种解决办法，即在代码中判空来验证 `root` 变量的值是否是非空的：

```typescript
const root = document.getElementById('root')

if (root === null) {
  throw Error('Unable to find DOM element #root')
}

root.addEventListener('click', (e) => {
  /* ... */
})
```

因为我们的判空逻辑，Typescript 的类型检查器会将 `root` 变量的类型从 `HTMLElement | null`（判空前） 收窄为 `HTMLElement`(判空后)：

```typescript
const root = document.getElementById('root')

// Type: HTMLElement | null
root

if (root === null) {
  throw Error('Unable to find DOM element #root')
}

// Type: HTMLElement
root

root.addEventListener('click', (e) => {
  /* ... */
})
```

这个方法比之前添加非空操作符的方式要安全得多了。我们会显式地去判断 `root` 变量是否为空，如果是空的则会抛出一个错误并且带上错误信息。

同时，我们发现这个方法没有带任何 Typescript 特有的语法，全部都是合法的 Javascript 代码。Typescript [基于控制流的类型分析](https://juejin.cn/post/7026522261846769677)能够理解我们的空检查，并且将 `root` 变量的类型收窄 —— 不需要任何的类型标注信息。

### 实现断言函数

最后我们来看下如何用断言函数以未来能复用的形式来实现这个空值检查。我们先来实现一个 `assertNonNullish` 函数，当传入的 value 值是 `null` 或者 `undefined` 的时候函数会抛出错误：

```js
function assertNonNullish(value: unknown, message: string) {
  if (value === null || value === undefined) {
    throw Error(message)
  }
}
```

我们这里给 `value` 参数声明了 [`unkown`](https://juejin.cn/post/7026526411858919437) 类型，允许调用者传入任意类型的值。我们只会将 `value` 和 `null` 以及 `undefined` 进行对比，所以我们不用要求 `value` 参数是一个特定的类型。

下面是我们在前面例子中使用这个 `assertNonNullish` 函数的方式。我们给它传了 `root` 变量以及错误信息：

```typescript
const root = document.getElementById('root')
assertNonNullish(root, 'Unable to find DOM element #root')

root.addEventListener('click', (e) => {
  /* ... */
})
```

然而，在调用 `root.addEventListener()` 方法的地方 Typescript 依然会报错：

```typescript
const root = document.getElementById('root')
assertNonNullish(root, 'Unable to find DOM element #root')

// Object is possibly null
root.addEventListener('click', (e) => {
  /* ... */
})
```

如果我们看一下在调用 `assertNonNullish()` 前后 `root` 变量的类型，我们会发现，它的类型都是 `HTMLElement | null` 类型：

```typescript
const root = document.getElementById('root')

// Type: HTMLElement | null
root

assertNonNullish(root, 'Unable to find DOM element #root')

// Type: HTMLElement | null
root

root.addEventListener('click', (e) => {
  /* ... */
})
```

这是因为 Typescript 并不知道我们的 `assertNonNullish` 函数会在 `value` 为空的时候抛出错误。我们应该显式地让 Typescript 知道 `assertNonNullish` 函数应该被当做一个断言函数，这个函数会断言传入的值是非空的，否则就会抛出一个错误。我们可以在返回值类型标注中使用 `asserts` 关键字来实现：

```typescript
function assertNonNullish<TValue>(
  value: TValue,
  message: string
): asserts value is NonNullable<TValue> {
  if (value === null || value === undefined) {
    throw Error(message)
  }
}
```

首先注意，`assertNonNullish` 函数已经是一个泛型函数。它声明了一个类型参数 `TValue` 作为 `value` 参数的的类型；同时，`TValue` 也在返回值类型标注中使用。

`asserts value is NonNullable<TValue>` 返回值类型标注就是我们所谓的**断言签名（assertion signature）**。这个断言签名的含义是如果函数正常返回（也就是不抛出错误），它就能断言 `value` 参数的类型是 `NonNullable<TValue>`。Typescript 使用这个信息来收窄我们传给 `value` 参数的表达式类型。

`NonNullable<T>` 类型是[条件类型](https://juejin.cn/post/7026526037001371678)，它在 _lib.es5.d.ts_ 类型声明文件中有定义：

```typescript
/**
 * Exclude null and undefined from T
 */
type NonNullable<T> = T extends null | undefined ? never : T
```

当 `NonNullable<T>` 作用于类型 `T`，它会将 `null` 和 `undefined` 类型从 `T` 中移除。下面是一些例子：

```
- NonNullable<HTMLElement> 运算得到 HTMLElement
- NonNullable<HTMLElement | null> 运算得到 HTMLElement
- NonNullable<HTMLElement | null | undefined> 运算得到 HTMLElement
- NonNullable<null> 运算得到 never
- NonNullable<undefined> 运算得到 never
- NonNullable<null | undefined> 运算得到 never
```

有了我们的类型签名，Typescript 现在可以正确地在 `assertNonNullish()` 函数调用后将 `root` 变量的类型收窄。类型检查器知道当 `root` 是空值时，`assertNonNullish` 函数会抛出错误。如果程序的控制流通过了 `assertNonNullish` 函数调用，那么 `root` 变量肯定包含了一个非空的值，因此 Typescript 准确地收窄了它的类型：

```typescript
const root = document.getElementById('root')

// Type: HTMLElement | null
root

assertNonNullish(root, 'Unable to find DOM element #root')

// Type: HTMLElement
root

root.addEventListener('click', (e) => {
  /* ... */
})
```

作为类型收窄的结果，我们的例子现在是类型正确的：

```typescript
const root = document.getElementById('root')
assertNonNullish(root, 'Unable to find DOM element #root')

root.addEventListener('click', (e) => {
  /* ... */
})
```

总结一下：可复用的 `assertNonNullish` 断言函数可以用来验证表达式是否是非空的值，如果是非空则会相应地从它的类型中移除 `null` 和 `undefined` 类型，从而收窄类型。
