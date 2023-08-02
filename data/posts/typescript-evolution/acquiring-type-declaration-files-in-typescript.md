---
title: 'TypeScript 中如何获取类型声明文件'
date: '2020-09-20'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/acquiring-type-declaration-files-in-typescript'
---

本文是 Typescript Evolution 系列的第 3 篇，原作者已经更新到了 40 多篇。该系列从 Typescript 2.0 开始，对每次语言更新新增的重要特性都做了通俗易懂的介绍，等不及翻译的同学建议直接阅读系列原文。

---

在 Typescript 2.0 中，获取 Javascript 各种库的类型信息变得异常简单。你不再需要使用类似 typings 或 tsd 这些额外的工具，而是可以直接使用 npm 上相关的类型声明包。

### 从 npm 安装类型声明包

假设你需要在某个 Typescript 项目中使用 Lodash：

```bash
npm install --save lodash
```

执行上面的命令后，Lodash 会安装到 node_modules 文件夹中，并且在 package.json 中被列为项目的依赖。然而，因为 Lodash 是使用 Javascript 写的，所以库本身没有携带类型声明文件，从而没办法提供 Typescript 需要的类型信息。

不过，你可以再次通过 npm 安装 @types/lodash 包，它包含了 Typescript 需要的类型信息：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/npm-install-types-lodash.png)

注意类型声明包的命名。它在原初 npm 包的名称之前加了 @types/ 前缀。大多数包应该遵守这种约定，不过你总是可以通过 TypeSearch 这个网站来搜索所用库对应的类型声明包的名称。

使用 npm 来管理类型信息的好处是，这些类型声明包会和你的其他依赖一样一起被记录在 package.json 文件中。此外，它们可以和其他 npm 包一样被正确地版本化。最后，你只需要一个你已经在用的包管理器，也即 npm，而不需要其他额外的工具。

### 这些类型声明文件究竟存在哪里

和其他 npm 包一样，这些类型声明包被安装在了 node_modules 文件夹中。其中有个 @types 文件夹包含了所有的类型声明文件。在上面的例子中，@types 下会有一个 lodash 文件夹，它包含的 index.d.ts 文件提供了所有 Lodash 的类型信息：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/node_modules-%40types-folder.png)

Typescript 的编译器知道这个约定，并且会自动获取 @types 文件夹中的类型声明。你不需要为此更新 tsconfig.json 或其他配置文件。

### 是谁写了这些类型声明包呢

这些类型声明包是通过 types-publisher 服务自动生成的。它会将 DefinitelyTyped 仓库的内容发布到 npm 中。如此，提交给 DefinitelyTyped 的类型声明最后会部署到 npm 上，方便开发使用。
