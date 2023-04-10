const template = require('babel-template')
const package = require('../package.json')
const {
  mergeOptions,
  matchesFile,
  tryTemplate,
  catchConsole
} = require('./utils')

module.exports = function (babel) {
  // 获取babel 得到types对象
  let types = babel.types

  const visitor = {
    AwaitExpression(path) {
      // 获取用户配置
      if (this.opts && !typeof this.opts === 'object') {
        return console.log('options must be an object')
      }

      // 如果父级中存在try，怎直接返回
      if (path.findParent(p => p.isTryStatement())) return false

      // 合并插件的选项
      const options = mergeOptions(this.opts)

      // 获取编译目标文件的路径，如：E:\myapp\src\App.vue
      const filePath = this.filePath || this.file.opts.filename || 'unknown'

      // 在排除列表的不编译
      if (matchesFile(options.exclude, filePath)) return

      // 如果设置了include, 只编译include中的文件
      if (options.include.length && !matchesFile(options.include, filePath))
        return

      const node = path.node

      // 在父路径节点中查找声明 async 函数的节点
      // async 函数分为4种情况：函数声明 || 箭头函数 || 函数表达式 || 对象的方法
      const asyncPath = path.findParent(
        p =>
        p.node.async &&
        (p.isFunctionDeclaration() ||
          p.isArrowFunctionExpression() ||
          p.isFunctionExpression() ||
          p.isObjectMethod())
      )

      let asyncName = ''

      const type = asyncPath.node.type

      switch (type) {
        // 1️⃣函数表达式
        // 情况1：普通函数，如const func = async function () {}
        // 情况2：箭头函数，如const func = async () => {}
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
          // 使用path.getSibling(index)来获得同级的id路径
          let identfier = asyncPath.getSibling('id')
          // 获取func方法名
          asyncName = identfier && identfier.node ? identfier.node.name : ''
          break
          // 2️⃣函数声明，如async function fn2() {}
        case 'FunctionDeclaration':
          asyncName = (asyncPath.node.id && asyncPath.node.id.name) || ''
          break
          // 3️⃣async函数作为对象的方法，如vue项目中，在methods中定义的方法: methods: { async func() {} }
        case 'ObjectMethod':
          asyncName = asyncPath.node.key.name || ''
          break
      }

      // 若asyncName不存在，通过argument.callee获取当前执行函数的name
      let funcName =
        asyncName || (node.argument.callee && node.argument.callee.name) || ''

      const temp = template(tryTemplate)

      // 给模版增加key，添加console.log打印信息
      let tempArgumentObj = {
        // 通过types.stringLiteral创建字符串字面量
        CatchError: types.stringLiteral(catchConsole(filePath, funcName, options.customLog))
      }

      // 通过temp创建try语句
      let tryNode = temp(tempArgumentObj);


      // 获取async节点(父节点)的函数体
      let info = asyncPath.node.body;

      // 将父节点原来的函数体放到try语句中
      tryNode.block.body.push(...info.body);

      // 将父节点的内容替换成新创建的try语句
      info.body = [tryNode];
    },
  }

  return {
    name: package.name,
    visitor,
  }
}