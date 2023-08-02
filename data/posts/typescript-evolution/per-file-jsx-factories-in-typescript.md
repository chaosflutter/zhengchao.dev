---
title: 'TypeScript 中基于文件设置JSX工厂函数'
date: '2021-04-18'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/per-file-jsx-factories-in-typescript'
---

Typescript 2.8 允许你基于单个文件来设置特定的 JSX 工厂函数名字。在这之前，你只能通过 `--jsxFactory` 编译选项来设置 JSX 工厂函数。并且这个设置会应用到整个项目中的所有 JSX 文件。现在，你可以通过在文件的开头添加特殊的 `@jsx` 注释来覆盖全局的 `--jsxFactory` 设置。

比方说我们想要使用 `Preact` 来将字符串 `Hello, World!` 渲染到 `<div id="app">` 容器中。因为 Preact 使用 `h` 函数来创建一个 JSX 元素，所以我们可以在文件的开头添加特殊的 `/** @jsx */` 注释（也被称作"pragma"）：

```ts
/** @jsx h */
import { h, render } from 'preact'

render(<h1>Hello World!</h1>, document.getElementById('app')!)
```

添加了 `/** @jsx h */` 之后，编译器会生成下面的代码：

```ts
/** @jsx h */
import { h, render } from 'preact'
render(h('h1', null, 'Hello World!'), document.getElementById('app'))
```

下面是我用来编译以上代码的 `tsconfig.json` 文件：

```ts
{
  "compilerOptions": {
    "target": "es5",
    "module": "es2015",
    "moduleResolution": "node",
    "jsx": "react",
    "strict": true
  }
}
```

注意你只有使用 `/** ... */` 这种形式的注释风格编译器才能够识别出来。如果你使用 `//...` 这种单行注释语法，JSX 工厂函数的设置不会有任何改变。

### 什么是 JSX 工厂函数

JSX 不是 ECMAScript 标准的一部分，也就是说，它本身不是有效的 Javascript 代码。如果一个脚本或者模块包含了 JSX，它就不能直接在浏览器中运行。就如一个包含了类型标注的文件，JSX 文件也需要先编译成普通的 JavaScript 文件。`--jsxFactory` 选项告诉了 Typescript 编译器它该如何编译 JSX 元素。

留意 `<h1>Hello World!</h1>` 是如何被转换成 `h("h1", null, "Hello World!")` 的。Preact 使用了 `h` 函来创建虚拟 DOM 元素，这就是为什么我们设定 `h` 为 JSX 工厂函数名。我们同时需要从 `preact` 包中导入 `h`，因为它会在模块中被使用。

### 按文件 vs 按项目设置 JSX 工厂函数

所以我们什么时候需要基于文件粒度来设置 JSX 工厂函数呢？如果你项目中只使用一种 Javascript 库来处理 JSX，你并不需要按文件设置。在这种场景下，只需要修改 `tsconfig.json` 文件中的 `--jsxFactory` 选项即可，它会应用到你项目中的所有 JSX 文件：

```ts
{
  "compilerOptions": {
    "target": "es5",
    "module": "es2015",
    "moduleResolution": "node",
    "jsx": "react",
    "jsxFactory": "h",
    "strict": true
  }
}
```

默认情况下，如果使用 `--jsx react` 选项，`--jsxFactory` 会设置为 `React.createElement`。因此，如果你使用 React，你不需要显式地设置 `--jsxFactory`，也不需要添加 `/** @jsx ... */` 注释。

如果你在一个项目中会使用多个库来处理 JSX，那么按文件设置工厂函数就非常有用了。举个例子，你也许想在一个主要以 React 开发的应用中添加一个 Vue 组件，你可以在对应的文件顶部添加 `/** @jsx ... */` 来设置不同的 JSX 工厂函数，而不用使用多个 `tsconfig.json` 文件。
