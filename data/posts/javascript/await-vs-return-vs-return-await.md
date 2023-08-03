---
title: '区分await、return以及return await'
date: '2017-12-28'
origin: 'https://jakearchibald.com/2017/await-vs-return-vs-return-await/'
topics: ['async', 'javascript']
---

当我们写 async 函数的时候，需要注意 await、return 以及 return await 的区别，并作出正确的选择。

我们先来看一个 async 函数：

```javascript
async function waitAndMaybeReject() {
  // Wait one second
  await new Promise((r) => setTimeout(r, 1000))
  // Toss a coin
  const isHeads = Boolean(Math.round(Math.random()))

  if (isHeads) return 'yay'
  throw Error('Boo!')
}
```

调用这个函数会返回一个 promise，等待一秒后，50%的可能性 fulfill，返回值为"yay"，另外 50%的可能性会 reject 一个错误。下面我们用几种不同的姿势来使用这个 async 函数。

### Just Calling

```javascript
async function foo() {
  try {
    waitAndMaybeReject()
  } catch (e) {
    return 'caught'
  }
}
```

如果调用上面的 foo 函数，会立即返回一个 promise，并且 fulfill 的值为 undefined。

因为我们没有 await 或者 return`waitAndMaybeReject()`调用的结果。像上面这样的代码，通常而言是写错了。

### Awaiting

```javascript
async function foo() {
  try {
    await waitAndMaybeReject()
  } catch (e) {
    return 'caught'
  }
}
```

如果调用上面的 foo 函数，返回的 promise 会等待一秒钟，然后 fulfill，返回值要么是 undefined，要么是“caught”。

因为我们 await 了`waitAndMaybeReject()`调用的结果。`waitAndMaybeReject()`调用返回一个 promise，如果 reject，会被当做一个异常抛出，因而 catch 代码块会被执行。但是如果 fulfill，foo 函数并没有处理该情况的返回值。

### Returning

```javascript
async function foo() {
  try {
    return waitAndMaybeReject()
  } catch (e) {
    return 'caught'
  }
}
```

如果调用上面的 foo 函数，返回的 promise 会等待一秒钟，然后要么 fulfill，返回值为“yay”，要么 reject 一个`Error('Boo!')`错误。

因为返回了`waitAndMaybeReject()`，所以 foo 函数调用返回的 promise 即为`waitAndMaybeReject()`返回的 promise。没有异常， 因而 catch 代码块并不会执行。

### Return-awaiting

如果  你的预期是上面的 catch 代码块有可能  执行，需要使用 return await：

```javascript
async function foo() {
  try {
    return await waitAndMaybeReject()
  } catch (e) {
    return 'caught'
  }
}
```

如果调用上面的 foo 函数，返回的 promise 会等待一秒钟，然后 fulfill，返回值为要么是“yay”，要么是“caught”。

因为我们 await 了`waitAndMaybeReject()`函数调用的结果，它返回的 promise 如果 reject 会抛出异常，此时 catch 代码块就会执行。但如果`waitAndMaybeReject()`返回的 promise 状态是 fulfill，则会返回 fulfill 的结果。

如果上面的代码看起来有点困惑，把它拆分成两步可能更容易理解：

```javascript
async function foo() {
  try {
    // Wait for the result of waitAndMaybeReject() to settle,
    // and assign the fulfilled value to fulfilledValue:
    const fulfilledValue = await waitAndMaybeReject()
    // If the result of waitAndMaybeReject() rejects, our code
    // throws, and we jump to the catch block.
    // Otherwise, this block continues to run:
    return fulfilledValue
  } catch (e) {
    return 'caught'
  }
}
```
