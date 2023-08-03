---
title: '每天一个Node模块：Path'
date: '2018-01-22'
origin: 'https://nodejs.org/dist/latest-v8.x/docs/api/path.html'
topics: ['node']
---

#### 注：node v8.11.1

### 目录

- Path
  - Windows vs. POSIX
  - path.basename(path[, ext])
  - path.delimiter
  - path.dirname(path)
  - path.extname(path)
  - path.format(pathObject)
  - path.isAbsolute(path)
  - path.join([...paths])
  - path.normalize(path)
  - path.parse(path)
  - path.posix
  - path.relative(from, to)
  - path.resolve([...paths])
  - path.sep
  - path.win32

### Path

path 模块提供了访问和操作文件/文件夹路径的能力。使用前引入：

```javascript
const path = require('path')
```

#### Windows vs. POSIX

path 模块的默认行为会根据所运行的操作系统而变化。具体地说，当 node 应用运行在 Windows 上时，path 模块会使用 Windows 风格的路径。

举个例子，当使用 path.basename()函数处理 Windows 风格的文件路径`C:\temp\myfile.html`时，在 POSIX 和 Windows 系统上的运行结果并不同:

POSIX:

```javascript
path.basename('C:\\temp\\myfile.html')
// Returns: 'C:\\temp\\myfile.html'
```

Windows:

```javascript
path.basename('C:\\temp\\myfile.html')
// Returns: 'C:\\temp\\myfile.html'
```

对于 Windows 风格的文件路径，如果想要在不同的操作系统返回相同的结果，可以使用 path.win32:

```javascript
path.win32.basename('C:\\temp\\myfile.html')
// Returns: 'myfile.html'
```

对于 POSIX 风格的文件路径，如果想要在不同的操作系统返回相同的结果，可以使用 path.posix:

```javascript
path.posix.basename('/tmp/myfile.html')
// Returns: 'myfile.html'
```

#### path.basename(path[, ext])

- path [string]
- ext [string] 可选的文件扩展名
- returns [string]

path.basename()方法返回路径最后的部分，类似于 Unix 中的 basename 命令。末尾的目录分隔符会被忽略。详情参看 path.sep。

举例：

```javascript
path.basename('/foo/bar/baz/asdf/quux.html')
// Returns: 'quux.html'

path.basename('/foo/bar/baz/asdf/quux.html', '.html')
// Returns: 'quux'
```

如果传入的 path 不是字符串，或者传入了 ext 并且不是字符串，会抛出类型错误`TypeError`。

#### path.delimiter

- [string]

返回特定于操作系统的路径分界符。

POSIX:

```javascript
console.log(process.env.PATH)
// Prints: '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'

process.env.PATH.split(path.delimiter)
// Returns: ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']
```

Windows

```javascript
console.log(process.env.PATH)
// Prints: 'C:\Windows\system32;C:\Windows;C:\Program Files\node\'

process.env.PATH.split(path.delimiter)
// Returns ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Program Files\\node\\']
```

#### path.dirname(path)

- path [string]
- returns [string]

path.dirname()方法返回路径的文件夹地址，类似于 Unix 中 dirname 命令。末尾的目录分隔符会被忽略。详情参看 path.sep。

举例：

```javascript
path.dirname('/foo/bar/baz/asdf/quux')
// Returns: '/foo/bar/baz/asdf'
```

#### path.extname(path)

- path [string]
- returns [string]

path.extname()返回路径的扩展名，从最后一个`.`开始一直到 path 路径字符串的末尾。如果 path 的最后一部分不包含`.`，或者 path 的 basename 以`.`开头，则返回一个空字符串。

举例：

```javascript
path.extname('index.html')
// Returns: '.html'

path.extname('index.coffee.md')
// Returns: '.md'

path.extname('index.')
// Returns: '.'

path.extname('index')
// Returns: ''

path.extname('.index')
// Returns: ''
```

如果传入的 path 不是字符串，则抛出类型错误。

#### path.format(pathObject)

- pathObject [Object]
  - dir [string]
  - root [string]
  - base [string]
  - name [string]
  - ext [string]

path.format()方法根据一个对象返回一个路径字符串，和 path.parse()方法执行相反的操作。
当设置 pathObject 的属性时，需要注意的是有些属性的优先级更高。具体而言：

- 如果 dir 存在则 root 会被忽略
- 如果 base 存在则 ext 和 name 会被忽略

POSIX

```javascript
// If `dir`, `root` and `base` are provided,
// `${dir}${path.sep}${base}`
// will be returned. `root` is ignored.
path.format({
  root: '/ignored',
  dir: '/home/user/dir',
  base: 'file.txt',
})
// Returns: '/home/user/dir/file.txt'

// `root` will be used if `dir` is not specified.
// If only `root` is provided or `dir` is equal to `root` then the
// platform separator will not be included. `ext` will be ignored.
path.format({
  root: '/',
  base: 'file.txt',
  ext: 'ignored',
})
// Returns: '/file.txt'

// `name` + `ext` will be used if `base` is not specified.
path.format({
  root: '/',
  name: 'file',
  ext: '.txt',
})
// Returns: '/file.txt'
```

Windows

```javascript
path.format({
  dir: 'C:\\path\\dir',
  base: 'file.txt',
})
// Returns: 'C:\\path\\dir\\file.txt'
```

#### path.isAbsolute(path)

- path [string]
- returns [boolean]

path.isAbsolute()方法判断一个路劲是否是绝对路径。
如果 path 参数是一个空字符串，返回 false。

POSIX:

```javascript
path.isAbsolute('/foo/bar') // true
path.isAbsolute('/baz/..') // true
path.isAbsolute('qux/') // false
path.isAbsolute('.') // false
```

Windows:

```javascript
path.isAbsolute('//server') // true
path.isAbsolute('\\\\server') // true
path.isAbsolute('C:/foo/..') // true
path.isAbsolute('C:\\foo\\..') // true
path.isAbsolute('bar\\baz') // false
path.isAbsolute('bar/baz') // false
path.isAbsolute('.') // false
```

#### path.join([...paths])

- ...paths [string] 一系列路径片段
- returns [string]

path.join()方法会用平台特定的分隔符连接传入的路径片段，返回规范的路径。

传入的空字符串片段会被忽略。如果连接后的路径字符串是空字符串，则返回'.'，表示当前工作目录。

举例：

```javascript
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..')
// Returns: '/foo/bar/baz/asdf'

path.join('foo', {}, 'bar')
// throws 'TypeError: Path must be a string. Received {}'
```

当传入的路径片段中有非字符串，则会报类型错误。

#### path.normalize(path)

- path [string]
- returns [string]

path.normalize()会规范化传入的 path 参数。

如果有多个连续的分隔符被发现，则会被替换成一个平台特定的路径分隔符。末尾的分隔符会被保留。

如果路径是空字符串，'.'会被返回，表示当前工作目录。

POSIX:

```javascript
path.normalize('/foo/bar//baz/asdf/quux/..')
// Returns: '/foo/bar/baz/asdf'
```

Windows:

```javascript
path.normalize('/foo/bar//baz/asdf/quux/..')
// Returns: '/foo/bar/baz/asdf'
```

当传入的 path 不是字符串，则会抛出一个类型错误。

#### path.parse(path)

- path [string]
- returns [Object]

path.parse()方法返回一个对象，该对象的属性代表了路径中的重要的元素。末尾的目录分隔符会被忽略，详情参看 path.sep。

返回的对象包含以下一些属性：

- dir [string]
- root [string]
- base [string]
- name [string]
- ext [string]

POSIX:

```javascript
path.parse('/home/user/dir/file.txt')
// Returns:
// { root: '/',
//   dir: '/home/user/dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' }
```

```javascript
┌─────────────────────┬────────────┐
│          dir        │    base    │
├──────┬              ├──────┬─────┤
│ root │              │ name │ ext │
"  /    home/user/dir / file  .txt "
└──────┴──────────────┴──────┴─────┘
(all spaces in the "" line should be ignored -- they are purely for formatting)
```

Windows:

```javascript
path.parse('C:\\path\\dir\\file.txt')
// Returns:
// { root: 'C:\\',
//   dir: 'C:\\path\\dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' }
```

```javascript
┌─────────────────────┬────────────┐
│          dir        │    base    │
├──────┬              ├──────┬─────┤
│ root │              │ name │ ext │
" C:\      path\dir   \ file  .txt "
└──────┴──────────────┴──────┴─────┘
(all spaces in the "" line should be ignored -- they are purely for formatting)
```

如果传入的 path 不是字符串，则会抛出类型错误。

#### path.posix

- [Object]
  path.posix 对象提供了 path 模块方法的 POSIX 特定实现的接口。

#### path.relative(from, to)

- from [string]
- to [string]
- returns [string]

path.relative()方法返回基于当前工作目录的 from 到 to 的相对路径。如果 from 和 to 解析出(path.resolve)的地址是相同的，则返回空字符串。

如果传给 from 或 to 的是空字符串，则会使用当前的工作目录替代传入的空字符串。

POSIX:

```javascript
path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')
// Returns: '../../impl/bbb'
```

Windows:

```javascript
path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb')
// Returns: '..\\..\\impl\\bbb'
```

如果传给 from 或 to 的不是字符串，则会抛出类型错误。

#### path.resolve([...paths])

- ...paths [string] 一系列路径片段
- returns [string]

path.resolve()方法解析一系列路径或路径片段，返回绝对路径。

该方法是从右向左处理路径序列的，累加路径片段直到构造出一个绝对路径。举一个例子，给定路径片段序列，/foo,/bar，/baz，调用 path.resolve('/foo', '/bar', 'baz')返回/bar/baz。

如果在处理所有路径片段后还是没有能够构造出一个决定路径，那么当前工作目录会被用于参与构造。

空字符串路径片段会被忽略。

如果没有传入 path 参数，那么会返回当前工作目录的绝对路径。

举例：

```javascript
path.resolve('/foo/bar', './baz')
// Returns: '/foo/bar/baz'

path.resolve('/foo/bar', '/tmp/file/')
// Returns: '/tmp/file'

path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif')
// if the current working directory is /home/myself/node,
// this returns '/home/myself/node/wwwroot/static_files/gif/image.gif'
```

如果传入的任何参数不是字符串，则会报类型错误。

#### path.sep

- [string]

提供平台特定的路径分隔符。

- Windows `\`
- POSIX `/`

POSIX:

```javascript
'foo/bar/baz'.split(path.sep)
// Returns: ['foo', 'bar', 'baz']
```

Windows:

```javascript
'foo\\bar\\baz'.split(path.sep)
// Returns: ['foo', 'bar', 'baz']
```

#### path.win32

path.win32 对象提供了 path 模块方法的 Windows 特定实现的接口。
