---
title: 'TypeScript 中导入 JSON 模块'
date: '2021-05-16'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/importing-json-modules-in-typescript'
---

Typescript 2.9 引入了一个新的 `--resolveJsonModule` 编译器选项，允许我们在 Typescript 中导入 JSON 模块。

### 通过 require 导入 JSON 模块

假设我们有个用 Typescript 写的 Node 应用，需要导入下面的 JSON 文件：

```ts
{
  "server": {
    "nodePort": 8080
  }
}
```

在 Node 中，我们可以像其他 CommonJS 模块一样通过 `require` 导入 JSON 文件：

```ts
const config = require('./config.json')
```

JSON 会自动反序列化为 Javascript 对象。这使得我们很容易访问该配置对象的属性：

```ts
'use strict'

const express = require('express')
const config = require('./config.json')

const app = express()

app.listen(config.server.nodePort, () => {
  console.log(`Listening on port ${config.server.nodePort} ...`)
})
```

目前为止都很好。

### 通过静态 import 声明导入 JSON 文件

现在我们要使用原生的 ECMAScript 模块而不是 CommonJS 模块。这意味着我们需要使用静态 `import` 声明来替代 `require` 调用：

```ts
// We no longer need the "use strict" directive since
// all ECMAScript modules implicitly use strict mode.

import * as express from 'express'
import * as config from './config.json'

const app = express()

app.listen(config.server.nodePort, () => {
  console.log(`Listening on port ${config.server.nodePort} ...`)
})
```

我们会在第二行发现一个报错。Typescript 默认并不允许我们像这样直接导入 JSON 模块。这是 Typescript 团队有意做出的设计决定：导入一个大的 JSON 文件很可能会消耗大量的内存。所以需要显式地使用 `--resolveJsonModule` 编译选项来允许导入：

```
Having people to consciously opt into this would imply the user understands the cost.
```

让我们打开 tsconfig.json 文件，然后开启 `resolveJsonModule` 选项：

```ts
{
  "compilerOptions": {
    "target": "es2015",
    "module": "commonjs",
    "strict": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  }
}
```

开启 `resolveJsonModule` 选项后，在我们的 Typescript 文件中不再报错。甚至我们可以得到类型检查和自动补全功能。

<video src="https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_json_module_autocompletion.m4v" autoplay width="100%" loop controls>
<source src="https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_json_module_autocompletion.m4v" type="video/m4v" />
</video>

如果我们编译上面的 Typescript 代码，我可以得到以下的 Javascript 输出：

```ts
'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const express = require('express')
const config = require('./config.json')
const app = express()
app.listen(config.server.nodePort, () => {
  console.log(`Listening on port ${config.server.nodePort} ...`)
})
```

注意，输出和我们之前的 `require` 版本非常相似：

```ts
'use strict'

const express = require('express')
const config = require('./config.json')

const app = express()

app.listen(config.server.nodePort, () => {
  console.log(`Listening on port ${config.server.nodePort} ...`)
})
```

好了，这就是如何在 Typescript 中导入 JSON 模块，只需要一个编译选项就能搞定。
