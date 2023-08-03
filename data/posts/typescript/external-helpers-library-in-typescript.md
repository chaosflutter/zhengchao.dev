---
title: 'TypeScript 中的外置帮助函数'
date: '2020-11-09'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/external-helpers-library-in-typescript'
---

在某些情况下，Typescript 编译器会在生成的代码中注入一些运行时执行的帮助函数。每个帮助函数都模拟了一个语言特性，这些特性在构建目标语言版本（ES3, ES5, ES2015, …）中没有得到原生支持。

目前，Typescript 中存在以下的一些帮助函数：

- `__extends` 用于继承
- `__assign` 用于对象属性扩展
- `__rest` 用于对象剩余属性
- `__decorate`, `__param`, 和 `__metadata` 用于装饰器
- `__awaiter` 和 `__generator` 用于 `async/await`

ES2015 中 class 继承的一个典型使用场景是定义一个 React 组件，像下面这样：

```ts
import * as React from 'react'

export default class FooComponent extends React.Component<{}, {}> {
  render() {
    return <div>Foo</div>
  }
}
```

如果构建目标是 ES5，因为既不支持 `class` 也不支持 `extends`，Typescript 编译器会生成以下的代码：

```ts
'use strict'
var __extends =
  (this && this.__extends) ||
  function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]
    function __() {
      this.constructor = d
    }
    d.prototype =
      b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
  }
var React = require('react')
var FooComponent = (function (_super) {
  __extends(FooComponent, _super)
  function FooComponent() {
    return _super.apply(this, arguments) || this
  }
  FooComponent.prototype.render = function () {
    return React.createElement('div', null, 'Foo')
  }
  return FooComponent
})(React.Component)
Object.defineProperty(exports, '__esModule', { value: true })
exports.default = FooComponent
```

对于这么简单的例子似乎并没有什么问题，但其实这样做有比较大的缺点：这个 `__extends` 帮助函数会注入到每一个编译生成的文件中，只要文件中使用了 `class` 和 `extends`。也就是说，帮助函数会注入到你应用的所有 React 类组件中。

对于一个中等规模的项目，拥有几十甚至上百个 React 组件，会生成大量重复的 `__extends` 帮助函数。这会导致打包后的文件体积变大，意味着需要更长的下载时间。

考虑到其他帮助函数也会被注入，问题因此变得更为严重。我之前写过一篇文["Typescript 如何将 async/await 编译成 ES3/ES5"](https://chaosflutter.com/ts-evolution/compiling-async-await-to-es3-es5-in-typescript)，其中的 `_awaiter` 和 `__generator` 帮助函数的代码量非常多，这显著增加了打包后的体积。记住，它们会在任何使用了 `async/await` 关键字的文件中被注入。

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
```

### --noEmitHelpers 标志

在 1.5 的版本中，Typescript 支持了 `--noEmitHelpers` 标志。当这个选项被设置后，Typescript 不会在编译后的输出中注入任何的帮助函数。如此，打包后的体积会减小——可能会很显著。

添加了 `--noEmitHelpers` 标志后，上面的 React 组件被编译为：

```ts
'use strict'
var React = require('react')
var FooComponent = (function (_super) {
  __extends(FooComponent, _super)
  function FooComponent() {
    return _super.apply(this, arguments) || this
  }
  FooComponent.prototype.render = function () {
    return React.createElement('div', null, 'Foo')
  }
  return FooComponent
})(React.Component)
Object.defineProperty(exports, '__esModule', { value: true })
exports.default = FooComponent
```

注意 `__extends` 的调用依然存在代码中。毕竟，React 组件要正常运行是需要它的。如果你使用了 `--noEmitHelpers` 标志，那么你有责任提供所有需要的帮助函数。Typescript 会默认它们在运行时中存在。

显然，人工维护所有的这些帮助函数麻烦又多余。你必须检查你的应用使用到了哪些帮助函数，并且保证将它们打包进去。这一点都不好玩！幸运的是，Typescript 团队想到了一个好的主意。

### --importHelpers 标志和 tslib 库

TypeScript 2.1 引入了一个新的 `--importHelpers` 标志，它会让编译器从 `tslib` 库中导入帮助函数。`tslib` 是一个外部的库，而不是将帮助代码内联到每个文件中。你可以像安装其他 npm 包一样安装 `tslib`：

```ts
npm install tslib --save
```

现在我们重新编译一次 React 组件，这次带上 `--importHelpers` 标志：

```ts
'use strict'
var tslib_1 = require('tslib')
var React = require('react')
var FooComponent = (function (_super) {
  tslib_1.__extends(FooComponent, _super)
  function FooComponent() {
    return _super.apply(this, arguments) || this
  }
  FooComponent.prototype.render = function () {
    return React.createElement('div', null, 'Foo')
  }
  return FooComponent
})(React.Component)
Object.defineProperty(exports, '__esModule', { value: true })
exports.default = FooComponent
```

注意第 2 行的`require("tslib")`和第 5 行的 `tslib_1.__extends`。代码中不再有内联的帮助函数，`__extends` 函数是从 `tslib` 模块中导入的。这样一来，每一个帮助函数只会被导入一次，而不用承受之前使用 `extends` 和 `async/await` 带来的问题。
