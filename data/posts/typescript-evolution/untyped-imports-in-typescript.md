---
title: 'TypeScript 中没有类型的导入'
date: '2020-12-21'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/untyped-imports-in-typescript'
---

Typscript 2.1 使得导入不具类型的模块更容易。之前，编译器过于严格，所以当你导入一个没有类型声明的模块的时候会提示错误：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_untyped_import_error-2x.ewgnulrtd5.imm.png)

从 Typescript 2.1 开始，对于这种情况编译器不会再报错。Typescript 允许导入没有类型的模块，编辑器也不会在导入的模块下面加红色波浪线了：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_untyped_import_ok-2x.qncktb45ze.imm.png)

现在导入的 `range` 函数被标记为 `any` 类型。这么做的好处是当一个 Javascript 项目迁移到 Typescript 的过程中会产生更少的编译错误。坏处是，你得不到任何的自动补全提示或者精准的类型检查因为编译器不清楚模块或从它导入的具体内容的类型。

如果之后你提供了类型声明，比如从 npm 上下载了类型声明包，它们会提供更精确的类型，并且覆盖默认的 `any` 类型（不然就没办法给导入的模块提供类型信息了）。

注意假如你的编译选项 `noImplicitAny` 设置为 `true`，没有类型的导入依然会被标记为错误——毕竟，导入的模块会默认被标记为 `any` 类型。如果想去掉这个报错，你可以提供类型声明或者将 `noImplicitAny` 选项设置为 `false`。
