---
title: 'TypeScript 中的字符串枚举'
date: '2021-02-21'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/string-enums-in-typescript'
---

Typescript 2.4 实现了一个呼声很高的特性：字符串枚举，或者更准确地说，成员的值是 string 类型的枚举。

现在允许将一个字符串赋值给一个枚举成员：

```ts
enum MediaTypes {
  JSON = 'application/json',
  XML = 'application/xml',
}
```

字符串枚举可以像其他 Typescript 中的枚举一样被使用：

```ts
enum MediaTypes {
  JSON = 'application/json',
  XML = 'application/xml',
}

fetch('https://example.com/api/endpoint', {
  headers: {
    Accept: MediaTypes.JSON,
  },
}).then((response) => {
  // ...
})
```

下面是编译器生成的 ES3/ES5 代码：

```ts
var MediaTypes
;(function (MediaTypes) {
  MediaTypes['JSON'] = 'application/json'
  MediaTypes['XML'] = 'application/xml'
})(MediaTypes || (MediaTypes = {}))
fetch('https://example.com/api/endpoint', {
  headers: {
    Accept: MediaTypes.JSON,
  },
}).then(function (response) {
  // ...
})
```

输出的结果和数字成员类型的枚举编译输出的几乎一样，但字符串成员的枚举没有反向的映射。

### 字符串枚举成员没有反向映射

对于每一个枚举，Typescript 都会生成一些映射代码构造出一个映射对象。但对于字符串枚举成员，这个映射对象只定义了 key 到 value 的映射，没有反向的映射。

```ts
var MediaTypes
;(function (MediaTypes) {
  MediaTypes['JSON'] = 'application/json'
  MediaTypes['XML'] = 'application/xml'
})(MediaTypes || (MediaTypes = {}))
```

这意味着，我们可以通过 key 来得到 value，但不能通过 value 得到它的 key：

```ts
MediaTypes['JSON'] // "application/json"
MediaTypes['application/json'] // undefined

MediaTypes['XML'] // "application/xml"
MediaTypes['application/xml'] // undefined
```

让我们来对比下数字类型成员的枚举：

```ts
enum DefaultPorts {
  HTTP = 80,
  HTTPS = 443,
}
```

在这个例子中，编译器额外生成了一个 value 到 key 的反向映射：

```ts
var DefaultPorts
;(function (DefaultPorts) {
  DefaultPorts[(DefaultPorts['HTTP'] = 80)] = 'HTTP'
  DefaultPorts[(DefaultPorts['HTTPS'] = 443)] = 'HTTPS'
})(DefaultPorts || (DefaultPorts = {}))
```

这个反向映射允许我们既可以通过 value 获得 key，也可以通过 key 获得 value。

```ts
DefaultPorts['HTTP'] // 80
DefaultPorts[80] // "HTTP"

DefaultPorts['HTTPS'] // 443
DefaultPorts[443] // "HTTPS"
```

### 通过常量枚举（const enum）来内联枚举的成员

为了避免生成枚举映射代码带来的开销，我们可以将 `MediaTypes` 枚举转换成一个常量枚举，只需要在声明的时候加上 `const` 修饰符：

```ts
const enum MediaTypes {
  JSON = 'application/json',
  XML = 'application/xml',
}

fetch('https://example.com/api/endpoint', {
  headers: {
    Accept: MediaTypes.JSON,
  },
}).then((response) => {
  // ...
})
```

加了 `const` 之后，编译器不会再为我们的 `MediaTypes` 生成任何的映射代码。相反的，它会在所有使用枚举成员的地方内联具体的值，这样减少了一些代码以及避免属性访问的开销。

```ts
fetch('https://example.com/api/endpoint', {
  headers: {
    Accept: 'application/json' /* JSON */,
  },
}).then(function (response) {
  // ...
})
```

但是，出于某些原因，我们想在运行时访问这个映射对象怎么办？

### 通过 preserveConstEnums 生成常量枚举代码

有些时候，为一个常量枚举生成映射代码是必要的，比如有一些 Javascript 代码需要访问它的时候。对于这种场景，你可以在 `tsconfig.json` 文件中开启 `preserveConstEnums` 编译选项。

```ts
{
  "compilerOptions": {
    "target": "es5",
    "preserveConstEnums": true
  }
}
```

在设置 `preserveConstEnums` 之后，再次编译我们的代码，编译器依然会內联 `MediaTypes.JSON` 的值，但是它同时会生成映射代码：

```ts
var MediaTypes
;(function (MediaTypes) {
  MediaTypes['JSON'] = 'application/json'
  MediaTypes['XML'] = 'application/xml'
})(MediaTypes || (MediaTypes = {}))
fetch('https://example.com/api/endpoint', {
  headers: {
    Accept: 'application/json' /* JSON */,
  },
}).then(function (response) {
  // ...
})
```
