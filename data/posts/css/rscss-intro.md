---
title: 'RSCSS，简单有效的CSS命名规范'
date: '2017-10-27'
topics: ['css']
---

> Reasonable System for CSS Stylesheet Structure.
> A set of simple ideas to guide your process of building
> maintainable CSS

`RSCSS`不是什么框架，而是一套可以帮助你写出可维护 css 代码的  想法，或说规范。

### 一、组件-Components

以组件化的方式思考。把 UI 上每一块内容  抽象成一个“component”，如  下图所示：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/component-example.png)

#### 如何命名组件

使用至少两个单词来命名组件，并且单词之间使用连字符`-`连接，举例如下：

- 一个点赞按钮（`.like-button`）
- 一个搜索表单（`.search-form`）
- 一个新闻文章卡片 （`.article-card`）

### 二、元素-Elements

元素包含在组件之内，如  下图所示：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/component-elements.png)

#### 如何命名元素

以一个单词命名元素。

```css
.search-form {
  > .field {
    /* ... */
  }
  > .action {
    /* ... */
  }
}
```

#### 元素选择器

 尽可能使用子元素选择器（直接后代选择器）`>`。这比后代选择器更精确，可以避免  意外的样式干扰，执行性能上也会更好。

```css
.article-card {
  .title {
    /* okay */
  }
  > .author {
    /* ✓ better */
  }
}
```

#### 拼接多个单词


对于某些必须使用两个单词表达的元素，直接拼接单词而不使用连字符或下划线。

```css
.profile-box {
  > .firstname {
    /* ... */
  }
  > .lastname {
    /* ... */
  }
  > .avatar {
    /* ... */
  }
}
```

####  避免标签选择器

 尽可能使用 class 选择器。标签选择器虽然也能完成工作，但性能上会差一些，并且没有 class 选择器那么具有描述性。

```css
.article-card {
  > h3 {
    /* ✗ avoid */
  }
  > .name {
    /* ✓ better */
  }
}
```

### 三、变体-Variants

组件和元素都有可能存在变体，如下图所示：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/component-modifiers.png)

#### 如何命名变体

在变体的 class 名之前加上连字符`-`前缀。

```css
.like-button {
  &.-wide {
    /* ... */
  }
  &.-short {
    /* ... */
  }
  &.-disabled {
    /* ... */
  }
}
```

#### 元素变体

元素也可能有变体。

```css
.shopping-card {
  > .title {
    /* ... */
  }
  > .title.-small {
    /* ... */
  }
}
```

#### 选择连字符`-`作变体前缀的原因

-  能够清晰地和元素命名区别开。
- class 命名只能以字母，`-`或者`_`开头。
- 连字符`-`比下划线`_`更方便键盘输入。
- 类似于 UNIX 命令(`gcc -O2 -Wall -emit-last`)。

### 四、嵌套组件-Nested components

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/component-nesting.png)

```html
<div class="article-link">
  <div class="vote-box">...</div>
  <h3 class="title">...</h3>
  <p class="meta">...</p>
</div>
```

有时候不可避免要嵌套组件。以下是一些好的做法建议。

#### 使用变体

嵌套在一个组件内的组件外观可能会和独立使用时有所区别。避免在容器组件内直接修改该组件的样式.

```css
.article-header {
  > .vote-box > .up {
    /* ✗ 避免这样做 */
  }
}
```

更好的替代方案是，给组件增加一个变体 class，并且应用该 class。如下所示：

```html
<div class="article-header">
  <div class="vote-box -highlight">...</div>
  ...
</div>
```

```css
.vote-box {
  &.-highlight > .up {
    /* ... */
  }
}
```

#### 简化嵌套组件

有时，嵌套组件会导致 html 代码臃肿丑陋。

```html
<div class="search-form">
  <input class="input" type="text" />
  <button class="search-button -red -large"></button>
</div>
```

你可以使用 css 预处理器的`@extend`语法来优化代码。

```html
<div class="search-form">
  <input class="input" type="text" />
  <button class="submit"></button>
</div>
```

```css
.search-form {
  > .submit {
    @extend .search-button;
    @extend .search-button.-red;
    @extend .search-button.-large;
  }
}
```

### 五、布局设计-Layouts

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/layouts.png)

#### 避免  一些布局属性

组件应该能够尽可能多地在各种上下文中复用。因为最好避免在组件上使用以下一些属性。

- Positioning (position, top, left, right, bottom)
- Floats (float, clear)
- Margins (margin)
- Dimensions (width, height) \*

#### 固定的大小

对于用户头像或者 logo 之类的组件可以使用固定的大小。

#### 在父容器内使用布局

如果你需要使用以上的一些属性来完成工作，可以在组件所在的上下文环境中使用布局属性。在下面的  示例代码中，`width` 和 `float`属性都是应用在`list`组件内的，而不是直接修改组件自身。

```css
.article-list {
  & {
    @include clearfix;
  }

  > .article-card {
    width: 33.3%;
    float: left;
  }
}

.article-card {
  & {
    /* ... */
  }
  > .image {
    /* ... */
  }
  > .title {
    /* ... */
  }
  > .category {
    /* ... */
  }
}
```

### 六、帮助类-Helpers

对于一些常用样式，比如左浮动有浮动，可以写一些通用的帮助类。但这些类名应该组织在一个单独的文件中。这些类名以下划线`_`开头，通常需要在属性后加`!important`标记。请谨慎使用这些帮助类。

```css
._unmargin {
  margin: 0 !important;
}
._center {
  text-align: center !important;
}
._pull-left {
  float: left !important;
}
._pull-right {
  float: right !important;
}
```

#### 如何命名帮助类

使用下划线`_`前缀来命名。这可以使帮助类和组件变体的类名有明显的区别。并且，下划线看上去有点丑，这是有意为之的，目的是告诫开发者不要过多地使用帮助类。

#### 如何组织帮助类

把所有的帮助类放在一个叫`helpers`的文件中。虽然你可以把它们分散在多个文件中，但请记住尽可能地减少帮助类的体量。

### 七、CSS 的组织结构-CSS structure

#### 一个组件对应一个文件

对于每一个组件，相关的  样式放在各自独立的文件中。

```css
/* css/components/search-form.scss */
.search-form {
  > .button {
    /* ... */
  }
  > .field {
    /* ... */
  }
  > .label {
    /* ... */
  }

  // variants
  &.-small {
    /* ... */
  }
  &.-wide {
    /* ... */
  }
}
```

####  使用通配符

在 sass，stylus 等预编译语言中，可以使用通配符引入所有组件样式。

```css
@import 'components/*';
```

#### 避免多层嵌套

使用最多一层嵌套。因为  过多的嵌套容易引起混乱以致难以维护。

```css
/* ✗ Avoid: 3 levels of nesting */
.image-frame {
  > .description {
    /* ... */

    > .icon {
      /* ... */
    }
  }
}

/* ✓ Better: 2 levels */
.image-frame {
  > .description {
    /* ... */
  }
  > .description > .icon {
    /* ... */
  }
}
```

### 八、和 BEM 的比较

BEM 很不错，但有些人可能会讨厌它不合常规的语法。RSCSS 基本符合 BEM 的思想，但语法上有区别。

```html
<!-- BEM -->
<form class="site-search site-search--full">
  <input class="site-search__field" type="text" />
  <button class="site-search__button"></button>
</form>
```

```html
<!-- rscss -->
<form class="site-search -full">
  <input class="field" type="text" />
  <button class="button"></button>
</form>
```

### 九、总结

- 以组件的方式去思考，并且用两个单词命名组件（.screenshot-image）
- 组件  拥有元素，使用一个单词命名元素（.blog-post > .title）
- 使用带连字符前缀的类来命名变体（.shop-banner.-with-icon）
- 组件可以嵌套
- 为了让事情更简单，你可以扩展自己的规则
