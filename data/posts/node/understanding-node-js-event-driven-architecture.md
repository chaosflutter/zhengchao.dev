---
title: 理解 Node.js 的事件驱动架构
date: '2017-07-18'
origin: 'https://www.freecodecamp.org/news/understanding-node-js-event-driven-architecture-223292fcbc2d/'
topics: ['node']
---

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/node%20event-driven-architecture/1_Nozl2qd0SV8Uya2CEkF_mg.jpeg)

大部分的 Node 对象，比如 HTTP 的 requests、responses 对象, 以及 streams，都实现了 EventEmitter 模块，所以它们都提供了触发和监听事件的功能。

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/node%20event-driven-architecture/1_74K5OhiYt7WTR0WuVGeNLQ.png)

事件驱动的本质可以从 Node.js 一些常用函数的回调风格这种最简单形式中看出来。比如，`fs.readFile`函数，传入该函数的回调会被作为事件处理器，在适当的时候（Node.js 准备好调用这个回调的时候）被触发。

我们先从这种最简单的形式开始讨论。

### Node，你准备好了就 Call 我吧

回调函数是 Node 处理异步事件最原始的形式，比很久之后 Javascript 才原生支持的 promise 和 async/await 要早很多。

回调函数简单说就是你传给其他函数的函数。这么做之所以可能，是因为函数在 Javascript 中是第一等对象。

有一点需要强调，回调并不意味异步，一个函数既可以同步也可以异步调用回调函数。

举个例子，这儿有个宿主函数 `fileSize` 接收一个回调参数 `cb`，并且会根据条件来同步或者异步调用这个回调。

```javascript
function fileSize(fileName, cb) {
  if (typeof fileName !== 'string') {
    return cb(new TypeError('argument should be string')) // Sync
  }
  fs.stat(fileName, (err, stats) => {
    if (err) {
      return cb(err)
    } // Async
    cb(null, stats.size) // Async
  })
}
```

注意这是糟糕的做法，会导致不可预料的错误。当我们设计宿主函数去调用回调的时候，记住要么永远同步，要么永远异步。

我们再来看一个典型的使用 callback 风格的异步函数：

```javascript
const readFileAsArray = function (file, cb) {
  fs.readFile(file, function (err, data) {
    if (err) {
      return cb(err)
    }
    const lines = data.toString().trim().split('\n')
    cb(null, lines)
  })
}
```

`readFileAsArray` 接收一个文件路径参数和一个回调参数。它会读取文件内容，并且按行分割放入一个数组中，然后调用回调函数并传入该数组。

以下是使用这个函数的一个例子。假设在相同的目录下有一个 `numbers.txt` 文件，其内容如下：

```javascript
10
11
12
13
14
15
```

如果我们要计算文件中奇数的数量，我们可以用 `readFileAsArray` 来简化代码：

```javascript
readFileAsArray('./numbers.txt', (err, lines) => {
  if (err) throw err
  const numbers = lines.map(Number)
  const oddNumbers = numbers.filter((n) => n % 2 === 1)
  console.log('Odd numbers count:', oddNumbers.length)
})
```

上面的代码首先从文件中读取内容获得一个字符串数组，然后将数组中的字符串转为数字并计算奇数个数。

这是不折不扣的 Node 回调风格。这个回调函数的第一个参数是可以为 null 的 `err` 错误对象，并且回调函数本身又作为宿主函数的最后一个参数传入。你应该永远这样做，因为使用者很可能会这样去预期，也即，宿主函数接收回调作为最后一个参数，并且这个回调函数接收一个错误对象作为它的第一个参数。

### 现代 Javascript 中回调函数的替代品

在现代 Javascript 中，我们有了 promise 对象，它可以替代回调函数作为异步的 API。与回调函数作为参数传入并且在同一个地方处理错误和正常流程不同，promise 对象允许我们分开处理两者，并且可以通过链式调用异步方法而不是嵌套他们。

如果 `readFileAsArray` 函数支持 promises，我们就可以向下面这样使用它：

```javascript
readFileAsArray('./numbers.txt')
  .then((lines) => {
    const numbers = lines.map(Number)
    const oddNumbers = numbers.filter((n) => n % 2 === 1)
    console.log('Odd numbers count:', oddNumbers.length)
  })
  .catch(console.error)
```

我们通过 `.then` 函数调用来处理宿主函数的返回值，而非传入一个回调函数。通过 `.then` 函数，我们可以像之前一样获取到 lines 数组，并且处理它。至于错误处理，我们可以通过 `.catch` 调用来访问到错误对象。

因为有了 `Promise` 构造函数，我们可以很容易地给宿主函数添加 promise 接口。下面的这个 `readFileAsArray` 即支持 promise 接口又支持回调风格的接口：

```javascript
const readFileAsArray = function (file, cb = () => {}) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, function (err, data) {
      if (err) {
        reject(err)
        return cb(err)
      }
      const lines = data.toString().trim().split('\n')
      resolve(lines)
      cb(null, lines)
    })
  })
}
```

新的 `readFileAsArray` 函数返回了一个 promise 对象，并且 Promise 构造器暴露了 `resolve` 和 `reject`函数。

每当发生错误的时候，我们就调用 `reject` 函数，并传入 `err` 对象，每当执行正常需要传递数据的时候就调用 `resolve` 函数。

在上面的例子中，为了避免使用者通过 promise 的方式消费这个函数而导致报错，我们需要给回调参数一个默认值，也即一个空函数。

### 通过 async/await 来使用 promise

相比回调，promise 使代码更易理解更易维护。generator 函数也能使异步代码更容易书写和阅读。不过，现在更推荐使用 async 函数来处理异步，它可以让我们像写同步代码一样来写异步代码，这对可读性的提升是巨大的。

下面演示了如何通过 async/await 的方式来使用 `readFileArray` 函数：

```javascript
async function countOdd() {
  try {
    const lines = await readFileAsArray('./numbers')
    const numbers = lines.map(Number)
    const oddCount = numbers.filter((n) => n % 2 === 1).length
    console.log('Odd numbers count:', oddCount)
  } catch (err) {
    console.error(err)
  }
}

countOdd()
```

创建 async 函数很简单，只需要在普通函数前面加上 `async` 关键字。在 async 函数中，通过`await` 调用 `readFileArray` 函数可以得到 lines 变量。然后继续执行，好像 `readFileArray` 是同步调用一样。

最后我们执行这个异步函数，上面的这种写法非常简单且易读。至于错误处理，我们需要把相关的异步调用放到 try/catch 语句中。

有了 async/await 语法，我们不再需要使用任何特殊的 API（比如 .then 和 .catch）。我们只需要在相应位置添加 async/await 即可。

我们可以对任意支持 promise 接口的函数使用 async/await 语法。但不支持回调风格的异步函数（比如 setTimeout）。

### EventEmitter 模块

在 Node 中，EventEmitter 模块可以使对象之间的通信更容易。EventEmitter 是 Node 异步事件驱动架构的核心。许多 Node 的内置模块都继承自 EventEmitter。

原理是很简单的：触发器对象触发命名事件，而已经注册了该命名事件的监听器会被调用。所以，触发器对象基本上有两个主要的功能：

- 触发命名事件
- 注册和注销监听器函数

要使用 EventEmitter，我们只需要创建一个继承自 EventEmitter 的类就可以了。

```javascript
class MyEmitter extends EventEmitter {}
```

触发器对象就是我们实例化这个类得到的对象。

```javascript
const myEmitter = new MyEmitter()
```

在这些触发器对象生命周期的任意时刻，我们都可以通过 emit 函数来触发一个命名事件。

```javascript
myEmitter.emit('something-happened')
```

触发一个事件往往是某种状况已经发生的信号。这种状况通常是触发器对象状态的变更。我们可以通过 `on` 方法来注册监听器函数，这些函数会在触发器对象触发相应事件的时候被调用。

### 事件 !== 异步

我们来看一个例子：

```javascript
const EventEmitter = require('events')

class WithLog extends EventEmitter {
  execute(taskFunc) {
    console.log('Before executing')
    this.emit('begin')
    taskFunc()
    this.emit('end')
    console.log('After executing')
  }
}

const withLog = new WithLog()

withLog.on('begin', () => console.log('About to execute'))
withLog.on('end', () => console.log('Done with execute'))

withLog.execute(() => console.log('*** Executing task ***'))
```

`WithLog` 类是一个事件触发器。它定义了一个实例方法 `execute`。该方法接收一个任务函数，并且在执行这个任务函数前后加了打印语句，以及触发了一些事件。

为了查看执行顺序，我们需要注册一些监听器，最后再调用 `excute`。

下面是打印输出：

```javascript
Before executing
About to execute
*** Executing task ***
Done with execute
After executing
```

需要提醒的是，输出都是同步发生的。上面的代码中并没有任何异步的内容。

- 我们首先打印 `Before executing`
- 然后 `begin` 事件触发并打印 `About to exccute`
- 执行任务函数，打印 `*** Executing task ***`
- 再然后触发 `end` 事件并打印 `Done with execute`
- 最后打印 `After executing`

和平淡无奇的回调一样，不要假设事件就意味着同步或者异步。

这点很重要，因为如果我们传入一个异步函数 `taskFunc` 给 `execute`，那么事件触发的时机就是不准确的。

我们可以通过 `setImmediate` 调用来模拟这种情况：

```javascript
withLog.execute(() => {
  setImmediate(() => {
    console.log('*** Executing task ***')
  })
})
```

现在的输出是这样的：

```javscript
Before executing
About to execute
Done with execute
After executing
*** Executing task ***
```

这是错误的。异步调用之后执行的代码，在任务执行完成之前就打印了 `Done with execute` 和 `After executing`，这显然不准确。

在异步调用后才触发事件需要结合使用回调或者 promise。下面的例子会证明这一点。

相比普通的回调函数，使用事件的一个好处是我们可以注册很多监听器，这些监听器在事件触发时都能被调用。如果想用回调函数达到同样的效果，我们需要在回调中写更多的逻辑。事件是一种非常棒的机制，比如它能让外部的插件基于应用的核心来构建功能。你可以认为事件是一种钩子，允许围绕状态的变化来书写自己的故事。

### 异步事件

我们把上面的同步代码转换成更有用的异步代码：

```javascript
const fs = require('fs')
const EventEmitter = require('events')

class WithTime extends EventEmitter {
  execute(asyncFunc, ...args) {
    this.emit('begin')
    console.time('execute')
    asyncFunc(...args, (err, data) => {
      if (err) {
        return this.emit('error', err)
      }

      this.emit('data', data)
      console.timeEnd('execute')
      this.emit('end')
    })
  }
}

const withTime = new WithTime()

withTime.on('begin', () => console.log('About to execute'))
withTime.on('end', () => console.log('Done with execute'))

withTime.execute(fs.readFile, __filename)
```

`WithTime` 的 execute 方法会执行一个异步函数 `asyncFunc`，并且会通过 `console.time` 和 `console.timeEnd` 来记录执行时间。上面的代码除了正确地触发了执行前后相应的事件，还触发了在异步调用中常用的 `error/data` 事件。

我们通过传入 `file.readFile` 这个异步函数来测试 `withTime`。现在我们可以通过监听 `data` 事件来获取文件数据，而非通过回调。

当我们执行上面的代码，我们可以得到正确的事件触发顺序，就像期望的一样，我们还得到了异步函数执行的时间：

```javascript
About to execute
execute: 4.507ms
Done with execute
```

以上的实现结合了事件触发器和回调函数。如果 `asyncFunc` 支持 promise 的话，我们也可以通过 `async/await` 来实现相同的功能：

```javascript
class WithTime extends EventEmitter {
  async execute(asyncFunc, ...args) {
    this.emit('begin')
    try {
      console.time('execute')
      const data = await asyncFunc(...args)
      this.emit('data', data)
      console.timeEnd('execute')
      this.emit('end')
    } catch (err) {
      this.emit('error', err)
    }
  }
}
```

我不知道你怎么看，对我来说上面的代码比基于回调的代码或者基于 `.then/.catch` 的代码要易读的多。`async/await` 让我们更接近 Javascript 语言本身，我们认为这很棒。

### 事件参数和错误

上面的示例中，我们还触发来两个带参数的事件。

error 事件触发的时候传递了一个错误对象。

```javascript
this.emit('error', err)
```

data 事件触发的时候传递了一个数据对象。

```javascript
this.emit('data', data)
```

我们可以根据需要传入任意多的参数给命名事件，并且这些参数会被所有注册的事件监听器接收到。

举个例子，注册了 data 事件的监听器会得到一个 data 参数，这个参数正是事件触发的时候传入的数据对象。

```javascript
withTime.on('data', (data) => {
  // do something with data
})
```

`error` 事件是比较特殊的一种事件。在上面基于回调的例子中，我们如果不设置监听器处理这个错误事件，那么 node 进程就会退出。

为了证明这一点，我们可以传入不正确的参数来执行 execute 方法：

```javascript
class WithTime extends EventEmitter {
  execute(asyncFunc, ...args) {
    console.time('execute')
    asyncFunc(...args, (err, data) => {
      if (err) {
        return this.emit('error', err) // Not Handled
      }

      console.timeEnd('execute')
    })
  }
}

const withTime = new WithTime()

withTime.execute(fs.readFile, '') // BAD CALL
withTime.execute(fs.readFile, __filename)
```

第一次执行 execute 方法会报错，node 进程会崩溃退出：

```javascript
events.js:163
      throw er; // Unhandled 'error' event
      ^
Error: ENOENT: no such file or directory, open ''
```

所以第二个 execute 调用会受影响根本不会被执行。

如果我们注册了一个监听器来处理 `error` 事件，node 进程的行为会被改变。如下所示：

```javascript
withTime.on('error', (err) => {
  // do something with err, for example log it somewhere
  console.log(err)
})
```

如果像上面这样做，那么第一次执行 execute 方法触发的错误会被捕获，从而不会导致 node 进程崩溃退出。第二个 execute 调用也会被正常执行。

```javascript
{ Error: ENOENT: no such file or directory, open '' errno: -2, code: 'ENOENT', syscall: 'open', path: '' }
execute: 4.276ms
```

需要注意的是，如果代码是基于 promise 的话，node 的行为会不一样，它只会打印警告信息。这种行为最终应该会改变。

```javascript
UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): Error: ENOENT: no such file or directory, open ''
DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```

另外一种处理异常的方式是在全局的 `process` 对象上注册 `uncaughtException` 事件。不过，这种在全局捕获错误的方式并不好。

关于 `uncaughtException` 的标准建议是避免使用它，但如果一定要用（比如报告发生了什么，或者做一些清理工作），那你应该还是要让进程退出：

```javascript
process.on('uncaughtException', (err) => {
  // something went unhandled.
  // Do any cleanup and exit anyway!

  console.error(err) // don't do just that!

  // FORCE exit the process too.
  process.exit(1)
})
```

此外，如果多个错误事件同时触发，意味着 `uncaughtException` 监听器函数会被调用很多次，这对于一些清理代码可能是个问题。比如可能会执行多次数据库连接断开操作。

`EventEmitter` 暴露了一个 `once` 方法。这个方法只会触发调用监听器函数一次，而非每次事件发生都执行。所以这个方法适合和 `uncaughtException` 配合使用，因为这样在第一次触发事件的时候清理代码会被执行，并且进程会顺利退出。

### 监听器顺序

如果我们给相同的事件注册了很多监听器，那么这些监听器会按照注册的时间顺序执行。也即，第一个注册的监听器会被第一个触发调用。

```javascript

withTime.on('data', (data) => {
  console.log(Length: ${data.length});
});


withTime.on('data', (data) => {
  console.log(Characters: ${data.toString().length});
});

withTime.execute(fs.readFile, __filename);
```

上面的代码中，"Length" 行会比 "Characters" 行先打印，因为这正是我们注册监听器的顺序。

如果你想注册一个新监听器，但希望被第一个调用，你也可以使用 `prependListener` 方法：

```javascript
withTime.on('data', (data) => {
  console.log(Length: ${data.length});
});

withTime.prependListener('data', (data) => {
  console.log(Characters: ${data.toString().length});
});

withTime.execute(fs.readFile, __filename);
```

上面 "Characters" 行会被先打印。

最后，如果你想移除一个监听器，你可以使用 `removeListener` 方法。

谢谢阅读。
