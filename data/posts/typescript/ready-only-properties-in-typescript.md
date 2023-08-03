---
title: 'TypeScript 中的 Ready-Only 属性'
date: '2020-09-27'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/read-only-properties-in-typescript'
---

Typescript 2.0 中增加了 `readonly` 修饰符。被标记为 `readonly` 的属性只能在初始化的时候赋值或者在同一个类的构造函数中赋值。除此之外，均不被允许。

让我们来看一个例子。这儿有个简单的 `Point` 类声明了两个 read-only 属性，`x` 和 `y`：

```ts
type Point = {
  readonly x: number
  readonly y: number
}
```

我们现在创建一个对象来代表原点，point（0/0），x、y 均初始化为 0:

```ts
const origin: Point = { x: 0, y: 0 }
```

因为`x`和`y`都被标记为`readonly`，我们不能再修改这两个属性的值：

```ts
// Error: Left-hand side of assignment expression
// cannot be a constant or read-only property
origin.x = 100
```

### 一个更现实的例子

上面这个人为构造的例子过于简单，我们再来看另一个函数：

```ts
function moveX(p: Point, offset: number): Point {
  p.x += offset
  return p
}
```

`moveX`函数不应该修改属性`x`的值。因为有 `readonly` 修饰符，你如果这样做 Typescript 编译器会报错:

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_readonly_properties-2x.a5pst655tj.imm.png)

作为替代方案，`moveX`应该返回一个更新了属性值的新的 point，就像下面这样：

```ts
function moveX(p: Point, offset: number): Point {
  return {
    x: p.x + offset,
    y: p.y,
  }
}
```

现在编译器不会报错了，因为我们没有去给一个只读的属性重新赋值，而是创建了一个新的 point 并初始化更新后的值，这完全没问题。

### 只读的类属性

你还可以在类中用 `readonly` 修饰属性。有一个`Circle`类包含了一个只读的属性`radius`和一个 getter 属性`area`，因为没有 setter，所以`area`是隐式只读的：

```ts
class Circle {
  readonly radius: number

  constructor(radius: number) {
    this.radius = radius
  }

  get area() {
    return Math.PI * this.radius ** 2
  }
}
```

area 的计算使用了 ES2016 的求幂运算。`area`和`radius`都可以在类外面被读取（因为没有标记为`private`），但是不能被重新赋值（因为都被标记为`readonly`)：

```ts
const unitCircle = new Circle(1)
unitCircle.radius // 1
unitCircle.area // 3.141592653589793

// Error: Left-hand side of assignment expression
// cannot be a constant or read-only property
unitCircle.radius = 42

// Error: Left-hand side of assignment expression
// cannot be a constant or read-only property
unitCircle.area = 42
```

### 只读的索引签名

另外，索引签名（index signatures）可以被标记为`readonly`。`ReadonlyArray<T>`类型在它的索引签名中使用`readonly`来避免它的索引被修改：

```ts
interface ReadonlyArray<T> {
  readonly length: number
  // ...
  readonly [n: number]: T
}
```

因为只读的索引签名，所以下面的代码编译器会报错：

```ts
const primesBelow10: ReadonlyArray<number> = [2, 3, 5, 7]

// Error: Left-hand side of assignment expression
// cannot be a constant or read-only property
primesBelow10[4] = 11
```

### readonly vs Immutability

`readonly` 修饰符是 Typescript 类型系统的一部分。它被编译器用来检查是否有非法的属性赋值，一旦 Typescript 代码被编译成 Javascript，所有的`readonly`标记都会消失。你可以在这个[小 Demo](https://www.typescriptlang.org/play?#code/C4TwDgpgBACg9gSwHbCgXigbwLACgoFQBOEAhgCZxIA2IUAHgFxRICuAtgEYREDcehYmUo06IZmy49+uAL4y8AYyoBnVHCIIA5smbxkqDJgbMADABoo4qKajy8QA)中随意修改玩耍，观察只读属性是如何被转译的。

因为`readonly`只存在于编译阶段，所以运行时对于属性赋值没有任何保护。也就是说，它会在编译阶段检查你代码中意外的属性赋值，这是 Typescript 类型系统中另一个帮你写出正确代码的特性。
