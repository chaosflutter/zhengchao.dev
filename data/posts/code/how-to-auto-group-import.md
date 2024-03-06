---
title: '如何自动分组排序 import 语句'
date: '2024-03-06'
topics: ['clean-code', 'format']
---

今天分享一个代码整理的小技巧：自动分组排序 import 语句。

go 或者类似自带 formt 工具的语言，通常会体贴地帮你自动整理 import 语句。前端一般用 `prettier` 格式化代码，虽然`prettier` 很好用，能够非常方便地让代码库的编码风格保持基本的一致性，但默认功能并不支持自动分组排序 import 语句。如果你在大的多人的代码仓库中协作过，并且对代码整洁性有一些洁癖，可能总是会不厌其烦地去整理 import 语句。但这和软件开发中的很多事情一样，都是可以自动化的。

我用过两个比较好的方案，都简单好用，选择哪一个可能主要取决于个人偏好。

### 基于 Prettier 格式化代码

可以使用：`prettier-plugin-organize-imports`

> 项目地址：https://github.com/simonhaenisch/prettier-plugin-organize-imports

安装：

```sh
pnpm add prettier-plugin-organize-imports -D
```

在 `prettier` 配置文件中添加配置：

```json
{
  "plugins": ["prettier-plugin-organize-imports"]
}
```

如果你使用 `prettier` 2.x.x 的版本，并且只用 `npm` 来做包管理，甚至都不用添加上面的配置。

如果你的 VSCode 配置了“Format On Save”，现在保存代码，`prettier` 会自动帮你排序 import 语句。除了排序外，它还支持自动删除冗余 import 语句。

### 基于 Eslint 格式化代码

可以使用：`eslint-plugin-simple-import-sort`

> 项目地址：https://github.com/lydell/eslint-plugin-simple-import-sort

安装：

```sh
pnpm add eslint-plugin-simple-import-sort -D
```

在 `eslint` 的配置文件中添加如下配置：

```json
{
  "plugins": ["simple-import-sort"],
  "rules": {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error"
  }
}
```

同样的，如果你的 VSCode 配置了“Format On Save”，现在保存代码会自动帮你排序和分组 import 以及 export 语句。

`eslint-plugin-simple-import-sort` 还支持更多的功能，比如自定义分组，可以根据项目需要自行配置。

最后，如果你对 import 和 export 语句有更精细化的 lint 和 format 需求，可以研究 [`eslint-plugin-import`](https://github.com/import-js/eslint-plugin-import/) 的使用。
