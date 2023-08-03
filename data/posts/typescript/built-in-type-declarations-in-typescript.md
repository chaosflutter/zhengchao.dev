---
title: 'TypeScript 中的内置类型声明'
date: '2020-10-25'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/built-in-type-declarations-in-typescript'
---

Typescript 2.0 让你能够更细粒度地控制哪些内置的 API 声明可以被加入到项目中。在之前，如果你的项目的构建目标（target）是`ES6`，那么你只能访问 `ES2015` 的 API。现在，内置的标准库声明已经模块化，Typescript 已经允许你选择哪些类型声明需要加入到项目中。

### --lib 编译器选项

Javascript 标准库的类型声明被拆分到了许多 API 组里。截止目前（2016 年 11 月底），已经定义了下面的这些组：

- dom
- webworker
- es5
- es6 / es2015
- es2015.core
- es2015.collection
- es2015.iterable
- es2015.promise
- es2015.proxy
- es2015.reflect
- es2015.generator
- es2015.symbol
- es2015.symbol.wellknown
- es2016
- es2016.array.include
- es2017
- es2017.object
- es2017.sharedmemory
- scripthost

你可以通过命令行选项 `--lib` 或者 tsconfig.json 中的 `lib` 属性来传入你需要的以上 API 集合的子集。然后 Typescript 只会将你需要的类型声明注入到项目中，也就是说，其他 API 组的类型声明在你的项目环境中是不存在的。

如果你不显式地提供 `lib` 选项，Typescript 会隐式地注入 web 开发需要的一些 api 组。以下这些是默认值，具体由你项目的构建目标而定：

- ["dom", "es5", "scripthost"]，当构建目标是 ES5
- ["dom", "es6", "dom.iterable", "scripthost"]，当构建目标是 ES6

### 在构建目标是 ES5 的 Typescript 项目中使用 ES2015 的 Promise

假如你正在开发的项目构建目标是 ES5，以此来保证项目能够在大多数的浏览中正常运行。你的 tsconfig.json 大概会是这样的：

```ts
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es5",
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

因为没有指定 `lib` 选项，Typescript 默认注入 "dom", "es5", 和 "scripthost" 这些 API 组。现在假设你想用 ES2015 中的 Promise API，但它在 ES5 中不存在，所以你需要安装 polyfill 来保证你的代码能够在低版本浏览器中正常运行：

```sh
npm install --save es6-promise
```

然后你在应用的入口模块中引入 polyfill:

```ts
import 'es6-promise'

// ...
```

引入 polyfill 以后，你就可以在你的应用中使用 `Promise`，你的代码也能正常运行。但是，TypeScript 会在编译阶段给出一个报错，提示 `Cannot find the name 'Promise'`。这是因为 `Promise` 的类型声明并没有在默认注入的 API 组中。

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_promise_missing_typings-2x.dhq2orkiic.imm.png)

你需要告诉 Typescript，你确定 `Promise` 在运行时会存在（因为有 polyfill）。这个时候 lib 这个编译器选项就派上用场了：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_lib_autocomplete-2x.mt3dvirudw.imm.png)

注意，因为你覆盖了默认值，所以现在你需要显式地提供所有 API 组。最终的 tsconfig.json 文件应该是这样的：

```ts
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es5",
    "noImplicitAny": true,
    "strictNullChecks": true,
    "lib": ["dom", "es5", "es2015.promise"]
  }
}
```

就这么简单，现在类型检查器又能开心工作了：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_promise-2x.syz6fctju3.imm.png)
