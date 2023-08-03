---
title: '如何在国内使用 Google Home Mini'
date: '2018-06-04'
topics: ['hacker']
---

上周去东京，买了两个 Google Home Mini 给自己和女友。因为众所周知的原因，在国内使用 Mini 需要自己搭梯子。自由的路总是磕磕绊绊，昨天在家折腾许多，当深夜里 Mini 说出"play some music on Spotify..."的时候，泪流满面。

#### 1、小米路由器刷开发版 ROM

我买的是小米路由器 3，然后到[小米路由器网站](http://www1.miwifi.com/miwifi_download.html)下载对应的开发版 ROM 固件。访问 miwifi.com 路由器页面，点击常用设置->系统状态->手动升级，选择刚刚下载的固件，开始刷机。

#### 2、开启路由器 SSH 功能

访问[MIWIFI 开放平台](http://www1.miwifi.com/miwifi_open.html)页面，点击[开启 SSH 工具]，如果你的小米账号有绑定路由器，会获得路由器的 root 密码。下载工具包，按照页面上的指示一步步开启路由器 SSH 功能。

#### 3、安装 Misstar Tools

Misstar Tools 是小米路由器的工具包，提供了很多路由器插件，包括科学上网的插件 Shadowsocks。详情可以参看[论坛介绍](http://www.miui.com/thread-4408033-1-1.html)。安装步骤如下：

```bash
# 登录小米路由器
ssh root@192.168.31.1

# 安装
wget http://www.misstar.com/tools/appstore/install.sh -O /tmp/install.sh && chmod +x /tmp/install.sh && /tmp/install.sh
```

安装完成后，刷新路由器页面会出现一个[MT 工具箱]菜单。如果页面打不开出现/web/misstar/index 没有注册的错误，可以参考[这篇文章](http://bbs.xiaomi.cn/t-14166902)进行设置。

如果可以打开 MT 工具箱页面，则点击插件管理，进入插件中心。因为某些原因，科学上网插件在插件中心找不到，但并不妨碍安装，chrome 浏览器中，右键任何一个安装按钮，选择[审查元素]，在出现的 html 代码中，把选中元素的 id 修改为 ss，然后再点击安装即可。

#### 4、设置 Shadowsocks

点击安装好的科学上网插件，进入设置页面。具体如何设置 ss 不清楚的话，可以自行搜索。推荐在 Google Cloud 上自己[搭梯子](https://suiyuanjian.com/124.html)。

#### 5、下载 Google Home App 设置

搭好路由器梯子以后，下载 Google Home App 对 Mini 进行设置，具体操作很简单，这里不再赘述。可能遇到的问题是，虽然路由器已经可以科学上网，但 Google Home Mini 的 DNS 解析依然会有问题，导致一直设置失败，解决方法参考[这篇文章](https://gist.github.com/willwhui/28e8896b6e4560f1cf0d32a5acf501f3)，具体如下：

```bash
# 登录小米路由器
ssh root@192.168.31.1

# 依次执行
iptables -t nat -A PREROUTING -s 192.168.1.1/24 -p udp --dport 53 -j DNAT --to 192.168.1.1
iptables -t nat -A PREROUTING -s 192.168.1.1/24 -p tcp --dport 53 -j DNAT --to 192.168.1.1
iptables -I PREROUTING -t nat -p udp -d 8.8.4.4 --dport 53 -j REDIRECT --to-ports 1053
iptables -I PREROUTING -t nat -p udp -d 8.8.8.8 --dport 53 -j REDIRECT --to-ports 1053
```

另外，在设置过程中，如果 Google Home App 有报错，可尝试将手机的系统语言设置成英文。

至此，不出意外你就可以开始调戏 Google Home Mini 了，恭喜 🎉
