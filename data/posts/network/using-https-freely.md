---
title: '免费启用HTTPS'
date: '2017-11-20'
topics: ['https']
---

昨天花了一些时间将之前的 Ghost 博客改用灵活强大的 Gatsby 重新搭建，顺带启用了 HTTPS。HTTPS 使用的是[Let’s Encrypt](https://letsencrypt.org/)提供的免费方案。具体的配置步骤如下：

1. 打开[https://certbot.eff.org](https://certbot.eff.org) 网站
2. 选择你使用的 web 服务器和操作系统，我的是`Nginx`和`CentOS 6`
3. 选择后会跳转到安装教程页，照着做一遍就可以

以我的选择为例，上面第三步需要执行的命令如下:

```bash
# 下载
wget https://dl.eff.org/certbot-auto
chmod a+x certbot-auto

# 更改nginx配置
sudo ./certbot-auto --nginx
```

在执行最后一条命令的时候报了如下错误：

```bash
/root/.local/share/letsencrypt/lib/python2.6/site-packages/cryptography/init.py:26: DeprecationWarning: Python 2.6 is no longer supported by the Python core team, please upgrade your Python. A future version of cryptography will drop support for Python 2.6
DeprecationWarning
Saving debug log to /var/log/letsencrypt/letsencrypt.log
The nginx plugin is not working; there may be problems with your existing configuration.
The error was: NoInstallationError()
```

Google 后在 certbot 仓库的[issue](https://github.com/certbot/certbot/issues/4937)下面找到了解决办法。报错是因为找不到 nginx，配置一下软链即可：

```bash
ln -s /usr/local/nginx/sbin/nginx /usr/bin/nginx
ln -s /usr/local/nginx/conf/ /etc/nginx
```

然后重新执行：

```bash
sudo ./certbot-auto --nginx
```

免费的 certbot 证书 90 天会过期，所以可以通过`crontab -e`去定时更新，相关配置如下(每月都强制更新一次)：

```bash
# 注意：请使用自己的certbot-auto目录
0 0 1 * * /home/certbot-auto renew --force-renewal
5 0 1 * * nginx -s reload
```
