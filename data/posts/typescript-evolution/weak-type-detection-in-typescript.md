---
title: 'TypeScript 中的弱类型检测'
date: '2021-02-28'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/weak-type-detection-in-typescript'
---

Typescript 2.4 引入了弱类型（weak types）的概念。当一个类型的所有属性都是可选的时候 ，它被认为是弱类型。说得更具体一些，一个弱类型定义了一个或多个可选属性，没有必需属性，也没有索引签名。

举个例子，下面的类型被认为是弱类型：

```ts
interface PrettierConfig {
  printWidth?: number
  tabWidth?: number
  semi?: boolean
}
```

弱类型检测的主要目的是为了找出代码中可能的错误，避免成为潜在的 bug。看下面的例子：

```ts
interface PrettierConfig {
  printWidth?: number
  tabWidth?: number
  semi?: boolean
}

function createFormatter(config: PrettierConfig) {
  // ...
}

const prettierConfig = {
  semicolons: true,
}

const formatter = createFormatter(prettierConfig) // Error
```

在 Typescript 2.4 之前，上面的这段代码是类型正确的。`PrettierConfig` 的所有属性都是可选的，所以一个属性都不设置也没问题。并且，我们的 `pretteirConfig` 对象有一个 `semicolons` 属性，这个属性并不存在于 `PrettierConfig` 类型中。

从 Typescript 2.4 开始，如果给弱类型赋值的对象中没有和弱类型相互重叠的属性（看[文档](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-4.html#weak-type-detection)），类型检查器会报以下的错误：

```sh
Type '{ semicolons: boolean; }' has no properties
in common with type 'PrettierConfig'.
```

虽然我们的代码严格说并没有错，但它很可能潜入了一个 bug。`createFormatter` 函数很可能会忽略 `config` 中它不认识的任何属性（比如 `semicolons`），而只使用它认识属性的默认值。在这种情况下，我们的 `semicolons` 属性不会有任何作用，无论它被设置为 `true` 或者 `false`。

Typescript 弱类型检测能帮助我们找出函数调用中 `prettierConfig` 可能存在的问题。如此，我们就可以更早地知道某些潜在的问题。

### 显式的类型标注

除了依赖弱类型检测，我们可以显式地给 `prettierConfig` 对象添加类型标注：

```ts
const prettierConfig: PrettierConfig = {
  semicolons: true, // Error
}

const formatter = createFormatter(prettierConfig)
```

添加了显式标注后，我们得到了以下的类型错误：

```ts
Object literal may only specify known properties,
and 'semicolons' does not exist in type 'PrettierConfig'.
```

通过这种方式 ，类型错误会更就近提示。它会提示在我们错误定义 `semicolons` 属性的地方，而不是正确地将 `prettierConfig` 参数传给 `createFormatter` 函数的时候。

这样做另一个好处是，Typescript 会提供自动补全的建议，因为类型标注告知了我们创建的对象类型。

### 避免弱类型报错的方法

假如，出于某些原因，我们不希望对某个特定的弱类型检测并报错，该怎么做？一种方法是给 `PrettierConfig` 添加 `unknown` 类型的索引签名：

```ts
interface PrettierConfig {
  [prop: string]: unknown
  printWidth?: number
  tabWidth?: number
  semi?: boolean
}

function createFormatter(config: PrettierConfig) {
  // ...
}

const prettierConfig = {
  semicolons: true,
}

const formatter = createFormatter(prettierConfig)
```

现在，这段代码是类型正确的了，因为我们显式地允许 `PrettierConfig` 类型中有未知的属性。

或者，我们也可以使用类型断言来告诉类型检查器我们的 `prettierConfig` 对象是 `PrettierConfig` 类型：

```ts
interface PrettierConfig {
  printWidth?: number
  tabWidth?: number
  semi?: boolean
}

function createFormatter(config: PrettierConfig) {
  // ...
}

const prettierConfig = {
  semicolons: true,
}

const formatter = createFormatter(prettierConfig as PrettierConfig)
```

我建议你避免使用类型断言来静默弱类型检测。可能是有一些场景使用类型断言是合适的，但一般而言，你应该选择其他更好的解决方案。

### 弱类型检测的局限

注意弱类型检测只会在完全没有属性重叠的情况下报类型错误。只要你设置了一个或多个弱类型中定义的属性，编译器将不会再报错误：

```ts
interface PrettierConfig {
  printWidth?: number
  tabWidth?: number
  semi?: boolean
}

function createFormatter(config: PrettierConfig) {
  // ...
}

const prettierConfig = {
  printWidth: 100,
  semicolons: true,
}

const formatter = createFormatter(prettierConfig)
```

在上面的例子中，我同时设置了 `printWidth` 和 `semicolons`。因为 `printWidth` 存在于 `PrettierConfig` 中，所以对象和 `PrettierConfig` 类型有属性重叠，弱类型的检测不再对函数调用提示错误。
