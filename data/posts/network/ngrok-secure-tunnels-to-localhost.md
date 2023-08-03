---
title: '使用ngrok实现内网穿透'
date: '2017-08-13'
topics: ['network']
---

首先说下什么是“内网穿透”。简单来说，就是让外网能够访问你本地电脑上的应用。例如你本地启了一个 Node 服务器，端口 8000，本地可以访问 http://localhost:8000，
但外网并不能访问你的这个本地应用。使用 ngrok 做反向代理，就可以实现“内网穿透”访问你的本地应用。

ngrok 的使用非常简单，按照下面的步骤操作即可：

### 注册登录

访问[ngrok 官网](https://ngrok.com/)注册一个账号或者也可以使用 Google 账号登录。

### 下载安装

注册并登录以后，进入 Dashborad，选择你的操作系统对应的版本进行安装。

### 连接账号

安装后，在 ngrok 应用所在目录执行如下命令行，你的 authtoken 在 ngrok 网站的 Dashboard 下可以看到。

```bash
./ngrok authtoken `你的authtoken`
```

执行这一步的命令后，你当前运行着的 tunnels 都能在 ngrok 网站的 Dashborad 下看到。

### 开启隧道

比如我要在本地 8000 端口开启 http 隧道允许外网访问，可以在 ngrok 应用所在目录执行下面的命令行：

```bash
./ngrok http 8000
```

创建成功后命令行终端会打印出一些信息，包含随机生成的外网访问连接，大致如下：

```bash
...
Forwarding                    http://195bb446.ngrok.io -> localhost:8000
Forwarding                    https://195bb446.ngrok.io -> localhost:8000
...
```

访问 https://195bb446.ngrok.io，
就可以实现“内网穿透”从外网访问你本地端口为 8000 的应用了。就这么简单。

如果想要自定义域名，需要付费升级你的 ngrok 账号，这里就不做介绍了。
