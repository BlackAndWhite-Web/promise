## Promise
### 含义
- promise是对异步的一种解决方案， promise表示承诺，包裹着未来的值(异步的值)；
- promise的实质还是基于回调的方式，只不过处理和写法上更加优雅了；

### 使用
```js
const promise = new Promise((resolve, reject)=> {
    setTimeout(() => {
        resolve(1);
    }, 100)
})

promise.then((value)=> {
    console.log(value)
}, (err) => {
    console.log(err)
})
```

### promise封装抽象
[promise抽象](./image/image.png)

### 理解难点
> 难点1：promise规范

promise本身就是有一套规则存在的，比如异步结果的值就是promise，怎么处理等，是有一套规范存在的；

> 难点2：promise构造函数中，维护了resolve,reject实现；

在promise的使用上面，可以看到实例化promise时传入了一个函数，这个函数有两个参数（resolve, reject）,这两个参数方法的封装，实际就封装在Promise里面；resolve, reject参数就是异步结果;

> 难点3： then方法实现
- then实现链式调用，在链式调用实现的关键就是返回一个新的promise;
- then返回的这个promise,实际就是下一个then中的两个参数(resolveNext, rejectNext)；当前上一个then中（onResolve, onReject),影响下一个promise的结果；传递下去；如果没有return,就返回undefined
- then实际上就是一个管道，一个函数返回一个函数；在链式调用中是一环扣一环的;上一个promise的结果给到下一个promise
- then(()=>{A}, ()=> {B})， 需要对then的参数进行是否是函数的一个判断；如果then 里面返回的也是一个promise，那么就需要用then连接这两个promise;
- then中就是维护成功失败的回调数组内容；

> 难点4: 对执行方法的返回值判断，如果是Promise，用then方法的连接

> 套路： 基本return promise + then;

- promise构造方法中注重异步结果是否是promise;用then链接；
- then中返回promise;注重执行执行回调的结果本身是否是promise;

### 参考链接
[Promise实现原理（附源码）](https://juejin.im/post/5b83cb5ae51d4538cc3ec354)