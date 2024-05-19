---
title: 前端程序员上手 Python 项目开发，分享一些收获
date: '2024-05-18'
topics: ['python']
---

## 为什么需要用 Python 开发

前段时间上线了自己的第一款产品 [Siphon 吸词](https://siphon.ink)，帮助英语学习者高效地通过阅读积累词汇量，进而提升英文阅读能力。产品有一个特色功能，用户在网页阅读中遇到生词双击就可以记录到生词本中，**同时也会自动记录生词所在的句子，帮助用户理解生词如何使用**。很多用户反馈，复习的时候，希望关联的句子能有翻译。

所以，我去做了调研，最后对比发现字节豆包大模型的翻译质量和速度都非常不错，并且价格也有优势。所以选择调用字节豆包大模型的 API 来翻译关联句子。效果如下所示：

![关联句子翻译](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/siphon/help/member-st.png)

翻译真的挑不出毛病，英文原文中并没有提到 `Her` 是一部电影，但大模型知道 `Her` 是一部叫《她》的电影。

**不过豆包大模型目前只提供了 Python 的 SDK，我相对擅长的 JavaScript、Go 都没有官方的 SDK。同时自己也想在这个大模型时代，重新捡起 Python 这门语言，所以决定翻译 API 基于 Python 实现。**

PS：自己很多年前有系统学习过 Python，用 Python 写过简单的自动化交易程序。所以重新上手 Python 项目开发，配合 Copilot 能力，语言层面基本没有什么问题，我遇到的其实还是工程方面的问题。

## 使用哪个 Web 开发框架

Python 的 Web 开发生态真的太丰富了，用“乱花渐欲迷人眼”来形容一点也不为过。比如以下知名的开源框架：

- [fastapi](https://github.com/tiangolo/fastapi)，Github star 71.6k；
- [django](https://github.com/django/django)，Github star 77.1k；
- [flask](https://github.com/pallets/flask)，Github star 66.6k；
- [tornado](https://github.com/tornadoweb/tornado)，Github star 21.5k；
- [falcon](https://github.com/falconry/falcon) Github star 9.4k；
- 还有更多...

可选的方案非常多。因为我的需求只是需要提供 API 给前端调用，简单看过一些热门框架的 README 文档，以及咨询了下 ChatGPT，很快决定选择使用 `fastapi` 作为项目的 API 框架。`fastapi` 的使用非常简单，下面是一个简单的示例：

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
```

上手真的很简单。

## Python 中的“虚拟环境”

作为初生牛犊，我虽然知道 Python 的虚拟环境，但自己一开始并没有在意，直到遇到了问题。

我按照豆包的文档，用 `pip` 安装了豆包的 sdk，但编辑器环境以及脚本运行的时候一直报错，找不到对应的包。**查了下原因，大概是我本地安装了多个版本的 Python 解释器，它们的安装目录不一样， pip 安装的全局包在 A 目录，而编辑器和代码执行的时候用的是另一个解释器，会去另一个全局目录 B 中寻找全局的包。** 所以，“虚拟环境” 登场了。

### 什么是 “虚拟环境”

以下是 ChatGPT 的解释：

> 在 Python 开发中，“虚拟环境”（virtual environment）是一个独立的、隔离的 Python 环境。它包含特定版本的 Python 解释器及安装在其中的包和库，且与全局的 Python 环境独立分开。使用虚拟环境可以为不同的项目创建隔离的开发空间，避免包和依赖冲突，保证项目的一致性和可移植性。

虽然不够准确，但或许可以把它理解为前端开发中的 “本地安装”，在前端开发中 `npm install` 默认会将包安装在本地目录中，但 Python 需要先创建“虚拟环境”，这样后续 pip 安装的包会安装在虚拟环境中，和全局环境隔离。

### 如何创建 “虚拟环境”

Python 中创建虚拟环境的方式非常多，比如：

- `venv`：适用于大多数 Python 3 用户，内置且简单。
- `virtualenv`：适用于需要兼容 Python 2 和 Python 3 的用户。
- `pipenv`：适用于需要集成包管理和虚拟环境管理的用户，推荐用于开发项目。
- `conda`：适用于数据科学和多语言项目，提供了强大的包管理和环境管理功能。

具体如何使用这些工具可以查看文档，或者咨询 ChatGPT。我阅读了下面这些文章后选择了 `poetry`：

- [5 Reasons Why Poetry Beats Pip Python Setup](https://betterprogramming.pub/5-reasons-why-poetry-beats-pip-python-setup-6f6bd3488a04)
- [I move from pipenv to poetry in 2023 - Am I right ?](https://dev.to/farcellier/i-migrate-to-poetry-in-2023-am-i-right--115)
- [Why Is Poetry Essential to the Modern Python Stack?](https://andrewbrookins.com/python/why-poetry/)

至于具体为什么，就是下面要说的“包管理”的问题。

### 有没有类似 Npm 一样的包管理工具

有，而且不止一个。比如官方推荐的 `pipenv`，它结合了 pip 和 virtualenv 的功能，可以创建虚拟环境，也能安装依赖，并且可以生成类似`package-lock.json` 文件的 `Pipfile.lock`，可以锁依赖的版本。我自己实际用了一下，感觉挺好用的。

另一个就是我最后选择使用的`poetry`，它提供了和 `pipenv` 类似的功能，甚至很多命令都是一样的。我实际体验后，也觉得很好用。之所以最后选择 `poetry`，是从上面的文章中获得了一些信息，比如：

- Poetry 使用标准的 pyproject.toml 文件来定义项目依赖和元数据。
- Poetry 支持从项目的元数据直接发布到 PyPI 或其他包仓库。
- Poetry 的依赖解析和安装性能通常比 Pipenv 更快。
- 近年来，Poetry 得到了更多的关注和采用。

坦白说，我自己目前还没能体验出 `poetry` 明显的优势，但既然很多人推荐使用这个更现代化的工具，所以自己最后选择了 `poetry`。

以下是 `poetry` 的一些命令：

```bash
// 初始化项目
poetry init

// 激活虚拟环境
poetry shell

// 添加依赖
poetry add package_name
```

### 如何基于 Docker 部署 Python 项目

和其他语言类似，Dockerfile 中大致的流程如下：

- 首先都需要有基础的镜像
- 然后 `Copy` 包管理的 `lock` 文件，安装依赖
- 然后 `Copy` 必要的项目文件
- 最后通过 `uvicorn` 来启动服务。

其实很简单，你甚至可以让 ChatGPT 帮你写一个 Dockerfile。我遇到的问题是，我发现最后 build 出的镜像居然有 1.2G（我喜欢用的 Web 开发语言 Go，镜像一般只有几十M）。

我最后参考了这篇 Medium 上的文章：[How to make your Python Docker images secure, fast & small](https://medium.com/vantageai/how-to-make-your-python-docker-images-secure-fast-small-b3a6870373a0) 对镜像尺寸做了优化，最后降到了 600多M。如果你有兴趣，推荐读一读这篇文章。这里做个小广告，如果你觉得自己的英文阅读能力需要提高，或许可以试试我开发的这款产品 [Siphon 吸词](https://siphon.ink)，我自己实际使用了两个多月，词汇量和阅读能力提升明显。

最后的 Dockerfile 文件大致如下：

``` Dockerfile
FROM python:3.11-slim as build

ENV PIP_DEFAULT_TIMEOUT=100 \
    # Allow statements and log messages to immediately appear
    PYTHONUNBUFFERED=1 \
    # disable a pip version check to reduce run-time & log-spam
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    # cache is useless in docker image, so disable to reduce image size
    PIP_NO_CACHE_DIR=1 \
    POETRY_VERSION=1.3.2

WORKDIR /app
COPY pyproject.toml poetry.lock ./

RUN pip install "poetry==$POETRY_VERSION" \
    && poetry install --no-root --no-ansi --no-interaction \
    && poetry export -f requirements.txt -o requirements.txt


### Final stage
FROM python:3.11-slim as final

WORKDIR /app

COPY --from=build /app/requirements.txt .

RUN set -ex \
    # Create a non-root user
    && addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 --gid 1001 --no-create-home appuser \
    # Upgrade the package index and install security upgrades
    && apt-get update \
    && apt-get upgrade -y \
    # Install dependencies
    && pip install -r requirements.txt \
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

COPY ./artifacts artifacts
COPY ./api api

EXPOSE 8000

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Set the user to run the application
USER appuser
```

### 关于产品

希望这篇文章对你有一些帮助。如果你对我开发的产品有兴趣，可以看看我之前写的两篇文章：

- [我如何在一个月内显著提升英文阅读能力](https://juejin.cn/post/7354019135992938536)
- [读完《人人都能用英语》，我开发了一款产品有效积累词汇量](https://juejin.cn/post/7352751855333900322)

如果对我感兴趣，也可以加我微信 `xc_siphon`沟通，谢谢。
