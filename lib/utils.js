const merge = require('deepmerge')

// 定义try模板
const tryTemplate = `
try {

} catch(e) {
  console.log(CatchError, e)
}
`

/*
 * catch要打印的信息
 * @param {string} filePath - 当前执行文件的路径
 * @param {string} funcName - 当前执行方法的名称
 * @param {string} customLog - 用户自定义的打印信息
 */
let catchConsole = (filePath, funcName, customLog) => `
filePath: ${filePath}
funcName: ${funcName}
${customLog}:`;

const defaultOptions = {
  customLog: 'Error',
  exclude: ['node_modules'],
  include: []
}


function matchesFile(list, filename) {
  return list.find((name) => name && filename.include(name))
}

function mergeOptions(options) {
  const { exclude, include } = options
  if (exclude) options.exclude = toArray(exclude)
  if (include) options.include = toArray(include)
}

function toArray(value) {
  return Array.isArray(value) ? value : [value]
}

module.exports = {
  tryTemplate,
  catchConsole,
  defaultOptions,
  mergeOptions,
  matchesFile
}