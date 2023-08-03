---
title: 'TypeScript 中的 object 类型'
date: '2020-12-28'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/the-object-type-in-typescript'
---

Typescript 2.2 引入了一个新类型叫 `object`。它代表了任意的非原始类型。下面的这些类型在 Javascript 中被认为是原始类型：

- string
- boolean
- number
- bigint
- symbol
- null
- undefined

其他所有的类型都被认为是非原始类型。所以新的 `object` 代表的类型表示如下：

```ts
// All primitive types
type Primitive = string | boolean | number | bigint | symbol | null | undefined

// All non-primitive types
type NonPrimitive = object
```

让我们看一下 `object` 如何能够让我们写出更准确的类型声明。

### 使用 object 声明类型

随着 Typescript 2.2 的发布，标准库已经更新了类型声明以支持 `object` 类型的使用。举个例子，`Object.create()` 和 `Object.setPrototypeOf()` 方法现在将 `object | null` 作为它们的原型参数：

```ts
interface ObjectConstructor {
  /**
   * Creates an object that has the specified prototype or that has null prototype.
   * @param o Object to use as a prototype. May be null.
   */
  create(o: object | null): any

  /**
   * Sets the prototype of a specified object o to  object proto or null. Returns the object o.
   * @param o The object to change its prototype.
   * @param proto The value of the new prototype or null.
   */
  setPrototypeOf(o: any, proto: object | null): any

  // ...
}
```

如果把一个原始类型的值作为原型参数传给 `Object.setPrototypeOf()` 或者 `Object.create()` 都会导致运行时 `TypeError` 异常。现在 Typescript 可以在编译时捕获这些问题。

```ts
const proto = {}

Object.create(proto) // OK
Object.create(null) // OK
Object.create(undefined) // Error
Object.create(1337) // Error
Object.create(true) // Error
Object.create('oops') // Error
```

另一个使用 `object` 类型的场景是 ES2015 中引入的 `WeakMap` 数据结构。它的 key 必须是对象而不能是原始类型的值。现在这个约束已经可以在类型定义中反映出来：

```ts
interface WeakMap<K extends object, V> {
  delete(key: K): boolean
  get(key: K): V | undefined
  has(key: K): boolean
  set(key: K, value: V): this
}
```

### object vs. Object vs. {}

可能会有一些困扰，Typescript 定义了一些看上去类似的类型，但实际的含义并不同：

- `object`
- `Object`
- `{}`

上面我们已经讲解了新的 `object` 类型。现在我们来看一看 `Object` 和 `{}` 代表了什么。

### Object 类型

Typescript 定义了一个和新的 `object` 类型命名几乎一样的类型，也就是 `Object` 类型。 小写的`object`
代表了所有非原始类型，大写的 `Object` 代表了所有 Javascript 对象都有的一些公共能力。比如 `toString()` 和 `hasOwnProperty()` 方法。

在 Typescript 内置的 lib.es6.d.ts 文件中，`Object` 对象被定义如下：

```ts
interface Object {
  // ...

  /** Returns a string representation of an object. */
  toString(): string

  /** Returns a date converted to a string using the current locale. */
  toLocaleString(): string

  /** Returns the primitive value of the specified object. */
  valueOf(): Object

  /**
   * Determines whether an object has a property with the specified name.
   * @param v A property name.
   */
  hasOwnProperty(v: string): boolean

  /**
   * Determines whether an object exists in another object's prototype chain.
   * @param v Another object whose prototype chain is to be checked.
   */
  isPrototypeOf(v: Object): boolean

  /**
   * Determines whether a specified property is enumerable.
   * @param v A property name.
   */
  propertyIsEnumerable(v: string): boolean
}
```

### 空类型 {}

还有一个类似的类型：`{}`，空类型。它代表了一个自身没有任何成员的对象。如果你访问这个对象上的任意属性，Typescript 会报编译时错误：

```ts
// Type {}
const obj = {}

// Error: Property 'prop' does not exist on type '{}'.
obj.prop = 'value'
```

不过，你依然可以访问所有定义在 `Object` 类型上的属性和方法，它们是通过 Javascript 原型链间接访问到的：

```ts
// Type {}
const obj = {}

// "[object Object]"
obj.toString()
```
