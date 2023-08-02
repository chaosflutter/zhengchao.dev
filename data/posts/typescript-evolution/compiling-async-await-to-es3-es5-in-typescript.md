---
title: 'TypeScript 如何将 async/await 编译成 ES3/ES5'
date: '2020-11-02'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/compiling-async-await-to-es3-es5-in-typescript'
---

早在 2015 年 11 月的时候，Typescript 在 1.7 的版本就已经支持 `async/await` 关键字了。编译器会把异步函数转换成 generator 函数。然而，这也意味着编译后的代码不能运行在只支持 ES3 或 ES5 的环境中，因为 generator 是 ES2015 才引入的新特性。

好消息是，Typescript 2.1 现在支持将异步函数编译成 ES3/ES5。就和其他编译生成的代码一样，它们可以在任何 Javascript 环境中运行（甚至包括 IE6，虽然我真的不希望你还要被迫支持这么古老的浏览器）。

### 使用异步函数

下面是一个简单的函数，在给定的毫秒之后会 resolve 一个 promise 的状态。它使用了内置的 `setTimeout` 函数在传入的 ms 毫秒后调用 `resolve` 回调函数。

```ts
function delay(ms: number) {
  return new Promise<void>(function (resolve) {
    setTimeout(resolve, ms)
  })
}
```

`delay` 函数会返回一个 promise，可以被一个调用者 await：

```ts
async function asyncAwait() {
  console.log('Knock, knock!')

  await delay(1000)
  console.log("Who's there?")

  await delay(1000)
  console.log('async/await!')
}
```

如果你调用 `asyncAwait` 函数，你将会在控制台中看到三条消息，每条消息会间隔对应的时间顺序打印：

```sh
asyncAwait();

// [After 0s] Knock, knock!
// [After 1s] Who's there?
// [After 2s] async/await!

```

让我们来看下当构建目标是 ES2017、ES2016/ES2015、以及 ES5/ES3 的时候，编译出的 Javascript 代码分别是什么。

### 编译 async/await 到 ES2017

异步函数这个 Javascript 语言特性已在 ES2017 中被标准化。当构建目标是 ES2017 的时候，Typescript 编译器没必要将 `async/await` 改写成其形式，因为异步函数已经在这个语言版本中得到原生支持。下面这个编译后的 Javascript 代码除了删除了所有类型标注以及空行，和 Typescript 代码几乎是一样的：

```ts
function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}
async function asyncAwait() {
  console.log('Knock, knock!')
  await delay(1000)
  console.log("Who's there?")
  await delay(1000)
  console.log('async/await!')
}
```

所以这里没有更多可以说的。这就是我们会写的代码，只不过没有类型标注。

### 编译 async/await 到 ES2015/ES2016

当构建目标是 ES2015 的时候，Typescript 编译器会把 `async/await` 重写成使用 `yield` 关键字的 generator 函数。它同时会生成一个 `__awaiter` 帮助函数作为异步函数的运行器。上面 `asyncAwait` 函数编译后的 Javascript 代码如下所示：

```ts
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function (resolve) {
              resolve(result.value)
            }).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments)).next())
    })
  }
function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}
function asyncAwait() {
  return __awaiter(this, void 0, void 0, function* () {
    console.log('Knock, knock!')
    yield delay(1000)
    console.log("Who's there?")
    yield delay(1000)
    console.log('async/await!')
  })
}
```

生成的帮助函数的代码数量并不是可以忽略不计的，但还是在可接受范围内。如果你想在 Node 6.x 或者 7.x 的应用中使用 `async/await`，ES2015 或者 ES2016 应该是你作为构建目标的语言标准。

值得一提的是，ES2016 中唯二标准化的语言特性是求幂操操作符以及 Array.prototype.includes 方法，但在这里都没有被用到。因此，就这个程序构建目标无论是 ES2016 还是 ES2015，生成的 Javascript 代码都是一样的。

### 编译 async/await 到 ES3/ES5

到这里事情变得更有趣了。如果你在开发浏览器端的客户端应用，你很可能不能把 ES2015（或者更高的语言版本） 作为构建目标，因为浏览器目前还支持得不够好。

在 Typescript 2.1 中，你可以让编译器将异步代码编译成 ES3/ES5。下面是以上代码被编译后的结果：

```ts
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function (resolve) {
              resolve(result.value)
            }).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments)).next())
    })
  }
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1]
          return t[1]
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t
    return { next: verb(0), throw: verb(1), return: verb(2) }
    function verb(n) {
      return function (v) {
        return step([n, v])
      }
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.')
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t = y[op[0] & 2 ? 'return' : op[0] ? 'throw' : 'next']) &&
              !(t = t.call(y, op[1])).done)
          )
            return t
          if (((y = 0), t)) op = [0, t.value]
          switch (op[0]) {
            case 0:
            case 1:
              t = op
              break
            case 4:
              _.label++
              return { value: op[1], done: false }
            case 5:
              _.label++
              y = op[1]
              op = [0]
              continue
            case 7:
              op = _.ops.pop()
              _.trys.pop()
              continue
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0
                continue
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1]
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1]
                t = op
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2]
                _.ops.push(op)
                break
              }
              if (t[2]) _.ops.pop()
              _.trys.pop()
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e]
          y = 0
        } finally {
          f = t = 0
        }
      if (op[0] & 5) throw op[1]
      return { value: op[0] ? op[1] : void 0, done: true }
    }
  }
function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}
function asyncAwait() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          console.log('Knock, knock!')
          return [4 /*yield*/, delay(1000)]
        case 1:
          _a.sent()
          console.log("Who's there?")
          return [4 /*yield*/, delay(1000)]
        case 2:
          _a.sent()
          console.log('async/await!')
          return [2 /*return*/]
      }
    })
  })
}
```

我的天，生成了好多的帮助代码！

除了我们前面提到过的的 `__awaiter` 函数，编译器还注入了另一个帮助函数 `__generator`，它使用了一个状态机来模拟 generator 函数可以暂停和继续的特性。

需要注意的是，为了让你的代码能够在 ES3 或 ES5 的环境中正常运行，你还需要提供 `Promise` 的 polyfill，因为 Promise 是 ES2015 中引入的语言特性。同时你还得让 Typescript 确知在运行时能够找到 `Promise` 函数。可以查看[这篇文章](https://chaosflutter.com/ts-evolution/built-in-type-declarations-in-typescript)获得更多的信息。

现在你可以让 `async/await` 运行在所有的 Javascript 引擎中。请继续关注这个系列后面的文章，我会介绍如何避免在编译阶段每个文件都重复生成这些帮助函数。
