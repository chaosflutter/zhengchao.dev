---
title: '轻松理解async函数'
date: '2017-04-09'
topics: ['async', 'javascript']
---

Async 函数是 ES2017 规范的一部分。刚刚发布的 Node7.6.0 版本开始支持该语法，不用加 flag 也能运行。Chrome55 版本之后以及大部分现代浏览器也都已经支持。对于不支持的浏览器和 Node 环境，可以通过 Babel 转译成 ES3/ES5 的语法运行。

### Async 函数是什么

先看一个简单的例子：

```javascript
async function fetchPosts() {
  const URL = '/api/posts'
  try {
    const response = await fetch(URL)
    // ...
  } catch (rejectValue) {
    // ...
  }
}
```

上面的函数声明前加了 async 关键字，函数内部使用了 await 语法。简单说，async 函数内部可以 await 一个 promise，用同步的方式写异步的代码。在被 await 的 promise 完成之前，函数不会继续执行，但不会阻塞主线程。当 promise 完成后，如果是 fulfill，返回的结果作为 await 表达式的值。如果是 reject，reject 的值被当做异常抛出。

上面的例子并不完整，为了能更好地理解 async 函数，下面分别用 promise 和 async 语法实现了相同的功能。

```javascript
// 实现请求文章列表 promise版本
function fetchPosts() {
  const URL = '/api/post'
  return fetch(URL)
    .then((res) => res.json())
    .then((posts) => {
      console.log(posts)
    })
    .catch((err) => {
      console.error('fetch posts failed', err)
    })
}
```

```javascript
// 实现请求文章列表 async版本
async function fetchPosts() {
  try {
    const URL = '/api/post'
    const res = await fetch(URL)
    const posts = await res.json()
    console.log(posts)
  } catch (err) {
    console.error('fetch posts failed', err)
  }
}
```

### async 函数的返回值

async 函数永远返回一个 promise。这个 promise 所 resolve 的是函数`return`的值。如果直接`return`一个 promise，那 async 函数的返回值就是该 promise。

如果 async 函数抛出异常，则返回的 promise 的状态是 reject。

```javascript
async function normal() {
  return 'hello'
}

// return a promise resolved with 'hello'
const promiseResolvedWithHello = normal()
```

```javascript
async function error() {
  throw Error('oops...')
}

// return a promise rejected with Error('oops...')
const promiseRejectedWithError = error()
```

### async 函数的其他语法

除了`async function() {}`这样声明一个 async 函数之外，也可以有如下几种写法：

#### 箭头函数

```javascript
const promise = async (url) => {
  const response = await fetch(url)
  return response.json()
}
```

#### 对象方法

```javascript
const work = {
  async debug(code) {
    // ...
  },
}
```

#### 类方法

```javascript
class Button {
  async onPress() {
    // ...
  }
}
```

### 需要注意的问题

先看下面的代码，假设`fetchPosts`函数需要 1s 的执行时间：

```javascript
async function fetchAllPosts() {
  // ...
  await fetchPosts(URL_1)
  await fetchPosts(URL_2)
  return true
}
```

上面的函数，因为两个 await 是顺序执行的，所以总共需要 2s 的执行时间。

再看下面的版本：

```javascript
async function fetchAllPosts() {
  // ...
  const fetch_1 = fetchPosts(URL_1)
  const fetch_2 = fetchPosts(URL_2)

  await fetch_1
  await fetch_2
  return true
}
```

上面的代码，因为 fetchPosts 操作是同时进行的，所以总共需要 1s 的执行时间。

在实际工作中需要特别注意这个问题，以避免不必要的执行耗时。
