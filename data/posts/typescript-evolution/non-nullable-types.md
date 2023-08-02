---
title: 'TypeScript 中的 Non-Nullable类型'
date: '2019-04-09'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/typescript-2-0-non-nullable-types'
---

[Typescirpt 2.0](https://blogs.msdn.microsoft.com/typescript/2016/09/22/announcing-typescript-2-0/)发布了许多新的特性。在这篇文章中，我们一起学习**non-nulable**类型。它是对类型系统的重要改进，旨在避免一整类在编译时因为可能为空值引发的报错。

### `null`和`undefined`

在 Typescript 2.0 之前，`null`和`undefined`可以是任何类型的值，也就是说，`null`和`undefined`可以赋值给任意类型，包括原始类型比如字符串、数字和布尔值：

```javascript
let name: string
name = 'Marius' // OK
name = null // OK
name = undefined // OK

let age: number
age = 24 // OK
age = null // OK
age = undefined // OK

let isMarried: boolean
isMarried = true // OK
isMarried = false // OK
isMarried = null // OK
isMarried = undefined // OK
```

我们以`number`类型为例。它的范围不仅包含了所有[IEEE 754 floating point numbers](https://en.wikipedia.org/wiki/IEEE_754)，并且也包含了`null`和`undefined`这两个特殊值。

<img src="https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-number-domain-with-null-and-undefined.png" width="349" />

对于对象、数组和函数类型也是类似的。所以在之前的类型系统中没有一种方式可以表达一个具体的变量是 non-nullable 的，即不能为空的。幸运的是，Typescript 2.0 解决了这个问题。

### 严格的 Null 检测

Typescript 2.0 增加了对**non-nullable**类型的支持。你可以选择通过在命令行加`--strictNullChecks`标识开启严格 null 检测模式。或者，你也可以在项目的 tsconfig.json 配置文件中，添加开启编译选项`strictNullChecks`：

```javascript
{
  "compilerOptions": {
    "strictNullChecks": true
    // ...
  }
}
```

在严格 null 检测模式下，`null`和`undefined`都不能再赋值给其他类型。它们只能赋值给各自的`null`和`undefined`类型：

<img src="https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-number-domain-without-null-and-undefined.png" width="349" />

我们如果在严格 null 检测模式下编译上面例子中的代码，会因为将`null`和`undefined`赋值给其他类型的变量而报类型错误：

```javascript
// Compiled with --strictNullChecks

let name: string
name = 'Marius' // OK
name = null // Error
name = undefined // Error

let age: number
age = 24 // OK
age = null // Error
age = undefined // Error

let isMarried: boolean
isMarried = true // OK
isMarried = false // OK
isMarried = null // Error
isMarried = undefined // Error
```

那在 Typescript 2.0 中我们该怎么定义一个 nullabe，即可以为空的变量呢？

### 使用联合类型定义可能为空的变量

在严格 null 检测下，既然类型默认是 non-nullable，即不能为空的，那么我们需要显式地告诉类型检查器哪些变量是可能为空的。我们可以通过构造包含`null`和`undefined`的联合类型来解决：

```javascript
let name: string | null
name = 'Marius' // OK
name = null // OK
name = undefined // Error
```

注意`undefined`不能赋值给`name`，因为联合类型中并没有包含`undefined`类型。

这种处理空值方式的一个大好处是，某个类型哪些成员可能为空变得非常显式，能够自我解释。举一个`User`类型的例子：

```javascript
type User = {
  firstName: string,
  lastName: string | undefined,
}

let jane: User = { firstName: 'Jane', lastName: undefined }
let john: User = { firstName: 'John', lastName: 'Doe' }
```

我们通过在`lastName`后面添加`?`使得这个属性是可选的，所以我们可以完全忽略`lastName`属性的赋值。另外，`undefined`类型会自动添加到这种联合类型中。因此，下面的所有赋值都是类型正确的：

```javascript
type User = {
  firstName: string,
  lastName?: string,
}

// We can assign a string to the "lastName" property
let john: User = { firstName: 'John', lastName: 'Doe' }

// ... or we can explicitly assign the value undefined
let jane: User = { firstName: 'Jane', lastName: undefined }

// ... or we can not define the property at all
let jake: User = { firstName: 'Jake' }
```

### 访问可能为空类型的属性

如果一个对象的类型包含了`null`或者`undefined`，访问它的任意属性都会导致编译时报错：

```javascript
function getLength(s: string | null) {
  // Error: Object is possibly 'null'.
  return s.length
}
```

在访问属性之前，你需要使用 type guard(类型收窄)来检查访问这个对象的属性是否安全：

```javascript
function getLength(s: string | null) {
  if (s === null) {
    return 0
  }

  return s.length
}
```

Typescript 能够理解 Javascript 的语法，所以在三目运算符中也能支持 type guard，下面的代码依然能够正确运行：

```javascript
function getLength(s: string | null) {
  return s ? s.length : 0
}
```

### 可能为空值的函数的调用

如果你尝试调用一个类型包含了`null`或者`undefined`的函数，就会触发一个编译时错误。下面的`callback`参数是可选的（注意`?`），所以它可能是`undefined`。因此不能被直接调用：

```javascript
function doSomething(callback?: () => void) {
  // Error: Object is possibly 'undefined'.
  callback()
}
```

和在访问属性之前检查对象一样，我们应该先检查这个函数是否是 non-null 的，即非空的：

```javascript
function doSomething(callback?: () => void) {
  if (callback) {
    callback()
  }
}
```

或者我们也可以通过`typeof`操作符去检查：

```javascript
function doSomething(callback?: () => void) {
  if (typeof callback === 'function') {
    callback()
  }
}
```

### 总结

Non-nullable 类型是对 Typescript 基础类型系统很重要的补充。它们使我们可以精确地控制那些变量和属性是可能为空的。可能为空的对象的属性访问或者函数调用通过 type guard 的方式能够确保类型安全，从而避免编译时许多空值引起的错误。
