---
title: 'TypeScript 中的标签联合类型'
date: '2020-10-04'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/tagged-union-types-in-typescript'
---

> 译者注：tagged union types 没有比较好的中文翻译，维基百科翻译为标签联合，也称可辨识联合（discriminated union）或者变体类型（variant type）。它是一种数据结构，很像联合（C/C++程序员一定知道这个结构）。它有一个字段（或称为属性）用于识别当前结构的确切类型。

Typescript 2.0 实现了一个相当有用的特性：标签联合类型（tagged union types），类似其他语言中你可能已经知道的 sum types 或 discriminated union types。标签联合类型是一种特殊的联合类型，它的成员类型中都定义了一个字面量类型属性，用于辨识和区分。

上面的定义还是过于抽象，我们来看两个具体的例子，它们展示了如何在实际场景中使用标签联合类型。

### 用标签联合类型定义支付方式

思考如何定义以下这些供用户在系统中选择的支付方式：

- Cash，不包含其他额外信息
- PayPal，包含了给定的邮件地址
- Credit card，包含了卡号和安全码

对于以上的每一种支付方式，我们都创建了一个 Typescript 接口：

```ts
interface Cash {
  kind: 'cash'
}

interface PayPal {
  kind: 'paypal'
  email: string
}

interface CreditCard {
  kind: 'credit'
  cardNumber: string
  securityCode: string
}
```

需要注意的是，除了其他必要的信息，每种类型都包含了一个`kind`属性——也就是所谓的可辨识（discriminant）属性。这里它是一个字符串字面量类型。我们很快会深入了解这个可辨识属性。

现在我们先来定义`PaymentMethod`类型，它是我们刚刚定义的三种类型的联合类型。如此，我们就明确了程序中任何一种支付方式都必须是这三种方式中的一种。

```ts
type PaymentMethod = Cash | PayPal | CreditCard
```

既然类型已经定义好，我们就来声明一个函数，它能接收一种支付方式，并且返回它的清晰可读的描述：

```ts
function describePaymentMethod(method: PaymentMethod) {
  switch (method.kind) {
    case 'cash':
      // Here, method has type Cash
      return 'Cash'

    case 'paypal':
      // Here, method has type PayPal
      return `PayPal (${method.email})`

    case 'credit':
      // Here, method has type CreditCard
      return `Credit card (${method.cardNumber})`
  }
}
```

首先请注意，这个函数的签名非常简洁，它只包含了很少的类型标识——只有`method`入参标注了类型。除此之外，函数体完全是 ES2015 的代码。

在 `switch` 的每个 case 从句中，Typescript 编译器会自动把联合类型收窄为它的一个成员类型。比如，在`paypal` case 从句中，`method` 入参的类型从`PaymentMethod`收窄为`Paypal`。因此，我们可以访问`email`属性而不用添加任何的类型断言。

本质上，编译器跟踪了程序的控制流来收窄标签联合类型。除了`switch`语句，它还能理解条件语句，类型推断效果就和赋值语句、返回语句一样。

```ts
function describePaymentMethod(method: PaymentMethod) {
  if (method.kind === 'cash') {
    // Here, method has type Cash
    return 'Cash'
  }

  // Here, method has type PayPal | CreditCard

  if (method.kind === 'paypal') {
    // Here, method has type PayPal
    return `PayPal (${method.email})`
  }

  // Here, method has type CreditCard
  return `Credit card (${method.cardNumber})`
}
```

这种程度的控制流分析使得使用标签联合类型变得更得心应手。我们只需要写很少的 Typescript 类型语法，就能获得类型检查和代码自动补全。这真是一种愉快的编辑体验。

### 用标签联合类型定义 Redux Actions

标签联合类型的另一个用武之地是在 Typescript 应用中使用 Redux 的时候。我们来构造另一个简单的例子，其中包括一个数据模型，两个 action，一个 reducer——你很可能猜到了，没错，它就是一个 todo 应用。

这里有一个简化的`Todo`类型代表了一个简单的 todo。注意我们使用了`readonly`修饰符让 Typescript 编译器帮我们检查以避免意外的属性修改。

```ts
interface Todo {
  readonly text: string
  readonly done: boolean
}
```

用户可以添加新的 todo，并且可以修改 todo 的完成状态。为了满足这些需求，我们需要两个 Redux actions，我们可以这样定义：

```ts
interface AddTodo {
  type: 'ADD_TODO'
  text: string
}

interface ToggleTodo {
  type: 'TOGGLE_TODO'
  index: number
}
```

参考上一个例子，我们可以把 Redux action 定义为我们应用支持的多个 action 类型的联合类型：

```ts
type ReduxAction = AddTodo | ToggleTodo
```

在这个例子中，`type` 属性就是可辨识属性，并且遵守了 Redux 中的命名规约。现在我们来写一个 reducer，把上面的两个 actions 都用上：

```ts
function todosReducer(
  state: ReadonlyArray<Todo> = [],
  action: ReduxAction
): ReadonlyArray<Todo> {
  switch (action.type) {
    case 'ADD_TODO':
      // action has type AddTodo here
      return [...state, { text: action.text, done: false }]

    case 'TOGGLE_TODO':
      // action has type ToggleTodo here
      return state.map((todo, index) => {
        if (index !== action.index) {
          return todo
        }

        return {
          text: todo.text,
          done: !todo.done,
        }
      })

    default:
      return state
  }
}
```

又一次，只有函数签名包含了类型标识。其他的代码都是纯 ES2015，并不是 Typescript 中特有的写法。

就和上个例子一样，基于 `type` 属性，我们可以在不修改原有状态的前提下计算出新的状态。在`switch`的 case 从句中，我们可以访问某个具体成员的`text`和`index`属性，而不用任何类型断言。
