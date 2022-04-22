let watcherId = 0;
/**
  Watcher 观察者, 用于 发射更新的行为 
  在 vue 中，每个组件实例都有响应的watcher实例对象，他会在组件渲染的过程中间将属性记录为依赖，
  之后在当依赖项的setter被调用时，会通知watcher重新进行计算，从而致使他关联的组件得以更新。
*/
class Watcher {
  /**
   *
   * @param {Object} vm JGVue 实例
   * @param {String|Function} expOrfn 如果是渲染 watcher, 传入的就是渲染函数, 如果是 计算 watcher 传入的就是路径表达式, 暂时只考虑 expOrFn 为函数的情况.
   */
  constructor( vm, expOrfn ) {
    this.vm = vm;
    this.getter = expOrfn;
    this.id = watcherId++;

    this.deps = []; // 依赖项
    this.depIds = {}; // 是一个 Set 类型, 用于保证 依赖项的唯一性 ( 简化的代码暂时不实现这一块 )

    // 一开始需要渲染: 真实 vue 中: this.lazy ? undefined : this.get()
    this.get();
  }

  /** 计算, 触发 getter */
  get() {
    pushTarget( this );
    this.getter.call( this.vm, this.vm ); // 上下文的问题就解决了
    popTarget();
  }

  /**
   * 执行, 并判断是懒加载, 还是同步执行, 还是异步执行:
   * 我们现在只考虑 异步执行 ( 简化的是 同步执行 )
   */
  run() {
    this.get();
    // 在真正的 vue 中是调用 queueWatcher, 来触发 nextTick 进行异步的执行
  }

  /** 对外公开的函数, 用于在 属性发生变化时触发的接口 */
  update() {
    this.run();
  }

  /** 清空依赖队列 */
  cleanupDep() {

  }

  /** 将 当前的 dep 与 当前的 watcher 关联 */
  addDep( dep ) {
    this.deps.push( dep );
  }
}
