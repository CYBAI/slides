title: ESLint
author:
  name: cybai
  twitter: cyb_0815
  url: http://cybai.github.io/
output: index.html
controls: true

--

# ESLint
## Pluggable JavaScript linter

--

### 今天要講啥

- 什麽是Linting?
- 為什麽我們需要使用 Lint?
- JS Lint 的小歷史
- Install & Demo
- 寫自己的 Rules

--

### 什麽是Linting?

![What is Lint](imgs/Lint.png)

--

### 為什麽我們需要使用 Lint?

* 幫助找到bugs
* 幫助你避免製造白痴錯誤
* 幫助保持 Clean Code
* 讓使用者遵守 Style Guide

--

### JS Lint 的小歷史

一開始，由 `Douglas Crockford` 寫了一個 **`JSHint`**
* **JavaScript: The Good Parts** 的作者
* 遵循 Crockford 個人的 coding style
* 彈性較低，能夠設定的不多

--

### 但如果不喜歡某些 Crockford 的 coding style 怎麽辦？

有些人也這麽覺得。有個人這麽稱呼 JSLint：
> 這是一個能讓你寫code寫得像 `Douglas Crockford` 的工具

後來他 Fork 了JSLint，再施了點魔法，就變成了 **`JSHint`**

* 很像 JSLint 但能讓你自己設定 rules
* 那個人就是 Anton Kovalyov，他和 Ben Vinegar 一起寫了一本書 **Third-Party JavaScript**
* 現在由 `idiomatic.js` 的作者 `Rick Waldron` 在維護

--

### 但如果還想要制定自己的 rules 怎麽辦？

JSHint 已經包涵了大部分的狀況，但可能還是不夠。所以又冒出了另一群人，施了 **更多** 的魔法。也就生出了今天的主題， **ESLint**。

* 像 JSHint，但是並不是他的 Fork。
* 而這不同的魔法讓我們能夠輕鬆的寫屬於我們自己的 rule
* 主要由 `Nicholas Zakas` 開發，他是 **Professional JS for Web Devs** 的作者
  - 另外他的 Blog 也寫了很多很棒的文章 ex. [Why is getElementsByTagName() faster than querySelectorAll()?](https://www.nczonline.net/blog/2010/09/28/why-is-getelementsbytagname-faster-that-queryselectorall/)

--

### 安裝

可以透過 npm 來安裝

  npm install -g eslint

--

### 裝好了，再來要怎麽跑？

首先，你需要寫一個 `.eslintrc`.

也可以透過 cli 來幫你創一個

    eslint --init

再來就可以執行他了

    eslint examples

--

&nbsp;

然後所有的 bad practice 就都跑出來了

出現後就把code改Clean讓他們消失吧！

--

### 如果寫屬於自己的 rule 呢？

但如果我們想要寫屬於我們自己的 rules，我們可以這麽做

``` sh
  npm install -g yo
  npm install -g generator-eslint
```

###### [ESLintプラグインでAST入門](https://speakerdeck.com/oodemi/eslintpuraguindeastru-men)
###### [ESLint 101](http://lewisjellis.com/eslint101/#10)

--

### Refs.

- [ESLint](http://eslint.org/)
- [JSHint](http://www.jshint.com/)
- [JSLint](http://www.jslint.com/)
- [Esprima](http://esprima.org/)
- [SpiderMonkey Parser API](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API)
- [idiomatic.js](https://github.com/rwaldron/idiomatic.js/)
- [Get Started with ESLint v1.0](http://devnull.guru/get-started-with-eslint/)
- [Migrating to v2.0.0](http://eslint.org/docs/user-guide/migrating-to-2.0.0)
- [ESLint2について調べた](http://qiita.com/pirosikick/items/dc1ca841c6e5c8ba0674)
