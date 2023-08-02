---
title: 'TypeScript 中字面量表达式的 Const 断言'
date: '2021-06-13'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/const-assertions-in-literal-expressions-in-typescript'
---

Typescript 3.4 中新增了 `const` 断言。`const` 断言是一种特殊的类型断言，它使用了 `const` 关键字而不是具体的类型名称。在这篇文章中，我会解释 `const` 断言是如何工作的，以及我们为什么需要使用它。

### const 断言的产生缘由

假设我们写了下面的 `fetchJSON` 函数。它接收一个 URL 和 一个 HTTP 请求方法，然后使用浏览器的 `Fetch API` 来对这个 URL 发起 GET 或 POST 请求，最后将结果反序列化为 JSON：

```ts
function fetchJSON(url: string, method: 'GET' | 'POST') {
  return fetch(url, { method }).then((response) => response.json())
}
```

我们可以调用这个函数，传入任意的的 URL 给 url 参数，以及 `"GET"` 字符串给 `method` 参数。注意我们使用了两个字符串常量：

```ts
// OK, no type error
fetchJSON('https://example.com/', 'GET').then((data) => {
  // ...
})
```

为了检查这个函数调用是否类型正确，Typescript 会检查所有入参的类型，并且和函数声明中的参数类型进行对比。在这个例子中，两个入参的类型都可以赋值给形参类型，所以该函数调用能正确通过类型检查。

现在我们来做一点代码重构。HTTP 规范定义了许多的请求方法，比如 DELETE, HEAD, PUT 等等。我们可以定义一个 HTTPRequestMethod 枚举风格的映射对象来列出各种请求方法：

```ts
const HTTPRequestMethod = {
  CONNECT: 'CONNECT',
  DELETE: 'DELETE',
  GET: 'GET',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
  PATCH: 'PATCH',
  POST: 'POST',
  PUT: 'PUT',
  TRACE: 'TRACE',
}
```

现在我们可以用 `HTTPRequestMethod.GET` 来替代 `fetchJSON` 函数调用中的字符串字面量 `"GET"`：

```ts
fetchJSON('https://example.com/', HTTPRequestMethod.GET).then((data) => {
  // ...
})
```

不过，现在 Typescript 会产生一个类型错误。类型检查器指出 `HTTPRequestMethod.GET` 类型不能赋值给 `method` 参数类型。

```sh
// Error: Argument of type 'string' is not assignable
// to parameter of type '"GET" | "POST"'.
```

为什么会这样？` HTTPRequestMethod.GET` 的值就是字符串 `"GET`，和我们之前使用的字符串字面量入参是一样的。属性 `HTTPRequestMethod.GET` 和字符串字面量 `"GET"` 究竟有什么不同？为了回答这个问题，我们需要理解字符串字面量类型是如何工作的，以及 Typescript 如何处理字面量类型拓宽(literal type widening)。

### 字符串字面量类型

让我们来看一个 `"GET"` 值的类型，它通过 `const` 关键字被赋值给了一个变量：

```ts
// Type: "GET"
const httpRequestMethod = 'GET'
```

TypeScript 将我们的 `httpRequestMethod` 变量推断为 `"GET"` 类型。`"GET"` 就是所谓的字符串字面量类型。每一个字面量类型都精确地描述了一种值，也就是，一个特定的字符串、数字、布尔值或者枚举成员。在我们的例子中，我们处理的是字符串 `"GET"`，所以我们的字面量类型是字符串字面量类型 `"GET"`。

注意我们使用了 `const` 关键字来声明 `httpRequestMethod` 变量。因此，我们知道它之后不可能再被重新赋值，它的值永远都是 `"GET"`。Typescript 能够理解这层语义，所以自动将其推断为字符串字面量类型 `"GET"`。

### 字面量类型拓宽

假如我们使用 `let` 关键字（代替 `const` 关键字）来声明 `httpRequestMethod` 变量会发生什么？

```ts
// Type: string
let httpRequestMethod = 'GET'
```

Typescript 在这里执行了所谓的[字面量类型拓宽](https://chaosflutter.com/ts-evolution/literal-type-widening-in-typescript)。`httpRequestMethod` 变量被推断为类型 `string`。虽然我们使用了 `"GET"` 来初始化 `httpRequestMethod`，但是因为这个变量是通过 `let` 关键字声明的，我们可以在之后对它进行重新赋值：

```ts
// Type: string
let httpRequestMethod = 'GET'

// OK, no type error
httpRequestMethod = 'POST'
```

后一个 `"POST"` 赋值是类型正确的，因为 `httpRequestMethod` 的类型是 `string`。Typescript 将其推断为 `string` 是因为我们既然用了 `let` 关键字声明变量我们就很有可能在之后修改这个变量的值。如果我们并不想对这个变量重新赋值，我们应该使用 `const` 关键字替代。

现在我们再来看看我们枚举风格的映射对象：

```ts
const HTTPRequestMethod = {
  CONNECT: 'CONNECT',
  DELETE: 'DELETE',
  GET: 'GET',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
  PATCH: 'PATCH',
  POST: 'POST',
  PUT: 'PUT',
  TRACE: 'TRACE',
}
```

`HTTPRequestMethod.GET` 的类型是什么？让我们来看看：

```ts
// Type: string
const httpRequestMethod = HTTPRequestMethod.GET
```

Typescript 将我们的 `httpRequestMethod` 变量推断为 `string` 类型。这是因为我们使用 `HTTPRequestMethod.GET`（它的类型是 `string`）作为这个变量的初始化值。

那为什么 `HTTPRequestMethod.GET` 的类型是 `string` 而不是类型 `"GET"`？我们使用字符串字面量 `"GET"` 来初始化属性 `GET` 的值，并且我们的 `HTTPRequestMethod` 对象本身是使用 `const` 关键字定义的。难道它的类型不应该被推断为字符串字面量类型 `"GET"` 吗？

Typescript 之所以将 `HTTPRequestMethod.GET` 推断为类型 `string`（其他属性也一样）的原因是，我们在之后可以对任何一个属性的值进行重新赋值。对我们来说，这个包含了所有大写属性的对象看上去像一个定义了字符串常量的枚举，并且不会随着时间而改变。然而，对 Typescript 来说，它就是一个普通的对象，只不过凑巧通过一些字符串来初始化这些属性。

下面的例子更好地解释了为什么 Typescript 没有将使用字符串常量初始化的对象属性推断为字符串常量类型：

```ts
// Type: { name: string, jobTitle: string }
const person = {
  name: 'Marius Schulz',
  jobTitle: 'Software Engineer',
}

// OK, no type error
person.jobTitle = 'Front End Engineer'
```

如果 `jobTitle` 属性被推断为 `"Software Engineer"` 类型，我们在之后给它赋值 `"Software Engineer"` 之外的字符串，将会产生一个类型错误。也即，`"Front End Engineer"` 的赋值将是类型错误的。对象属性默认是可以改变的，所以我们并不想要 Typescript 推断出一个类型严格限制我们执行完全合理的对象属性修改。

那我们如何确保函数调用中的 `HTTPRequestMethod.GET` 属性能够通过类型检查？我们需要先理解非拓宽的字面量类型(no-widening literal types)。

### 非拓宽的字面量类型

Typescript 有一个特殊的字面量类型，被称为非拓宽的字面量类型。正如其名所示，非拓宽的字面量类型不会被拓宽为一个更宽泛的类型。举个例子，非拓宽的字符串字面量类型 `"GET"` 不会被拓宽为 `"string"`，而这种拓宽在很多场景中经常发生。

我们可以通过给 `HTTPRequestMethod` 对象每个属性的值应用相应字符串字面量类型断言来使得它们都变为非拓宽的字面量类型：

```ts
const HTTPRequestMethod = {
  CONNECT: 'CONNECT' as 'CONNECT',
  DELETE: 'DELETE' as 'DELETE',
  GET: 'GET' as 'GET',
  HEAD: 'HEAD' as 'HEAD',
  OPTIONS: 'OPTIONS' as 'OPTIONS',
  PATCH: 'PATCH' as 'PATCH',
  POST: 'POST' as 'POST',
  PUT: 'PUT' as 'PUT',
  TRACE: 'TRACE' as 'TRACE',
}
```

现在我们再来检查一下 `HTTPRequestMethod.GET` 的类型：

```ts
// Type: "GET"
const httpRequestMethod = HTTPRequestMethod.GET
```

的确，现在 `httpRequestMethod` 变量的类型是 `"GET"` 而不是 `string`。`HTTPRequestMethod.GET` 的类型（`"GET"`）现在可以赋值给参数 `method`的类型（`"GET" | "POST"`），因此 `fetchJSON` 函数调用现在能够正确通过类型检查：

```ts
// OK, no type error
fetchJSON('https://example.com/', HTTPRequestMethod.GET).then((data) => {
  // ...
})
```

这很不错，但看一看我们为了达到这个目的需要写的类型断言数量。太啰嗦了！每一个键值对都需要包含三遍 HTTP 请求方法。我们能简化这个定义吗？当然可以，我们可以使用 Typescript 的 `const` 断言。

### 字面量达式的 const 断言

我们的 `HTTPRequestMethod` 变量通过字面量表达式初始化，它是一个包含若干属性的对象字面量，每一个属性都被字符串字面量初始化。在 Typescript 3.4 中，我们可以给这个字面量表达式应用 `const` 断言：

```ts
const HTTPRequestMethod = {
  CONNECT: 'CONNECT',
  DELETE: 'DELETE',
  GET: 'GET',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
  PATCH: 'PATCH',
  POST: 'POST',
  PUT: 'PUT',
  TRACE: 'TRACE',
} as const
```

`const` 断言是一种特殊的类型断言，它使用了 `const` 关键字而不是特殊的类型名称。在字面量表达式中使用 `const` 断言会产生以下的效果：

1.  字面量表达式中的字面量类型不会被拓宽。
2.  对象字面量会得到只读属性。
3.  数组字面量会变成只读元组。

添加了 `const` 断言后，上面的 `HTTPRequestMethod` 定义和下面的是等价的：

```ts
const HTTPRequestMethod: {
  readonly CONNECT: 'CONNECT'
  readonly DELETE: 'DELETE'
  readonly GET: 'GET'
  readonly HEAD: 'HEAD'
  readonly OPTIONS: 'OPTIONS'
  readonly PATCH: 'PATCH'
  readonly POST: 'POST'
  readonly PUT: 'PUT'
  readonly TRACE: 'TRACE'
} = {
  CONNECT: 'CONNECT',
  DELETE: 'DELETE',
  GET: 'GET',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
  PATCH: 'PATCH',
  POST: 'POST',
  PUT: 'PUT',
  TRACE: 'TRACE',
}
```

我们并不希望自己手写上面的定义。它太冗长，并且包含了太多的重复：每一个 HTTP 方法被拼写了四次。相反的，`const` 断言的 `as const` 非常简洁，只需要写这么一点代码就可以。

同时请注意所有的属性都被标记为 `readonly`。如果我们尝试给只读属性赋值，Typescript 会产生一个类型错误：

```ts
// Error: Cannot assign to 'GET'
// because it is a read-only property.
HTTPRequestMethod.GET = '...'
```

添加了 `const` 断言后，我们的 `HTTPRequestMethod` 对象有了类似枚举的特性。那为什么不直接用 Typescript 枚举？

### 使用 Typescript 枚举

另一种解决办法是使用 Typescript 枚举来替代普通的对象字面量。我们可以使用 `enum` 关键字定义 `HTTPRequestMethod`：

```ts
enum HTTPRequestMethod {
  CONNECT = 'CONNECT',
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
  TRACE = 'TRACE',
}
```

Typescritp 枚举是用来描述命名的常量，也就是它们的成员永远是只读的。字符串枚举的成员都有一个字符串常量类型：

```ts
// Type: "GET"
const httpRequestMethod = HTTPRequestMethod.GET
```

这意味着函数调用中使用 `HTTPRequestMethod.GET` 作为 `method` 的入参能够通过类型检查：

```ts
// OK, no type error
fetchJSON('https://example.com/', HTTPRequestMethod.GET).then((data) => {
  // ...
})
```

然而，有些开发并不喜欢在它们的代码中使用 Typescript 枚举，因为 `enum` 语法并不是合法的 Javascript 语法。Typescript 编译器会为我们定义的 `HTTPRequestMethod` 枚举输出以下的 Javascript 代码：

```ts
var HTTPRequestMethod
;(function (HTTPRequestMethod) {
  HTTPRequestMethod['CONNECT'] = 'CONNECT'
  HTTPRequestMethod['DELETE'] = 'DELETE'
  HTTPRequestMethod['GET'] = 'GET'
  HTTPRequestMethod['HEAD'] = 'HEAD'
  HTTPRequestMethod['OPTIONS'] = 'OPTIONS'
  HTTPRequestMethod['PATCH'] = 'PATCH'
  HTTPRequestMethod['POST'] = 'POST'
  HTTPRequestMethod['PUT'] = 'PUT'
  HTTPRequestMethod['TRACE'] = 'TRACE'
})(HTTPRequestMethod || (HTTPRequestMethod = {}))
```

用普通的对象字面量还是 Typescript 枚举这完全决定于你自己。如果你想尽可能使用 Javascript，并且只将 Typescript 用于类型标注，你可以继续使用普通的对象字面量以及 `const` 断言。如果你并不介意非标准的枚举定义语法，并且你喜欢简洁，你完全可以使用 Typescript 枚举。

### 其他类型的 const 断言

你可以应用 `const` 断言到：

- 字符串字面量
- 数字字面量
- 布尔字面量
- 数组字面量，以及
- 对象字面量

举个例子，你可以定义 `ORIGIN` 变量描述原始的二维空间：

```ts
const ORIGIN = {
  x: 0,
  y: 0,
} as const
```

这等同于（但更加简洁）以下的声明：

```ts
const ORIGIN: {
  readonly x: 0
  readonly y: 0
} = {
  x: 0,
  y: 0,
}
```

另外，你可以像下面这样用一个包含 X 和 Y 坐标的元组来代表一个点：

```ts
// Type: readonly [0, 0]
const ORIGIN = [0, 0] as const
```

因为 `const` 断言，`ORIGIN` 被定义为 `readony [0, 0]`。如果没有断言，`ORIGIN` 则会被推断为 `number[]` 类型：

```ts
// Type: number[]
const ORIGIN = [0, 0]
```
