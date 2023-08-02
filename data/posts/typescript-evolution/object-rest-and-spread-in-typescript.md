---
title: 'TypeScript 中的对象剩余和扩展属性'
date: '2020-11-16'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/object-rest-and-spread-in-typescript'
---

Typescript 2.1 实现了在 ES2018 中标准化的对象剩余和扩展属性（Object Rest And Spread Properties）。所以你可以以类型安全的方式使用剩余和扩展属性，编译器最终会将这两个特性降级为 ES3 代码。

### 对象剩余属性

假设你声明了一个简单的对象字面量，包含三个属性：

```ts
const marius = {
  name: 'Marius Schulz',
  website: 'https://mariusschulz.com/',
  twitterHandle: '@mariusschulz',
}
```

你可以使用 ES2015 的解构赋值语法将这些属性的值保存在几个局部变量中。Typescript 会正确地推断每个变量的类型：

```ts
const { name, website, twitterHandle } = marius

name // Type string
website // Type string
twitterHandle // Type string
```

上面的用法完全正确，但并没有什么新东西。现在我们将解构赋值和对象剩余属性这两个语言特性结合起来使用：你除了可以解构出你感兴趣的一组属性，你还可以通过 `...` 语法将其他的属性解构到一个剩余的元素中：

```ts
const { twitterHandle, ...rest } = marius

twitterHandle // Type string
rest // Type { name: string; website: string; }
```

Typescript 能够正确判断出所有局部变量的类型。`twitterHandle` 是一个普通的字符串类型，`rest` 变量是一个对象，包含了剩下的两个没有被单独解构的属性。

### 对象扩展属性

假设你想使用 `fetch()` API 来发送 HTTP 请求。它接受两个参数：一个 URL 和一个选项对象，你可以通过这个选项对象给请求添加其他自定义的设置。

在你的应用中，你可能封装了对 `fetch()` 的调用，并且提供了默认选项，同时支持用特定的设置来覆盖默认选项。这些选项对象大概像下面这样：

```ts
const defaultOptions = {
  method: 'GET',
  credentials: 'same-origin',
}

const requestOptions = {
  method: 'POST',
  redirect: 'follow',
}
```

使用对象扩展操作，你可以将这两个对象合并到一个新的对象中，然后传递给 `fetch()` 方法：

```ts
// Type { method: string; redirect: string; credentials: string; }
const options = {
  ...defaultOptions,
  ...requestOptions,
}
```

对象扩展操作会创建一个新对象，按照从左到右的顺序，先从 `defaultOptions` 中复制所有的属性，然后从 `requestOptions` 复制所有的属性：

```ts
console.log(options)
// {
//   method: "POST",
//   credentials: "same-origin",
//   redirect: "follow"
// }
```

注意顺序是重要的。如果一个属性在两个对象中都出现了，后一个会覆盖前一个。这就是为什么我们把 `defaultOptions` 放到 `requestOptions` 前面，如果顺序相反，那么没有可能覆盖默认的值。

当然，Typescript 理解这种顺序。因此，当多个扩展对象定义了同一个属性，这个属性的类型是由最后一个包含该属性的对象决定的，因为它会覆盖前面所有对这个属性的赋值：

```ts
const obj1 = { prop: 42 }
const obj2 = { prop: 'Hello World' }

const result1 = { ...obj1, ...obj2 } // Type { prop: string }
const result2 = { ...obj2, ...obj1 } // Type { prop: number }
```

简单说：最后一次赋值胜出。

### 对象的浅拷贝

对象扩展操作可以用于对象的浅拷贝。假如你想创建一个和已存在的对象属性完全一致的 todo 对象，使用对象扩展，就是一行代码的事：

```ts
const todo = {
  text: 'Water the flowers',
  completed: false,
  tags: ['garden'],
}

const shallowCopy = { ...todo }
```

可以看到，你的确创建了一个新对象，并且复制了所有的属性：

```ts
console.log(todo === shallowCopy)
// false

console.log(shallowCopy)
// {
//   text: "Water the flowers",
//   completed: false,
//   tags: ["garden"]
// }
```

现在可以修改 `text` 属性而不会影响到原始的对象：

```ts
shallowCopy.text = 'Mow the lawn'

console.log(shallowCopy)
// {
//   text: "Mow the lawn",
//   completed: false,
//   tags: ["garden"]
// }

console.log(todo)
// {
//   text: "Water the flowers",
//   completed: false,
//   tags: ["garden"]
// }
```

然而，新的 todo 对象拥有和第一个对象一样的 `tags` 引用。所以这里并没有深拷贝。因此，修改这个数组会对两个对象都产生影响：

```ts
shallowCopy.tags.push('weekend')

console.log(shallowCopy)
// {
//   text: "Mow the lawn",
//   completed: false,
//   tags: ["garden", "weekend"]
// }

console.log(todo)
// {
//   text: "Water the flowers",
//   completed: false,
//   tags: ["garden", "weekend"]
// }
```

如果你想对一个可序列化的对象进行深拷贝，你可以考虑用 `JSON.parse(JSON.stringify(obj))` 或其他办法。就像 `Obeject.assign()`，对象扩展只会复制属性的值，所以如果不注意引用类型的属性，可能会产生意料之外的行为。

值得一提的是，上面所有的代码片段都不包含任何的 Typescript 类型标记，或其他 Typescript 特定的构造结构。所有代码都只是普通的使用了对象剩余或扩展属性的 Javascript 代码。类型推断居功至伟！
