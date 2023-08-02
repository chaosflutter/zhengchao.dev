---
title: 'TypeScript 中增强的字面量类型推断'
date: '2020-12-07'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/improved-inference-for-literal-types-in-typescript'
---

Typescript 中很早就存在字符串字面量类型。到 2.0 的时候，类型系统又新增了一些新的字面量类型：

- 布尔字面量类型
- 数字字面量类型
- 枚举字面量类型

在 TypeScript 2.1 中，如果一个变量用 `const` 声明或者一个属性用 `readonly` 声明，并且有一个字面量初始值，那么这些变量、属性会得到更准确的字面量类型。

### const 变量更好的类型推断

我们先来看一个用 `var` 声明的局部变量。当 Typescript 看到下面的变量声明，它会将 `baseUrl` 推断为 `string` 类型：

```ts
var baseUrl = 'https://example.com/'
// Inferred type: string
```

用 `let` 关键字声明也是类似的：

```ts
let baseUrl = 'https://example.com/'
// Inferred type: string
```

这两个变量都被推断为 `string` 类型，因为它们可以在任何时候被改变。它们初始化了一个字符串字面量，但它们依然可能在之后被改变。

不过，当一个变量使用 `const` 关键字声明，并且初始化了一个字符串字面量，那么推断出的类型就不再是 `string` 了，而是相应的字符串字面量类型：

```ts
const baseUrl = 'https://example.com/'
// Inferred type: "https://example.com/"
```

推断出的类型应该越具体越好，因为一个字符串常量的值后面是不可能被修改的。也就是 `baseUrl` 的值只可能是`"https://example.com/"`，而不可能是其他。这个信息现在被反映到了类型系统中。

字面量类型推断也同样作用于其他原始类型。如果一个常量被初始化为一个数字或布尔值，同样会被推断为字面量类型：

```ts
const HTTPS_PORT = 443
// Inferred type: 443

const rememberMe = true
// Inferred type: true
```

类似的，如果被初始化为一个枚举值，也会被推断为字面量类型：

```ts
enum FlexDirection {
  Row,
  Column,
}

const direction = FlexDirection.Column
// Inferred type: FlexDirection.Column
```

注意 `direction` 被推断为 `FlexDirection.Column` 类型，这是一个枚举字面量类型。假如我们使用 `let` 或 `var` 关键字来声明 `direction` 变量，那么它的推断类型应该是 `FlexDirection`。

### readonly 属性更好的类型推断

和 `const` 变量类似， readonly 属性如果初始化了一个字面量，也会被推断为一个字面量类型：

```ts
class ApiClient {
  private readonly baseUrl = 'https://api.example.com/'
  // Inferred type: "https://api.example.com/"

  request(endpoint: string) {
    // ...
  }
}
```

class 中的只读属性只能在声明的时候或者在构造函数中被初始化。尝试在其他地方修改它的值都会导致编译时报错。因此，将只读的 class 属性推断为字面量类型是合理的，因为它的值不会再改变（前提是这个 Typescript 程序是类型正确的）。

当然，Typescript 并不知道运行时会发声什么：使用 `readonly` 修饰的属性在运行时可以被任意的 Javascript 代码修改。`readonly` 修饰符只在 Typescript 中限制了对对应属性的操作，它不会在运行时起任何作用。因为，它会在编译时被去除，不会出现在生成的 Javascript 代码中。

### 字面量类型推断的用处

你可能会疑惑，为什么将 `const` 变量和 `readyonly` 属性推断为字面量类型是有用的？可以思考以下的代码：

```ts
const HTTP_GET = 'GET' // Inferred type: "GET"
const HTTP_POST = 'POST' // Inferred type: "POST"

function request(url: string, method: 'GET' | 'POST') {
  // ...
}

request('https://example.com/', HTTP_GET)
```

假如 `HTTP_GET` 被推断为 `string` 而不是 `"GET`，你会得到一个编译时错误，因为你不能将 `HTTP_GET` 作为第二个入参传给 `request` 函数：

```sh
Argument of type 'string' is not assignable to parameter of type '"GET" | "POST"'.
```

显而易见，你不能给一个明确只接受两个特定字符串作为参数的入参传递任意的字符串。但当上面的两个常量被推断为 `"GET"` 和 `"POST"`的时候，程序就能正常工作了。
