// 挂载
MyVue.prototype.mount = function () {
  // 提供一个 render方法： 生成虚dom
  this.render = this.createRenderFn(); // 该方法就是生成虚拟dom的方法，带有缓存 （vue本身是可以带有render成员）
  this.mountComponent();
}
//  将我们的整个页面做了一个替换 在VUE中：整个的更新是按照组件为单位进行判断，以节点为单位进行更新
MyVue.prototype.mountComponent = function () {
  // 执行 mountComponent() 函数
  let mount = () => {
    this.update(this.render());// 这里update 做了 vue中的虚拟dom和真实dom的diff算法对比
  }
  // 这个 Watcher 就是全局的 Watcher, 在任何一个位置都可以访问他了 ( 简化的写法 )
  new Watcher(this, mount); // 相当于这里调用了 mount

}

/*
* Vue 中使用了 二次提交的 设计结构
* 1. 在页面中的DOM 和虚拟 DOM 是一一对应的关系
* 2. 先 有AST和数据 生成VNode（新，render） --> CreateRenderFn()
* 3. 将旧的的 VNode 和新的VNode进行diff比较，然后更新数据 --> update()
* */
MyVue.prototype.createRenderFn = function () {
  // 该方法是为了生成render的函数，目的是缓存（做 抽象语法树，我们在这里使用虚拟DOM来模拟）
  let ast = generalVNode(this._template)

  return function render() {
    //  Vue 将 AST + data => VNode
    //  我们简化实现： 带 “坑”的VNode + data => 含数据的VNode
    let _tmp = combine(ast, this._data);
    return _tmp;
  };
}

//  将虚拟DOM渲染到页面：  diff 算法，做新旧dom对比
MyVue.prototype.update = function (vnode) {
  // 简化， 直接生成HTML DOM 通过 replaceChild 到页面： 父元素.replaceChild(new, old)
  let realDOM = parseVNode(vnode);

  this._parent.replaceChild(realDOM, document.getElementById('root'));
  // 这种做法是不负责任的： 每次都会将页面中的 DOM 全部替换掉的
}
