---
title: 'TypeScript 中的只读数组和元组类型'
date: '2021-06-06'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/read-only-array-and-tuple-types-in-typescript'
---

Typescript 3.4 增加了一些语法糖使得处理只读的数组和元组类型更容易。我们现在可以使用 `readonly` 修饰符来创建只读的数组类型（比如 `readonly string[]`），或只读的元组类型（比如 `readonly [number, number]`）。

### Typescript 中的只读数组类型

假设我们定义了以下的 `intersperse` 函数：

```ts
function intersperse<T>(array: T[], separator: T): T[] {
  const newArray: T[] = []
  for (let i = 0; i < array.length; i++) {
    if (i !== 0) {
      newArray.push(separator)
    }
    newArray.push(array[i])
  }
  return newArray
}
```

`intersperse` 函数接收一个包含了类型 `T` 元素的数组，以及同样是类型 `T` 的分隔元素。它会返回一个新的数组，新数组会在每一个原始元素中间插入分隔元素。`intersperse` 函数和 `Array.prototype.join()` 方法某种程度上有些相似，不过它会返回一个相同类型的数组而不是字符串。

以下是使用 `intersperse` 函数的一些例子：

```ts
intersperse(['a', 'b', 'c'], 'x')
// ["a", "x", "b", "x", "c"]

intersperse(['a', 'b'], 'x')
// ["a", "x", "b"]

intersperse(['a'], 0)
// ["a"]

intersperse([], 0)
// []
```

现在让我们来创建一个 `ReadonlyArray<string>` 类型的数组，它是一个只读数组类型：

```ts
const values: ReadonlyArray<string> = ['a', 'b', 'c']
```

这意味着我们并不希望这个数组被修改。如果我们尝试去写这个数组，或者调用修改数组的一些方法比如 `push()`、`pop()` 、`splice()`，Typescript 的类型检查器会报错。

```ts
values[0] = 'x' // Type error
values.push('x') // Type error
values.pop() // Type error
values.splice(1, 1) // Type error
```

另外，我们也可以使用 `readonly` 修饰符来使得 `values` 数组变为只读数组：

```ts
const values: readonly string[] = ['a', 'b', 'c']
```

`ReadonlyArray<string>` 和 `readonly string[]` 代表了相同的类型。你可以选择任何一种你喜欢的语法。
我自己喜欢使用 `readonly T[]` 语法，因为它更精炼并且更接近 `T[]` 的写法。你可能有不同的想法，不过这只是偏好问题。

假设我们现在把 `values` 传给 `intersperse`， 会发生什么？

```ts
const valuesWithSeparator = intersperse(values, 'x')
```

Typescript 会报一个类型错误！

```sh
Argument of type 'readonly string[]' is not assignable to parameter of type 'string[]'.
  The type 'readonly string[]' is 'readonly' and cannot be assigned to the mutable type 'string[]'.
```

类型检查器指出我们的只读数组类型 `readonly string[]` 不能赋值给可变数组类型 `string[]`。因为潜在的问题是，我们的 `intersperse` 函数有可能调用 `array` 数组参数修改自身的一些方法。这和 `values` 数组的只读行为是相违背的。

我们可以通过将 `array` 定义为只读数组来避免以上的类型错误。通过这样做，我们就能明确知道 `intersperse` 函数不会修改 `array` 数组：

```ts
function intersperse<T>(array: readonly T[], separator: T): T[] {
  const newArray: T[] = []
  for (let i = 0; i < array.length; i++) {
    if (i !== 0) {
      newArray.push(separator)
    }
    newArray.push(array[i])
  }
  return newArray
}

const values: readonly string[] = ['a', 'b', 'c']
const valuesWithSeparator = intersperse(values, 'x')
```

如果你在写一个纯函数接收一个数组作为参数，我建议你将这个数组参数标记为只读。这样，函数调用的时候既可以接收可变数组也可以接收只读数组。并且，Typescript 可以帮你避免对那些参数的意外修改。

如果你想自己试试只读数组类型和上面提到的类型标记，我给你准备了[TypeScript playground](https://www.typescriptlang.org/play/?target=1#code/GYVwdgxgLglg9mABDMUCmAnAzgB01tAHgBUA+ACjQBs0BbNVLALkQzQEMATBKgT0WIBtALoAaRARzsM7KHAwtiASkUjEAbwBQiRBARYoiMGgDuAURr1GiALyIRAbm2Jg8xORqGYtxAAYHyIiEiNR0DFBYAHSINGAA5lAAFgEwANSpShrOOjDA7t4AhDZ2vplaOhVGphZhjJE4IFiJ5JLSsvJKTpUAvtlV5pbhUQ1NlIOMgjDCnZU6zr06bFAgGEjGA7URTr2aemAGiABu7FQgaMysHNxgfBJQGChxanaCAETsr+KvAEafiK8QV7CJx7A7HU7nADqMCSAGU0FIZHIMD4UOhsHhsGhyOCzlgvgAPV6dTRAA)。

### Typescript 中的只读元组类型

和只读数组类型类似，Typescript 允许我们通过 `readonly` 修饰符创建只读的元组类型：

```ts
const point: readonly [number, number] = [0, 0]
```

任何修改只读元组类型的尝试都会导致类型错误：

```ts
point[0] = 1 // Type error
point.push(0) // Type error
point.pop() // Type error
point.splice(1, 1) // Type error
```

对于元组类型，没有和 `ReadonlyArray` 相对应的类型。你必需使用 `readonly` 修饰符来使得元组类型只读。

再一次，如果你想自己试试元组类型和 `readonly` 修饰符，可以使用这个[TypeScript playground](https://www.typescriptlang.org/play/?target=1#code/MYewdgzgLgBADiAlmKAuGAnApgQwCbgA2AnjANpgCuAtgEZYYA0MVdDAujALzkAMzvdgG4AUCITIoZQdxgBGURJQA6OJQgALABS8AlIqQqEcLfvGGoyiHEKJgWLXOZz9QA)。
