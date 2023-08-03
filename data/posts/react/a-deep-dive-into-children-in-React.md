---
title: '理解React中的children'
date: '2018-12-10'
origin: 'https://mxstbr.blog/2017/02/react-children-deepdive/'
topics: ['react']
---

React 的核心是组件。你可以像嵌套 HTML 标签一样嵌套组件，所以写 JSX 并不难。当我刚开始学 React 的时候，我觉得关于 children 我只要会用 props.children 就可以了。我承认，我天真了。

因为在 JSX 里可以写 Javascript，我们可以改变 children。比如，我们可以传特殊的 props 给它们，或者决定是否要渲染它们，或者根据自己的意愿任意操作它们。废话不多说，进入正题。

## Child 组件

假设我们有 Grid 组件和 Row 组件，你可以像下面这样使用它们：

```javascript
<Grid>
  <Row />
  <Row />
  <Row />
</Grid>
```

上面的三个 Row 组件会通过 props.children 的方式传给 Grid 组件，在 Grid 组件内可以渲染 children:

```javascript
class Grid extends React.Component {
  render() {
    return <div>{this.props.children}</div>
  }
}
```

父组件也可以选择不渲染传入的任何 children。比如像下面这样：

```javascript
class Fullstop extends React.Component {
  render() {
    return <h1>Hello world!</h1>
  }
}
```

无论你给 Fullstop 传什么 children，它都只会显示`Hello world!`。

### Child 可以是任意类型

React 的 children 并不一定是组件类型的，它可以是任意类型。比如，我们可以给上面的 Grid 传入一些文本：

```javascript
<Grid>Hello world!</Grid>
```

JSX 会自动删除开始和结尾的空格和空行。同时也会将内容中间的空行压缩成一个空格。这意味着下面的这些示例最后渲染出的内容是一样的：

```javascript
<Grid>Hello world!</Grid>

<Grid>
  Hello world!
</Grid>

<Grid>
  Hello
  world!
</Grid>

<Grid>

  Hello world!
</Grid>
```

你也可以混合不同类型的 child，如下所示：

```javascript
<Grid>
  Here is a row:
  <Row />
  Here is another row:
  <Row />
</Grid>
```

### Child 也可以是函数

我们可以传递 Javascript 表达式作为 children，包括函数。比如下面这个组件：

```javascript
class Executioner extends React.Component {
  render() {
    // 看，我们在调用children                  ↓
    return this.props.children()
  }
}
```

可以这样使用这个组件：

```javascript
<Executioner>{() => <h1>Hello World!</h1>}</Executioner>
```

上面的例子只是为了展示函数作为 children 的这种想法，所以看上去没什么用。

假设有一个从服务器获取数据的场景，这种函数作为 children 的模式能派上用场：

```javascript
<Fetch url="api.myself.com">{(result) => <p>{result}</p>}</Fetch>
```

---

## 操作 children

如果你有看过 React 的官方文档，你会看到这样的说法，“children 是一种不透明的数据结构”。其实他们想说的是，props.chidlren 可以是任意的类型，比如可以是数组，可以是函数，也可以是对象，等等。

React 提供了一些辅助类函数帮助我们更容易地操作 children。这些函数都挂载在 React.Children 对象下面。

### 循环 children

有两个最常用的辅助函数，React.Children.map 和 React.Children.forEach。他们的用法和同名的数组方法类似，但能够作用于函数、对象或者传入的任意 children。

```javascript
class IgnoreFirstChild extends React.Component {
  render() {
    const children = this.props.children
    return (
      <div>
        {React.Children.map(children, (child, i) => {
          // 忽略第一个 child
          if (i < 1) return
          return child
        })}
      </div>
    )
  }
}
```

IgnoreFirstChild 会渲染第一个 child 以外的 child。

```javascript
<IgnoreFirstChild>
  <h1>First</h1>
  <h1>Second</h1> // 只会渲染这个
</IgnoreFirstChild>
```

上面的例子中，我们也可以用 this.props.children.map 的方式去循环。但是，假如我们传入的 children 是一个函数，直接使用数组的 map 方法会导致报错。使用 React.Children.map，一切依旧正常：

```javascript
<IgnoreFirstChild>
  {() => <h1>First</h1>} // <- Ignored 💪
</IgnoreFirstChild>
```

### 计算 children 个数

因为 children 可以是任意类型，所以统计 children 的个数并不容易。举个例子，如果你传入的是“hello world!"字符串，使用 this.props.children.length 计数的话就是 12，但其实只有一个 child。

所以我们需要使用 React.Children.count：

```javascript
class ChildrenCounter extends React.Component {
  render() {
    return <p>React.Children.count(this.props.children)</p>
  }
}
```

它会返回正确的 children 数量，不管 children 是什么类型：

```javascript
// Renders "1"
<ChildrenCounter>
  Second!
</ChildrenCounter>

// Renders "2"
<ChildrenCounter>
  <p>First</p>
  <ChildComponent />
</ChildrenCounter>

// Renders "3"
<ChildrenCounter>
  {() => <h1>First!</h1>}
  Second!
  <p>Third!</p>
</ChildrenCounter>
```

### 将 children 转为数组

如果上面的方法都不能满足你的需求，还有最后一招：你可以通过 React.Children.toArray 方法将 children 转成数组:

```javascript
class Sort extends React.Component {
  render() {
    const children = React.Children.toArray(this.props.children)
    return <p>{children.sort().join(' ')}</p>
  }
}
```

### 强制只能有一个 child

如果你想强制只能传入一个 child，你可以使用 React.Children.only 方法，如下：

```javascript
class Executioner extends React.Component {
  render() {
    return React.Children.only(this.props.children)()
  }
}
```

上面的例子中，如果使用 Excutioner 组件的时候传入多个 child 会直接导致报错。这能避免一些不严谨的开发者滥用我们的组件。

---

## 编辑 children

虽然我们可以传入任意类型作为 children 进行渲染，但到目前为止，我们只能在父组件中控制它们，而不是在具体渲染它们的组件中。举个例子，假设有一个 RadioGroup 组件包含了一些 RadioButton 组件（渲染成 radio 类型的 input）:

```javascript
render() {
  return(
    <RadioGroup>
      <RadioButton value="first">First</RadioButton>
      <RadioButton value="second">Second</RadioButton>
      <RadioButton value="third">Third</RadioButton>
    </RadioGroup>
  )
}
```

这些 RadioButton 其实并不是在书写他们的地方渲染的，它们只是作为 children 传给了 RadioGroup 组件。上面的代码中有一个小问题，因为没有 name 属性，三个 RadioButton 并不是一组的。为了解决这个问题，我们可以给每一个 RadioButton 加上 name 属性：

```javascript
<RadioGroup>
  <RadioButton name="g1" value="first">
    First
  </RadioButton>
  <RadioButton name="g1" value="second">
    Second
  </RadioButton>
  <RadioButton name="g1" value="third">
    Third
  </RadioButton>
</RadioGroup>
```

但是等等，这样做既繁琐又容易出错。我们既然在写 Javascript, 我们难道不能更智能地将 name 属性添加给每一个 RadioButton 吗？

### 改变 children 的 props

在 RadioGroup 组件中，我们加了一个 renderChildren 方法用于修改 children 的 props：

```javascript
class RadioGroup extends React.Component {
  constructor() {
    super()
    this.renderChildren = this.renderChildren.bind(this)
  }

  renderChildren() {
    // TODO
    return this.props.children
  }

  render() {
    return <div className="group">{this.renderChildren()}</div>
  }
}
```

首先，我们循环 children，并返回每一个 child：

```javascript
renderChildren() {
  return React.Children.map(this.props.children, child => {
    // TODO
    return child
  })
}
```

然后呢？

### 克隆元素

这是要介绍的最后一个辅助函数，React.cloneElement。使用这个方法的时候，我们传入需要被克隆的元素作为第一个参数，然后传入一个对象作为第二个参数，这个对象中的属性会作为 props 传给克隆出来的元素：

```javascript
const cloned = React.cloneElement(element, {
  new: 'yes!',
})
```

cloned 元素会有一个值为 yes! 的 new 属性。

这个方法正是我们需要的，现在我们给每一个 child 添加上一个 name 属性：

```javascript
renderChildren() {
  return React.Children.map(this.props.children, child => {
    return React.cloneElement(child, {
      name: this.props.name
    })
  })
}
```

最后，我们只需要给 RadioGroup 设置 name 属性即可：

```javascript
<RadioGroup name="g1">
  <RadioButton value="first">First</RadioButton>
  <RadioButton value="second">Second</RadioButton>
  <RadioButton value="third">Third</RadioButton>
</RadioGroup>
```
