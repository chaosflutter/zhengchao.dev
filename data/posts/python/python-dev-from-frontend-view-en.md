---
title: Some Insights Gained from a Frontend Developer Starting Python Project Development
date: '2024-05-18'
topics: ['python']
---

## Why I Needed to Use Python for Development

I recently developed a product, and one of its features required integrating a good translation service. So, I researched some technical solutions and found that ByteDance's Doubao large model is excellent. The translation quality is great, and the speed is very fast.

**But the Doubao large model currently only offers a Python SDK, and the languages I'm more proficient in, JavaScript and Go, don't have official SDKs. At the same time, I also wanted to pick up Python again in this era of large models, so I decided to implement the translation API using Python.**

I systematically learned Python many years ago and used it to write simple automated trading programs. So, getting back into Python project development, combined with Copilot's capabilities, posed no major issues at the language level. **The problems I encountered were actually more on the engineering side.**

## Which Web Development Framework to Use

Python's web development ecosystem is incredibly rich. Here are some well-known open-source frameworks:


- [fastapi](https://github.com/tiangolo/fastapi)，Github star 71.6k；
- [django](https://github.com/django/django)，Github star 77.1k；
- [flask](https://github.com/pallets/flask)，Github star 66.6k；
- [tornado](https://github.com/tornadoweb/tornado)，Github star 21.5k；
- [falcon](https://github.com/falconry/falcon) Github star 9.4k；
- There's more...

There are many options available. Since my requirement was just to provide an API for the frontend to call, I briefly looked through the README documents of some popular frameworks and consulted ChatGPT. I quickly decided to use FastAPI as the project's API framework. FastAPI is very simple to use. Here's a basic example:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
```

## "Virtual Environment" in Python

As a novice, I was aware of Python's virtual environment, but I didn't pay much attention to it at first, until I encountered some issues.

I followed the documentation of Doubao and installed their SDK using `pip`, but I kept encountering errors in my editor environment and when running scripts, indicating that the corresponding package couldn't be found. Upon investigation, I realized that the issue stemmed from having multiple versions of Python interpreters installed locally. Their installation directories differed, with globally installed packages via `pip` residing in directory A, while the editor and code execution referred to another interpreter, searching for globally installed packages in directory B. This is where "virtual environments" come into play.

### What is a "virtual environment"?

The following is ChatGPT's explanation:

> A "virtual environment" in Python is a self-contained directory that contains a specific Python interpreter and its associated libraries and scripts. It allows you to create an isolated environment for your Python projects, where you can install packages and dependencies without affecting other projects or the system-wide Python installation. This helps in managing dependencies and ensuring that each project has its own set of libraries and versions, avoiding conflicts between different projects.

Although not entirely accurate, it can be understood as the "local installation" in frontend development. In frontend development, `npm install` by default installs packages in a local directory. However, in Python, you need to create a "virtual environment" first, so that subsequently installed packages via pip will be isolated within the virtual environment rather than the global environment.

### How to create a "virtual environment"?

There are many ways to create a virtual environment in Python, such as:

- `venv`
- `virtualenv`
- `pipenv`
- `conda`
- `poetry`

You can check the documentation of these tools for specific usage instructions, or consult ChatGPT. After reading the following articles, I chose `poetry`:

- [5 Reasons Why Poetry Beats Pip Python Setup](https://betterprogramming.pub/5-reasons-why-poetry-beats-pip-python-setup-6f6bd3488a04)
- [I move from pipenv to poetry in 2023 - Am I right ?](https://dev.to/farcellier/i-migrate-to-poetry-in-2023-am-i-right--115)
- [Why Is Poetry Essential to the Modern Python Stack?](https://andrewbrookins.com/python/why-poetry/)


## Are there any package management tools in Python similar to NPM?

Yes, there are, and more than one. For example, there's the officially recommended `pipenv`, which combines the functionalities of pip and virtualenv. It can create virtual environments, install dependencies, and generate a `Pipfile.lock` similar to `package-lock.json`, which locks the versions of dependencies. I've personally used it and found it quite handy.

Another one is the one I ultimately chose to use, `poetry`. It offers similar functionalities to `pipenv`, and many commands are even the same. After trying it out, I found it very convenient. The reason I ended up choosing `poetry` was because I gathered some information from the articles above, such as:

- Poetry uses the standard `pyproject.toml` file to define project dependencies and metadata.
- Poetry supports publishing directly to PyPI or other package repositories from project metadata.
- Dependency resolution and installation performance in Poetry are usually faster than Pipenv.
- In recent years, Poetry has gained more attention and adoption.

To be honest, I haven't personally experienced any significant advantages of Poetry yet. However, since many people recommend using this more modern tool, I ultimately chose Poetry.

Here are some commands for `poetry`:

```bash
# Initialize a project
poetry init

# Activate the virtual environment
poetry shell

# Add a dependency
poetry add package_name

```

## How to deploy a Python project based on Docker

Similar to JavaScript, the Dockerfile for a Python project follows a general process like this:

- First, you need a base image.
- Then, `Copy` the package management `lock` file, etc., and install dependencies.
- Next, `Copy` necessary project files.
- Finally, use `uvicorn` to start the service.

It's actually quite simple, you can even have ChatGPT help you write a Dockerfile. **The issue I encountered was that the final built image was a whopping 1.2G (I usually work with Go for web development, and the images are usually just a few tens of megabytes).**

In the end, I followed this Medium article: [How to make your Python Docker images secure, fast & small](https://medium.com/vantageai/how-to-make-your-python-docker-images-secure-fast-small-b3a6870373a0) to optimize the image size, and managed to reduce it to just over 600MB. 

The final Dockerfile looks something like this:

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