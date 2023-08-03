---
title: 'Node.js 按图索骥'
date: '2017-06-02'
topics: ['node']
---

根据饿了么的[node-interview](https://github.com/ElemeFE/node-interview/blob/master/sections/zh-cn/README.md)按主题整理了 node 学习资料，方便日后按图索骥，检索学习。

## 1. Javascript 基础问题

- 类型判断，推荐阅读[lodash](https://lodash.com/)源码，建议学习[Typescript](http://www.typescriptlang.org/)。
- 作用域，推荐阅读[你不知道的 Javascript](https://book.douban.com/subject/26351021/)。
- 引用传递，还是传递引用，和指针的区别是什么，推荐阅读[is-javascript-a-pass-by-reference-or-pass-by-value-language](https://stackoverflow.com/questions/518000/is-javascript-a-pass-by-reference-or-pass-by-value-language)。
- 内存释放，需要了解 V8 的 GC，了解哪些情况可能会导致内存泄漏。推荐阅读[《如何分析 Node.js 中的内存泄漏》](https://zhuanlan.zhihu.com/p/25736931)，以及[《深入浅出 Node.js》](https://book.douban.com/subject/25768396/)的相关章节。
- ES6+新特性。深入理解 ES6，推荐阅读阮一峰的[《ECMAScript 6 入门》](http://es6.ruanyifeng.com/)，或者红宝书作者的[Understanding ECMAScript 6](https://leanpub.com/understandinges6/read#leanpub-auto-introduction)。

## 2. 模块

- 模块机制，先阅读[官方文档](https://nodejs.org/docs/latest-v8.x/api/modules.html)。深入理解[CommonJS](http://javascript.ruanyifeng.com/nodejs/module.html)规范。
- 热更新，理解 require.cache，以及清空 cache 的问题。是否应该将可变的数据存到数据库？
- 上下文，一般情况只有一个上下文，可以使用 vm 模块在一个沙盒环境运行 js 避免上下文被污染。参考[VM 官方文档](https://nodejs.org/docs/latest-v8.x/api/vm.html)。
- 包管理，深入理解 npm，yarn，语义化版本等。参考[npm 官方文档](https://docs.npmjs.com/)。

## 3. 事件/异步

- Promise。理解 Promise 的一些细节，比如 then 第二个参数和 catch 的区别，参考[We have a problem with promises](https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)。理解 Promise 的[实现](https://juejin.im/post/5b83cb5ae51d4538cc3ec354)。
- Events。理解[events](https://nodejs.org/dist/latest-v10.x/docs/api/events.html)核心模块。理解 Stream 基于 Events 实现，而 fs，net，http 等模块都依赖 Stream。
- Timers。理解 nextTick、setTimeout 以及 setImmediate 三者的[区别](https://cnodejs.org/topic/5556efce7cabb7b45ee6bcac)。深入理解[Event Loop](https://blog.sessionstack.com/how-javascript-works-event-loop-and-the-rise-of-async-programming-5-ways-to-better-coding-with-2f077c4438b5)。官方文档[The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)。Jake Archibald 的文章[Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)。
- 并行和并发。并发，2 个队列对应 1 个咖啡机。并行，2 个队列对应 2 个咖啡机。

## 4. 进程

- 关于进程以及操作系统，推荐阅读[《Unix 环境高级编程》](https://book.douban.com/subject/1788421/)。
- 关于 Node.js 中的 process 对象，推荐看[官方文档](https://nodejs.org/dist/latest-v10.x/docs/api/process.html)。
- 配置。可以通过设置环境变量，或者使用 dotenv 等库读取配置文件。
- 标准流。熟悉 process.stderr、process.stdout 和 process.stdin。
- child process。可以参考之前翻译过的[文章](https://medium.freecodecamp.org/node-js-child-processes-everything-you-need-to-know-e69498fe970a)，熟悉[child_process](https://nodejs.org/dist/latest-v10.x/docs/api/child_process.html)模块的用法。
- 理解[cluster](https://nodejs.org/dist/latest-v10.x/docs/api/cluster.html)模块。
- 理解 IPC 进程间通信。
- 理解守护进程的概念和[实现](https://cnodejs.org/topic/57adfadf476898b472247eac)。

## 5. IO

- Buffer 是 Node.js 中用于处理二进制数据的类，与 IO 相关的操作均基于 Buffer。[官方文档](https://nodejs.org/dist/latest-v10.x/docs/api/buffer.html)。理解 ES6 的 TypedArray。
- String Decoder。将 Buffer 转成 string。
- Stream。可以参考之前翻译过的[文章](https://medium.freecodecamp.org/node-js-streams-everything-you-need-to-know-c9141306be93)。
- 理解 pipe 的用法和[实现](https://cnodejs.org/topic/56ba030271204e03637a3870)。
- 了解 Console.log 的实现，基于 process.stout。
- 熟悉 fs 模块的使用。[官方文档](https://nodejs.org/dist/latest-v11.x/docs/api/fs.html)。
- 理解标准输入输出，理解 shell 和进程，ssh 的使用和实现等。

## 6. NetWork

- TCP/IP。推荐阅读[TCP/IP 详解 卷一](https://www.amazon.cn/TCP-IP%E8%AF%A6%E8%A7%A3%E5%8D%B71-%E5%8D%8F%E8%AE%AE-W-Richard-Stevens/dp/B00116OTVS/)，[图解 TCP/IP](https://book.douban.com/subject/24737674/)，[Wireshark 网络分析就这么简单](https://book.douban.com/subject/26268767/)。
- 熟悉 HTTP/HTTPS/HTTP2。理解[RESTful 架构](https://www.restapitutorial.com/)。
- 理解 DNS 解析，Zlib 压缩等。
- 理解 RPC，了解 Thrift，[gRPC](https://grpc.io/docs/quickstart/node.html)。

## 7. OS

- 熟悉 OS、Path 等模块。[官方文档](https://nodejs.org/dist/latest-v10.x/docs/api/os.html)。
- 推荐阅读[深入理解计算机系统](https://nodejs.org/dist/latest-v10.x/docs/api/os.html)，[性能之巅](https://book.douban.com/subject/26586598/)。

## 8. 错误处理/调试

- 理解常见的错误类型，JS 错误、系统错误、自定义错误、断言错误。
- 理解 Node.js 中处理错误的几种方式，callback(err, data)、throw/try/catch、EventEmitter 的 error 事件。
- 理解异步调用的函数，错误栈可能会丢失，比如在 setImmediate 中的异步调用。
- 理解[防御性编程](http://blog.jobbole.com/101651/)。
- 知道什么时候[Let it crash](http://wiki.c2.com/?LetItCrash)。
- 理解 uncaughtException、unhandledRejection 的使用。
- 知道如何 debug，console.log、node-inspector、 built-in debugger、debug module、vscode debug。

## 9. 测试

- 理解为什么要写测试。
- 理解单元测试、集成测试、基准测试、压力测试等。
- 理解测试相关的一些概念，[测试覆盖率](https://www.infoq.cn/article/test-coverage-rate-role)、[Mock](https://martinfowler.com/articles/mocksArentStubs.html)等。

## 10. util

- 理解 url 的组成。
- 熟悉 querystring 的使用。
- 熟悉 util 的一些工具方法。
- 熟悉[常用模块](https://www.npmjs.com/browse/depended)的使用。

## 11. 存储

- 理解[数据库范式](http://www.cnblogs.com/CareySon/archive/2010/02/16/1668803.html)。
- 熟悉 SQL 的相关概念，主键、外键、索引等。
- 熟悉 Mysql、MongoDB 的使用。
- 理解数据库模式 M/M、M/S 等，理解事务、数据一致性等概念。
- 理解 redis、memcached，了解 zookeeper、kafka、hadoop、spark、storm 等。

## 12. 安全

- 熟悉[crypto](https://nodejs.org/dist/latest-v10.x/docs/api/crypto.html)模块的使用。
- 理解 HTTPS 的认证过程，了解 TLS/SSL。
- 理解常见的 Web 安全问题以及防御策略，XSS、CSRF、CSP、SQL 注入等。
