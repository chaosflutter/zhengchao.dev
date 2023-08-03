---
title: 'TypeScript 中的动态 import() 表达式'
date: '2021-03-14'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/dynamic-import-expressions-in-typescript'
---

Typescript 2.4 添加了对动态 import() 表达式的支持，它允许按需异步加载和执行 ECMAScript 模块。

在 2018 年一月的写作当下，TC39 官方的动态 `import()` 表达式提议处在 TC39 提议流程的阶段 3（stage 3），这意味着它很可能会作为 ECMAScript 2018 或者 2019 的一部分被标准化。

### 通过静态 import 声明导入模块

我们先来看一个没有使用动态 import() 的例子来启发我们为什么需要它。

假设我们给客户端写了一个 `widget.ts` 模块：

```ts
import * as $ from 'jquery'

export function render(container: HTMLElement) {
  $(container).text('Hello, World!')
}
```

我们的 widget 需要 jQuery，因此需要从 `jquery` npm 包中导入 `$`。注意，我们在第一行使用了完全静态的 `import`，而不是动态 `import()` 表达式。

现在我们切换到 `main.ts` 模块，我们在这个模块中将我们的 widget 渲染到一个特定的 `<div>` 容器中，不过前提条件是我们能在 DOM 中找到这个容器，否则就放弃渲染：

```ts
import * as widget from './widget'

function renderWidget() {
  const container = document.getElementById('widget')
  if (container !== null) {
    widget.render(container)
  }
}

renderWidget()
```

现在如果我们将 `main.ts` 作为入口模块，并使用 `webpack` 或者 `rollup` 这样的打包工具打包我们的应用，打包后的 Javascript 文件有 10000 多行代码。这是因为在我们的 `widget` 模块中，我们导入了 `jquery` 这个体积非常大的 npm 包。

问题在于我们导入了 widget 以及它所有的依赖，即便我们没有渲染这个 widget。当新用户第一次打开我们 web 应用的时候，他们的浏览器需要下载和解析大量的无用代码。这对于那些网络不稳定、带宽低、处理性能有限的移动设备来说尤其糟糕。

让我们来看下如何使用动态的 `import()` 表达式来改善这种情况。

### 使用动态 import() 表达式来导入模块

更好的方式是仅在模块被确实用到的时候才导入。然而，ES2015 的 `import` 声明是完全静态的，并且必须在文件的顶部声明，这意味着我们不能把它放在 if 语句中按需导入模块，而这正是 `import()` 表达式发挥作用的地方。

在我们的 `main.ts` 模块中，我们删除了文件顶部的 `import` 声明，并且使用 `import()` 表达式动态地导入模块，前提是我们能够找到这个 widget 模块挂载的容器。

```ts
function renderWidget() {
  const container = document.getElementById('widget')
  if (container !== null) {
    import('./widget').then((widget) => {
      widget.render(container)
    })
  }
}

renderWidget()
```

`import(specifier)` 表达式是一种特殊的加载模块的语法形式。这个语法让人联想这是一个函数调用，它会解析处理 `specifier` 这个字符串。`specifier` 字符串可以被动态计算——这对于静态 `import` 声明是不可能的。

因为按需获取一个 ECMAScript 模块是异步操作，所以 `import()` 表达式总是会返回一个 promise。当这个 `widget` 和它所有的依赖被下载和执行成功后 promise 会被 resolve。

### 使用 await 操作符来执行 import()

我们来做点简单的重构使 `renderWidget` 函数嵌套更少，更易阅读。因为 `import()` 会返回 ES2015 promise（它有一个 .then() 方法），我们可以使用 `await` 操作符来等待 promise 被 resolve：

```ts
async function renderWidget() {
  const container = document.getElementById('widget')
  if (container !== null) {
    const widget = await import('./widget')
    widget.render(container)
  }
}

renderWidget()
```

清晰又干净！不过别忘了给 `renderWidget` 函数添加 `async` 关键字来声明它是一个异步函数。

如果你还不太熟悉 `async` 和 `await` 是如何工作的，可以看一下我的 [`Asynchronous Javascript with async/await`](https://egghead.io/courses/asynchronous-javascript-with-async-await?af=9g63dt) 视频课程。它只有 18 分钟——你下一个喝咖啡休息的空档就能看完它！

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/asynchronous_javascript_with_async_await-2x.mmlkmp6xpm.imm.png)

### 针对不同模块系统的构建

Typescript 编译器支持各种各样的 Javascript 模块系统，比如 ES2015，CommonJS，或 AMD。针对不同的模块系统，`import()` 表达式构建出的 Javascript 代码也会非常不一样。

一个限制是你不能将 `import()` 表达式构建为 ES2015 模块，因为静态的`import`声明不能表达动态性和可能的按条件加载特性。

假如我们使用 `--module esnext` 来编译我们的 Typescript 应用，下面的 Javascript 代码会被生成。它和原始的代码几乎一致：

```ts
'use strict'
function renderWidget() {
  var container = document.getElementById('widget')
  if (container !== null) {
    var widget = import('./widget').then(function (widget) {
      widget.render(container)
    })
  }
}
renderWidget()
```

注意 `import()` 表达式并没有经过任何的转换。如果我们在这个模块中使用了任何的 `import` 和 `export` 声明，它们也会原封不动地保留下来。

对比下面使用 `--module commonjs` 构建生成的代码（为了易读性添加了一些额外的换行）：

```ts
'use strict'
function renderWidget() {
  var container = document.getElementById('widget')
  if (container !== null) {
    var widget = Promise.resolve()
      .then(function () {
        return require('./widget')
      })
      .then(function (widget) {
        widget.render(container)
      })
  }
}
renderWidget()
```

对于 Node 应用，CommonJS 是一个很不错的选择。所有的 `import()` 表达式都会被转换成 `require()` 调用，它支持在你程序的任何位置有条件地去执行代码，而不必提前加载、解析、执行这个模块。

所以，如果你在开发一个客户端 web 应用并且使用了 `import()`来按需懒加载模块，你应该选择哪种模块系统作为构建目标？我推荐你使用 `--module esnext`，并且结合 webpack 的代码分片（code splitting）功能。可以参考一下这个 demo：[Code-Splitting a TypeScript Application with import() and webpack](https://mariusschulz.com/blog/code-splitting-a-typescript-application-with-import-and-webpack)。
