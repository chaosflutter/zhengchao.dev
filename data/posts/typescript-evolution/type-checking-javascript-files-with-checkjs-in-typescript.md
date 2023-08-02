---
title: 'TypeScript 中使用 --checkJs 检查 Javascript 文件'
date: '2021-02-07'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/type-checking-javascript-files-with-checkjs-in-typescript'
---

一直到 Typescript 2.2，类型检查以及相应的错误提示仅限于 `.ts` 文件。从 Typescript 2.3 开始，编译器可以对普通的`.js`文件进行类型检查和报错。

```ts
let foo = 42

// [js] Property 'toUpperCase' does not exist on type 'number'.
let upperFoo = foo.toUpperCase()
```

我们可以通过设置新增的 `--checkJs` 标识来默认开启对所有 `.js` 文件的类型检查。除此之外，还可以通过三个新增的指令，以注释的方式来对哪段 Javascript 进行检查进行更精细的控制。

- 使用 `// @ts-check` 来选择对单个文件进行类型检查
- 使用 `// @ts-nocheck` 来选择对单个文件不进行类型检查
- 使用 `// @ts-ignore` 来选择对单行代码不进行类型检查

这些选项提供了类型检查的黑名单和白名单机制。注意不管使用哪种方式，`--allowJs` 选项都应该设置为 `true`，这样在一开始 Javascript 文件就会被纳入到编译范围内。

### 黑名单机制

黑名单机制的意思是默认开启每一个 Javascript 文件的类型检查。这可以通过设置`--checkJs`编译选项为`true`来实现。你可以在每一个不需要进行类型检查的文件顶部添加 `// @ts-nocheck` 注释来将它们加入检查黑名单。

如果你的 Javascript 代码库足够小，你希望能够一次性地添加类型检查，我推荐你使用这种方式。如果有报错，你可以立即去修复它，或者通过`// @ts-ignore` 来忽略引起错误的那一行，或者通过 `// @ts-nocheck` 来忽略整个文件。

### 白名单机制

白名单机制的意思是默认只检查选中的 Javascript 文件。这可以通过将 `--checkJs` 编译选项设置为 `false` 同时在每一个选中的文件顶部添加 `@ts-check` 注释来实现。

如果你想在一个巨大的 Javascript 代码库中渐进地引入类型检查，我推荐使用这种方式。通过这种方式，你不用一开始就被大量的报错淹没。每当你在处理一个文件的时候，你可以添加 `// @ts-check`，然后修复可能的报错，通过这种方式渐进地进行迁移。

### 从 Javascript 迁移到 Typescript

一旦整个代码库都添加了类型检查，你会更容易地将 Javascript(即 `.js` 文件)迁移到 Typescript(即 `.ts` 文件)。使用白名单或者黑名单机制，你可以通过小步迭代的方式添加类型检查，同时为迁移到 Typescript 实现代码库完全的静态类型检查做准备。
