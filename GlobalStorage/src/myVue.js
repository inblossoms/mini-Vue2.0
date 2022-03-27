//  封装函数
function MyVue(options) {
  //  vue 中：内部数据 _ 下划线开头，静态数据 $ 开头
  this._data = options.data;
  //  准备工作  预备模板
  let elm = document.getElementById("root")
  this._template = elm
  this._parent = elm.parentNode;

  this.initData(); // 将data进行响应式转换，设置代理

  //  挂载
  this.mount()
}
