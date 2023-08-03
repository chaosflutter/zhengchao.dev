---
title: 'TypeScript 中的拼写更正'
date: '2021-03-07'
topics: ['ts-evolution', 'typescript']
origin: 'https://mariusschulz.com/blog/spelling-correction-in-typescript'
---

Typescript 2.4 实现了标识符拼写更正机制。即便你只是稍微拼写错了变量、属性，或者函数名，Typescript 也会尽可能地给出正确的拼写建议。

### 拼写更正实际案例

你想调用 `window.location.reload()`来重载应用的当前页面，但你不小心打了`locatoin`或其他可能的拼写错误，Typescript 就会给出正确的拼写建议并且提供快速修复功能：

![](https://blog-1258648987.cos.ap-shanghai.myqcloud.com/blog/typescript-evolution/typescript_spelling_correction-2x.tvas6pyfzn.imm.png)

这种校验更正机制对于那些经常拼错的名字非常有用。比如单词 "referrer"，你可能会写成以下的几种情况，而不是 `document.referrer`：

- document.referer
- document.refferer
- document.refferrer

Typescript 会认出所有这些拼写错误，并且给出正确的 `document.referrer` 作为建议。它甚至可以认出并更正以下的这些（更奇特的）变体：

- document.referrerer
- document.referrawr
- document.refferrrr

当然，如果只是输入 `document.ref` 并且按 `TAB` 或着 `ENTER` 让 Typescript 帮你自动补全你并不需要拼写建议，但如果你快速输入了完整的属性名，你很可能会拼写错误并需要更正建议。

### 莱文斯坦距离和启发

在内部实现中，Typescript 会计算拼错名字和当前位置可能的候选单词列表中每个单词的莱文斯坦距离。最佳的匹配（如果有）会作为拼写更正建议返回。

这个算法是由 Typescript 编译器 `checker.ts` 文件中的 `getSpellingSuggestionForName` 函数实现的。在写作当下，它的代码如下：

```ts
/**
 * Given a name and a list of symbols whose names are *not* equal to the name, return a spelling suggestion if there is one that is close enough.
 * Names less than length 3 only check for case-insensitive equality, not levenshtein distance.
 *
 * If there is a candidate that's the same except for case, return that.
 * If there is a candidate that's within one edit of the name, return that.
 * Otherwise, return the candidate with the smallest Levenshtein distance,
 *    except for candidates:
 *      * With no name
 *      * Whose meaning doesn't match the `meaning` parameter.
 *      * Whose length differs from the target name by more than 0.34 of the length of the name.
 *      * Whose levenshtein distance is more than 0.4 of the length of the name
 *        (0.4 allows 1 substitution/transposition for every 5 characters,
 *         and 1 insertion/deletion at 3 characters)
 */
function getSpellingSuggestionForName(
  name: string,
  symbols: Symbol[],
  meaning: SymbolFlags
): Symbol | undefined {
  const maximumLengthDifference = Math.min(2, Math.floor(name.length * 0.34))
  let bestDistance = Math.floor(name.length * 0.4) + 1 // If the best result isn't better than this, don't bother.
  let bestCandidate: Symbol | undefined
  let justCheckExactMatches = false
  const nameLowerCase = name.toLowerCase()
  for (const candidate of symbols) {
    const candidateName = symbolName(candidate)
    if (
      !(
        candidate.flags & meaning &&
        Math.abs(candidateName.length - nameLowerCase.length) <=
          maximumLengthDifference
      )
    ) {
      continue
    }
    const candidateNameLowerCase = candidateName.toLowerCase()
    if (candidateNameLowerCase === nameLowerCase) {
      return candidate
    }
    if (justCheckExactMatches) {
      continue
    }
    if (candidateName.length < 3) {
      // Don't bother, user would have noticed a 2-character name having an extra character
      continue
    }
    // Only care about a result better than the best so far.
    const distance = levenshteinWithMax(
      nameLowerCase,
      candidateNameLowerCase,
      bestDistance - 1
    )
    if (distance === undefined) {
      continue
    }
    if (distance < 3) {
      justCheckExactMatches = true
      bestCandidate = candidate
    } else {
      Debug.assert(distance < bestDistance) // Else `levenshteinWithMax` should return undefined
      bestDistance = distance
      bestCandidate = candidate
    }
  }
  return bestCandidate
}
```

`getSpellingSuggestionForName` 使用了大量启发来输出合理的拼写建议，既不会太严格也不会太宽松——我觉得这是非常棒的平衡。
