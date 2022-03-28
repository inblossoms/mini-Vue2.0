// 响应式化的部分
let ARRAY_METHOD = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice',
];
let array_methods = Object.create(Array.prototype);
//  替换 原型方法
ARRAY_METHOD.forEach(method => {
  array_methods[method] = function () {
    // 将数据进行响应式化
    [...arguments].forEach(item => {
      observe(item);
    })

    let res = Array.prototype[method].apply(this, arguments)
    return res
  }
})
//  vue 中通过 Object.defineProperty()  对数据进行响应式设置
// 简化后的版本
function defineReactive(targetObj, prop, value, enumerable) {
  // 折中处理后, this 就是 Vue 实例 ：  let _this = targetObj;
  // 判断非数组的引用类型
  if (typeof (value) == "object" && value != null) {
    observe(value, targetObj);// 递归处理的是非数组的引用类型
  }

  let dep = new Dep();  // 为每一个属性定义 dep 对象
  dep.__propName__ = prop;
  // 函数内部就是一个局部作用域 value就只在函数内部使用的变量
  Object.defineProperty(targetObj, prop, {
    configurable: true,
    enumerable: !!enumerable,
    get() {
      // 依赖收集
      dep.depend();

      return value;
    },
    set(newVal) {
      if (value === newVal) return;

      // 目的
      // 将重新赋值的数据变成响应式的, 因此如果传入的是对象类型, 那么就需要使用 observe 将其转换为响应式
      if (typeof newVal === 'object' && typeof newVal != null) {
        // observe(newVal, _this); // 此方法在目前间断作为过渡 不安全
        observe(newVal)
      }
      value = newVal

      dep.notify(); // 派发更新 找到全局的 watcher，调用 update

      // typeof _this.mountComponent == "function" && _this.mountComponent();// 模板刷新 ( 这现在是假的, 只是演示 )
      /*
      * 临时处理： 数组当前写法并没有参与到页面上（在数组上进行响应式处理就不需要页面刷新，这里无法被调用暂时是没有关系的）
      *   在替换原型的方法中 我们当前没有办法传入参数，所以&& 左边的_this是拿不到值的
      *   处于undefined等式不成立，&& 右边的代码也就不会被执行（不会触发这个页面的更新，只是数据的更新）
      *  */
    }
  })
}

// 将对象 obj 变成响应式不仅仅局限于他的成员，vm就是myVue的实例作调用时的上下文
function observe(obj, vm) {
  // 在 rectify函数中并没有对 obj 本身进行操作，这里解决掉这个问题
  if (Array.isArray(obj)) {
    obj.__proto__ = array_methods;
    for (let i = 0; i < obj.length; i++) {
      observe(obj[i], vm); // 处理每一个数组元素
    }
  } else {
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      let prop = keys[i]; // 属性名
      defineReactive(obj, prop, obj[prop], true);
    }
  }

}

/*
*  对 MyVue 的实例对象做响应式化
* */
MyVue.prototype.initData = function () {
  // 遍历 this._data 的成员，将属性转化为响应式，将直接属性代理到实例上
  let keys = Object.keys(this._data);
  // 响应式化: 这里将 对象this._data[ item ]变成响应式的
  observe(this._data, this)
  // 代理: 将this._data[ item ]映射到 this.[ item ]上
  keys.forEach(item => {
    /*
    *  这里要 调用者 this 提供 keys[ item ] 这个属性，
    * 在访问这个属性的时候相当于访问 this._data
    * */
    proxy(this, "_data", item)
  })
}

/* 将 某个对象的属性访问修改操作  映射到 对象的某一个属性成员上 */
function proxy(target, prop, key) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,

    get() {
      return target[prop][key]
    },
    set(newVal) {
      target[prop][key] = newVal
    }
  })
}
