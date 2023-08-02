---
title: 'TypeScript 中的泛型参数默认值'
date: '2021-01-25'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/generic-parameter-defaults-in-typescript'
---

Typescript 2.3 实现了泛型参数默认值，它允许你给泛型的参数类型设置默认类型。

在这篇文章中，我会通过将下面的 React 组件从 Javascript(即 JSX) 转成 Typescript(即 TSX) 来展开我们如何能够从泛型参数默认值中获益：

```ts
class Greeting extends React.Component {
  render() {
    return <span>Hello, {this.props.name}!</span>
  }
}
```

不用担心，你不用懂 React 也能看懂下面的内容。

### 给这个类组件创建一个类型定义

让我们先来给 `Component` 这个类创建一个类型定义。每一个 React 类组件都有两个属性 `pops` 和 `state`，它们的类型都是任意的。所以我们可以定义如下的类型：

```ts
declare namespace React {
  class Component {
    props: any
    state: any
  }
}
```

注意为了说明的目的这个例子中做了极大的简化。毕竟，这篇文章不是在讲 React，而是关于泛型参数和它的默认值。真实的[DefinitlyTyped 上的 React 类型定义](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts) 要复杂得多。

现在我们得到了类型检查和自动补全建议：

```ts
class Greeting extends React.Component {
  render() {
    return <span>Hello, {this.props.name}!</span>
  }
}
```

我们可以像下面这样创建一个组件实例：

```ts
<Greeting name="World" />
```

渲染我们的组件会生成下面的 HTML，和我们期望的一样：

```ts
<span>Hello, World!</span>
```

目前来看一切都很好。

### Props 和 State 使用泛型参数

虽然上面的例子可以编译和运行正常，但 `Componnent` 的类型定义非常不准确。因为我们将 `props` 和 `state` 定义为 `any` 类型，Typescript 编译器并帮不了太多的忙。

让我们来把它们变得更具体一些。我们会引入两个泛型 `Props` 和 `State` 来准确地描述 `props` 和 `state` 两个属性的形状：

```ts
declare namespace React {
  class Component<Props, State> {
    props: Props
    state: State
  }
}
```

我们再来创建一个 `GreetingProps` 类型，它定义了一个 `string` 类型的 `name` 属性，并且作为实参传给 `Props` 类型参数：

```ts
type GreetingProps = { name: string }

class Greeting extends React.Component<GreetingProps, any> {
  render() {
    return <span>Hello, {this.props.name}!</span>
  }
}
```

术语解释：

- `GreetingProps` 是 `Props` 参数的类型实参
- 类似的，`any` 是 `State` 参数的类型实参

有了这些类型，我们的组件会得到更好的类型检查和自动补全建议：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_generic_parameter_defaults_react-2x.rfxyz2u6bf.imm.png)

然而，如果我们想要继承 `React.Componnet` 类，我们现在必须提供两个类型。我们最初的代码不再是类型正确的：

```ts
// Error: Generic type 'Component<Props, State>'
// requires 2 type argument(s).
class Greeting extends React.Component {
  render() {
    return <span>Hello, {this.props.name}!</span>
  }
}
```

如果我们不想提供类似 `GreetingProps` 这样具体的类型，我们可以通过提供 `any` 类型（或者其他不太有用的类型比如 `{}`）给 `Props` 和 `State` 来修复代码：

```ts
class Greeting extends React.Component<any, any> {
  render() {
    return <span>Hello, {this.props.name}!</span>
  }
}
```

这种方式可以正常工作并且通过类型检查，但是假如 `any` 在这个例子中是默认值，并且可以简单地不用传任何实参不是更好吗？好，那我们就来介绍泛型参数默认值。

### 拥有参数默认值的泛型类型定义

从 Typescript 2.3 开始，我们可以选择性地给我们的泛型类型参数添加一个默认的类型。在我们的例子中，我们可以将 `Props` 和 `State` 的默认值设置为 `any` 类型，如果没有显式地设置类型实参，就会使用该默认值：

```ts
declare namespace React {
  class Component<Props = any, State = any> {
    props: Props
    state: State
  }
}
```

通过这种方式，我们最初始的代码再一次通过了类型检查并且成功编译：

```ts
class Greeting extends React.Component {
  render() {
    return <span>Hello, {this.props.name}!</span>
  }
}
```

当然，我们依然可以给 `Props` 类型参数提供类型实参，它会覆盖默认的 `any` 类型，就像我们之前做过的一样：

```ts
type GreetingProps = { name: string }

class Greeting extends React.Component<GreetingProps, any> {
  render() {
    return <span>Hello, {this.props.name}!</span>
  }
}
```

我们还可以做些其他有趣的事。现在这两个参数都有了默认的类型，这让它们的实参变得可选——你可以不用提供实参。这允许我们给 `Props` 显式地设置一个类型，同时让 `State` 隐式地使用默认的 `any` 类型。

```ts
type GreetingProps = { name: string }

class Greeting extends React.Component<GreetingProps> {
  render() {
    return <span>Hello, {this.props.name}!</span>
  }
}
```

注意我们只提供了一个类型实参。我们可以选择性地不给右边的参数传实参。也就是说，在这个例子中，我们不能给 `State` 设置类型实参同时让 `Props` 使用默认参数。类似地，在定义类型的时候，可选的类型参数不能放在必需参数的前面。

### 另一个例子

在我的上一篇文章 [Typescript 中的 mixin 类](https://chaosflutter.com/ts-evolution/mixin-classes-in-typescript) 中，我一开始就定义了下面的两个类型别名：

```ts
type Constructor<T> = new (...args: any[]) => T
type Constructable = Constructor<{}>
```

`Constructable` 类型是单纯的语法糖。它可以替代 `Constructor<{}>`，这样我们不用每次都写泛型类型参数。那有了泛型类型默认值，我们完全可以不用写 `Constructable` 类型，只需要将 `{}` 设为默认值即可：

```ts
type Constructor<T = {}> = new (...args: any[]) => T
```

这个语法相对复杂一些，但代码变得更简洁了。很好！
