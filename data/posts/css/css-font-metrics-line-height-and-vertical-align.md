---
title: '深入理解CSS：字体规格，line-height 和 vertical-align'
date: '2020-07-13'
topics: ['css']
origin: 'https://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align'
---

`line-height` 和 `vertical-align` 是简单的 CSS 属性。如此简单以至于我们大多数人都自信已经完全理解它们以及如何使用它们。但真的并非如此。它们真的很复杂，也许是最难以理解的属性，因为它们是某个很少为人所知的 CSS 特性——行内格式化上下文（inline formatting context）——的主要组成部分。

举个例子，`line-height` 可以被设置为一个具体的长度，或者无单位的值，不过它的默认值是 `normal`。但， `normal` 究竟是什么？我们经常会读到说它应该是 1，或可能是 1.2，但就连[ CSS 规范对于这一点也没有清晰的说明](https://www.w3.org/TR/CSS2/visudet.html#propdef-line-height)。我们知道无单位的 `line-height` 是相对 `font-size` 的，但问题是不同的字体族 `font-size: 100px` 的表现并不一致，所以 `line-height` 是永远相同还是不同的呢？它取值真的在 1 和 1.2 之间吗？然后说到 `vertical-align`，它对于 `line-height` 又意味着什么呢？

让我们一起来深入理解并不那么简单的 CSS 机制...

### 让我们先来谈一谈 `font-size`

看下面这个简单的 HTML 代码，一个 `<p>` 标签包含了 3 个 `<span>` 标签，并且每一个的 `font-family` 都不同：

```html
<p>
  <span class="a">Ba</span>
  <span class="b">Ba</span>
  <span class="c">Ba</span>
</p>
```

```css
p {
  font-size: 100px;
}
.a {
  font-family: Helvetica;
}
.b {
  font-family: Gruppo;
}
.c {
  font-family: Catamaran;
}
```

不同字体族即便设置相等的 `font-size`，它们的高度也是不同的：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/1.png)

<figcaption>
<i>1. 不同的字体族，相同的 font-size，得到不同的高度</i>
</figcaption>

现在我们知道了这个奇怪行为，但为什么 `font-size: 100px` 不能使得元素高 100px 呢？我测量了一下，发现他们的高度分别为：Helvetica: 115px，Gruppo: 97px，Gatamaran: 164px。

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/2.png)

<figcaption  >
<i>2. font-size: 100px 的元素高度从 97px 到 164px 不一</i>
</figcaption>

虽然乍看有点奇怪，但完全是符合预期的。原因在于字体本身。下面解释了原因：

- 一个字体定义了它的 [`em-square`](http://designwithfontforge.com/en-US/The_EM_Square.html)(也叫 UPM，units per em)，它代表一种容器，每个字符都在其中绘制。这个方形（square）使用相对单位，并且通常设置为 1000 单位。不过它也可能是 1024，2048 或其他数值。

- 基于这个相对单位，字体的规格被确定下来，包括 ascender（字体基线以上部分），descender（字体基线以下部分），capital height（大写字母高度），x-height（小写 x 高度）等。[注：这几个术语以下文章都使用英文本身，不再翻译]

- 在浏览器中，相对单位会进行缩放来适应需要的字号。

以 Catamaran 字体为例，我们在 [FontForge](https://fontforge.org/en-US/) 中打开查看它的规格：

- `em-square` 是 1000
- ascender 是 1100，descender 是 540。经过一些测试发现，在 Mac OS 系统中，浏览器使用的是 HHead Ascent/Descent 值，而在 Windows 系统中，使用的是 Win Ascent/Descent 值（注意这些值可能是不一样的）。我们还注意到 Capital Height 是 680，X height 是 485。

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/3.png)

<figcaption  >
<i>3. FontForge 中显示的字体规格</i>
</figcaption>

这意味，基于 1000 单位的 `em-square`， Catamaran 字体使用了 1100 + 540 单位，当字号设为 `font-size: 100px` 的时候，它的高度就是 164px。这个计算后的高度（computed height）定义了元素的 content-area（内容区域，注：这个术语以下也不再翻译），我在文章的剩余部分都会使用这个术语。你可以认为这个 content-area 就是背景颜色应用的区域（并不完全准确）。

我们同样能得知大写字母高度是 68px (680 单位)，小写字母（x-height）是 49px（485 单位）。结果就是，1ex = 49px，1em = 100px，注意不是 164px（谢天谢地，`em` 是基于 `font-size` 的，而不是计算后的高度）。

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/4.png)

<figcaption  >
<i>4. Catamaran 字体：UPM —Units Per Em— 和基于 font-size: 100px 的像素值</i>
</figcaption>

在继续深入之前，需要先提及一下这里面涉及的一个知识点。当一个 `<p>` 元素渲染在屏幕上的时候，它可以由许多行组成，这取决于它的宽度。每一行又由一个或多个行内元素（HTML 标签或者普通的文本内容）组成，被视为一个行盒（line-box）。行盒的高度取决于它的子元素的高度。浏览器会计算每一个行内元素的高度，然后得到行盒的高度（从它子元素的最高点到子元素的最低点）。结果是，一个行盒总是足够高以容纳它所有的子元素（默认情况）。

> 每一个 HTML 元素其实都是一堆行盒。如果你知道了每一个行盒的高度，那么你就知道了这个元素的高度。

如果像下面这样更新一下代码：

```html
<p>
  Good design will be better.
  <span class="a">Ba</span>
  <span class="b">Ba</span>
  <span class="c">Ba</span>
  We get to make a consequence.
</p>
```

它会产生 3 个行盒：

- 第一个和最后一个包含了一个匿名的行内元素（文本内容）
- 第二个包含了两个匿名行内元素，以及三个 `<span>`

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/5.png)

<figcaption  >
<i>5. 一个 p（黑色边框）元素由几个行盒（白色边框）组成，这些行盒又包含一些行内元素（实线边框）以及匿名行内元素（虚线边框）</i>
</figcaption>

我们可以清楚地看到第二个行盒比其他行盒都要高，这是由它子元素计算后的 content-area 高度决定的，或者更准确地说，由使用了 Catamaran 字体的那个元素决定。

行盒的难点在于我们肉眼看不到它，也没办法通过 CSS 来控制。即便给 `::first-line` 添加背景也没办法得到有关第一个行盒高度的任何视觉线索。

### `line-height`：面对问题以及更多

到现在为止，我介绍了两个概念：content-area (内容区域) 和 line-box（行盒），我说过一个行盒的高度是根据子元素的高度计算得到的，但我并没有说是根据子元素的 content-area 高度。这两种说法有很大的区别。

虽然听上去有点奇怪，一个行内元素其实有两个不同的高度：content-area 高度以及 virtual-area (虚拟区域)高度（我发明了 virtual-area 这个术语，因为它是不可见的，在规范中也找不到它的影子）。

- content-area 的高度是由字体规格（上面已经提到）决定的
- virtual-area 的高度是 `line-height`，这个就是用于计算行盒高度的高度

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/6.png)

<figcaption  >
<i>6. 行内元素有两个不同的高度</i>
</figcaption>

这也就是说，广泛流行的 `line-height` 高度是两个基线间距离的这种说法是错误的。在 CSS 中，并不如此。

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/7.png)

<figcaption  >
<i>7. 在 CSS 中，line-height 并非两个基线间的距离</i>
</figcaption>

virtual-area 和 content-area 计算后的高度差被称为 leading。leading 的一半被添加在 content-area 之上，另一半添加在其之下。所以，content-area 永远在 virtual-area 正中间。

根据它的计算值，`line-height`（virtual-area） 可能等于，大于或小于 content-area 的高度。当小于 content-area 高度的时候，leading 是负的，这个时候行盒在视觉上要比它的子元素低。

除了上面提到的，还有一些其他的行内元素：

- 替代性行内元素（`<img>`， `<input>`，`<svg>` 等等）
- `inline-block` 和所有 `inline-*` 元素
- 参与某种特殊格式化上下文的行内元素（比如，flexbox 元素内，所有的 flex item 都是行内块状元素）

对于这些特殊的行内元素，高度计算是基于他们的 `height`，`margin`，`border` 属性。如果 `height` 是 `auto`，那么 `line-height` 会被使用，并且 content-area 高度严格等于 `line-height`。

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/8.png)

<figcaption  >
<i>8. 替代性行内元素，inline-block/inline-* 元素以及其他特殊的行内块状元素，它们的 content-area 等于他们的高度，或者等于line-height </i>
</figcaption>

不过，我们的问题还是没有解决：`line-height` 的 `normal` 值究竟是多少呢？答案和 content-area 高度的计算一样，需要从字体规格中找。

所以我们回到 FontForge。Catamaran 字体的 `em-square` 是 1000，但是我们可以看到很多 ascender/descender 值：

- generals Ascent/Descent：ascender 是 770 ， descender 是 230. 用于字符绘画 (表格 “OS/2”)
- metrics Ascent/Descent：ascender 是 1100， descender 是 540. 用于 content-area 高度（表格 “hhea” 和 表格 “OS/2”）
- metric Line Gap。用于 `line-height: normal`，通过在 Ascent/Descent 规格之上添加值。（表格 “hhea”）

在我们的例子中，Catamaran 字体定义了 0 单位的 line gap，所以 `line-height: normal` 就等于 content-area，也就是 1640 单位，或 1.64。

作为对比，Arial 字体的 em-square 是 2048，ascender 是 1854，descender 是 434，line gap 是 67。这意味着，`font-size: 100px` 的 content-area 是 112px（1117 单位），`line-height: normal` 是 115px（1150 单位 或 1.15）。所有这些规格都是由字体设计者决定的，是特殊于某个字体的。

所以显而易见，`line-height: 1` 是不好的做法。我提醒过你，无单位的 `line-height` 值是基于 `font-size`的，而不是基于 content-area。所以这可能会导致 virtual-area 比 content-area 要低，这正是很多问题的来源。

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/9.png)

<figcaption  >
<i>9. 使用 line-height: 1，可能会导致行盒高度小于 content-area 高度 </i>
</figcaption>

问题不仅仅在于 `line-height： 1`。更糟糕的是，在我电脑中安装的 1117 个字体中（是的，我安装了所有来自 Google Web Fonts 的字体），其中有 1059 个字体，差不多 95% 计算后的 `line-height` 都大于 1。他们的值在 0.618 到 3.378 之间。你没看错，3.378！

一些关于行盒计算的细节：

- 对于行内元素，`padding` 和 `border` 会增加背景区域，而不是 content-area 高度（也不是行盒的高度）。所以 content-area 并不总是你屏幕上看到的样子。`margin-top` 和 `margin-bottom` 没有任何作用。

- 对于替代性的行内元素，`inline-block` 以及其他行内块状元素：`padding`，`margin`，`border`都会增加 `height`，也就是能增加 content-area 和行盒高度。

### `vertical-alilgn`: 一个属性打天下

到现在我还没提到 `vertical-align`，尽管它对于计算行盒高度是至关重要的。 我们甚至可以说，`vertical-align` 是行内格式化上下文的领导角色。

它的默认值是 `baseline`。你还记得字体规格中的 ascender 和 descender 吗？这些值决定了 baseline 所在的位置，也决定了比例（ratio）。由于 ascenders 和 descenders 的比例很少是 50/50，所以它很可能会造成意想不到的结果，比如相邻元素间的关系。

从下面的代码开始说起：

```html
<p>
  <span>Ba</span>
  <span>Ba</span>
</p>
```

```css
p {
  font-family: Catamaran;
  font-size: 100px;
  line-height: 200px;
}
```

一个 `<p>` 标签下有两个相邻的 `<span>` 标签，并且继承了相同的 `font-family`，`font-size` 和固定的 `line-height`。基线是对齐的，并且行盒的高度等于他们的 `line-height`。

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/10.png)

<figcaption  >
<i>10. 相同的字号，相同的基线，一切都OK </i>
</figcaption>

但如果第二个元素有更小的 `font-size` 会怎样呢？

```css
span:last-child {
  font-size: 50px;
}
```

听上去会很奇怪，默认的基线对齐方式会导致更高的行盒，就像下面图片所展示的。记住行盒的高度是根据子元素最高点到子元素最低点计算得到的。

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/11.png)

<figcaption  >
<i>11. 一个更小的元素可能会导致更高的行盒 </i>
</figcaption>

这可能给[赞成使用无单位 `line-height` 值提供了某种理由](https://allthingssmitty.com/2017/01/30/nope-nope-nope-line-height-is-unitless/)，但有些时候你可能需要修复更多的问题来创建一个完美的[垂直方向的美感](https://scotch.io/tutorials/aesthetic-sass-3-typography-and-vertical-rhythm#baseline-grids-and-vertical-rhythm)（vertical rhytm）。老实说，不管你怎么选择，对于行内对齐你总会遇到一些问题。

再看一个例子。一个 `<p>` 标签，`line-height: 200px`，包含了一个 `<span>` 标签，并继承了 `line-height`

```html
<p>
  <span>Ba</span>
</p>
```

```css
p {
  line-height: 200px;
}
span {
  font-family: Catamaran;
  font-size: 100px;
}
```

这个行盒究竟有多高呢？我们应该期望是 200px，但并不是。这里的问题在于，`<p>` 标签有他自己的，不同的 `font-family`（默认是 serif）。因为 `<p>` 标签和 `<span>` 标签的基线很可能是不一样的，所以行盒的高度要比期望中的更高。之所以会这样，是因为浏览器在计算的时候会假设每个行盒都是从一个零宽（zero-width）字符开始的，规范中称之为 strut。

> 一个不可见的字符，但有可见的影响。

简单说，我们现在面临的是和前面相邻元素同样的问题：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/12.png)

<figcaption  >
<i>12. 子元素的对齐方式就好像行盒从一个不可见的零宽字符开始 </i>
</figcaption>

基线对齐方式看来问题很多，那 `vertical-align: middle` 能解决问题吗？你在规范中可以读到，`middle` “会将盒子（box）的垂直中点与父级盒子（parent box）的基线位置加上父级 x-height 一半高度的和对齐”。基线的比例是不同的，x-height 的比例也不相同，所以 `middle` 对齐显然也不靠谱。更糟糕的是，在大部分情况下，`middle` 并不是真的 "在中点"。太多的因素会产生影响，并且还没办法通过 CSS 来设置（x-height，ascender/descender 比例等）。

顺带提一下，有其他 4 个值在某些场景下可能有用：

- `vertical-align: top / bottom`，对齐于行盒的的顶部或底部。
- `vertical-align: text-top / text-bottom`，对齐于 content-area 的顶部或底部

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/13.png)

<figcaption  >
<i>13. Vertical-align: top, bottom, text-top and text-bottom </i>
</figcaption>

需要注意的是，对于所有情况，它都会对齐于 virtual-area，也就是不可见的高度。以下面这个 `vertical-align: top` 为例，不可见的 `line-height` 可能会产生奇怪，但不出所料的结果。

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/14.png)

<figcaption  >
<i>14. vertical-align 可能会产生乍看奇怪，但视觉化 line-height 后就在预料中的结果 </i>
</figcaption>

最后，`vertical-align` 也能接受数值类型的值，这会使盒子基于基线上升或下降。这个选项可能会偶尔派上用场。

### CSS 是 awesome 的

我们现在已经讨论了 `line-height` 和 `vertical-align` 如何一起作用，但是现在的问题是：字体规格可以通过 CSS 控制吗？即便我真的很希望如此，但简单的回答是：否。不管怎样，我想我们还是可以做点什么。字体规格是固定的，所以我们应该可以搞点事情。

假设，如果我们想要一个 Catamaran 字体的文本大写字母高度是精确的 100px，该怎么做？看上去是可为的：我们来做一些数学计算。

首先我们将所有的字体规格设置成 CSS 自定义属性，然后计算 `font-size` 来得到 100px 的大写字母高度：

```css
p {
  /* font metrics */
  --font: Catamaran;
  --fm-capitalHeight: 0.68;
  --fm-descender: 0.54;
  --fm-ascender: 1.1;
  --fm-linegap: 0;

  /* desired font-size for capital height */
  --capital-height: 100;

  /* apply font-family */
  font-family: var(--font);

  /* compute font-size to get capital height equal desired font-size */
  --computedFontSize: (var(--capital-height) / var(--fm-capitalHeight));
  font-size: calc(var(--computedFontSize) * 1px);
}
```

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/15.png)

<figcaption  >
<i>15. 大写字母高度现在是 100px 了 </i>
</figcaption>

非常简单对吗？但是如果我们想要文本处在视觉的中心，也就是 “B” 字母的上下空间要相等，又该怎么做呢？为了达到这个效果，我们需要根据 ascender/descender 比例计算 `vertical-align` 的值。

首先，我们计算 `line-height: normal` 和 content-area 的高度：

```css
p {
    …
    --lineheightNormal: (var(--fm-ascender) + var(--fm-descender) + var(--fm-linegap));
    --contentArea: (var(--lineheightNormal) * var(--computedFontSize));
}
```

然后，我们需要：

- 大写字母底部到底部边缘的距离
- 大写字母顶部到顶部边缘的距离

就像这样：

```css
p {
    …
    --distanceBottom: (var(--fm-descender));
    --distanceTop: (var(--fm-ascender) - var(--fm-capitalHeight));
}
```

现在我们可以计算 `vertical-align` 了，它就是两个距离的差值乘以计算的 `font-size` 的值（我们必须把这个值应用在一个行内子元素上）。

最后，我们可以设置想要的 `line-height`，通过计算使得元素保持垂直居中：

```css
p {
    …
    /* desired line-height */
    --line-height: 3;
    line-height: calc(((var(--line-height) * var(--capital-height)) - var(--valign)) * 1px);
}
```

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/16.png)

<figcaption  >
<i>16. 不同的 line-height，但文本永远在正中间 </i>
</figcaption>

增加一个和 “B” 相同高度的图标现在非常简单：

```css
span::before {
  content: '';
  display: inline-block;
  width: calc(1px * var(--capital-height));
  height: calc(1px * var(--capital-height));
  margin-right: 10px;
  background: url('https://cdn.pbrd.co/images/yBAKn5bbv.png');
  background-size: cover;
}
```

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/css-font-metrics-line-height-and-vertical-align%22/17.png)

<figcaption  >
<i>17. 图标和 B 高度相等 </i>
</figcaption>

需要注意的是，这个实验仅仅为了演示而已。你不能依靠这个来布局。原因有很多：

- 除非字体规格是固定不变的，但其实在浏览中的计算[并非如此](https://www.brunildo.org/test/normal-lh-plot.html)⁠\⁠(ツ)⁠/⁠¯。
- 如果字体没有被加载，备用的字体很可能有不一样的字体规格，处理这么多的规格变量会变得不可控制

### 最后小结

我们学到了：

- 行内格式化上下文真的很难理解
- 所有的行内元素都有 2 个高度：
  - content-area （基于字体规格）
  - virtual-area （基于 `line-hegiht`）
  - 毫无可能视觉化这两个高度（如果你是 devtool 的开发者，并且想改善这种情况，那就真的太棒了）
- `line-height: normal` 基于字体规格
- `line-height: n` 可能会造成 virtual-area 比 content-area 小
- `vertical-align` 是不可靠的
- 行盒的高度计算是基于它子元素的 `line-height` 和 `vertical-align` 属性
- 我们没办法通过 CSS 轻易得到或设置字体规格

但是，我仍然深爱 CSS ：）

_（欢迎转载，但请保留文章地址）_
