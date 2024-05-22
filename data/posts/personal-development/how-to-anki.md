---
title: 有了这款工具，Anki 背单词不用再手动制卡了
date: '2024-05-23'
topics: ['product']
---

## 工具介绍

这款工具叫 “Siphon 吸词”，帮助有英文阅读需求的人高效地通过阅读积累词汇量。它提供了一个浏览器插件，用户安装后，在网页阅读中遇到生词，**只要双击一下，就可以查询单词释义并自动将单词加入到生词本中。除了自动记录生词外，插件也会自动记录单词所在的句子，方便复习单词的时候查看上下文。**

我之前写过两篇文章，分别介绍这款产品的理念以及如何使用，这两篇文章都上了少数派的“本周精选”，你如果有兴趣可以阅读：

- [读完《人人都能用英语》，我开发了一款产品有效积累词汇量](https://sspai.com/post/87847)
- [我如何在一个月内显著提升英文阅读能力](https://sspai.com/post/87917)

产品上线后，有不少用户反馈需要对接 Anki，于是我开发了“导出 Anki 文件”的功能。或许有了 Siphon，你以后真的不用再手动制卡了。

## 如何使用

### 一、安装插件

首选需要安装 “Siphon 吸词” 浏览器插件，可以在 [Chrome](https://chromewebstore.google.com/detail/siphon-%E5%90%B8%E8%AF%8D/ellokeilepgocdknilnlljmgohncjllb)、[Edge](https://microsoftedge.microsoft.com/addons/detail/siphon-%E5%90%B8%E8%AF%8D/iineaaglgdgkoohpcpbaecoaigibhipe) 商店下载安装，也可以在这个页面 [https://siphon.ink/downloads](https://siphon.ink/downloads) 下载，然后本地安装。

安装完成后，在线阅读过程中遇到任何生词，只要双击一下，就可以加入到生词本中，如下所示：

![双击记录](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/siphon/screenshots/1.%20%E5%BF%AB%E6%8D%B7%E5%BD%95%E5%85%A5min.png)

### 二、导出 Anki 文件

访问 [https://siphon.ink](https://siphon.ink)，可以看到所有记录的生词，如下所示：

![单词](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/siphon/idea-statistics.png)

点击右上角的头像图标，在下拉菜单中点击“导出 Anki 文件”：

![导出 Anki 文件](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/siphon/help/export_anki.png)

点击后，会导出一个 `txt` 格式的 Anki 文件，文件内包含了你所有在线阅读中通过“Siphon 吸词”插件记录的生词。


### 导入到 Anki 中

导出的文件包含四个 column：Front、Back、Sentence、Origin，分别表示单词、释义、关联句子以及来源地址，你可以根据自己的需要映射到 Anki Fields。

![导入 Anki](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/siphon/help/import_to_anki.png)

### 在 Anki 中复习

可以自定义 Anki 卡片样式进行复习，示例如下：

![在 Anki 中复习](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/siphon/help/review_in_anki.png)


推荐有需要的同学试一试，如果有任何想法或建议可以加我微信 `xc_siphon` 沟通，谢谢。