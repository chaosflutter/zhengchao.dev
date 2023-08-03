---
title: '用好 TypeScript，请再深入一些'
date: '2022-09-09'
topics: ['typescript']
---

TypeScript 已经成为前端编程语言的事实标准。但我从大量的 Code Review 和面试经历中发现，真正能深入使用 TypeScript 的开发其实并不多。如果你不知道 `ReturnType<T>` 的作用和实现，或许这篇文章也适合你。

当然，我们花大量时间去学习一门语言或技术并非为了追求奇技淫巧，而是出于务实的态度。如果你看过大量使用 `any` 的 TypeScript 的代码，你肯定会感叹“那还不如不用”。在此种情况下，使用 TypeScript 的成本大于它所带来的收益。

如何充分利用好 TypeScript 的语言特性，帮助自己写出更健壮、类型提示更友好的代码？那就需要"再深入一些"。

## 一个简单的例子

假设有以下的 TypeScript 代码，你会如何添加类型信息呢？

```Typescript
function prop(obj, key) {
  return obj[key];
}
```

上面的函数接收一个对象和一个 key，返回对应的属性值。我们也许可以尝试这样写：

```Typescript
function prop(obj: {}, key: string) {
  return obj[key];
}
```

我们限定了 obj 必须是个对象，key 必须是一个字符串，但返回值呢？假如我们这样使用该函数：

```Typescript
const todo = {
  id: 1,
  text: "Buy milk",
  due: new Date(2016, 11, 31),
};

const id = prop(todo, "id"); // any
const text = prop(todo, "text"); // any
const due = prop(todo, "due"); // any
```

因为 JavaScript 是高度动态的语言，我们没办法预知 obj 的具体类型和 key 的值，也就没办法知道返回值的类型，所以 TypeScript 将返回值推断为 `any`。如果我们想要得到更精确的返回值类型，那该如何解？

> 想一想：上面我们用 `{}` 来约束 obj 必须是一个对象，那你知道在 TypeScript 中，`{}`、`object`、`Object` 三种类型的区别吗，它们分别用在什么场景？

### keyof 操作符

keyof 是 TypeScript 2.1 版本增加的操作符，我们用它来解决上面的问题。

```Typescript
interface Todo {
  id: number;
  text: string;
  due: Date;
}
type TodoKeys = keyof Todo; // "id" | "text" | "due"
```

从上面的示例代码中可以看到，keyof 作用于类型 Todo，可以得到 Todo 中所有 key 的联合类型，即上面的 `"id" | "text" | "due"`。有了 keyof 的助力，我们可以改写 prop 方法：

```Typescript
function prop<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
```

上面的函数签名中，key 的类型 K 不再是任意的字符串，而是要求必须存在于 obj 对象属性名的联合类型中。

> 想一想：停下来思考一下 `K extends keyof T` 这种写法，尝试用自己的话描述它的含义。如果说不清楚，原因很可能是对 `extends` 关键字的理解不够清晰。

上面的代码中，obj 的类型是 T，key 的类型是 K，那么返回值 obj[key] 的类型会被推断为 T[K]，在 TypeScript 中这被称为 `Indexed Access Types`。现在我们重新通过 prop 函数来访问 todo 的属性：

```Typescript
const todo = {
  id: 1,
  text: "Buy milk",
  due: new Date(2016, 11, 31),
};

const id = prop(todo, "id"); // number
const text = prop(todo, "text"); // string
const due = prop(todo, "due"); // Date
```

可以看到，现在返回值类型能被正确推断，而不是笼统的 any 类型。另外，正因为我们限定 K 必须存在于 obj 属性名的联合类型中，所以传入其他 key 值，TS 会报错，代码会更健壮：

```TypeScript
const none = prop(todo, 'none');

// [ts] Argument of type 'none' is not assignable to parameter of type '"id" | "text" | "due"'.
```

> 想一想：如何用刚学的这些知识点，来给 JavaScript 语言内置的 Object.entries() 方法补充类型签名？聪明的你可以打开 VSCode 看一看。

## 第二个简单的例子

你觉得下面的代码存在什么问题?

```TypeScript
interface Point {
  x: number;
  y: number;
}

interface FrozenPoint {
  readonly x: number;
  readonly y: number;
}

function freezePoint(p: Point): FrozenPoint {
  return Object.freeze(p);
}

const origin = freezePoint({ x: 0, y: 0 });

// Error! Cannot assign to 'x' because it
// is a constant or a read-only property.
origin.x = 42;
```

表面上看我们确实实现了想要的效果，我们冻结了一个对象，修改冻结对象的属性会报错，一切似乎都没问题。但真的吗？

至少存在两个缺陷：

1. 我们需要定义两个 interface，并且每当 Point 类型有修改，对应的 FrozenPoint 也要修改，这样做不但修改成本高，也很容易遗漏导致出错；
2. 对于每一个需要 Object.freeze 的对象，我们都要封装一个类似 freezePoint 这样的函数来得到正确的返回值类型，实在太繁琐。

那解法又是什么?

### 映射类型

TypeScript 中的映射类型允许你通过映射已有类型的每个属性来创建新的类型。我们直接来看 Object.freeze() 方法的类型签名：

```TypeScript
freeze<T>(o: T): Readonly<T>;
```

这里的 `Readonly<T>` 返回类型就是一个映射类型，它的定义如下：

```TypeScript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

在讲述过第一个例子后，你对上面代码中的 keyof T，T[P] 写法应该不再陌生，剩余的关键点是属性方括号中的 `in` 操作符，正是它告诉我们这是一个映射类型。

`[P in keyof T]: T[P]` 意味着类型 T 的每一个 P 属性类型都应该转换为 T[P] 类型。如果没有 readonly 修饰符，这种转换后的类型和之前是一样的。

> 想一想：readonly 修饰符可以约束属性是只读的，那你知道 TypeScript 中还有哪些属性修饰符吗？

如果还是不能理解上面的代码，可以看看下面的转换过程(转换过程只是为了解释，并非 TypeScript 中的具体算法)：

```TypeScript
// 泛型参数 T 我们传入了上面定义的 Point 类型，得到 ReadonlyPoint 类型
type ReadonlyPoint = Readonly<Point>;

// 等价于
type ReadonlyPoint = {
  readonly [P in keyof Point]: Point[P];
};

// 进一步，我们展开 keyof  Point
type ReadonlyPoint = {
  readonly [P in "x" | "y"]: Point[P];
};

// P 代表了 x 和 y 属性，我们可以分别声明，进而去掉映射类型语法：
type ReadonlyPoint = {
  readonly x: Point["x"];
  readonly y: Point["y"];
};

// 最后我们可以用 number 代替 T[P] 形式的查询类型:
type ReadonlyPoint = {
  readonly x: number;
  readonly y: number;
};

而这就是我们最初代码中定义的 FrozenPoint 类型。

```

从上面的代码中，我们得到的 ReadonlyPoint 和 FrozenPoint 类型是完全一样的。但使用 `Readonly<T>` 映射类型避免了上文中提到的两个问题。

> 想一想：`Readonly<T>` 映射类型是 TS 的内置类型，除此之外，TS 还定义了哪些映射类型？你能整理出所有的内置映射类型并弄明白它们的作用和实现吗？

## 回到最初的问题

文章开头我们有提到 `ReturnType<T>`，它的作用和实现是什么？这次我们不卖关子，直接给出代码。

它的用法：

```Typescript
type A = ReturnType<() => string>; // string
type B = ReturnType<() => () => any[]>; // () => any[]
type C = ReturnType<typeof Math.random>; // number
type D = ReturnType<typeof Array.isArray>; // boolean
```

它的定义：

```Typescript
/**
 * Obtain the return type of a function type
 */
type ReturnType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : any;
```

从用法中我们可以看到，ReturnType 接收一个函数类型参数，然后推断出该函数类型的返回值类型，比如它推断出 Math.random 函数的返回值类型是 number。

> 想一想：为什么是 `ReturnType<typeof Math.random>`，而不是 `ReturnType<Math.random>` ?

我们再来看看它的实现。乍看之下你可能会觉得很复杂，因为它涉及到了 Typescript 这门语言中最难的部分，也就是所谓的类型编程。Typescript 的类型编程本身是图灵完备的，比如你可以使用三元运算符来决定使用哪个类型。

```TypeScript
T extends U ? X : Y
```

上面的表达式，在 TS 中被称为条件类型。条件类型使用了熟悉的 ... ? ... : ... 语法，它在 Javascript 中被用于条件表达式。T, U, X 和 Y 代表了任意类型。 其中 T extends U 描述了类型关系测试。如果条件满足，类型 X 被选择，否则类型 Y 被选择。

如果使用人类语言，条件类型可以描述如下：如果类型 T 可以赋值给 U，选择类型 X，否则选择类型 Y。

此时我们重新回过头来看 `ReturnType<T>` 的实现，是不是更容易理解了？ReturnType 的泛型参数我们约束为函数类型，如果 T 真满足约束，那么我们可以通过 infer 关键字推断函数返回值类型 R，否则就返回 any 类型。

> 想一想：我们既然可以通过条件类型推断函数的返回值类型，那是不是同样可以推断函数的入参类型呢？聪明的你可以在 VSCode 里试试 `Parameters<T>` 类型。

既然我们已经知道了映射类型和条件类型，那么两者结合起来怎么样？

```TypeScript
type NonNullablePropertyKeys<T> = {
  [P in keyof T]: null extends T[P] ? never : P;
}[keyof T];
```

你能按照第二个例子中的推导过程，推导以下代码中 NonNullableUserPropertyKeys 的最终类型吗？

```TypeScript
type User = {
  name: string;
  email: string | null;
};

type NonNullableUserPropertyKeys = NonNullablePropertyKeys<User>;
```

> 想一想： `NonNullablePropertyKeys<T>` 的定义中用到了 never 关键字，你知道它的含义吗？另外，你能用自己的话说清楚 any 和 unknown 类型的区别吗？

## 结语

这篇文章并不想就 TypeScript 的某个主题深入讲解，而是提出这样一个事实：TypeScript 的类型使用远比想象中复杂。为什么会这样？因为 JavaScript 是动态的，很多类型只能通过文中提到一些方法来描述。

当然并不是说你掌握了 keyof 操作符、映射类型、条件类型就万事大吉了，如果你真的想使用好 TypeScript，必须再深入一些，彻底掌握 TS 的类型编程。

我这里推荐两份学习资料：

1. 我之前翻译的 TypeScript Evolution 系列，讲解了很多 TypeScript 2.0 以来的重要特性，文章中的例子也都来自于此，掘金专栏：https://juejin.cn/column/7026521661352607781
2. 神光的 "TypeScript 类型体操通关秘籍" 小册，小册地址：https://juejin.cn/book/7047524421182947366

当你能轻松回答所有“想一想”中的问题，你会感受到成长的喜悦，祝你学习愉快！

参考资料：

1. https://mariusschulz.com/blog/keyof-and-lookup-types-in-typescript
2. https://mariusschulz.com/blog/conditional-types-in-typescript
3. https://mariusschulz.com/blog/mapped-types-in-typescript
