---
title: '这几个好用的库，你开发浏览器插件大概率能用上'
date: '2024-09-16'
topics: ['crx', 'javascript']
---

在过去的几个月里，我尝试开发了两款产品（见文末）。这两款产品的主要形态都是**浏览器插件 + 网站**。在开发这两款产品浏览器插件的时候，我用到了一些非常好用的三方库，在这里做一个整理，或许你的下一个项目也能用到这些好用的库。

### dexie.js

- 官网地址：[https://dexie.org/](https://dexie.org/)
- 该库截至目前（2024-09-16）已经在 [Github](https://github.com/dexie/Dexie.js) 上收获了 11.4k 的 star

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/useful-js-libs-for-crx-development/dexie.png)

**开发浏览器插件经常会涉及本地数据的结构化存储，熟悉浏览器存储方案的同学大概都会想到 indexedDB。**

Dexie.js 是对 indexedDB API 的封装，提供了更好的易用性和稳定性。**它解决了 indexedDB 某些浏览器实现中的 bug，并支持几乎所有的浏览器。** 我自己实际使用下来感觉非常好用，以下是官方提供的示例代码，和操作后端数据库的 ORM 框架语法很接近。

```js
<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/dexie/dist/dexie.js"></script>
    <script>

      //
      // Declare Database
      //
      const db = new Dexie('FriendDatabase');
      db.version(1).stores({
        friends: '++id, age'
      });

      //
      // Play with it
      //
      db.friends.add({ name: 'Alice', age: 21 }).then(() => {
        return db.friends
          .where('age')
          .below(30)
          .toArray();
      }).then(youngFriends => {
        alert (`My young friends: ${JSON.stringify(youngFriends)}`);
      }).catch (e => {
        alert(`Oops: ${e}`);
      });

    </script>
  </head>
</html>
```

### webextension-polyfill

- Github 地址：[https://github.com/mozilla/webextension-polyfill](https://github.com/mozilla/webextension-polyfill)
- 该库截至目前已经在 Github 上收获了 2.7k 的 star

**开发浏览器插件需要的很多能力，比如脚本间通信、本地数据KV形式的存储都依赖 `chrome` API，比如存储相关的 API 在 `chrome.store` 命名空间下，脚本间通信相关的 API 在 `chrome.runtime` 命名空间下。**

但是，你在实际使用过程中会发现各种问题，比如对 async/await 语法的支持并不好，不同浏览器之间 API 也可能存在一些兼容性问题。 `webextension-polyfill` 这个库就是要解决上面的问题，这是官方对这个库的定位说明：

> This library allows extensions that use the Promise-based WebExtension/BrowserExt API being standardized by the W3 Browser Extensions group to run on Google Chrome with minimal or no changes.

**它基于 Promise，并且完全符合 W3 浏览器插件标准。我自己实际使用下来，感觉非常好用，完全解决了我之前使用 `chrome` API 的一些痛点**，以下是它的示例代码：

```js
var browser = require("webextension-polyfill");

browser.runtime.onMessage.addListener(async (msg, sender) => {
  console.log("BG page received message", msg, "from", sender);
  console.log("Stored data", await browser.storage.local.get());
});

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.executeScript({file: "content.js"});
});
```

### cash-dom

- Github 地址：[https://github.com/fabiospampinato/cash](https://github.com/fabiospampinato/cash)
- 该库截止到目前已经在 Github 上收获了 6.5k 的 star

很多浏览器插件都需要和当前网页的 DOM 交互，**直接使用浏览器 DOM API 也可以，但有时候未免繁琐，用 jQuery 等库又显得杀鸡用牛刀**。 `cash-dom` 就是这样一个替代方案，它非常小，非常轻量，但该有的 API 它基本都提供了。

这是官方提供的对比图：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/useful-js-libs-for-crx-development/cash-dom.png)

我在产品中使用没出现什么问题，相比直接使用 DOM API，代码的确更简洁清晰，更语义化，更容易维护了。


### create-chrome-ext

- Github 地址：[https://github.com/guocaoyi/create-chrome-ext](https://github.com/guocaoyi/create-chrome-ext)

最后这个不是一个库，而是一个浏览器插件开发的脚手架模板项目。**它基于 Vite 构建，支持各种不同的前端框架，支持 TS，插件该有的配置也都帮你提前配置好了，开箱即用。**

我的两个浏览器插件产品都是基于这个脚手架开发的，非常好用，没有遇到任何问题，推荐使用。使用方式和图示如下：

```bash
# npm 6.x
λ npm create chrome-ext@latest my-crx-app --template svelte-js

# or npm 7+, extra double-dash is needed:
λ npm create chrome-ext@latest my-crx-app -- --template react-ts

# or yarn
λ yarn create chrome-ext my-crx-app --template vue-ts

# or pnpm
λ pnpm create chrome-ext my-crx-app --template vanilla-ts
```

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/useful-js-libs-for-crx-development/crx-run.png)


### 小结

上面罗列的好用的库，都是和开发浏览器插件直接相关的，但我的两个项目中其实还用到了其他一些好用的库，比如特别好用的组件库 [shadcn/ui](https://ui.shadcn.com/)，这些库的整理我写在了之前的另一篇文章中：[盘点最近 React 项目中用到的一些非常好用的库：动画库、组件库、Hook库等](https://juejin.cn/post/7353138889458810932)，如有需要可以阅读。

最后，这两款产品分别是：

 - [Siphon 吸词](https://siphon.ink)：解决如何快速收藏在线阅读中遇到的生词的问题，并提供了很好的复习体验；
 - [Memowise](https://memowise.ink)：解决快速收藏、查询、整理、使用在线阅读中有价值信息的问题，提供了 AI Chat 等能力来使用笔记。

 欢迎体验和使用，谢谢！