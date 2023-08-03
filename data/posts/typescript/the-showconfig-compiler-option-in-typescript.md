---
title: 'TypeScript 中的 --showConfig 编译器选项'
date: '2021-05-30'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/the-showconfig-compiler-option-in-typescript'
---

TypeScript 3.2 给 `tsc` 添加了新的 `--showConfig` 编译选项。`tsc --showConfig` 命令会计算有效的 tsconfig.json 文件内容，并且将它们打印到终端中。这对于调试项目配置是很有用的，尤其是我们在 tsconfig.json 文件中使用 `extends` 属性的时候。

### --showConfig 选项

让我们看一个例子来帮助理解 `--showConfig` 究竟是做什么的。假设我们有以下的目录结构：

```sh
.
├── main.ts
├── tsconfig.json
└── utils
    └── crypto.ts
```

tsconfig.json 文件中的内容如下：

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "es2015",
    "moduleResolution": "node",
    "strict": true,
    "importHelpers": true
  },
  "include": ["**/*.ts"]
}
```

现在让我们在包含了 tsconfig.json 文件的根目录执行下面的命令：

```sh
tsc --showConfig
```

上面的命令会在终端中打印以下的输出：

```ts
{
  "compilerOptions": {
    "target": "es5",
    "module": "es6",
    "moduleResolution": "node",
    "strict": true,
    "importHelpers": true
  },
  "files": ["./main.ts", "./utils/crypto.ts"],
  "include": ["**/*.ts"]
}
```

这就是当我们在这个目录中执行 `tsc` 命令时，Typescript 编译器所使用的有效配置。

注意 `files` 属性。它包含了编译范围内的所有文件。我们并没有在 tsconfig.json 文件中显式地设置这个属性；但 Typescript 编译器根据我们的 `include` 模式，帮我们计算出了这个属性。在这个例子中，我们只会编译 main.ts 和 crypto.ts 文件。在更真实的项目中，你很可能会看到更多的文件。

注意 `--showConfig` 在 tsconfig.json 文件中设置不会有任何作用，它只能配合命令行工具（CLI）`tsc` 使用。

### 配置继承和 --showConfig

当调试的 tsconfig.json 文件有继承于其他 tsconfig.json 文件的属性时，`tsc --showConfig` 命令尤其有用。继续举例子，假设有下面的目录结构：

```ts
.
├── client
│   ├── client.ts
│   └── tsconfig.json
├── server
│   ├── server.ts
│   └── tsconfig.json
└── tsconfig.json
```

根目录下 `tsconfig.json` 文件的内容如下。它设置了所有嵌套 tsconfig.json 文件需要继承的属性：

```ts
{
  "compilerOptions": {
    "moduleResolution": "node",
    "strict": true,
    "importHelpers": true
  }
}
```

下面是 client 目录下 tsconfig.json 文件的内容。注意它使用了 `extends` 属性来继承父目录中的 tsconfig.json 文件配置：

```ts
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "target": "es5",
    "module": "es2015"
  },
  "include": ["**/*.ts"]
}
```

下面是 server 目录下 tsconfig.json 文件的内容。它同样继承了根目录下的 tsconfig.json 文件。

```ts
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "target": "es2019",
    "module": "commonjs"
  },
  "include": ["**/*.ts"]
}
```

我们可以通过下面的命令打印出 client 目录下 tsconfig.json 文件的有效配置：

```sh
tsc --project ./client/tsconfig.json --showConfig
```

或者，我们也可以用更简短的 `-p` 别名来替代 `--project` 命令。我们还可以简化传给 `-p` 命令的参数，我们可以只写文件夹名，而不用写完整的 tsconfig.json 文件路径：

```sh
tsc -p client --showConfig
```

两个命令是等价的，都会打印以下的输出到终端：

```ts
{
  "compilerOptions": {
    "moduleResolution": "node",
    "strict": true,
    "importHelpers": true,
    "target": "es5",
    "module": "es6"
  },
  "files": ["./client.ts"],
  "include": ["**/*.ts"]
}
```

注意两个 `tsconfig.json` 文件 `compilerOptions` 对象中的属性是如何合并的：

- `moduleResolution`、`strict`、和 `importHelpers` 属性来自于根目录的 `tsconfig.json` 文件。这是为什么它们被列在最上面。
- `target` 和 `module` 属性来自于 client 目录中的 tsconfig.json 文件。它们可以覆盖来自父配置中的任何值（不过在这个例子中，并没有覆盖的需要）。

同样的，我们可以用下面的命令打印 sever 目录下 tsconfig.json 文件的有效配置：

```sh
tsc -p server --showConfig
```

该命令会打印以下输出到终端：

```ts
{
  "compilerOptions": {
    "moduleResolution": "node",
    "strict": true,
    "importHelpers": true,
    "target": "es2019",
    "module": "commonjs"
  },
  "files": ["./server.ts"],
  "include": ["**/*.ts"]
}
```

就这么多！希望 `--showConfig` 能够帮助你调试你的 Typescript 配置文件。
