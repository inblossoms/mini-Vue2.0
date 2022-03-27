// 创建虚拟dom： Vdom (由 HTML DOM  ---> VNode: 将这个函数当做 compiler 函数)
function generalVNode(node) {
  //  获取 tag
  let nodeType = node.nodeType,
    _vnode = null; // 接收当前节点的内容，包括其属性值
  if (nodeType === 1) {
    let nodeTagName = node.nodeName,
      attrs = node.attributes, // .attributes 获取到的是节点上所有属性组成的伪数组。
      _attrsObj = {}; // 负责接收将attrs这个伪数组转换成对象后的内容


    for (let i = 0; i < attrs.length; i++) { // attrs[i] 是一个属性节点，它身上有两个属性(nodeName,nodeValuee) 它的nodeType === 2
      _attrsObj[attrs[i].nodeName] = attrs[i].nodeValue
    }

    _vnode = new VNode(nodeTagName, _attrsObj, undefined, nodeType)

    //  考虑： 当前传进来的 ndoe（真实dom）是否存在子元素
    let nodeChilds = node.childNodes;
    for (let i = 0; i < nodeChilds.length; i++) {
      _vnode.appendChild(generalVNode(nodeChilds[i]));  // 递归处理层级嵌套问题
    }
  } else if (nodeType === 3) {
    _vnode = new VNode(undefined, undefined, node.nodeValue, nodeType)
  }

  return _vnode; // 将定义后的节点内容返回
}

/** 将虚拟 DOM 转换成真正的 DOM */
function parseVNode(vnode) {
  //  创建 真实 DOM
  let type = vnode.type,
    _node = null; // 作为函数返回的真实dom

  if (type === 3) {
    return document.createTextNode(vnode.value);
  } else if (type === 1) { // 需要判断是否存在子节点 包括其所有属性
    _node = document.createElement(vnode.tag);

    //  判断属性
    let data = vnode.data; // 现在这个data是存放我们拿到的dom元素节点的键值对
    Object.keys(data).forEach((key) => {
      let attrName = key,
        attrValue = data[key];
      _node.setAttribute(attrName, attrValue)
    })

    //  子元素
    let children = vnode.children;
    children.forEach(subVNode => {
      return _node.appendChild(parseVNode(subVNode))
    });

    return _node
  }
}

let regBrace = /\{\{(.+?)\}\}/g

/** 根据插值语法内的路径 访问data中对象成员 */
function getValueByPath(obj, path) {
  let paths = path.split('.'); // [ xxx, yyy, zzz ]
  let res = obj;
  let prop;
  while (prop = paths.shift()) {
    res = res[prop];
  }
  return res;
}

// 将 未渲染值的 VNode 和 数据 data结合， 得到填充数据的 VNode： 模拟 AST -> VNode
function combine(vnode, data) {
  let _type = vnode.type,
    _data = vnode.data,
    _value = vnode.value,
    _tag = vnode.tag,
    _children = vnode.children;


  let _vnode = null;
  if (_type === 3) {
    // 对文本节点进行处理
    _value = _value.replace(regBrace, function (_, g) {
      return getValueByPath(data, g.trim())
    })
    _vnode = new VNode(_tag, _data, _value, _type);

  } else if (_type === 1) { // 需要判断是否存在子节点 包括其所有属性
    _vnode = new VNode(_tag, _data, _value, _type);
    _children.forEach(_subVNode => _vnode.appendChild(combine(_subVNode, data)))
  }
  return _vnode
}
