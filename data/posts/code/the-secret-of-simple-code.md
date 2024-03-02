---
title: '简单代码的密码'
date: '2020-08-16'
topics: ['clean-code']
origin: 'https://medium.com/javascript-scene/the-secret-of-simple-code-a2cacd8004dd'
---

10 倍程序员如何创造 10 倍价值。

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/1_8ACkMfSmpb8EpcosjXu-5w.png)

有成为 10 倍程序员的捷径吗？是否有某种神奇的秘密——你只要知道它——就能为你解锁精通软件开发和提高生产力的全新世界？

持怀疑态度的人会想“没有捷径！任何人都需要练习来精进！”。这自然是对的，但高手是如何练习来提高软件开发生产力的呢？有没有某种关键的东西发挥了巨大的作用？

没错，有！

但即便我告诉你——甚至我苦口婆心一字一句详详细细和你说——你可能还是需要花费 10 年的时间来完全领会这个质朴的道理。

至少，我是这样过来的。我是从高中编程课老师普通的英语中第一次听到它，然后我亦步亦趋地跟着示例代码来应用它。但直到 10 年后我才真正理解它。现在因为有了经验的积累，我深深地感谢这一课。并且即便我知道你一开始并不会真的领会这一课，但我还是准备和你分享它。

这个秘密是平均生产力和 10 倍生产力不同之处的关键所在。使用这个秘密提供的杠杆能力，你可以极大地提高效率。

你可以写出复用性更高的代码，并且更少地因为新需求的引入和周边代码的修改而出现问题。

拥有 10 倍生产力的秘密是真正掌握抽象能力。很多程序员对待“抽象”就像对待一个脏字眼一样。你会听到一些（好的）建议，“不要过早抽象”，或者 Python 之禅著名的“显式比隐式更好”，意味着具体比抽象更好。这些都是好建议——不过要看场景。

现代应用使用了巨量的代码。如果你把现在 top 10 应用的源码打印出来，这些层层叠叠的纸张的高度可以和摩天大楼一较高下，并且软件需要花很多的钱来维护。你创造的代码越多，它的花费也越多。

### 抽象是简单代码的关键

正确的抽象能够使代码更易读、更具适应性，以及更容易维护。因为它隐藏了对当前上下文不重要的细节，减少了完成工作所需要的代码量——通常是数量级程度的减少。

> 简单是减去明显的，同时增加有意义的。——John Maeda：简单的法则

抽象不是单向街。它由两个相辅相成的概念组成：

- 一般化——移除重复的部分（明显的），把它们隐藏在抽象的后面。
- 专门化——在某个特殊的使用场景应用抽象，仅仅增加所需的不同的部分（有意义的）

来看下面的代码：

```javascript
const doubleList = (list) => {
  const newList = []
  for (var i = 0; i < list.length; i++) {
    newList[i] = list[i] * 2
  }
  return newList
}
```

这段代码本身没有任何错，但它包含了太多的细节，而这些细节可能对于这个特别的应用并不重要。

- 它包含了数据容器使用的数据结构的细节（数组），意味着它只能使用数组。它包含了对状态形状的依赖（state shape dependency）。
- 它包含了迭代逻辑，意味着如果你想对数据结构中的每个元素做某种操作你也需要重复上面代码中的迭代逻辑。这种不可避免的重复会违反 DRY（Don’t Repeat Yourself）原则。
- 它包含了显示的赋值操作，而不是声明式地描述需要被执行的操作。它太啰嗦了。

所有这些都不是必需的。它们都可以被隐藏在抽象后面。在这个例子中，有种抽象是如此普适，以至于它改变了现代应用开发的方式，并且减少了我们写 for 循环的次数。

> 如果你以深刻的觉知接触一件事，你就接触了一切。——Thich Nhat Hanh

使用 map 操作，你可以把代码减少到一行。它移除了明显的（我们很可能会在类似代码中重复的部分），并且专注于有意义的（我们的使用场景中不同的地方）：

```javascript
const doubleList = (list) => list.map((x) => x * 2)
```

初级开发者认为他们需要写很多的代码来产出很多的价值。

高级开发者理解没有人需要写的代码的价值。

想象自己是使得 map 操作在编程语言中，比如 Javascript 中流行开来的程序员。Map 抽象了一些细节，比如隐藏了你做映射操作所需的数据类型，数据容器的数据结构，对数据结构中每个数据进行迭代的逻辑。它提高了我过去十数年开发每一个应用的效率。

Jeremy Ashkenas 使得类似的一些操作在 Javascript 中流行，一些我们视为理所当然的 Javascript 中非常棒的简洁语法是他在 CoffeeScript 中开创使用而被慢慢引入的。他写了 Underscore，从而滋生了 Lodash（依然是目前 Javascript 中最流行的函数式编程百宝箱），他还写了 Backbone，使得 MVC 架构在 Javascript 中流行，并且为 Angular 和 React 搭好了舞台。

John Resig 创造了 jQuery，它是如此流行和具有影响力，以至于在 Node 模块和 ES6 模块出现前几年，它形成了最大的封装好的可复用的 Javascript 模块集合（jQuery 插件）。jQuery 的选择器 API 是如此有影响力，以至它是构成今天 DOM 选择器 API 的基础。我依然几乎每天都能从 jQuery 的选择器 API 中获益因为要写 React 组件的单元测试。

正确的抽象是强大的杠杆，会极大地影响生产力。抽象不是脏字眼。模块，函数，变量，类——所有这些都是某种抽象的形式，并且它们存在的全部理由是使得抽象以及抽象的组合更容易。

你无法构建一个复杂的软件却没有抽象。即使是汇编语言也使用抽象——指令的名字，内存地址的变量，跳转到子程序的代码指针（像函数调用）等等。现代软件是有用抽象的千层蛋糕，这些层给了你杠杆的能力。

> 给我一根足够长的杠杆和一个支点，我将能撬动地球。——阿基米德

简单的关键：我们寻找的秘密——如何减少我们产出的大量代码——其实是为了做得更少但完成更多。当你掌握了它之后，你会成为 10 倍程序员。我保证。