title: Promise
author:
  name: cybai
  twitter: cyb_0815
  url: http://cybai.github.io/
theme: jdan/cleaver-retro
output: index.html
controls: true

--

<link href="prism/prism.css" rel="stylesheet" type="text/css" />
<script src="prism/prism.js" type="text/javascript"></script>
<style>
  .slide-content {
    height: auto;
  }
</style>

# Promises
## Let's escape from `Callback Hell` with `Promise`

--

### Reference from the blog

這份Slides全部節錄至 [Nolan Lawson](https://twitter.com/nolanlawson) 寫在 [PouchDB 官方的 Blog](https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)。

--

### 以下四種 Promise 差別在哪？

``` js
doSomething().then(function () {
  return doSomethingElse();
});

doSomething().then(function () {
  doSomethingElse();
});

doSomething().then(doSomethingElse());

doSomething().then(doSomethingElse);
```

###### 最後再來公佈答案 😉

--

### Promise 解決什麽問題？

> Promises 的確解決了 Callback Hell 的問題，但絕對不只是排版上的問題。就像在 [Redemption from Callback Hell](http://youtu.be/hf1T_AONQJU) 這場很棒的talk中所解釋的，callback真正的問題是他讓我們不用寫 `return` 或是 `throw` 等關鍵字。但是，反觀這樣程式的整個流程就是以 `副作用(side effects)` 為基礎：一個 function 順便去呼叫另外一個 function。

--

### Promise 解決什麽問題？(Cont.)

> To me, promises are all about `code structure` and `flow`.
>
> --- Nolan Lawson, 18 May 2015

--

### 菜鳥錯誤 #1: 落入 Promise 的死亡金字塔

```js
// Bad Practice
remotedb.allDocs({
  include_docs: true,
  attachments: true
}).then(function (result) {
  var docs = result.rows;
  docs.forEach(function(element) {
    localdb.put(element.doc).then(function(response) {
      alert("Pulled doc with id " + element.doc._id + " and added to local db.");
    }).catch(function (err) {
      if (err.name == 'conflict') {
        localdb.get(element.doc._id).then(function (resp) {
          localdb.remove(resp._id, resp._rev).then(function (resp) {
// et cetera...
```

--

### 菜鳥錯誤 #1: 落入 Promise 的死亡金字塔 (Cont.)

```js
// Better Style
remotedb.allDocs(...).then(function (resultOfAllDocs) {
  return localdb.put(...);
}).then(function (resultOfPut) {
  return localdb.get(...);
}).then(function (resultOfGet) {
  return localdb.put(...);
}).catch(function (err) {
  console.log(err);
});
```

- 不要以為只有初學者才會犯這種錯，上一張slide的 bad practice 就是源自於[黑莓的 code ](https://github.com/blackberry/BB10-WebWorks-Community-Samples/blob/d6ee75fe23a10d2d3a036013b6b1a0c07a542099/pdbtest/www/js/index.js#L190-L266)
- 這叫做 `composing promises` (組合式promises)

--

### 菜鳥錯誤 #2: 殺小，我用 Promise 的話要怎麽做 `forEach` ?

```js
// Bad Practice
// I want to remove() all docs
db.allDocs({include_docs: true}).then(function (result) {
  result.rows.forEach(function (row) {
    db.remove(row.doc);  
  });
}).then(function () {
  // I naively believe all docs have been removed() now!
});
```

--

### 菜鳥錯誤 #2: 殺小，我用 Promise 的話要怎麽做 `forEach` ? (Cont.)

```js
// Better Style
db.allDocs({include_docs: true}).then(function (result) {
  return Promise.all(result.rows.map(function (row) {
    return db.remove(row.doc);
  }));
}).then(function (arrayOfResults) {
  // All docs have really been removed() now!
});
```

> 這邊發生了什麽事呢？ 基本上 Promise.all() 拿 array 的 promises 當作 input，然後他會在所有的 promise 都 resolve 之後再將結果傳至 then()。他也等於是非同步的 for-loop。

--

### 菜鳥錯誤 #3: 忘記加 `.catch()`

```js
somePromise().then(function () {
  return anotherPromise();
}).then(function () {
  return yetAnotherPromise();
}).catch(console.log.bind(console)); // <-- this is badass
```

--

### 菜鳥錯誤 #4: 使用 `"deferred"`

> 簡言之，Promise 有個很長的歷史與故事，他也花了 JS 社群很長的時間來將他規範到正確的方向。
> 在較早之前，jQuery 和 Angular 在每個地方都使用 `deferred` 模式，現在已經由 `ES6 Promise spec`
> 所代替，其他的 `"好"` library 們也有實作這個功能，例如 `Q`, `When`, `RSVP`, `Bluebird`, `Lie`
> 等等。所以如果你有想這麽做，那麽你就錯了。但該怎麽避免呢？

--

### 菜鳥錯誤 #4: 使用 `"deferred"` (Cont.)

第一種：
> 大多 Promise libraries 都會讓你有辦法將 `Promise` 導入第三方的 libraries。

```js
// ex. Angular's `$q`
$q.when(db.put(doc)).then(/* ... */); // <-- this is all the code you need
```

--

### 菜鳥錯誤 #4: 使用 `"deferred"` (Cont.)

第二種：
> 利用 [Revealing Constructor Pattern](https://blog.domenic.me/the-revealing-constructor-pattern/)
> ，這種用法在包裝 非promise API 時很好用

```js
new Promise(function (resolve, reject) {
  fs.readFile('myfile.txt', function (err, file) {
    if (err) {
      return reject(err);
    }
    resolve(file);
  });
}).then(/* ... */)
```

--

### 菜鳥錯誤 #4: 使用 `"deferred"` (Cont.)

在 `Bluebird` 的文件中有解釋為什麽 `使用"deferred"` 是 anti-pattern。

> In Deferred anti-pattern, "deferred" objects are created for no reason, complicating code.

[The Deferred anti-pattern](https://github.com/petkaantonov/bluebird/wiki/Promise-anti-patterns#the-deferred-anti-pattern)

--

### 菜鳥錯誤 #5: 使用 methods (side effects) 而不是 return 他們

```js
// Bad Practice
somePromise().then(function () {
  someOtherPromise();
}).then(function () {
  // Gee, I hope someOtherPromise() has resolved!
  // Spoiler alert: it hasn't.
});
```

--

### 菜鳥錯誤 #5: 使用 methods (side effects) 而不是 return 他們 (Cont.)

```js
somePromise().then(function () {
  // I'm inside a then() function!
});
```

在 `then()` function 裡面我們應該做的有：
  1. `return` another promise
  2. `return` a synchronous value (or `undefined`)
  3. `throw` a synchronous error

--

### 菜鳥錯誤 #5: 使用 methods (side effects) 而不是 return 他們 (Cont.)

第一種: Return another promise
> 最需要注意的是在第二個 promise 使用 `return`，這個 `return` 非常重要。
> 如果沒有使用 `return` 的話，`getUserAccountById()` 就只是個副作用，
> 然後下一個 function 會收到 `undefined` 而不是 `userAccount`。

```js
getUserByName('nolan').then(function (user) {
  return getUserAccountById(user.id);
}).then(function (userAccount) {
  // I got a user account!
});
```

--

### 菜鳥錯誤 #5: 使用 methods (side effects) 而不是 return 他們 (Cont.)

第二種: Return a synchronous value (or undefined)
> return `undefined` 通常都是一個錯誤的作法，但 return 一個同步的值
> 是個很棒的方法來將同步的 code 轉成 promise-way 的 code。

```js
getUserByName('nolan').then(function (user) {
  if (inMemoryCache[user.id]) {
    return inMemoryCache[user.id];    // returning a synchronous value!
  }
  return getUserAccountById(user.id); // returning a promise!
}).then(function (userAccount) {
  // I got a user account!
});
```

--

### 菜鳥錯誤 #5: 使用 methods (side effects) 而不是 return 他們 (Cont.)

第三種: Throw a synchronous error
> 講到 `throw`，這就是 promise 很棒的其中一點。
> `catch()` 會在使用者登出時收到同步的錯誤，他也會收到任何
> 被 `reject` 的同步錯誤。

```js
getUserByName('nolan').then(function (user) {
  if (user.isLoggedOut()) {
    throw new Error('user logged out!'); // throwing a synchronous error!
  }
  if (inMemoryCache[user.id]) {
    return inMemoryCache[user.id];       // returning a synchronous value!
  }
  return getUserAccountById(user.id);    // returning a promise!
}).then(function (userAccount) {
  // I got a user account!
}).catch(function (err) {
  // Boo, I got an error!
});
```

--

### 進階錯誤 #1: 忽略 `Promise.resolve()`

```js
new Promise(function (resolve, reject) {
  resolve(someSynchronousValue);
}).then(/* ... */);
```

可以透過 `Promise.resolve()` 簡短的寫成：

```js
Promise.resolve(someSynchronousValue).then(/* ... */);
```

--

### 進階錯誤 #1: 忽略 `Promise.resolve()`

因為這方法非常好用，可以將 promise-returning API methods 寫成：

```js
function somePromiseAPI() {
  return Promise.resolve().then(function () {
    doSomethingThatMayThrow();
    return 'foo';
  }).then(/* ... */);
}
```

但千萬也別忘了 `.catch()` 他。

--

### 進階錯誤 #1: 忽略 `Promise.resolve()`

同樣的，也可以使用 `Promise.reject()` 來馬上 reject 並 return promise

```js
Promise.reject(new Error('some awful error'));
```

--

### 進階錯誤 #2: `catch()` 並不完全等於 `then(null, ...)`

在部落格中前段有提到 `.catch()` 是個 sugar，所以下列兩者會相等

```js
somePromise().catch(function (err) {
  // handle error
});

somePromise().then(null, function (err) {
  // handle error
});
```

--

### 進階錯誤 #2: `catch()` 並不完全等於 `then(null, ...)` (Cont.)

但並不代表下列兩者會相等

```js
somePromise().then(function () {
  return someOtherPromise();
}).catch(function (err) {
  // handle error
});

somePromise().then(function () {
  return someOtherPromise();
}, function (err) {
  // handle error
});
```

--

### 進階錯誤 #2: `catch()` 並不完全等於 `then(null, ...)` (Cont.)

如果不知道為什麽不一樣的話，`throw` error 就知道了

```js
somePromise().then(function () {
  throw new Error('oh noes');
}).catch(function (err) {
  // I caught your error! :)
});

somePromise().then(function () {
  throw new Error('oh noes');
}, function (err) {
  // I didn't catch your error! :(
});
```

--

### 進階錯誤 #2: `catch()` 並不完全等於 `then(null, ...)` (Cont.)

Another example of previous slide:
```js
Promise.resolve(2).then((val) => {
  if (val > 10) {
    return val;
  }
  throw new Error('The number is too small');
})
  .then((val) => console.log(val * 10))
  .catch((err) => console.log('Error in catch method', err))

Promise.resolve(2).then((val) => {
  if (val > 10) {
    return val;
  }
  throw new Error('The number is too small');
}, (err) => {
  console.log('Error in rejectHandler', err)
})
  .then((val) => console.log(val * 10))
```

--

### 進階錯誤 #2: `catch()` 並不完全等於 `then(null, ...)` (Cont.)

如果寫 [mocha](http://mochajs.org/) 的 unit test 跑跑看的話
```js
it('should throw an error', function () {
  return doSomethingThatThrows().then(function () {
    throw new Error('I expected an error!');
  }, function (err) {
    should.exist(err);
  });
});
```

--

### 進階錯誤 #3: promises vs promise factories

如果你想要執行一系列的行為在一個promise序列中，
換句話說，你可能會想要執行他們像 `Promise.all()`，
但不是狀況下在平行的執行。
```js
function executeSequentially(promises) {
  var result = Promise.resolve();
  promises.forEach(function (promise) {
    result = result.then(promise);
  });
  return result;
}
```

很不幸的，他們執行的不如預期。傳入 `executeSequentially()` 的
promises 還是平行的執行。

--

### 進階錯誤 #3: promises vs promise factories (Cont.)

上一個 example 會這樣運作的原因是因為每個 promise 一被創造
就開始執行，所以你需要的是 an array of promise factories

```js
function executeSequentially(promiseFactories) {
  var result = Promise.resolve();
  promiseFactories.forEach(function (promiseFactory) {
    result = result.then(promiseFactory);
  });
  return result;
}
```

--

### 進階錯誤 #3: promises vs promise factories (Cont.)

一個 promise factory 很簡單，因為他只是一個 function 回傳一個 promise
```js
function myPromiseFactory() {
  return somethingThatCreatesAPromise();
}
```

他為什麽能夠運作呢？因為他並不會創造一個 promise 直到他被執行時。
他就像個 `then` function 一樣在運作，事實上，他們正是一樣的事情。

--

### 進階錯誤 #4: okay, 那如果我想要兩個 promise 的結果呢？

有時候，promise 會需要依靠其他 promise 所回傳的值，但是我們可能需要
兩個 promise 以上的值，例如：
```js
getUserByName('nolan').then(function (user) {
  return getUserAccountById(user.id);
}).then(function (userAccount) {
  // dangit, I need the "user" object too!
});
```

--

### 進階錯誤 #4: okay, 那如果我想要兩個 promise 的結果呢？ (Cont.)

身為一個好的 JavaScript 工程師，應該會在上一層 scope 宣告一個 `user` 變數
```js
var user;
getUserByName('nolan').then(function (result) {
  user = result;
  return getUserAccountById(user.id);
}).then(function (userAccount) {
  // okay, I have both the "user" and the "userAccount"
});
```

這麽寫雖然沒錯，但是作者覺得這是個拙劣的設計。

--

### 進階錯誤 #4: okay, 那如果我想要兩個 promise 的結果呢？ (Cont.)

所以作者覺得應該要這麽做 (這時應該要拋去成見，樂於接受金字塔)

```js
getUserByName('nolan').then(function (user) {
  return getUserAccountById(user.id).then(function (userAccount) {
    // okay, I have both the "user" and the "userAccount"
  });
});
```

--

### 進階錯誤 #4: okay, 那如果我想要兩個 promise 的結果呢？ (Cont.)

如果排版對你來說真的是個 issue 的話，那麽你可以把他們都拉成 function
```js
function onGetUserAndUserAccount(user, userAccount) {
  return doSomething(user, userAccount);
}

function onGetUser(user) {
  return getUserAccountById(user.id).then(function (userAccount) {
    return onGetUserAndUserAccount(user, userAccount);
  });
}

getUserByName('nolan')
  .then(onGetUser)
  .then(function () {
  // at this point, doSomething() is done, and we are back to indentation 0
});
```

--

### 進階錯誤 #4: okay, 那如果我想要兩個 promise 的結果呢？ (Cont.)

如果 promise 中的 code 開始變得複雜了，那麽也是應該把他們拉出來變成 function，
然後就變成漂亮的 code 了
```js
putYourRightFootIn()
  .then(putYourRightFootOut)
  .then(putYourRightFootIn)  
  .then(shakeItAllAbout);
```

--

### 進階錯誤 #5: 失敗的Promise

這段 code 會印出什麽？

```js
Promise.resolve('foo').then(Promise.resolve('bar')).then(function (result) {
  console.log(result);
});
```

--

### 進階錯誤 #5: 失敗的Promise

這段 code 會印出什麽？

```js
Promise.resolve('foo').then(Promise.resolve('bar')).then(function (result) {
  console.log(result);
});
```

他會印出 `foo`，如果你覺得是 `bar` 的話就錯了！

--

### 進階錯誤 #5: 失敗的Promise (Cont.)

原因是因為當你傳一個 non-function (例如, 一個 promise) 給 `then()` 的時候，
他會直接幫你直譯成 `then(null)`，因此就導致前一個範例的結果印失敗了，
你也可以試試看這個範例
```js
Promise.resolve('foo').then(null).then(function (result) {
  console.log(result);
});
```

--

### 進階錯誤 #5: 失敗的Promise (Cont.)

在這邊又得提到前面 `promises vs promise factories` 所提到的。
簡言之，你`可以`直接傳一個 promise 給 `then()`，但他並不會執行的如你所想，
`then()` 應該接收一個 function 當作參數，所以大多情況你應該這麽做
```js
Promise.resolve('foo').then(function () {
  return Promise.resolve('bar');
}).then(function (result) {
  console.log(result);
});
```

--


#
> 還記得第一頁的題目嗎？
>
> 再來讓我們公佈答案吧！

--

### 以下四種 Promise 差別在哪？

``` js
doSomething().then(function () {
  return doSomethingElse();
});

doSomething().then(function () {
  doSomethingElse();
});

doSomething().then(doSomethingElse());

doSomething().then(doSomethingElse);
```

--

### Answer of Puzzle #1

```js
doSomething().then(function () {
  return doSomethingElse();
}).then(finalHandler);
```

--

### Answer of Puzzle #1

```js
doSomething().then(function () {
  return doSomethingElse();
}).then(finalHandler);
```

Answer:
```js
doSomething
|-----------------|
                  doSomethingElse(undefined)
                  |------------------|
                                     finalHandler(resultOfDoSomethingElse)
                                     |------------------|
```

--

### Answer of Puzzle #2

```js
doSomething().then(function () {
  doSomethingElse();
}).then(finalHandler);
```

--

### Answer of Puzzle #2

```js
doSomething().then(function () {
  doSomethingElse();
}).then(finalHandler);
```

Answer:
```js
doSomething
|-----------------|
                  doSomethingElse(undefined)
                  |------------------|
                  finalHandler(undefined)
                  |------------------|
```

--

### Answer of Puzzle #3

```js
doSomething().then(doSomethingElse())
  .then(finalHandler);
```

--

### Answer of Puzzle #3

```js
doSomething().then(doSomethingElse())
  .then(finalHandler);
```

Answer:
```js
doSomething
|-----------------|
doSomethingElse(undefined)
|---------------------------------|
                  finalHandler(resultOfDoSomething)
                  |------------------|
```

--

### Answer of Puzzle #4

```js
doSomething().then(doSomethingElse)
  .then(finalHandler);
```

--

### Answer of Puzzle #4

```js
doSomething().then(doSomethingElse)
  .then(finalHandler);
```

Answer:
```js
doSomething
|-----------------|
                  doSomethingElse(resultOfDoSomething)
                  |------------------|
                                     finalHandler(resultOfDoSomethingElse)
                                     |------------------|
```

--

### Reference

- [We have a problem with promises](https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)
- [JSBin to demonstrate what mentioned in the blog](http://jsbin.com/tuqukakawo/1/edit?js,console,output)
- [promise protips cheat sheet](https://gist.github.com/nolanlawson/6ce81186421d2fa109a4)
- [A refactor of PouchDB's map/reduce module](https://github.com/pouchdb/mapreduce/commit/dfe44b0ab3da9d213640a1010b34bb27327da4c9)

--

# 再次感謝 [Nolan Lawson](https://twitter.com/nolanlawson) 的文章介紹的這麽仔細
# m(\_ \_)m
