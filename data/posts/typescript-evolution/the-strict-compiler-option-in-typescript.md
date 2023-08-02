---
title: 'TypeScript 中的 --strict 编译选项'
date: '2021-02-01'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/the-strict-compiler-option-in-typescript'
---

Typescript 2.3 引入了一个新的 `--strict` 编译选项，它会开启一些相关的其他编译选项来使用更严格的类型检查。

### 严格类型检查选项

添加这个选项的初衷是让你可以方便地使用“默认严格模式”（strict-by-default mode）来得到更好的类型安全而不用一个个去开启相关的编译选项。你可以在命令行中添加 `--strict` 参数，或者在项目的 tsconfig.json 中设置 `strict` 选项来进入这个模式。

到 2021 年 8 月 Typescript 4.3 为止，`--strict` 选项会启用下面的八个编译选项：

- --alwaysStrict
- --strictBindCallApply
- --strictFunctionTypes
- --strictNullChecks
- --strictPropertyInitialization
- --noImplicitAny
- --noImplicitThis
- --useUnknownInCatchVariables

未来的 Typescript 版本可能会添加更多的类型检查选项到这个集合中。这意味着你不用跟踪每一次的 Typescript 发布使得你的项目能启用新的严格检查相关的选项。如果新的选项被添加到上面的集合中，只要升级了你项目的 Typescript 版本它们就会被自动激活。

### 选择性关闭某一些选型

每一个通过 `--strict` 开启的选项都可以被单独设置。也就是说，你依然可以在覆盖默认值的前提下默认使用严格模式。

举个例子，`--alwaysStrict` 选项会让编译器使用严格模式解析所有的源文件并且注入 “use strict” 指令，如果你想开启除此以外的所有严格类型检查选项，你可以像下面这样来设置你的 tsconfig.json 配置文件：

```json
{
  "strict": true,
  "alwaysStrict": false
}
```

这个配置会如你期望的一样开启除 `--alwaysStrict` 以外的所有严格类型检查选项。你依然可以自动享受未来新增的严格检查选型的好处。

### 通过 tsc --init 自动生成配置文件模板

为了帮你初始化一个新的 Typescript 项目，编译器提供了自动生成配置文件的功能：

```bash
$ tsc --init
message TS6071: Successfully created a tsconfig.json file.
```

运行该命令后，你会在当前工作目录中发现一个 tsconfig.json 文件。生成的配置内容应该和下面的差不多：

```json
{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig.json to read more about this file */

    /* Basic Options */
    // "incremental": true,                         /* Enable incremental compilation */
    "target": "es5" /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ES2021', or 'ESNEXT'. */,
    "module": "commonjs" /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', 'es2020', or 'ESNext'. */,
    // "lib": [],                                   /* Specify library files to be included in the compilation. */
    // "allowJs": true,                             /* Allow javascript files to be compiled. */
    // "checkJs": true,                             /* Report errors in .js files. */
    // "jsx": "preserve",                           /* Specify JSX code generation: 'preserve', 'react-native', 'react', 'react-jsx' or 'react-jsxdev'. */
    // "declaration": true,                         /* Generates corresponding '.d.ts' file. */
    // "declarationMap": true,                      /* Generates a sourcemap for each corresponding '.d.ts' file. */
    // "sourceMap": true,                           /* Generates corresponding '.map' file. */
    // "outFile": "./",                             /* Concatenate and emit output to single file. */
    // "outDir": "./",                              /* Redirect output structure to the directory. */
    // "rootDir": "./",                             /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
    // "composite": true,                           /* Enable project compilation */
    // "tsBuildInfoFile": "./",                     /* Specify file to store incremental compilation information */
    // "removeComments": true,                      /* Do not emit comments to output. */
    // "noEmit": true,                              /* Do not emit outputs. */
    // "importHelpers": true,                       /* Import emit helpers from 'tslib'. */
    // "downlevelIteration": true,                  /* Provide full support for iterables in 'for-of', spread, and destructuring when targeting 'ES5' or 'ES3'. */
    // "isolatedModules": true,                     /* Transpile each file as a separate module (similar to 'ts.transpileModule'). */

    /* Strict Type-Checking Options */
    "strict": true /* Enable all strict type-checking options. */,
    // "noImplicitAny": true,                       /* Raise error on expressions and declarations with an implied 'any' type. */
    // "strictNullChecks": true,                    /* Enable strict null checks. */
    // "strictFunctionTypes": true,                 /* Enable strict checking of function types. */
    // "strictBindCallApply": true,                 /* Enable strict 'bind', 'call', and 'apply' methods on functions. */
    // "strictPropertyInitialization": true,        /* Enable strict checking of property initialization in classes. */
    // "noImplicitThis": true,                      /* Raise error on 'this' expressions with an implied 'any' type. */
    // "alwaysStrict": true,                        /* Parse in strict mode and emit "use strict" for each source file. */

    /* Additional Checks */
    // "noUnusedLocals": true,                      /* Report errors on unused locals. */
    // "noUnusedParameters": true,                  /* Report errors on unused parameters. */
    // "noImplicitReturns": true,                   /* Report error when not all code paths in function return a value. */
    // "noFallthroughCasesInSwitch": true,          /* Report errors for fallthrough cases in switch statement. */
    // "noUncheckedIndexedAccess": true,            /* Include 'undefined' in index signature results */
    // "noImplicitOverride": true,                  /* Ensure overriding members in derived classes are marked with an 'override' modifier. */
    // "noPropertyAccessFromIndexSignature": true,  /* Require undeclared properties from index signatures to use element accesses. */

    /* Module Resolution Options */
    // "moduleResolution": "node",                  /* Specify module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6). */
    // "baseUrl": "./",                             /* Base directory to resolve non-absolute module names. */
    // "paths": {},                                 /* A series of entries which re-map imports to lookup locations relative to the 'baseUrl'. */
    // "rootDirs": [],                              /* List of root folders whose combined content represents the structure of the project at runtime. */
    // "typeRoots": [],                             /* List of folders to include type definitions from. */
    // "types": [],                                 /* Type declaration files to be included in compilation. */
    // "allowSyntheticDefaultImports": true,        /* Allow default imports from modules with no default export. This does not affect code emit, just typechecking. */
    "esModuleInterop": true /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */,
    // "preserveSymlinks": true,                    /* Do not resolve the real path of symlinks. */
    // "allowUmdGlobalAccess": true,                /* Allow accessing UMD globals from modules. */

    /* Source Map Options */
    // "sourceRoot": "",                            /* Specify the location where debugger should locate TypeScript files instead of source locations. */
    // "mapRoot": "",                               /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSourceMap": true,                     /* Emit a single file with source maps instead of having a separate file. */
    // "inlineSources": true,                       /* Emit the source alongside the sourcemaps within a single file; requires '--inlineSourceMap' or '--sourceMap' to be set. */

    /* Experimental Options */
    // "experimentalDecorators": true,              /* Enables experimental support for ES7 decorators. */
    // "emitDecoratorMetadata": true,               /* Enables experimental support for emitting type metadata for decorators. */

    /* Advanced Options */
    "skipLibCheck": true /* Skip type checking of declaration files. */,
    "forceConsistentCasingInFileNames": true /* Disallow inconsistently-cased references to the same file. */
  }
}
```

注意 `--strict` 是默认开启的。这意味着初始化一个 Typescript 项目后，你会自动进入默认严格模式。
