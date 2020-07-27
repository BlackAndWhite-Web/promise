const  { PEDDING, RESOLVE, REJECT, isFunction }  = require('./const');

class MyPromise {
    constructor(fn) {
        if(!isFunction(fn)) throw new Error('fn must be a function');
        this.status = PEDDING;
        this.value = undefined;
        this.resolveCallback = [];
        this.rejectCallback = [];

        const resolve = (val) => {
            if(this.status !== PEDDING) return;
            const runResolve = (value) => {
                let cb;
                // 推出resolveCallback中的回调，去执行回调&清空当前回调；
                while(cb = this.resolveCallback.shift()) {
                    cb(value)
                }
            }
            const runReject = (err) => {
                let cb;
                while(cb = this.rejectCallback.shift()) {
                    cb(err);
                }
            }
            if(val instanceof Promise) {
                // 如果结果是promise，那么就用val.then来连接，等val的异步行为完成后，在then中去执行外层promise的回调和状态改变
                val.then((value) => {
                    this.status = RESOLVE;
                    this.value = value;
                    runResolve(value);
                }, (err) => {
                    this.status = REJECT;
                    this.value = err;
                    runReject(err)
                })
            } else {
                this.status = RESOLVE;
                this.value = val;
                runResolve(val);
            }

        }

        const reject = (err) => {
            if(this.status !== PEDDING) return;
            this.status = REJECT;
            this.value = err;
            runReject(val);
        }

        try {
            fn(resolve, reject);
        } catch (err) {
            reject(err);
        }

    }

    then(onResolve, onReject) {
        // then链式调用，返回的也是一个全新promise;
        // then的链式调用需要传递下去，链式调用就是管道一般，把value值一直往后带过去
        // 返回的这个promise,实际就是下一个then中的两个参数(resolveNext, rejectNext)；当前上一个then中（onResolve, onReject),影响下一个promise的结果；传递下去；如果没有return,就返回undefined
        return new Promise((resolveNext, rejectNext) => {
            const { status } = this;
            const resolveFn = (value) => {
                try {
                    // 规范中定义，如果onResolve不是函数，就直接执行resolveNext
                    if(!isFunction(onResolve)) {
                        resolveNext(value);
                    } else {
                        const res = onResolve(value);
                        if(res instanceof Promise) {
                            res.then(resolveNext, rejectNext);
                        } else {
                            resolveNext(res)
                        }
                    }
                    
                } catch(err) {
                    rejectNext(err);
                }
            }

            const rejectFn = (err) => {
                try {
                    if(!isFunction(onReject)) {
                        rejectNext(err);
                    } else {
                        const res = onReject(err);
                        if(res instanceof Promise) {
                            res.then(resolveNext, rejectNext);
                        } else {
                            rejectNext(res)
                        }
                    }
                } catch(err) {
                    rejectNext(err);
                }
            }

            switch(status) {
                case PEDDING:
                    this.resolveCallback.push(resolveFn);
                    this.rejectCallback.push(rejectFn);
                    break;
                case RESOLVE:
                    this.resolveCallback.push(resolveFn);
                    break;
                case REJECT:
                    this.resolveCallback.push(rejectFn);
                    break;
            }
        })
    }

    catch(rejectCb) {
        return this.then(null, rejectCb);
    }

    static resolve(resolveCb) {
        if(resolveCb instanceof Promise) return resolveCb;
        return new Promise((resolve, reject) => resolve(resolveCb));
    }
    static reject(rejectCb) {
        return new Promise((resolve, reject) => reject(rejectCb));
    }

    // 返回promise
    // 返回第一个状态改变的promise
    static race(list) {
        return new Promise((resolve, reject) => {
            for(const item of list) {
                // 可能传入的list中不真的是promise,用resolve包装一层；
                this.resolve(item).then((value) => {
                    resolve(value);
                }, err => {
                    reject(err);
                })
            }
        })
    }

    // 返回的还是一个promise
    // list中全转为resolve,才返回resolve
    // 只要一个reject全部reject
    static all(list) {
        return new Promise((resolve, reject) => {
            let count = 0;
            const arr = [];
            for(let i=0;i<list.length;i++) {
                this.resolve(list[i]).then((value) => {
                    count++;
                    arr[i] = value;
                    if(count === list.length) {
                        resolve(arr);
                    }
                }, (err) => {
                    reject(err);
                })
            }
        })
    }
}

module.exports = {
    MyPromise: MyPromise
}