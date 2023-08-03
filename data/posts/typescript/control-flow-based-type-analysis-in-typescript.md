---
title: 'TypeScript 中基于控制流的类型分析'
date: '2020-09-13'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/articles/control-flow-based-type-analysis-in-typescript'
---

本文是 Typescript Evolution 系列的第 2 篇，原作者已经更新到了 40 多篇。该系列从 Typescript 2.0 开始，对每次语言更新新增的重要特性都做了通俗易懂的介绍，等不及翻译的同学建议直接阅读系列原文。

---

Typescript 2.0 发布带来了许多新的特性。我前面写过一篇文章介绍 non-nullable 类型，和本文中要讨论的内容是相关的，并且可以配合使用，它就是：基于控制流的类型分析。

### 基于控制流的类型分析

官方的 What‘s new in TypeScript 对基于控制流的类型分析总结如下：

> Typescript 2.0 中，类型检查器会分析语句和表达式所有可能的控制流，将声明为联合类型的局部变量或参数收窄到尽可能具体的类型（类型收窄）。

上面的解释相当滞重，不好理解。这儿有个例子可以说明 Typescript 如何理解局部变量赋值语句的效果，并且相应地收窄变量的类型：

```typescript
let command: string | string[]

command = 'pwd'
command.toLowerCase() // Here, command is of type 'string'

command = ['ls', '-la']
command.join(' ') // Here, command is of type 'string[]'
```

注意，所有的代码都在同一个作用域内。可以看到，类型检查器对任意位置的 `command` 变量都使用了尽可能具体的类型：

- 在被赋值为 “pwd” 之后，`command` 变量不可能是字符串数组（联合类型中的另一种可能）。因此，Typescript 把 `command` 当作 string 类型的变量，允许调用 `toLowerCase()` 方法。
- 当被赋值为 `["ls", "-la"]` 字符串数组后，`command` 变量不再被当作字符串。它已经是字符串数组，所以可以成功调用 `join
` 方法。

因为相同的控制流分析，下面的函数在 Typescript 2.0 中是类型安全的：

```typescript
function composeCommand(command: string | string[]): string {
  if (typeof command === 'string') {
    return command
  }

  return command.join(' ')
}
```

编译器现在能够理解如果 `command` 参数是 string 类型，那么函数会在 if 语句中提早返回。因为这个提早返回的行为，if 语句之后，`command` 参数的类型被收窄为 string[] 。结果就是，调用 `join` 方法是类型安全的。

但在 Typecript 2.0 之前，编译器不能够理解上面代码的语义。因为 sting 类型不会从 `command` 变量的联合类型中移除，所以会产生下面的编译时错误：

```
property 'join' does not exist on type 'string | string[]'.
```

### 严格 Null 检查

基于控制流的类型分析和 nullable 类型配合的时候尤其有用。nullable 类型表示可以为 null 或 undefined 的联合类型。通常在使用一个 nullable 类型的变量之前，我们需要检查它是否是一个非空的值：

```typescript
type Person = {
  firstName: string
  lastName?: string | null | undefined
}

function getFullName(person: Person): string {
  const { firstName, lastName } = person

  // Here, we check for a falsy value of the `lastName` property,
  // which covers `null` and `undefined` (and other values like "")
  if (!lastName) {
    return firstName
  }

  return `${firstName} ${lastName}`
}
```

这里，`Person` 类型定义了一个 non-nullable 属性 firseName 以及一个 nullable 属性 lastName。如果我们需要组合两者生成全名，我们需要检查 lastName 是否是 null 或者 undefined 来避免将 “null” 或者 “undefined” 添加到 firstName 后面。

为了方便说明，我给 lastName 属性的联合类型添加了 undefined 类型，虽然这样做其实是多余的。在严格 null 检查模式下，undefined 类型会自动添加到可选属性的联合类型中，所以我们不需要显式地写出来。如果想了解更多，可以看我之前写的文章[non-nulable 类型](https://mariusschulz.com/articles/typescript-2-0-non-nullable-types)。

### 明确赋值分析

另一个基于控制流的新特性叫做明确赋值分析（definite assignment analysis）。在严格 null 检查模式下，局部变量在它们被赋值之前不能够被使用：

```typescript
let name: string

// Error: Variable 'name' is used before being assigned.
console.log(name)
```

这条规则的一个例外是那些包含 undefined 类型的局部变量：

```typescript
let name: string | undefined
console.log(name) // No error
```

明确赋值分析是又一种避免因空值导致 bug 的保护机制。它背后的思考是，确保所有 non-nullble 类型的局部变量在使用之前都被适当地初始化了。

### 总结

基于控制流的类型分析是对 Typescript 类型系统强有力的补充。类型检查器现在可以理解赋值语句以及控制流跳转的语义，因此极大地减少了类型保护的需要。通过排除 null 和 undefined 类型能够更方便地使用 nullable 类型的变量。最后，基于控制流的分析可以阻止变量在明确赋值之前被使用。
