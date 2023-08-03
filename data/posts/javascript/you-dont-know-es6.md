---
title: '你不知道的 ECMAScript 6'
date: '2018-12-15'
topics: ['javascript', 'es6']
---

ECMAScript 6 可以说是 Javascript 语言标准最重要的一次更新。它包含的内容非常多，我相信有相当多的前端程序员并没有很系统地学习过 ES6。比如你是否有完整地阅读过扎老师的[《
Understanding ECMAScript 6》](https://leanpub.com/understandinges6/read#leanpub-auto-importing-without-bindings) 或者阮老师的《ES6 标准入门》，抑或其他相对完备相对系统的资料呢？如果没有，那么下面罗列的这些知识点，有一些你很可能并没有掌握，甚至没有听说过。

### let 和 const

1. 和 var 不同，let/const 不存在变量声明提升，又因为“暂时性死区”的存在，在变量声明前使用变量，即便用 typeof 操作符，也会导致 “ReferenceError”错误。
2. 它们声明的全局变量不属于全局对象的属性，所以你在 window 对象上访问不到这些变量。

### 解构赋值

1. 如果数组形式的解构赋值等号右边不是可遍历的对象会导致报错。事实上，只要数据结构具有 Iterator 接口，都可以采用数组形式的解构赋值。
2. 只有解构赋值右边对应的值为 undefined 的时候，默认值才会生效。即便是 null 也不行，因为 null 不严格等于 undefined。
3. 字符串因为部署了 Iterator 接口所以也可以被数组形式解构赋值。
4. 数值和布尔值在进行对象形式解构赋值时，会先被转为对象。undefined 和 null 因为不能被转对象，所以会报错。
5. 解构赋值中，非模式部分可以使用圆括号。

### 字符串

1. Javascript 可以采用 \uxxxx 形式表示一个字符，其中 xxxx 表示字符的码点。但是，这种表示法只限于 \u0000 --- \uFFFF 之间的字符。超过这个范围的字符，必须用 2 个双字节的形式表示。ES6 对这一点作出了改进，只要将码点放入大括号就能正确解读该字符。
2. Javascript 内部，字符以 UTF-16 的格式存储，每个字符固定 2 个字节。对于那些需要 4 个字节的字符（Unicode 码点大于 \uFFFF），Javascript 会认为它们是 2 个字符。ES6 提供了 codePointAt 方法，能够正确处理 4 个字节储存的字符。codePointAt 方法是测试一个字符由 2 个字节还是 4 个字节组成的最简单方法。

```javascript
function is32Bit(c) {
  return c.codePointAt(0) > 0xffff
}
```

3. ES5 提供了 String.fromCharCode 方法，用于从码点返回对应字符。但这个方法不能识别 32 位的 UTF-16 字符（Unicode 码点大于 \uFFFF）。ES6 提供的 String.fromCodePoint 解决了这个问题。
4. ES6 为字符串添加了遍历接口，可以用 for...of 循环。这种遍历方式最大的优点是可以识别大于 0xFFFF 的码点。而传统的 for 循环做不到。
5. startsWith，endsWith，includes 三个方法都支持第二个参数，表示开始搜索的位置。
6. 标签模板其实不是模板，而是函数调用的一种特殊形式。

### 正则

1. 增加了 u 修饰符，可以正确识别大于二字节的字符。
2. 增加了 y 修饰符，和 g 类似，不同的是，y 修饰符会确保匹配必须从剩余的第一个位置开始。

### 数值

1. ES6 提供了二进制和八进制数值的新写法，分别用前缀 0b 和 0o 表示。
2. Number.isFinite 和 Num.isNaN 和之前的全局方法的不同在于，它们不会对传入的非数值进行数值转换。这样做的目的，是为了减少全局性方法，使语言逐步模块化。
3. 极小常量 Number.EPSILON 可以检查浮点运算可以接受的误差范围。
4. Javascript 能够准确表示的整数范围在正负 2 的 53 方，ES6 引入了 Number.MAX_SAFE_INTEGER 和 Number.MINI_SAFE_INTEGER 两个常量来表示范围的上下限。
5. Math 的扩展：Math.trunc 会去除一个数的小数部分，Math.sign 会返回一个数是正数还是负数还是零。

### 数组

1. Array.from 方法用于将两类对象转为真正的数组：类似数组的对象和可遍历的对象。
2. 只要是部署了 Iterator 接口的数据解构，Array.from 都能将其转为数组。
3. 扩展运算符也能调用遍历器接口，将数据转为数组，比如 arguments 对象，Nodelist 对象等。但 Array.from 可以转换任意有 length 属性的对象。
4. Array.from 还能接受第二个参数，作用类似数组的 map 方法，比如：

```javascript
Array.from({ length: 2 }, () => 'jack')
// ['jack', 'jack']
```

5. Array.from 可以将字符串转为数组，并且能返回正确的 length：

```javascript
function countSymbols(string) {
  return Array.from(string).length
}
```

6. fill 方法使用给定值填充数组。
7. 数组的 includes 方法能准确判断是否含有 NaN。
8. ES6 明确将数组空位转为 undefined。

### 函数

1. 如果参数默认值是一个变量，该变量所处的作用域和其他变量作用域规则一样。
2. 参数默认值如果是一个表达式，则在运行时执行，而非定义时。
3. 箭头函数不能使用 new，没有 arguments 对象，不能用作 generator 函数。没有自己的 this，所以也不能使用 call 等方法。
4. 尾调用由于是函数的最后一步操作，所以不需要保留外层函数的调用帧，因为调用位置、内部变量等信息都不会再用到了，直接用内层函数的调用帧来取代外层函数的即可。

### 对象

1. Object.is 用来比较两个值是否严格相等。它与严格个比较运算符（===）的行为基本一致。不同的是，+0 不等于 -0，NaN 等于自身。
2. 克隆对象，并且保留继承链：

```javascript
function clone(origin) {
  let originProto = Object.getPrototypeOf(origin)
  return Object.assign(Object.create(originProto), origin)
}
```

3. Object.getOwnPropertyDescriptor 可以获取属性的描述对象。
4. ES6 一共有 6 种方法可以遍历对象的属性。for...in 循环遍历对象自身和继承的可枚举属性（不含 Symbol 属性）。Object.keys()返回的数组包含对象自身的可枚举属性（不含 Symbol 属性）。Object.getOwnPropertyNames() 返回的数组，包含自身的所有属性（不含 Symbol 属性）。Object.getOwnPropertySymbols() 返回的数组包含对象的所有 Symbol 属性。Reflect.ownKeys(obj) 返回一个数组，包含对象自身的所有属性。

### Symbol

1. Symbol 函数不能用 new 操作符，因为生成的是原始类型的值。
2. Symbol 值不能与其他类型的值进行运算，会报错。
3. Symbol 很适合常量的定义，因为能保证常量的值都不相等。
4. Symbol.for 和 Symbol 的不同在于，前者会被登记在全局中供搜索，所以不是每次都会返回一个新的 Symbol 类型的值。
5. Symbol.hasInstance 属性指向一个内部方法，对象使用 instanceof 运算符时会调用这个方法。
6. 对象的 Symbol.toPrimitive 属性指向一个方法，对象被转为原始类型的值时会调用这个方法。
7. 对象的 Symbol.toStringTag 可以用于定制[object Array] 中 object 后面的字符串。

### Proxy & Reflect

1. Proxy 实际上重载了点运算符，即用自己的定义覆盖了语言的原始定义。
2. 对于可以设置但没有设置拦截的操作，直接落在目标对象上，按照原先的方式产生结果。
3. 下面的例子使用 get 拦截实现数组读取负数索引：

```javascript
function createArray(...elements) {
  let handler = {
    get(target, propKey, receiver) {
      let index = Number(propKey)
      if (index < 0) {
        propKey = String(target.length + index)
      }
      return Reflect.get(target, propKey, receiver)
    },
  }
  return new Proxy([...elements], handler)
}
```

4. 利用 Proxy 可以将读取属性的操作（get）变成执行某个函数，从而实现属性的链式操作。

```javascript
var pipe = (function () {
  var pipe
  return function (value) {
    pipe = []
    return new Proxy(
      {},
      {
        get: function (pipeObject, fnName) {
          if (fnName === 'get') {
            return pipe.reduce(
              (function (val, fn) {
                return fn(val)
              },
              value)
            )
          }
          pipe.push(window[fnName])
          return pipeObject
        },
      }
    )
  }
})()
```

5. 结合 get 和 set 方法，就可以做到防止内部属性被外部读写。

```javascript
var handler = {
  get(target, key) {
    invariant(key, 'get')
    return target[key]
  },
  set(target, key, value) {
    invariant(key, 'set')
    return true
  },
}

function invariant(key, action) {
  if (key[0] === '_') {
    throw new Error(`Invalid attempt to ${action} private ${key} property`)
  }
}
```

6. apply 拦截函数调用，contruct 拦截 new 操作，has 拦截 in 操作， deleteProperty 拦截 delete 操作，enumerate 拦截 for...in。
7. Proxy.revocable 方法返回一个可取消的 Proxy 实例。
8. Relect 对象上的方法和 Proxy 对象的方法是一一对应的，所以 Proxy 对象可以方便地调用对应的 Reflect 方法完成默认行为。

### Set 和 Map

1. Array.from 可以将 Set 结构转为数组，这就提供了一种去除数组重复元素的方法：

```javascript
function dedupe(array) {
  return Array.from(new Set(array))
}
```

2. 扩展运算符也可以作用于 Set 结构。
3. WeakSet 成员只能是对象，并且都是弱引用，也即垃圾回收不会考虑该对象的引用。WeakSet 没有 size 属性，没有办法遍历其成员。
4. Map 是一种更完善的 Hash 结构实现，键不限于字符串。

### Iterator

1. 遍历器对象本质就是一个指针对象。
2. 遍历器接口（Iterable）、指针对象（Iterator） 和 next 方法：

```javascript
interface Iterable {
  [Symbol.iterator](): Iterator,
}

interface Iterator {
  next(value?: any): IterationResult,
}

interface IterationResult {
  value: any,
  done: boolean,
}
```

3. yield\* 后面跟一个可遍历的结构， 它会调用该结构的遍历器接口。
4. Symbol.iterator 方法最简单的实现是通过 generator 函数。

```javascript
let obj = {
  *[Symbol.iterator]() {
    yield 'hello'
    yield 'world'
  },
}

for (let x of obj) {
  console.log(x)
}

// hello
// world
```

5. 可以用下面的方式包装对象来使用 for...of 循环：

```javascript
function* entries(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]]
  }
}

for (let [key, value] of entries(obj)) {
  console.log(key, '->', value)
}
```

### Generator

1. 执行 Generator 函数会返回一个遍历器对象，也就是说，Generator 函数除了是状态机，还是一个遍历器对象生成函数。
2. 可以通过 next 方法在 Generator 运行的不同阶段注入不同的值，从而调整函数行为。
3. 用 Generator 函数实现斐波那契数列：

```javascript
function* fibonacci() {
  let [pre, curr] = [0, 1]
  while (true) {
    ;[prev, curr] = [curr, prev + curr]
    yield curr
  }
}
```

4. Generator 函数返回的遍历器对象都有一个 throw 方法，可以在函数体外抛出错误，然后在 Generator 函数体内捕获。
5. yield\* 命令可以很方便地取出嵌套数组的所有成员：

```javascript
function* iterTree(tree) {
  if (Array.isArray(tree)) {
    for (let i = 0; i < tree.length; i++) {
      yield* iterTree(tree[i])
    }
  } else {
    yield tree
  }
}
```

### Promise

1. 如果没有使用 catch 方法，Promise 对象抛出的错误不会传递到外层的代码。
2. 可以实现一个 done 方法，保证抛出任何可能的错误：

```javascript
Promise.prototype.done = function (onFulfilled, onRejected) {
  this.then(onFulfilled, onRejected).catch(function (reason) {
    setTimeout(() => {
      throw reason
    }, 0)
  })
}
```

3. 也可以实现一个 finally 方法：

```javascript
Promise.prototype.finally = function (cb) {
  let p = this.constructor
  return this.then(
    (value) => p.resolve(cb()).then(() => value),
    (reason) =>
      p.resolve(cb()).then(() => {
        throw reason
      })
  )
}
```

### Async 函数

1. yield 命令是异步两个阶段的分界线。
2. 编译器的“传名调用”实现往往是先将参数放到一个临时函数中，再将这个临时函数传入函数体。这个临时函数就叫做 Thunk 函数。
3. 在 Javascript 中，Thunk 函数替换的不是表达式，而是多参数函数，它将其替换为单参数的版本，且只接受回调函数作为参数。

```javascript
// 正常版本
fs.readFile(fileName, callback)

var readFileThunk = Thunk(filaName)

readFileThunk(callback)

var Thunk = function (fileName) {
  return function (callback) {
    return fs.readFile(fileName, callback)
  }
}
```

4. 任何函数，只要参数有回调函数，就能写成 Thunk 函数的形式：

```javascript
var Thunk = function (fn) {
  return function () {
    var args = [].slice(arguments)
    return function (callback) {
      args.push(callback)
      return fn.apply(this, args)
    }
  }
}
```

5. yield 命令用于将程序的执行权移出 Generator 函数，那么就需要一种方法将执行权再交还给 Generator 函数。
6. Thunk 函数真正的威力在于可以自动执行 Generator 函数：

```javascript
function run(fn) {
  var gen = fn()

  function next(err, data) {
    var result = gen.next(data)
    if (result.done) return
    result.value(next)
  }

  next()
}

run(generator)
```

7. co 模块其实就是将两种自动执行器（Thunk 函数和 Promise 对象）包装成了一个模块。
8. 基于 Promise 的自动执行：

```javascript
function run(gen) {
  var g = gen()

  function next(data) {
    var result = g.next(data)
    if (result.done) return result.value

    result.value.then(function (data) {
      next(data)
    })
  }
  next()
}
```

9. await 命令后面可以是 Promise 对象和原始类型的值。

### Class

1. 类内部定义的所有方法都是不可枚举的。
2. ES5 的继承实质上是先创造子类的实例对象 this，然后再将父类的方法添加到 this 上，ES6 完全不同，而是先创建父类的实例对象 this（所以必须先调用 super 方法），然后再用子类的构造函数修改 this。
3. 父类的静态方法可以被子类继承。静态方法也可以从 super 对象上调用。
4. new.target 这个属性可用于确定构造函数是怎么调用的。
