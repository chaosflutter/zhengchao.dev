---
title: 'TypeScript 中的映射类型'
date: '2020-11-30'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/mapped-types-in-typescript'
---

Typescript 2.1 引入了映射类型（mapped types），这给类型系统添加了强大的武器。简单说，映射类型允许你通过映射已有类型的每个属性来创建新的类型。已有类型的每个属性会根据你设置的规则进行转换。转换后的属性会构造出一个新的类型。

使用映射类型，你就能捕获一些方法比如 `Object.freeze()` 所产生的作用。当一个对象被冻结后，它就不能添加、修改、移除属性。我们先来看下如果没有映射类型该如何在类型系统中编写代码：

```ts
interface Point {
  x: number
  y: number
}

interface FrozenPoint {
  readonly x: number
  readonly y: number
}

function freezePoint(p: Point): FrozenPoint {
  return Object.freeze(p)
}

const origin = freezePoint({ x: 0, y: 0 })

// Error! Cannot assign to 'x' because it
// is a constant or a read-only property.
origin.x = 42
```

我们定义了一个 `Point` 接口，它包含 `x` 和 `y` 两个属性。同时，我们定义了另一个接口 `FrozenPoint`，它和 `Point` 类似，不过它的所有属性都通过 `readonly` 关键字声明为只读属性。

`freezePoint` 函数接收一个 `Point` 类型参数，冻结它，然后返回冻结后的对象给调用者。因为返回的对象类型已经改变为 `FrozenPoint`，所以它的属性被静态类型定义为只读。这是为什么当我们试图给 `x` 属性重新赋值为 `42` 的时候 Typescript 会报错的原因。在运行时，这个赋值会抛 `TypeError` 异常（严格模式下）或者静默失败（非严格模式下）。

虽然上面的例子可以编译通过，并且能运行正常，但它有两个很大的缺陷：

1. **我们需要两个接口。** 除了定义 `Point` 类型，我们还需要定义 `FrozenPoint` 类型来给两个属性添加 `readonly` 修饰符。当我们修改 `Point` 的时候我们需要同时修改 `FrozenPoint`，这样做既容易出错也过于繁琐。
2. **我们需要 `freezePoint` 函数。** 对于每一个需要冻结的类型，我们都需要定义对应的包装函数来接收这个类型的对象，并返回它的冻结后类型的对象。没有映射类型的话，我们就不能静态地以泛型的方式来声明 `Object.freeze()` 的类型。

### 用映射类型来声明 Object.freeze()

我们来看下 Typescript 内置的 lib.d.ts 文件中是如何定义 `Object.freeze()` 的类型的。

```ts
/**
  * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
  * @param o Object on which to lock the attributes.
  */
freeze<T>(o: T): Readonly<T>;
```

这个方法有一个 `Readonly<T>` 返回类型——这就是个映射类型！它的定义如下：

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
```

这个语法初看可能让人有点摸不着头脑，让我们一块块来拆解它：

- 我们定义了一个 `Readonly` 泛型类型，接受一个参数，参数类型为`T`。
- 在方括号内，我们使用了 `keyof` 操作符。`keyof T` 代表了类型 `T` 的所有属性名，它是一个字符串字面量联合类型。
- 方括号中的 `in` 关键词告诉我们正在使用映射类型。`[P in keyof T]: T[P]` 意味着类型 `T` 的每一个 `P` 属性类型都应该转换为 `T[P]` 类型。如果没有 `readonly` 修饰符，这种转换后的类型和之前是一样的。
- `T[P]` 是一个查询类型，它代表了类型 `T` 的属性 `P` 的类型。
- 最后，`readonly` 修饰符使得每一个属性都转换为只读属性。

因为 `Readonly<T>` 是一个泛型，所以 `Object.freeze()` 可以正确接收我们提供的每一种类型 `T`。下面是简化后的代码：

```ts
const origin = Object.freeze({ x: 0, y: 0 })

// Error! Cannot assign to 'x' because it
// is a constant or a read-only property.
origin.x = 42
```

简单太多了！

### 映射类型语法的直觉解释

下面我尝试以另一种方式来解释映射类型是如何工作的，这一次我们使用 `Point` 类型来作为例子。注意以下内容中的符合直觉的方法只是为了解释，并没有精确还原 Typescript 中的具体算法。

我们先从一个类型别名开始：

```ts
type ReadonlyPoint = Readonly<Point>
```

我们现在可以用 `Point` 来代替泛型`Readonly<T>`中出现 `T` 类型的地方：

```ts
type ReadonlyPoint = {
  readonly [P in keyof Point]: Point[P]
}
```

既然我们知道 `T` 就是 `Point` 类型，那么我们就能推断 `keyof Point` 运算得到的字符串字面量联合类型如下：

```ts
type ReadonlyPoint = {
  readonly [P in 'x' | 'y']: Point[P]
}
```

`P` 类型代表了 `x` 和 `y` 属性，我们可以分别声明这些属性，然后去掉映射类型语法：

```ts
type ReadonlyPoint = {
  readonly x: Point['x']
  readonly y: Point['y']
}
```

最后，我们可以用 `x` 和 `y` 的具体类型来替代上面的两个查询类型，这两个类型都是 `number` 类型：

```ts
type ReadonlyPoint = {
  readonly x: number
  readonly y: number
}
```

终于弄明白了，结果得到的 `ReadonlyPoint` 类型和之前手动创建的 `FrozenPoint` 类型是安全一样的。

### 更多映射类型的例子

我们已经知道 `Readyonly<T>` 类型是内置在 lib.d.ts 文件中的。除此之外，Typescript 还定义了其他的一些映射类型，它们能够在不同的场景中派上用场。比如这些：

```ts
/**
 * Make all properties in T optional
 */
type Partial<T> = {
  [P in keyof T]?: T[P]
}

/**
 * From T pick a set of properties K
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends string, T> = {
  [P in K]: T
}
```

下面是两个你很可能用得到的映射类型：

```ts
/**
 * Make all properties in T nullable
 */
type Nullable<T> = {
  [P in keyof T]: T[P] | null
}

/**
 * Turn all properties of T into strings
 */
type Stringify<T> = {
  [P in keyof T]: string
}
```

你还可以结合不同映射类型产生各种效果：

```ts
type X = Readonly<Nullable<Stringify<Point>>>
// type X = {
//     readonly x: string | null;
//     readonly y: string | null;
// };
```

非常棒！

### 映射类型的实际使用案例

我最后想介绍下映射类型在实际使用中如何让框架或库获得更准确的类型，以此给大家带来一些启发。具体而言，我们来看看 React 和 Lodash：

- **React:** 一个组件的 `setState` 方法允许你更新整个状态或状态的一部分。你可以更新任意多你想更新的属性，这使得 `setState` 非常适合使用 `Partial<T>` 映射类型。
- **Lodash:** `pick` 工具函数允许你从一个对象中挑选出属性的子集。它会返回一个仅仅包含被选择属性的对象。这个行为可以用 `Pick<T>` 类型来定义，就如名字所示一样。

注意，在写作这篇文章的当下，相应的 DefinitelyTyped 类型声明文件中并没有添加以上的这些修改。
