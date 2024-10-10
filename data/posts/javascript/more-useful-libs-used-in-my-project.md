---
title: '推荐一些近期前端项目中用到的好用的库'
date: '2021-09-21'
topics: ['react', 'javascript']
---

之前写过两篇文章，分别介绍了我在 [Siphon](https://siphon.ink) 产品中用到的好用的 React 相关的库，以及浏览器插件开发相关的库：

- [盘点最近 React 项目中用到的一些非常好用的库：动画库、组件库、Hook库等](https://juejin.cn/post/7353138889458810932)
- [这几个好用的库，你开发浏览器插件大概率能用上](https://juejin.cn/post/7415662205615570995)

这些文章还挺受欢迎的，今天这篇可能是这个主题最后的一篇，整理了我第二款产品 [Memowise](https://memowise.ink) 中用到的我觉得非常用好的三方库，或许你以后的项目中也能用上这些好用的库。

## Magic UI

- 官网地址：[https://magicui.design/](https://magicui.design/)
- 截至目前（10月1日），该项目已经在 Github 上收获了 9.6k 的 Star。

Magic UI 也是一个组件库，但比较特别，它是专为 Landing Page（落地页）开发的组件库。它提供了非常多好用好看甚至有些酷炫的组件，也有非常多的 Landing Page 就是基于它开发的，比如官网 [Showcase](https://magicui.design/showcase) 页面下展示的案例：

// png landing_page_showcase.png

它受 [shadcn/ui](https://ui.shadcn.com) 影响，也可以直接通过 shadcn/ui 的 cli 工具下载使用某个组件，下载命令如下所示：

```bash
npx shadcn@latest add "https://magicui.design/r/marquee"
```

默认会帮你下载到本地工程的 `src/components/magicui` 目录下。

我在 [Memowise](https://memowise.ink) 的落地页中用到了 [Marquee](https://magicui.design/docs/components/marquee)、[Particles](https://magicui.design/docs/components/particles)、[Border Beam](https://magicui.design/docs/components/border-beam) 等好用的组件。添加了这些细微的精致的动效组件后，整个落地页的气质就不一样了。可能不恰当，但就像一个素颜姑娘化了优雅的淡妆。以下的背景使用了 `Particles` 组件，注意背景中可以随着鼠标移动会产生视差动效的白色小粒子：

// png memowise_header_particles.png


## React-Markdown

- Github 地址：[https://github.com/remarkjs/react-markdown](https://github.com/remarkjs/react-markdown)
- 该库截至目前已经在 Github 上收获了 13k 的 star

React-Markdown 是一个特别好用的直接渲染 Markdonw 文本内容的 React 组件，以下是最简单额使用示例：

```jsx
import React from 'react'
import {createRoot} from 'react-dom/client'
import Markdown from 'react-markdown'

const markdown = '# Hi, *Pluto*!'

createRoot(document.body).render(<Markdown>{markdown}</Markdown>)
```

在这个 `LLM` 的时代，这个组件显得特别有用。比如你可以让 `LLM` 返回 Markdown 格式的内容，然后用这个组件把 Markdown 文本渲染成适合阅读的网页内容。另外，React-Markdown 支持对渲染的内容（h1、p 元素等等）自定义适合网站的样式。下面的图片是 [Memowise](https://memowise.ink) 的 AI Chat 功能，其中 AI 返回的内容，我就是使用 React-Markdown 渲染的：

// png memowise-chat-markdown.png


## Slate.js

- Github 地址：[https://github.com/ianstormtaylor/slate](https://github.com/ianstormtaylor/slate)
- 该库截至目前已经在 Github 上收获了 29.6k 的 star

Slate.js 是众多开源的富文本编辑器中非常有特色的一个编辑器。我自己在做技术预研的时候，看过不少富文本编辑的使用文档，对 Slate.js 的设计理念最是认同。和很多其他富文本编辑器不一样的是，Slate 没有严格的 Schema 约束，且支持更现代化的开发方式，比如所有编辑器元素都可以基于 React 组件实现。就像它文档中说的，很多组件库似乎开箱即用很好用，但一旦要基于这些编辑器去实现类似 Medium、Google Docs 那样复杂的编辑器几乎是不太可能。但 Slate 理论上完全可以做到，我自己实际去开发去使用后，也相信它能做到，它的UI、功能，几乎一切都可以定制化。

当然我只是在产品中简单实用，并没有真的用它来开发非常复杂的编辑器。我之前分享中有人反馈可能也有较多的问题（毕竟还是 beta 版本），所以大家选型的时候还是要更慎重一些。以下是我用 Slate 实现的 Memowise 的笔记输入框：

// png memowise-editor.png

## fuse.js

- Github 地址：[https://github.com/krisk/fuse](https://github.com/krisk/fuse)
- 该库截至目前已经在 Github 上收获了 18.1k 的 star

一个挺好用的，完全基于前端实现的摸索搜索库。我在 Memowise 的笔记搜索功能中有实用到它，基本能满足需求，检索速度也很快。但毕竟是纯前端实现的关键字搜索，准确性并不算特比高，尤其是中文场景。它的中文分词算法似乎不是特别有效，很多时候会搜不到。所以，Memowise 的搜索后面基于 Postgres 数据库内置的关键字搜索做了升级，效果要好很多。但如果你的应用内容搜索限于英文，且相对轻量，完全可以基于 fuse.js 实现。以下是 Memowise 的搜索功能展示，PS：搜索的高亮是实用 marked.js 实现的。


// png memowise-seach.png

## react-tweet

- Github 地址：[https://github.com/krisk/fuse](https://github.com/krisk/fuse)
- 该库截至目前已经在 Github 上收获了 18.1k 的 star

React-tweet 是一个非常好用的，可以基于 tweet id 渲染出和 twitter 官方原生样式非常接近的 tweet。如果你的应用涉及到 twitter 的推文展示，那么大概率可以使用这个组件来改善推文的展示和阅读体验。

Memowise 是一款网络阅读划线笔记，有一个小特色是，针对社交媒体，比如微博、即刻，包括 X 做了优化，在这些社交媒体上划线的内容，会自动归类到“社交媒体”笔记下，如下所示：


// memowise-social-notes.png

本来基于 react-tweet 做了推文的展示优化，但考虑到 Memowise 主要面向国内用户，且其他社交媒体没有对应的组件用来渲染原生样式，所以去掉了这个展示优化。但如果你的项目中有类似的需求，非常推荐使用这个组件。


## 还有更多

除了以上组件外，Memowise 还使用了更多好用的三方库，比如：

- typed.js


以上的这些三方库都特别好用，推荐体验和使用。
