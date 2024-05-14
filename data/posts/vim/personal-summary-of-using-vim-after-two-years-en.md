---
title: 'My personal summary after using Vim for two years'
date: '2024-05-14'
topics: ['vim', 'editor']
---

### Why use Vim

The motivation to learn is crucial. Just because many expert programmers use Vim doesn't mean you should learn it with that mindset. If you approach it this way, you're likely to give up after a few attempts, as I once did. Vim has a steep learning curve, and without a strong motivation to learn, it's hard to stick with it.

So why did I start learning Vim again and eventually become accustomed to, even fond of, and dependent on Vim after over two years? The reason is simple: I had to master Vim.

I'm someone who enjoys tinkering. I've bought many cloud servers and often write programs on them, with Vim as my preferred editor. Day after day, when I couldn't tolerate the extremely inefficient coding experience on the server side, I decided to truly master Vim. From that moment on, I deliberately practiced frequently, and one day I found that I had not only survived but also developed a liking for Vim.

I'm not saying you have to buy a cloud server and write code on it (actually, you can use VSCode's remote feature to code on a server now). **What I'm trying to convey is that you must have sufficient motivation to learn, which often comes from necessity, whether it's work-related or related to your personal projects. Perhaps, a strong motivation to show off might work too.**

Of course, when you truly enjoy using Vim, you'll have a new understanding. For example, Vim in some ways represents certain positive values, which I'll mention at the end of this article.

### The best metaphor for the “Normal mode” comes from the book "Practical Vim."

The book "Code Complete" begins with the **metaphor** of software construction, which is an excellent way to establish correct mental models through familiar concepts. Regarding why Vim needs a Normal mode, the best metaphor I've encountered comes from the book "Practical Vim". Here are a few key passages I've excerpted:

> Think of all of the things that painters do besides paint. They study their subject, adjust the lighting, and mix paints into new hues. And when it comes to applying paint to the canvas, who says they have to use brushes? A painter might switch to a palette knife to achieve a different texture or use a cotton swab to touch up the paint that's already been applied.

> The painter does not rest with a brush on the canvas. And so it is with Vim. Normal mode is the natural resting state. The clue is in the name, really.

> Just as painters spend a fraction of their time applying paint,programmers spend a fraction of their time composing code . More time is spent thinking, reading, and navigating from one part of a codebase to another. And when we do want to make a change, who says we have to switch to Insert mode? We can reformat existing code, duplicate it, move it around, or delete it. From Normal mode, we have many tools at our disposal.

The author compares programming to painting, and the Normal mode to the intervals in which a painter paints. **Just as a painter often sets down the brush, steps back to look at the painting, or uses tools like a knife or cotton swab to modify the artwork, a programmer doesn't continuously input code (Insert mode). Programmers also need to think and make modifications to the code (not necessarily inserting content). At this point, they should enter Normal mode. Normal mode allows programmers to rest, contemplate, and provides additional tools such as deleting, copying, pasting, cursor jumping, and so on. Whenever writing code requires a pause for thought, entering Normal mode is appropriate.**

### The most important pattern

This most important pattern is as follows:

```
Action = Operator + Motion
```

Here's an example: the operation "delete all characters from the cursor position to the end of the line" is represented as d$, where d is the operator (action) and $ is the motion (range of action). This pattern is ubiquitous in Vim. Here are a few more examples:

- `dap`: Deletes an entire paragraph.
- `yG`: Copies the current line and all content to the end of the file.
- `cw`: Changes the current word (deletes the word and enters Insert mode).

This is the most basic pattern and the foundation of Vim's efficient text editing capabilities. It abstracts commonly used operators and motions into simple letters, such as `d` for delete operation and `$` for end of the sentence. These abstract symbols can then be combined using the same formula, reducing the burden of memorization. This is where Vim's elegance truly shines. However, there is one exception: if you input two consecutive operators, it means to operate on the current line. For example, `yy` means to copy the current line.

In Vim, there are several commonly used operators, including:

- `d`: Delete (e.g., `dw` deletes a word, `dd` deletes a line)
- `y`: Yank (copy) (e.g., `yw` yanks a word, `yy` yanks a line)
- `c`: Change (e.g., `cw` changes a word, `cc` changes a line)
- `v`: Visual (for selection) (e.g., `vw` visually selects a word, `V` visually selects a line)
- `=`: Indent (e.g., `==` indents the current line)
- `g`: Additional commands (e.g., `gU` converts text to uppercase, `gu` converts text to lowercase)

These operators can be combined with motions to perform various text editing tasks efficiently in Vim.

As for motions, there are many more commonly used ones, including:

- `w`: Move cursor forward to the beginning of the next word
- `b`: Move cursor backward to the beginning of the previous word
- `e`: Move cursor to the end of the current word
- `0` (zero): Move cursor to the beginning of the line
- `$`: Move cursor to the end of the line
- `^`: Move cursor to the first non-blank character of the line
- `gg`: Move cursor to the first line of the file
- `G`: Move cursor to the last line of the file
- `}`: Move cursor to the next paragraph
- `{`: Move cursor to the previous paragraph

These motions, when combined with operators, allow you to efficiently navigate and manipulate text in Vim.

Of course, there are many more motions available in Vim. If you're interested, you can view the complete documentation by typing the following command in Vim's Normal mode:

```
:h motion.txt
```

### Survive first

Before becoming a Vim expert, our primary goal is to survive. This goal is actually not difficult.

Once you master basic cursor movements like `h`, `l`, `k`, `j`, `0`, `^`, `$`, `gg`, `G`, and basic editing operations as mentioned earlier, you have a high chance of survival. However, knowing is not the same as mastering. You need to practice frequently to turn these basic operations into muscle memory.

If you successfully survive, you can already use Vim for some editing tasks in actual development. However, you may still feel that something is not quite right and that you lack more advanced techniques to flow seamlessly. At this point, it may be necessary to read books like "Practical Vim" or similar ones to better grasp Vim's design philosophy and many subtle details. Combined with continuous practice, I believe you will eventually find joy in realizing that you can almost give up the mouse while coding.

Congratulations.

### The ultimate secret to becoming a Vim master

Actually, there is no secret. Vim is fast, but becoming a Vim master is a relatively long process. During this process, you will master more subtle skills, such as how to efficiently use the `f{char}` command to quickly locate a specific character. After surviving, the only thing you can do is to use Vim every day. Gradually, using Vim will become as natural as breathing, and you won't be able to live without it.

Here are some suggestions on how to use Vim every day:

- Make Vim your daily development tool. Learn to use [Neovim](https://neovim.io/), which provides better plugins and extension mechanisms. If you're interested, you can even configure Neovim into a powerful IDE.
- If you're used to using VSCode or other editors, you can install the corresponding [Vim plugin](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim).
- If you use the Chrome browser, you can install the corresponding [Vim plugin](https://chrome.google.com/webstore/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb) to improve browsing efficiency.
- Do you usually take notes? Then use note-taking software that supports Vim shortcuts, such as my favorite [Obsidian](https://obsidian.md/).
- Do you often write code on Cloud IDEs? I recommend using an IDE that supports Vim shortcuts, such as [Replit](https://replit.com/), which I often use.

In short, after I decided to use Vim to improve my coding efficiency, I couldn't bear to work without Vim in any editing scenario. It became so natural that it became a part of my work. There's a discussion on Reddit titled [If using vim is a lifestyle/philosophy, what other products also fits into this lifestyle?](https://www.reddit.com/r/vim/comments/q9zhrc/if_using_vim_is_a_lifestylephilosophy_what_other/), which aptly metaphorizes Vim as a lifestyle/philosophy. Learning to use Vim implies some valuable things. I believe it embodies the pursuit of perfection—being faster and stronger—and the perseverance of long-termism—enduring temporary pain and focusing on the long term. Perhaps it can also be said that if you can become a Vim master one day, you probably can accomplish many other difficult tasks.
