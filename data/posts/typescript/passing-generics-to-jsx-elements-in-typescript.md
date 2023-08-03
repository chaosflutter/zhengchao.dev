---
title: 'TypeScript 中给 JSX 元素传递泛型'
date: '2021-05-09'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/passing-generics-to-jsx-elements-in-typescript'
---

Typescript 2.9 支持给 JSX 元素设置泛型类型参数。这意味着我们可以像下面这样在 TSX 文件中写组件：

```ts
function Form() {
  // ...

  return (
    <Select<string> options={targets} value={target} onChange={setTarget} />
  )
}
```

为了理解为什么泛型 JSX 元素是有用的（以及为什么我们通常并不需要显式地把类型参数写出来），我们先来写一个 `Select` 组件，然后围绕这个组件迭代升级它的静态类型。

### 步骤一：在 Javascript/JSX 中实现 Select

让我们使用 React 实现一个可复用的 Select 组件。我们的组件应该渲染出原生的 `<select>` 元素，并且有一组 `<option>` 子元素：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/select_component-2x.r3ukgn6ebw.imm.png)

我们需要给 `Select` 组件传递 `options` 属性，以及当前选中的 `value` 和 `onChange` 回调函数。上面截图组件的代码如下：

```ts
function Form() {
  const targets = [
    { value: 'es3', label: 'ECMAScript 3' },
    { value: 'es5', label: 'ECMAScript 5' },
    { value: 'es2015', label: 'ECMAScript 2015' },
    { value: 'es2016', label: 'ECMAScript 2016' },
    { value: 'es2017', label: 'ECMAScript 2017' },
    { value: 'es2018', label: 'ECMAScript 2018' },
    { value: 'es2019', label: 'ECMAScript 2019' },
  ]

  const [target, setTarget] = useState('es2019')

  return <Select options={targets} value={target} onChange={setTarget} />
}
```

我们该如何在普通的 Javascript/JSX 中实现 `Select` 组件？以下是第一次尝试：

```ts
function Select(props) {
  function handleOnChange(e) {
    props.onChange(e.currentTarget.value)
  }
  return (
    <select value={props.value} onChange={handleOnChange}>
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
```

我们的组件接收一些属性，然后返回包含了通过 `options` 属性设置的所有选项的 `<select>` 元素。我们还定义了一个 `handleOnChange` 函数，它会在每次选中值改变时被触发，然后调用 `onChange` 回调并传入选中的值。

组件能和预期一样工作。现在我们尝试给它添加静态类型。

### 步骤二：在 TypeScript/TSX 中实现 Select

我们先来创建一个类型，用来表示单个选项的类型。我们把它命名为 `Option`，并且定义了两个属性，一个是选项的值，另一个是我们需要展示的 label：

```ts
type Option = {
  value: string
  label: string
}
```

这很简单。接下去，我们来给 `Select` 组件的属性定义一个类型。我们需要一个 `options` 属性，它会使用我们刚刚定义的 `Option` 类型；一个 `value` 属性代表当前被选中的值；以及一个 `onChange` 回调，每当选中值修改时被调用：

```ts
type Props = {
  options: Option[]
  value: string
  onChange: (value: string) => void
}
```

最后，我们将 `Props` 付诸使用，并且给我们的 `handleOnChange` 函数的参数 `e` 添加类型标注：

```ts
function Select(props: Props) {
  function handleOnChange(e: React.FormEvent<HTMLSelectElement>) {
    props.onChange(e.currentTarget.value)
  }
  return (
    <select value={props.value} onChange={handleOnChange}>
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
```

我们现在有了一个完全实现静态类型的 React 组件。它要求所有的选项都需要设置 `string` 类型的值，这个约束在现实的应用中限制可能过于严格（或者完全没有，如果是这种场景，我们可以就此打住不继续展开了）。

### 步骤三：支持数字类型的选项值

虽然字符串类型的值是常见的使用场景，但它并不是唯一可能的选项值类型。我们很可能需要 `Select` 组件接收数字类型的选项值：

```ts
function Form() {
  const targets = [
    { value: 3, label: 'ECMAScript 3' },
    { value: 5, label: 'ECMAScript 5' },
    { value: 2015, label: 'ECMAScript 2015' },
    { value: 2016, label: 'ECMAScript 2016' },
    { value: 2017, label: 'ECMAScript 2017' },
    { value: 2018, label: 'ECMAScript 2018' },
    { value: 2019, label: 'ECMAScript 2019' },
  ]

  const [target, setTarget] = useState(2019)

  return <Select options={targets} value={target} onChange={setTarget} />
}
```

注意我已经用数字替换了字符串类型的值，包括传给 `useState` Hook 的初始值。

在我们更新 `Select` 组件的类型之前，让我们先给 `handleOnChange` 函数添加非字符串选项值的支持。当前，它只能接受字符串类型的值。`e.currentTarget.value` 永远是一个字符串，即便我们给我们的选项设置了数字类型的值。

好消息是，修改并不难，且相当简单。我们可以不用读取 `e.currentTarget.value` 然后把它直接传给 `onChange` 回调，相反的，我们可以通过 `e.currentTarget.selectedIndex` 属性来获取选中选项的索引，然后通过 `options` 数组来获取到对应索引中的选项值，并传递给 `onChange`：

```ts
function Select(props: Props) {
  function handleOnChange(e: React.FormEvent<HTMLSelectElement>) {
    const { selectedIndex } = e.currentTarget
    const selectedOption = props.options[selectedIndex]
    props.onChange(selectedOption.value)
  }
  return (
    <select value={props.value} onChange={handleOnChange}>
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
```

这种方法之所以能生效，是因为我们将 `options` 数组中的每一项都按顺序渲染出一个 `<option>` 元素，并且没有额外添加 `<option>` 元素。

我们已经修复了 `Select` 组件的实现，现在我们来修复它的类型。我们现在会得到一个类型错误，因为我们传递给 `value` 属性（期望是 `string` 类型）的 `target` 是数字类型。

让我们将 `value` 属性的类型从 `string` 修改为 `string | number` 类型来支持数字类型的值：

```ts
type OptionValue = string | number

type Option = {
  value: OptionValue
  label: string
}

type Props = {
  options: Option[]
  value: OptionValue
  onChange: (value: OptionValue) => void
}
```

注意我增加了一个类型别名叫 `OptionValue`，这样我们不用在很多地方重复写联合类型 `string | number`。

不幸的是，我们的 `Props` 类型现在并不太合适。我们的选项值现在被定义为 `string | number` 类型，这意味着我们的 `onChange` 回调也会接收 `string | number` 类型的值。但这个类型并没有很好地反映 `Select` 组件的行为：

- 如果我们传的选项值类型是 `string`，`onChange` 回调应该接收 `string` 类型的值。
- 如果我们传的选项值类型是 `number`，`onChange` 回调应该接收 `number` 类型的值。

换句话说，我们在这个过程中丢失了类型信息。这会在我们使用这个参数的时候产生问题，比如当们调用 `useState` Hook 返回的 `setTarget` 函数的时候：

- 当我们使用 `"es2019"` 作为初始值调用 `userState` 的时候，它是一个字符串，Typescript 推断 `target` 应该是类型 `string`。
- 当我们使用 `2019` 作为初始值调用 `userState` 的时候，它是一个数字，Typescript 推断 `target` 应该是类型 `number`。

不管哪种情况，`string | number` 类型的值都不能赋值给 `string` 或者 `number`。Typescript 因此会给我们 `Select` 组件的 `TypeScript` 属性报一个类型错误：

```
Type 'number' is not assignable to type 'SetStateAction'.
```

所以我们究竟该如何恰当地给 React 组件添加类型？答案是泛型。

### 步骤四：使用泛型确定精确的属性类型

我们来使用泛型 `T` 来替代到处使用的 `string | number` 类型。我们通过给 `Option` 添加类型参数使得它变为泛型。然后我们可以使用类型 `T` 作为属性 `value` 的类型：

```ts
type OptionValue = string | number

type Option<T extends OptionValue> = {
  value: T
  label: string
}
```

注意我们限制类型参数 `T` 需要继承于 `OptionValue` 类型。换句话说，我们可以给泛型 `T` 设置任何类型，只要它能赋值给 `string | number`，这包括：

- `string` 类型
- `number` 类型
- 字符串字面量类型
- 数字字面量类型
- `never` 类型，以及
- 以上类型的任意联合类型

现在 `Option` 类型已支持泛型，当我们在 `Props` 类型的 options 属性中使用它的时候，我们需要给它设置一个类型参数。因此，我们也应该需要让 `Props` 支持泛型。再一次，我们引入了泛型类型参数 `T`，并且也将它用于 `value` 和 `onChange` 属性：

```ts
type Props<T extends OptionValue> = {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}
```

现在 `Props` 是泛型类型了，所以我们需要在 `Select` 组件使用 `Props` 类型的时候提供类型参数 `T`。同时，我们需要添加 `extends OptionValue` 限制，这样我们可以将 `T` 传递给 `Props<T>`——以下是完整代码：

```ts
function Select<T extends OptionValue>(props: Props<T>) {
  function handleOnChange(e: React.FormEvent<HTMLSelectElement>) {
    const { selectedIndex } = e.currentTarget
    const selectedOption = props.options[selectedIndex]
    props.onChange(selectedOption.value)
  }
  return (
    <select value={props.value} onChange={handleOnChange}>
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
```

我们已经成功地将 `Select` 变成了一个泛型函数式组件。现在 TypeScript 2.9 终于要登场了。当我们创建一个 `<Select>` 元素的时候，我们可以设置一个泛型类型：

```ts
function Form() {
  const targets = [
    { value: 'es3', label: 'ECMAScript 3' },
    { value: 'es5', label: 'ECMAScript 5' },
    { value: 'es2015', label: 'ECMAScript 2015' },
    { value: 'es2016', label: 'ECMAScript 2016' },
    { value: 'es2017', label: 'ECMAScript 2017' },
    { value: 'es2018', label: 'ECMAScript 2018' },
    { value: 'es2019', label: 'ECMAScript 2019' },
  ]

  const [target, setTarget] = useState('es2019')

  return (
    <Select<string> options={targets} value={target} onChange={setTarget} />
  )
}
```

这个语法刚接触确实有点奇怪。然而，再仔细一想，它和我们在 Typescript 其他地方设置泛型参数的语法是一致的。

现在我们将 `Select` 组件以及 `Props` 和 `Option` 类型都变成了泛型，我们的程序能通过类型检查，不再有任何类型报错，无论我们使用字符串、数字，或者两者都使用。

注意在这里我们并不需要在 JSX 元素上显式地设置泛型类型参数。Typescript 可以帮我们推断出来。通过检查 `targets` 数组中每个对象的 `value` 属性类型，Typescript 会理解我们正在使用 `string` 作为值的类型。

因为 Typescript 可以根据上下文为我们推断出类型 `string`，我们可以将 `<Select<string>` 修改回 `<Select`。下面是完整可运行的例子：

```ts
type OptionValue = string | number

type Option<T extends OptionValue> = {
  value: T
  label: string
}

type Props<T extends OptionValue> = {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

function Select<T extends OptionValue>(props: Props<T>) {
  function handleOnChange(e: React.FormEvent<HTMLSelectElement>) {
    const { selectedIndex } = e.currentTarget
    const selectedOption = props.options[selectedIndex]
    props.onChange(selectedOption.value)
  }
  return (
    <select value={props.value} onChange={handleOnChange}>
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function Form() {
  const targets = [
    { value: 'es3', label: 'ECMAScript 3' },
    { value: 'es5', label: 'ECMAScript 5' },
    { value: 'es2015', label: 'ECMAScript 2015' },
    { value: 'es2016', label: 'ECMAScript 2016' },
    { value: 'es2017', label: 'ECMAScript 2017' },
    { value: 'es2018', label: 'ECMAScript 2018' },
    { value: 'es2019', label: 'ECMAScript 2019' },
  ]

  const [target, setTarget] = useState('es2019')

  return <Select options={targets} value={target} onChange={setTarget} />
}
```

好了，我们最终完成了这个支持静态类型的 `Select` 组件，可以给 JSX 元素添加泛型的类型参数。
