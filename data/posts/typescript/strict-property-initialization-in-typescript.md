---
title: 'TypeScript 中的严格属性初始化'
date: '2021-04-11'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/strict-property-initialization-in-typescript'
---

Typescript 2.7 中引入了一个新的编译选项用来对类的属性初始化做严格检查。如果 `--strictPropertyInitialization` 选项被开启，类型检查会验证类中的每一个实例属性是否满足以下三个条件之一：

- 类型中包括了 `undefined` 类型，
- 有一个明确的初始值，或者，
- 在构造函数中有被明确赋值

`--strictPropertyInitialization` 选项是 `--strict` 选项开启后自动生效编译选项家族中的一员。

`--strictPropertyInitialization` 就像其他所有的严格编译选项一样，你可以将 `--strict` 设置为 `true`，同时选择性地将 `--strictPropertyInitialization` 设置为 `false` 来关闭对属性初始化的严格检查。

注意，为了 `--strictPropertyInitialization` 设置有效果，你必须同时设置 `--strictNullChecks`（可以直接设置，也可以通过 `strict` 间接设置）。

好了，让我们来看看严格属性初始化检查的实际例子。在没有开启 `--strictPropertyInitialization` 的情况下，下面的代码能通过类型检查，但会在运行时报一个 `TypeError` 错误：

```ts
class User {
  username: string
}

const user = new User()

// TypeError: Cannot read property 'toLowerCase' of undefined
const username = user.username.toLowerCase()
```

产生运行时报错的原因是，`username` 属性的值是 `undefined`，因为没有任何的值赋值给这个属性。因此，调用 `toLowerCase()` 方法会失败。

如果我们开启了 `--strictPropertyInitialization`，类型检查器会提示一个错误：

```ts
class User {
  // Type error: Property 'username' has no initializer
  // and is not definitely assigned in the constructor
  username: string
}
```

现在我们一起来学习四种可以避免 `User` 类产生这个类型错误的解决方案。

### 方案一：允许 undefined

一种避免该类型错误的方案是给 `username` 属性一个 `undefined`类型：

```ts
class User {
  username: string | undefined
}

const user = new User()
```

现在，`username` 属性完全可以包含 `undefined` 的值而不会有问题。不过，每当我们想把 `username` 作为字符串类型使用的时候，我们首先需要确保它包含了一个字符串，而不是 `undefined`。比如使用 `typeof` 判断：

```ts
// OK
const username =
  typeof user.username === 'string' ? user.username.toLowerCase() : 'n/a'
```

或者，我们也可以使用可选链（`?.`运算符）来保证只有在 `username` 包含了一个非空值的时候才会调用 `toLowerCase()` 方法。我们还可以结合空值合并（`??` 运算符）来提供一个备选值：

```ts
// OK
const username = user.username?.toLowerCase() ?? 'n/a'
```

### 方案二：显式初始化属性

另一个解决类型错误的方式是显式地给 `username` 属性初始化一个值。这样，属性就拥有了一个字符串类型的值，而不会是`undefined`：

```ts
class User {
  username = 'n/a'
}

const user = new User()

// OK
const username = user.username.toLowerCase()
```

### 方案三：在构造函数中赋值

也许最有用的解决方案是给构造函数添加一个 `username` 参数，然后将这个参数赋值给 `username` 属性。这样，每当一个 `User` 实例被构造的时候，调用者需要提供一个 username 作为入参：

```ts
class User {
  username: string

  constructor(username: string) {
    this.username = username
  }
}

const user = new User('mariusschulz')

// OK
const username = user.username.toLowerCase()
```

我们可以通过类字段（classs field）以及给 `username` 参数添加 `public` 修饰符的方式简化 `User` 类：

```ts
class User {
  constructor(public username: string) {}
}

const user = new User('mariusschulz')

// OK
const username = user.username.toLowerCase()
```

注意，严格属性初始化检查要求每一个属性在构造函数的所有代码路径中都能被明确赋值。下面的（人为构造）的例子因此在某些情况下不是类型正确的，`username` 属性有可能不必被初始化：

```ts
class User {
  // Type error: Property 'username' has no initializer
  // and is not definitely assigned in the constructor.
  username: string

  constructor(username: string) {
    if (Math.random() < 0.5) {
      this.username = username
    }
  }
}
```

### 方案四：明确的赋值断言

如果类属性既没有显式地初始化，又没有包含 `undefined` 类型，类型检查器会要求属性在构造函数中被直接初始化。否则，严格属性初始化检查就会失败。但如果你想在一个帮助函数中初始化这个属性或者希望某个依赖注入框架来帮助初始化的时候可能会有问题。在这些场景中，你需要给属性声明添加一个明确的赋值断言（!）：

```ts
class User {
  username!: string

  constructor(username: string) {
    this.initialize(username)
  }

  private initialize(username: string) {
    this.username = username
  }
}

const user = new User('mariusschulz')

// OK
const username = user.username.toLowerCase()
```

通过给 `username` 属性添加明确的赋值断言，我们在告诉类型检查器它可以期望 `username` 属性已经被初始化，即便它自己并没有检测到。现在确保属性在构造函数返回前被明确赋值就是我们自己的责任了，所以我们应该很小心。否则，`username` 属性很可能是 `undefined`，然后又会在运行时报一个 `TypeError` 错误。
