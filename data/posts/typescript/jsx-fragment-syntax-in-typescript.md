---
title: 'TypeScript 中的 JSX Fragment 语法'
date: '2021-03-28'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/jsx-fragment-syntax-in-typescript'
---

TypeScript 2.6 添加了对 JSX fragments 的支持。在 `.tsx` 文件中，你现在可以使用新的 `<>...</>` 语法来创建一个 fragment。

### JSX Fragments 背后的动机

在 React 中，从一个组件中返回多个元素是常见的模式。举个例子，下面的组件中会渲染多个列表项：

```ts
class List extends React.Component {
  render() {
    return (
      <ul>
        <ListItems />
        <li>Item 3</li>
      </ul>
    )
  }
}
```

然而，在我们的 `ListItems` 组件中，我们不能简单地返回多个毗邻的 JSX 元素：

```ts
class ListItems extends React.Component {
  render() {
    return (
      <li>Item 1</li>
      <li>Item 2</li>
    );
  }
}
```

毗邻的多个 JSX 元素必须用一个闭合元素包裹，所以我们添加了包裹元素 `div`：

```ts
class ListItems extends React.Component {
  render() {
    return (
      <div>
        <li>Item 1</li>
        <li>Item 2</li>
      </div>
    )
  }
}
```

不幸的是，添加了这个包括元素后就破坏了列表的结构。我们的 `ListItems` 组件现在会渲染出以下的 DOM 元素：

```ts
<ul>
  <div>
    <li>Item 1</li>
    <li>Item 2</li>
  </div>
  <li>Item 3</li>
</ul>
```

注意这个 `<div>` 并不应该在这个结构中。我们应该使用 JSX fragment 语法来避免这种情况：

```ts
class ListItems extends React.Component {
  render() {
    return (
      <>
        <li>Item 1</li>
        <li>Item 2</li>
      </>
    )
  }
}
```

fragment 允许我们在不添加任何包裹节点的情况下返回多个 JSX 元素。现在我们的 `List` 组件渲染出了期望的结构：

```ts
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
```

还有一种方式，我们可以显式地使用 `React.Fragment` 替代上面介绍的 JSX 语法：

```ts
class ListItems extends React.Component {
  render() {
    return (
      <React.Fragment>
        <li>Item 1</li>
        <li>Item 2</li>
      </React.Fragment>
    )
  }
}
```

这两个版本的 `ListItems` 组件是相等的，会渲染出完全一样的结果（前提是都在 React 框架中使用我们的 JSX）。

### 在 Typescript 中编译 JSX Fragments

下面是我们用新语法改写后的 `ListItems` 组件：

```ts
class ListItems extends React.Component {
  render() {
    return (
      <>
        <li>Item 1</li>
        <li>Item 2</li>
      </>
    )
  }
}
```

如果我们使用 `--jsx react`（以及 `--target es2015`）来编译 `.tsx` 文件，会生成下面的 Javascript 代码：

```ts
class ListItems extends React.Component {
  render() {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement('li', null, 'Item 1'),
      React.createElement('li', null, 'Item 2')
    )
  }
}
```

编译器会生成 `React.createElement()` 方法调用来替换简短的 fragment 语法，并且把 `React.Fragment` 作为第一个参数传入。

如果我们使用 `--jsx preserve`（以及 `--target es2015`）来编译 `ListItems`组件，我们的 JSX 输出不会有改变（忽略空格）：

```ts
class ListItems extends React.Component {
  render() {
    return (
      <>
        <li>Item 1</li>
        <li>Item 2</li>
      </>
    )
  }
}
```
