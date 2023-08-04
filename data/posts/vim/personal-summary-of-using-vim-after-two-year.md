---
title: '使用 Vim 两年后的个人总结'
date: '2023-01-03'
topics: ['vim', 'editor']
---

### 为什么要使用 Vim

学习动机非常重要。并不是很多大牛程序员用 Vim 编程，你就应该去学习 Vim，如果你是这种心态，很大的概率，你会在几次尝试以后最终放弃，就像我曾经做过的一样。因为 Vim 的学习曲线很陡峭，没有强烈的学习动机很难坚持下来。

那我为什么后来又重新开始学习 Vim，并在两年多后已经习惯、喜欢甚至离不开 Vim？原因很简单，我必须掌握 Vim。

我是一个很爱折腾的人，自己买过很多云服务器，也经常会在服务器上写一些程序，编辑器当然首选 Vim。日复一日，当有一天我实在无法忍受自己在服务端极其低效的编程体验后，我决定真正掌握 Vim。从那时候起，我开始刻意频繁练习，也终于有一天，我发现我完全存活了下来，并且喜欢上了 Vim。

我并不是说你一定要买个云服务器，然后在云服务器上写代码（其实现在你可以用 VSCode 的远程功能在服务器上写代码），我想表达的是，**你一定要有足够的学习动机，这个学习动机往往来自于必要性，不管是工作上的必要性，还是自己业余项目上的必要性。也许，有强烈的炫耀动机可能也行。**

当然了，当你真正喜欢上 Vim，你会有新的理解，比如 Vim 某种意义上代表了一些正向的价值，文章最后我会提到这一点。

### 关于 Normal 模式的最佳隐喻

《代码大全》（Code Complete）开头就讲了“软件构建的隐喻”，隐喻是非常好的方式，能够通过熟悉的事物帮我们建立正确的思维模型。关于 Vim 为什么要有 Normal 模式，我看过的最好的隐喻来自《Practical Vim》这本书，我摘录几个关键的段落：

> Think of all of the things that painters do besides paint. They study their subject, adjust the lighting, and mix paints into new hues. And when it comes to applying paint to the canvas, who says they have to use brushes? A painter might switch to a palette knife to achieve a different texture or use a cotton swab to touch up the paint that's already been applied.

> The painter does not rest with a brush on the canvas. And so it is with Vim. Normal mode is the natural resting state. The clue is in the name, really.

> Just as painters spend a fraction of their time applying paint,programmers spend a fraction of their time composing code . More time is spent thinking, reading, and navigating from one part of a codebase to another. And when we do want to make a change, who says we have to switch to Insert mode? We can reformat existing code, duplicate it, move it around, or delete it. From Normal mode, we have many tools at our disposal.

作者把编程比喻成绘画，把 Normal 模式比喻成画家作画的间隙。**就像画家要经常放下画笔，走远处看看，或用小刀、棉球等工具修改画作一样，程序员也不会一直输入代码（Insert 模式），程序员也需要思考，需要对程序做一些修改（不一定是插入内容），那么这个时候就应该进入 Normal 模式。Normal 模式让程序员休息、思考，同时提供了更多的工具，比如删除、复制、黏贴、跳转光标等等。每当写程序需要停顿思考的时候，就可以进入 Normal 模式。**

### 一个最重要的模式

这里的模式，不是指“Normal”或“Insert”模式。而是我们在使用 Vim 组合快捷键时候的“操作模式”。这个最重要的模式如下：

```
Action = Operator + Motion
```

举一个例子，“删除当前到句尾的所有字符”的操作是`d$`，`d$ = d + $`，其中的 `d` 即为 Operator，也即操作，`$` 即为 Motion，也即操作的范围。这个模式在 Vim 中无处不在，再举一些例子：

- `dap`，删除一整个段落；
- `yG`，复制当前行到文件末尾所有内容；
- `cw`， 修改当前单词（删除单词并进入 Insert 模式）;

这是最基本的模式，也是 Vim 编辑器能高效编辑文本的基础，**它把常用的 Operator 和 Motion 做了抽象，抽象成了一些简单字母，比如 `d` 代表删除操作，`$`代表句子末尾，而这些抽象符号又可以通过同一个公式组合使用，减轻了记忆负担。这是 Vim 非常优雅的地方。** 不过有一个例外，如果你连续输入两个 Operator，就表示对当前行进行操作。比如 `yy` 表示复制当前行。

那 Vim 中有哪些常用的 Operator 呢，有以下这些：

| Operator | 效果            |
| -------- | --------------- |
| `c`      | 修改            |
| `d`      | 删除            |
| `y`      | 复制到 register |
| `g~`     | 切换大小写      |
| `gu`     | 使字母小写      |
| `gU`     | 使字母大写      |
| `>`      | 右缩进          |
| `<`      | 左缩进          |
| `=`      | 自动缩进        |

至于 Motion，有更多，以下也是一些常用的:

| Motion      | 效果                                         |
| ----------- | -------------------------------------------- |
| `$`         | 句子末尾                                     |
| `G`         | 文件末尾                                     |
| `w`         | 下一个单词开头                               |
| `b`         | 上一个单词开头                               |
| `e`         | 下一个单词结尾                               |
| `%`         | 在闭合括号，比如 `{}` 之间跳转               |
| `f/F{char}` | 下一个/上一个出现`{char}`单词的位置          |
| `t/T{char}` | 下一个/上一个出现`{char}`单词之前/之后的位置 |
| `a}/]/)`    | 包括 `}/]/)` 在内的括号包裹的内容            |
| `i}/]/)`    | 不包括 `}/]/)` 在内的括号包裹的内容          |
| `iw/s/p`    | 当前单词/句子/段落                           |
| `aw/s/p`    | 当前单词/句子/段落, 加一个空格/空行          |

当然还有更多，如果你感兴趣，可以在 Vim 的 Normal 模式下，输入以下命令查看完整的文档：

```
:h motion.txt
```

### 先生存下来

在成为 Vim 高手之前，我们的首要目标是先存活下来。这个目标其实并不难。

掌握基本的光标跳转，比如`hlkj`，`0`、`^`、`$`、`gg`、`G` 等等，以及以上说的基本操作模式后，你大概率可以生存下来。当然知道不等于掌握，你一开始需要频繁地练习把基本操作变成肌肉记忆。我一开始是跟着左耳朵耗子(在此纪念耗子叔)的文章《[简明 VIM 练级攻略](https://coolshell.cn/articles/5426.html)》练习，当时一旦有时间就打开文章，跟着内容逐条操作，一段时间后，我就真的存活下来了。

如果你也顺利存活了下来，在实际的开发过程中就已经可以做一些编辑工作了，但可能总还是会觉得哪儿哪儿不对劲，要完全行云流水，你还欠缺更多技巧。这个时候或许有必要去看看《Practival Vim》或者类似的书，更好地掌握 Vim 的设计理念以及许多细微的技巧，同样配合不断的练习，我相信你迟早会有一天欣喜地发现自己在编码的时候真的几乎完全可以放弃鼠标了，这种喜悦或许类似于修仙小说中的破境。

恭喜你。

### 成为 Vim 高手的终极秘诀

其实没有秘诀。Vim 很快，但成为 Vim 高手是一个相对漫长的过程，在这个过程中你会掌握更多微妙的技能，比如如何更高效地使用 `f{char}` 命令更快地定位到某个字符。在生存下来以后，你唯一能做的就是每天使用 Vim。慢慢地， Vim 的使用会变成水和空气一样的自然存在，你从此离不开它。

如何每天使用 Vim 呢，以下是我的一些建议：

- 把 Vim 变成日常开发工具。学习使用 [Neovim](https://neovim.io/)，它提供了更好的插件和扩展机制，你如果愿意你甚至可以把 Neovim 配置成强大的 IDE。这里推荐一下掘金小册 [Neovim 配置实战](https://juejin.cn/book/7051157342770954277?utm_source=course_list)。
- 如果习惯使用 VSCode 或其他编辑器，可以安装相应的 [Vim 插件](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim)。
- 如果你使用 Chrome 浏览器，你可以安装相应的 [Vim 插件](https://chrome.google.com/webstore/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb)来提升浏览效率。
- 平时习惯做笔记？那就使用一款支持 Vim 快捷键的笔记软件，比如我最喜欢的 [Obsidian](https://obsidian.md/)。
- 经常在 Cloud IDE 上写代码？建议使用一款支持 Vim 快捷键的 IDE，比如我常用的 [Replit](https://replit.com/)。

总之，在我决定使用 Vim 提高编程效率以后，在任何编辑场景我都变得无法忍受没有 Vim 的存在，就是这么自然，它变成了我工作的一部分。Reddit 上有这样一条讨论，[If using vim is a lifestyle/philosophy, what other products also fits into this lifestyle?](https://www.reddit.com/r/vim/comments/q9zhrc/if_using_vim_is_a_lifestylephilosophy_what_other/)，把 Vim 隐喻成一种生活方式/哲学确实很合适，Vim 和学习使用 Vim 隐含了一些有价值的东西，我相信大约有追求极致——更快更强的精神，坚持长期主义——忍受暂时痛苦，着眼长远的精神。或许也可以这么说，如果你有朝一日能成为 Vim 高手，你大概率也能做成其他许多困难的事。

少年们，加油。
