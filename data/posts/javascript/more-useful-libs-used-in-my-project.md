---
title: '推荐一些前端项目中用到的好用的库'
date: '2024-10-01'
topics: ['react', 'javascript']
---

之前写过两篇文章，分别介绍了我在 [Siphon](https://siphon.ink) 产品中用到的好用的库，以及浏览器插件开发相关的库：

- [盘点最近 React 项目中用到的一些非常好用的库：动画库、组件库、Hook库等](https://juejin.cn/post/7353138889458810932)
- [这几个好用的库，你开发浏览器插件大概率能用上](https://juejin.cn/post/7415662205615570995)

今天这篇整理了我在第二款产品 [Memowise](https://memowise.ink) 中用到的三方库，或许你以后的项目中也能用上这些好用的库。

## Magic UI

- 官网地址：[https://magicui.design/](https://magicui.design/)
- 截至目前（10月1日），该项目已经在 Github 上收获了 9.6k 的 Star。

Magic UI 也是一个组件库，但比较特别，它是专为 Landing Page（落地页）开发的组件库。它提供了非常多好用好看甚至有些酷炫的组件，有非常多的 Landing Page 就是基于它开发的，比如它的官网 [Showcase](https://magicui.design/showcase) 展示的案例：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/more-useful-libs-used-in-my-project/landing_page_showcase.png)

它的设计理念受 [shadcn/ui](https://ui.shadcn.com) 影响，甚至可以直接通过 shadcn/ui 的 cli 工具下载使用某个组件，下载命令如下所示：

```bash
npx shadcn@latest add "https://magicui.design/r/marquee"
```

默认会帮你下载到本地工程的 `src/components/magicui` 目录下。

我在 [Memowise](https://memowise.ink) 落地页中用到了 [Marquee](https://magicui.design/docs/components/marquee)、[Particles](https://magicui.design/docs/components/particles)、[Border Beam](https://magicui.design/docs/components/border-beam) 等好用的组件。**添加这些细微精致的动效组件后，整个落地页的气质就不一样了。可能不恰当，但就像一个素颜姑娘化了优雅的淡妆。** 下图的背景中使用了 `Particles` 组件，注意背景中可以随着鼠标移动产生视差动效的白色小粒子：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/more-useful-libs-used-in-my-project/memowise_header_particles.png)


## React-Markdown

- Github 地址：[https://github.com/remarkjs/react-markdown](https://github.com/remarkjs/react-markdown)
- 该库截至目前已经在 Github 上收获了 13k 的 star

React-Markdown 是一个特别好用的能直接渲染 Markdown 文本内容的 React 组件，以下是使用示例：

```jsx
import React from 'react'
import {createRoot} from 'react-dom/client'
import Markdown from 'react-markdown'

const markdown = '# Hi, *Pluto*!'

createRoot(document.body).render(<Markdown>{markdown}</Markdown>)
```

在 `LLM` 的时代，这个组件显得特别有用。**比如你可以让大语言模型返回 Markdown 格式的内容，然后用这个组件把 Markdown 文本渲染成适合阅读的网页内容。** 另外，React-Markdown 支持对渲染的内容（h1、p 元素等等）自定义样式。下图是 [Memowise](https://memowise.ink) 的 AI Chat 功能，其中 AI 返回的内容就是使用 React-Markdown 渲染的：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/more-useful-libs-used-in-my-project/memowise-chat-markdown.png)


## Slate.js

- Github 地址：[https://github.com/ianstormtaylor/slate](https://github.com/ianstormtaylor/slate)
- 该库截至目前已经在 Github 上收获了 29.6k 的 star

Slate.js 是众多开源富文本编辑器中非常有特色的一个。我自己在做技术预研的时候，阅读过不少富文本编辑器的使用文档，对 Slate.js 的设计理念最为认同。

**和很多富文本编辑器不一样的是，Slate 没有严格的 Schema 约束，且支持更现代化的开发方式，所有编辑器元素都可以基于 React 组件实现。** 正如它文档中说的，很多编辑器似乎开箱即用，但要基于这些方案去实现类似 Medium、Google Docs 这样复杂的编辑器几乎是不太可能的。但 Slate 理论上完全可以做到，我自己实际去开发去使用后，也相信它能做到，它的UI、功能，几乎一切都可以定制化。

以下是我用 Slate 实现的 Memowise 笔记输入框：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/more-useful-libs-used-in-my-project/memowise-editor.png)

## Fuse.js

- Github 地址：[https://github.com/krisk/fuse](https://github.com/krisk/fuse)
- 该库截至目前已经在 Github 上收获了 18.1k 的 star

一个挺好用的，完全基于前端实现的关键字搜索库。我在 Memowise 的笔记搜索功能中有使用到它，基本能满足需求，检索速度也很快。但毕竟是纯前端实现的搜索，匹配准确性并不算特别高，尤其是中文场景。它的中文分词算法似乎不是特别有效，很多时候会搜不到。

所以，Memowise 后面基于 Postgres 数据库内置的关键字搜索做了升级，效果要好很多。**但如果你的搜索范围限于英文，且相对轻量，完全可以基于 fuse.js 实现。** 以下是 Memowise 的搜索功能展示，PS：搜索的高亮效果是使用 marked.js 实现的。


![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/more-useful-libs-used-in-my-project/memowise-seach.png)



以上的这些三方库都特别好用，推荐体验和使用。
