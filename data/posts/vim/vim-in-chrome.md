---
title: '在 Chrome 中使用 Vim'
date: '2021-07-25'
topics: ['vim', 'chrome']
---

作为一个前端开发，用得最多的两类软件应该就是编辑器和浏览器了。编辑器我们有
VSCode、Vim，浏览器我们会选择 Chrome。那有没有可能在 Chrome 中使用 Vim？借助 Vim
的快捷键来提升浏览体验？有，这就是今天要介绍的 Vimium 插件。

Vimium 是一个 Chrome
插件，[下载地址](https://chrome.google.com/webstore/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb)。如何安装不赘言了，我会介绍自己每天都在用的一些功能，这些功能让我在使用 Chrome 的时候完全离不开它。

### 命令全览和插件配置

在安装 Vimium 插件后，打开任意一个网页，在光标不在地址栏或页面中某个输入框的时候，按 `?` 号会弹出
`Vimium Help` 弹窗，上面列出了默认的所有基础快捷键，如下所示：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/vimium/1.jpeg)

点击右下角的 `Show advanced commands` 可以展开更多高级的命令。

点击右上角的 `Options`，可以打开 Vimium 插件的配置页面，如下所示：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/vimium/2.jpeg)

你可以对 Vimum 插件做一些适当的配置。比如有一些页面本身会有一些快捷键，这些快捷键会和 Vimuim
有冲突，所以你可以选择在该页面中全部或部分禁用 Vimium。它支持通过 Pattern 匹配
url，比如这里我禁止了在 `repl.it` 中使用 Vimium，它的 Pattern 如下：

```sh
https?://repl.it/*
```

你还可以通过 Keys 字段来选择禁止部分快捷键，如果这个字段不设置，默认会在该 url 匹配的网页中禁止
Vimuim 的全部命令。

另外，和 `.vimrc` 中的 map 类似，如果你想自定义某些快捷键，可以使用上面的 `Custom key mappings`
设置。

最后你还能通过 `Custom search engines` 设置 Vimium 插件 vomnibar（搜索框，下面会提到）的搜索引擎。

### 常用的那些命令

#### 快速打开页面中的任意链接：`f` 和 `F`

在当前页面中，按下 `f` 键，你会发现所有的链接都被标记了对应的字母或字母组合，如下所示：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/vimium/3.jpeg)

输入对应的字母或字母组合，比如上面的 `A`（不区分大小写），就可以在当前 tab 打开 `Better Programming` 在 Medium
上的[主页](https://betterprogramming.pub/5-new-killer-features-of-next-js-12-dfd1d766b539)。是不是非常地便捷、非常地爽？如果你想在新
tab 打开页面，可以使用大写的 `F` 命令。

#### 流畅自如地控制页面滚动：`j`、`k`、`h`、`l`、`gg`、`G`

这些命令和 vim 中是一致的。所以很容易上手：

- `j`：向下滚动页面
- `k`：向上滚动页面
- `h`：向左滚动页面
- `l`：向右滚动页面
- `gg`：滚动到页面的顶部
- `G`：滚动到页面的底部

有了这些命令，你浏览网页的体验会好很多，也高效很多，完全不需要再借助鼠标滚动页面。

#### 刷新页面一个键就够了：`r`

相比于使用 f5（离手远盲打定位难）、或者使用 `Command + R`，只需要按一下 `r`
就刷新页面，体验要好很多，也可以彻底嫌弃操作鼠标去刷新页面。

#### 对 url 的操作：`yy`、`p`、`P`

操作 url 是使用浏览器时常见的需求。比如我想复制浏览器中长长的 url
要怎么做？以前要操作鼠标，定位到地址栏，然后右键复制。现在你只需要键盘敲击 `yy`，就能快速复制 url
地址了。

复制了 url 以后，想打开一个 tab，又用鼠标？不需要，只需要敲击 `p`，就会在当前 tab 打开剪贴板中的
url。或者使用大写的 `P` 在新的 tab 中打开该地址。

#### 使用 vomnibar 打开 url、操作书签、历史记录等：`o`、`O`、`b`、`B`、`T`

如果想快速打开一个 url、书签或历史记录，可以使用 `o` 命令，效果如下：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/vimium/4.jpeg)

它会在你的历史记录、书签、当前打开 tab
中搜索和关键词匹配的页面，方便快速打开对应页面。同样的，默认在当前 tab 打开页面，可以使用大写的 `O`
命令在新 tab 中打开搜索结果的页面。如果你输入了完整的 url，可以直接回车打开对应的页面。

如果你只想搜索书签中的页面，可以使用 `b` 或者 `B` 命令，大小写的含义和上面介绍的几个命令一样。

如果你想快速切换到已经打开的某个 tab 页，可以使用 `T` 命令，试试吧，你会感觉非常爽的。

#### 操作历史记录：`H`、`L`

- `H`：回退到历史中的上一个页面
- `L`：前进到历史中的下一个页面

#### tabs 操作从未如此简单：`t`、`J`、`K`、`g0`、`g$`、`yt`、`x`、`X`

以下这些命令都和 tabs 操作有关，花点时间熟练掌握后 tabs 操作效率会高出不止一倍。

- `t`：打开新 tab
- `J`：切到左边的 tab
- `K`：切到右边的 tab
- `g0` ：切到第一个 tab
- `g$`：切到最后一个 tab
- `yt`：在另一个 tab 打开当前页面（复制当前 tab）
- `x`：关闭当前 tab
- `X`：恢复最近关闭的 tab

#### 结语

好了，Vimium
常用的命令就介绍到这，但知道不等于能熟练使用。建议可以花一点时间熟悉一下上面的命令，以后它会帮你节省更多的时间。也许更重要的是，因为这些看似细枝末节微不足道的体验提升，会让你更容易进入一种工作、学习的心流状态，帮助你更高效地吸收、更高效地输出。希望你能愉快地使用 Vimium。
