---
title: 'TypeScript 中更多的字面量类型'
date: '2020-10-11'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/more-literal-types-in-typescript'
---

Typescript 1.8 引入了字符串字面量类型，用于将变量的值限定在有限的字符串字面量集合中。在 Typescript 2.0 中，字面量类型不再局限于字符串字面量。以下的这些字面量类型被添加到了类型系统中：

- 布尔字面量类型
- 数字字面量类型
- 枚举字面量类型

下面我们就每一种新的字面量类型举一个实际的例子。

### 布尔字面量类型

下面的代码中定义了两个常量，`TRUE`和`FALSE`，他们分别保存了 `true` 和 `false` 两个值：

```ts
const TRUE: true = true // OK
const FALSE: false = false // OK
```

如果你尝试给这两个变量赋值相反的布尔值，会报类型错误：

```ts
const TRUE: true = false
// Error: Type 'false' is not assignable to type 'true'

const FALSE: false = true
// Error: Type 'true' is not assignable to type 'false'
```

在引入布尔字面量类型后，预定义的`boolean`类型现在等同于 `true | false` 这个联合类型：

```ts
let value: true | false // Type boolean
```

布尔字面量类型单独使用可能并没有太多用处，但和标签联合类型（tagged union types）以及基于控制流的类型分析(control flow based types analysis) 配合非常有用。举个例子，`Result<T>` 泛型要么有一个 `T` 类型的值，要么包含了一个 `string` 类型的错误信息，它被定义如下：

```ts
type Result<T> = { success: true; value: T } | { success: false; error: string }
```

这儿有个函数使用了这个泛型：

```ts
function parseEmailAddress(input: string | null | undefined): Result<string> {
  // If the input is null, undefined, or the empty string
  // (all of which are falsy values), we return early.
  if (!input) {
    return {
      success: false,
      error: 'The email address cannot be empty.',
    }
  }

  // We're only checking that the input matches the pattern
  //   <something> @ <something> DOT <something>
  // to keep it simple. Properly validating email addresses
  // via regex is hard, so let's not even try here.
  if (!/^\S+@\S+\.\S+$/.test(input)) {
    return {
      success: false,
      error: 'The email address has an invalid format.',
    }
  }

  // At this point, control flow based type analysis
  // has determined that the input has type string.
  // Thus, we can assign input to the value property.
  return {
    success: true,
    value: input,
  }
}
```

注意`strictNullChecks`配置选项开启后，`string`类型是`non-nullable`类型。为了使我们的函数能够接收 nullable 类型的参数，`null` 和 `undefined` 类型必须显式地添加到联合类型中。

我们现在可以像下面这样调用 `parseEmailFunction` 函数：

```ts
const parsed = parseEmailAddress('example@example.com')

if (parsed.success) {
  parsed.value // OK
  parsed.error // Error
} else {
  parsed.value // Error
  parsed.error // OK
}
```

下面是以上代码片段在 VSCode 中的截图。注意，有一些属性访问表达式被标注了红色的下划线：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_boolean_literal_discriminant_property-2x.p4d5gfznrb.imm.png)

这里面值得一提的是，在我们检查了`parsed.success`这个可辨识属性（discriminant property）之后，编译器只允许我们访问 `value` 或者 `error` 属性：

- 如果`parsed.success`是`true`，`parsed`肯定是`{ success: true; value: string }` 类型。因此我们可以访问`value`属性，但不能访问 `error`。
- 如果`parsed.success`是`false`，`parsed`肯定是`{ success: false; error: string }` 类型。因此我们可以访问`error`属性，但不能访问 `value`。

顺便提一句，你发现了吗，这段代码中和 Typescript 相关的只有 `Result<T>` 和函数签名的类型标注？其他的部分都是普通的、原汁原味的 Javascript，而这些代码因为基于控制流的类型分析而得到了类型安全。

###  数字字面量类型

和字符串字面量类似，我们可以将一个数字类型变量取值限定于已知的一个有限集合中：

```ts
let zeroOrOne: 0 | 1

zeroOrOne = 0
// OK

zeroOrOne = 1
// OK

zeroOrOne = 2
// Error: Type '2' is not assignable to type '0 | 1'
```

举个例子，在实际使用中，我们可以用数字字面量类型来定义端口号。HTTP 默认使用 80 端口，HTTPS 默认使用 443 端口。我们可以写一个 `getPort` 函数，并且在函数签名中声明只能返回这两个可能的值：

```ts
function getPort(scheme: 'http' | 'https'): 80 | 443 {
  switch (scheme) {
    case 'http':
      return 80
    case 'https':
      return 443
  }
}

const httpPort = getPort('http') // Type 80 | 443
```

更有趣的是，如果我们结合 Typescript 中的函数重载，会得到更具体的类型：

```ts
function getPort(scheme: 'http'): 80
function getPort(scheme: 'https'): 443
function getPort(scheme: 'http' | 'https'): 80 | 443 {
  switch (scheme) {
    case 'http':
      return 80
    case 'https':
      return 443
  }
}

const httpPort = getPort('http') // Type 80
const httpsPort = getPort('https') // Type 443
```

如下图所示，当我们去比较`httpPort` 和 `443`，编译器会提示我们这个条件语句会永远返回 `false`:

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_control_flow_contradiction-2x.kpi7hrylto.imm.png)

既然 httpPort 的类型是 80，那么它永远只能包含 80 的值，而 80 显然永远不会等于 443。类似这样的案例，Typescript 编译器可以帮助你检测有 bugger 的代码和一些不会执行的死代码（dead code）。

### 枚举字面量类型

最后，我们还能使用枚举字面量类型。继续我们上面的例子，我们将实现一个函数用来映射给定的端口（80 或 443）到相应的协议（HTTP 或 HTTPS）。首先，我们来定义一个枚举常量，包含了这两个端口号：

```ts
const enum HttpPort {
  Http = 80,
  Https = 443,
}
```

现在我们来声明我们的 `getScheme` 函数，再一次，我们使用函数重载来限定特定类型：

```ts
function getScheme(port: HttpPort.Http): 'http'
function getScheme(port: HttpPort.Https): 'https'
function getScheme(port: HttpPort): 'http' | 'https' {
  switch (port) {
    case HttpPort.Http:
      return 'http'
    case HttpPort.Https:
      return 'https'
  }
}

const scheme = getScheme(HttpPort.Http)
```

枚举常量不会产生运行时的代码（除非你提供了 `preserveConstEnums` 编译器配置）。也就是说在编译之后，枚举常量的值会被直接内联到代码中。下面就是编译后的 Javascript 代码：

```ts
function getScheme(port) {
  switch (port) {
    case 80:
      return 'http'
    case 443:
      return 'https'
  }
}
var scheme = getScheme(80)
```

是不是很简洁？
