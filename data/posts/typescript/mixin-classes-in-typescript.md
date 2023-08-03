---
title: 'TypeScript 中的 Mixin 类'
date: '2021-01-18'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/mixin-classes-in-typescript'
---

Typescript 致力于支持在不同框架和库中使用的 Javascript 通用模式（common pattterns）。从 Typescript 2.2 开始，mixin 类就是其中一种得到静态类型检查支持的模式。这篇文章会先简单介绍 mixin 是什么，然后通过一些例子来展示如何在 Typescript 中去使用。

### Javascript/Typescript 中的 Mixin

Mixin 类是某种实现了特定功能的类。其他的类可以引入 mixin，并可以访问它的方法和属性。如此，mixin 提供了一种基于组合行为的代码重用方式。

```sh
Mixin 是一个这样的函数：
1. 接收一个构造函数，
2. 声明一个继承于这个类的构造函数
3. 给这个新类添加成员
4. 然后返回这个类

          —— Announcing Typescript 2.2 RC
```

定义已经清楚了，让我们再深入到代码中一窥究竟。下面代码中有一个 `Timestamped` mixin，它通过一个 `timestamp` 属性来记录对象创建的日期。

```ts
type Constructor<T = {}> = new (...args: any[]) => T

function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp = Date.now()
  }
}
```

上面代码包含的信息量相当多。让我们从最顶上的类型别名来庖丁解牛：

```ts
type Constructor<T = {}> = new (...args: any[]) => T
```

`Constructor<T>`类型是一个别名，代表了一个能够构造泛型 T 类型对象的构造函数的签名，并且这个构造函数能够接受任意类型任意数量的参数。它使用了泛型参数默认值（Typescript 2.3 中引入）来明确 T 的类型， 除非被设定为其他类型，否则会默认使用 `{}` 类型。

接下来让我们看一看 mixin 函数本身：

```ts
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp = Date.now()
  }
}
```

这里我们有一个函数叫 `Timestamped`，接收一个 `TBase` 泛型类型的参数 `Base`。注意 `TBase` 被限定必须和 `Constructor` 类型兼容，也就是说，这个类型可以构造某种对象。

在这个函数的函数体中，我们创建并返回了一个继承自 `Base` 的新类。这种语法初看会有点奇怪。在这里，我们创建了一个类表达式而不是类声明，而类声明是定义类更通常的方式。我们的新类定义了一个属性叫 `timestamp`，然后立即设置了一个以毫秒为单位的 Unix 时间戳。

注意从 mixin 函数返回的类表达式是一个匿名的类表达式，因为 `class` 关键字后面没有带名字。和类声明不同的是，类表达式命名不是必须的。你可以选择性地给这个类添加一个类名，它在类中可以被访问并且允许这个类引用自己：

```ts
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class Timestamped extends Base {
    timestamp = Date.now()
  }
}
```

我们已经介绍了上面的类型别名和 mixin 函数的声明，我们来看看如何在另一个类中使用这个 mixin：

```ts
class User {
  name: string

  constructor(name: string) {
    this.name = name
  }
}

// Create a new class by mixing `Timestamped` into `User`
const TimestampedUser = Timestamped(User)

// Instantiate the new `TimestampedUser` class
const user = new TimestampedUser('John Doe')

// We can now access properties from both the `User` class
// and our `Timestamped` mixin in a type-safe manner
console.log(user.name)
console.log(user.timestamp)
```

Typescript 编译器理解了我们创建和使用的 mixin。所有的一切都能拥有静态类型，我们因此得到了自动补全和重构相关的工具支持。

### Mixin 中使用构造函数

现在我们再来看一个稍微更高级的 mixin。这次我们会在 mixin 的类中定义一个构造函数：

```ts
function Tagged<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    tag: string | null

    constructor(...args: any[]) {
      super(...args)
      this.tag = null
    }
  }
}
```

如果你要在 mixin 类中定义一个构造函数，它必须是一个类型为 `any[]` 的剩余参数。这么做的原因是，mixin 类不应该和一个特定的类绑定已知的构造函数参数；因此 mixin 应该要支持接收任意类型任意数量的参数。所有的参数都会被传给 `Base` 的构造函数，然后 mixin 再处理它负责的事情。在我们的例子中，它初始化了 `tag` 属性。

我们可以和使用 `Timestamped` 的方式一样去使用 `Tagged` mixin：

```ts
// Create a new class by mixing `Tagged` into `User`
const TaggedUser = Tagged(User)

// Instantiate the new `TaggedUser` class
const user = new TaggedUser('John Doe')

// We can now assign values to any property defined in either
// the `User` class or our `Tagged` mixin in a type-safe manner.
// TypeScript will type-check those assignments!
user.name = 'Jane Doe'
user.tag = 'janedoe'
```

### 带方法的 Mixin

直到现在，我们只给我们的 Mixin 添加了属性。现在我们再看一个实现了两个方法的 mixin：

```ts
function Activatable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    isActivated = false

    activate() {
      this.isActivated = true
    }

    deactivate() {
      this.isActivated = false
    }
  }
}
```

我们在 mixin 函数返回了一个 ES2015 中的类，这意味着你可以使用所有类语法支持的特性，比如构造函数，属性，方法，getters/setters，静态成员，等等。

再一次，我们可以向下面这样配合 `User` 类使用 `Activatable` mixin：

```ts
const ActivatableUser = Activatable(User)

// Instantiate the new `ActivatableUser` class
const user = new ActivatableUser('John Doe')

// Initially, the `isActivated` property is false
console.log(user.isActivated)

// Activate the user
user.activate()

// Now, `isActivated` is true
console.log(user.isActivated)
```

### 组合多个 Mixin

当你开始组合使用 mixin 的时候，它的灵活性显而易见。一个类可以引入你想要的任意多个 mixin，我们来组合上面介绍的所有 mixin。

```ts
const SpecialUser = Activatable(Tagged(Timestamped(User)))
const user = new SpecialUser('John Doe')
```

现在我并不确定 `SpecialUser` 类是否真的非常有用，但重点是，Typescript 可以理解这个 mixin 组合的静态类型。编译器可以检查所有相关的操作，并在自动补全列表中给出可用成员的建议：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_mixin_autocompletion_list-2x.3okvyh3how.imm.png)

如果和类的继承相比，你会发现其中区别：一个类只能有一个基类。无论在 Javascript 或 Typescript 中，你都不可能继承多个基类。

### 更多阅读

- [What's new in TypeScript](https://github.com/Microsoft/TypeScript/pull/13743): Support for Mix-in classes
- [Pull request](https://github.com/Microsoft/TypeScript/pull/13743): "Mixin classes" by Anders Hejlsberg
- ["Real" Mixins with JavaScript Classes](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/) by Justin Fagnani
