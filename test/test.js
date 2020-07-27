const { MyPromise } = require('../src/promise')

const promise1 = new MyPromise((resolve, reject) => {
    setTimeout(() =>{
        resolve(111);
    },100)
});


const promise2 = new MyPromise((resolve, reject) => { 
    setTimeout(() => { 
        resolve(222);
    }, 200)
})

// const racePromise = MyPromise.race([promise1, promise2]);
// console.log(racePromise.then((value)=> { console.log(value)}, (err) => {console.log(err)}));

const allPromise = MyPromise.all([promise1, promise2])
console.log(allPromise.then((value)=> { console.log(value)}))
