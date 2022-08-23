const swc = require("@swc/core")
const path = require('path')
const fs = require('fs')
const Visitor = require('@swc/core/Visitor').default;
const ExcludeConsole = require('./plugins/exclude-console')
let moduleId = 0
const deps = []

class MockWebpackPlugin extends Visitor {
  constructor(entry) {
    super()
    this.entry = entry
  }
  visitCallExpression(token) {
    // 定位到require函数
    if (token.callee.value === 'require') {
      // 获取require的参数 
      const argument = token.arguments[0]

      if (argument.expression.type === 'StringLiteral') {
        // 找到一个模块时 moduleId + 1
        moduleId++

        // 获取到引入模块的文件位置
        const nextFilename = path.join(path.dirname(this.entry), argument.expression.value)
        // 把文件名改成moduleId
        argument.expression.value = `${moduleId}`

        // console.log(token.arguments[0])
        deps.push(collectRelyOn(nextFilename))
      }
    }
    return token
  }
}

function collectRelyOn(entry) {

  const parseOption = {
    syntax: 'ecmascript',
    comments: false,
    script: true,

    target: 'es5',

    isModule: true
  }
  entry = path.resolve(__dirname, entry)

  const currentModuleId = moduleId
  // read file content
  const sourceCode = fs.readFileSync(entry, 'utf-8')

  const ast = swc.parseSync(sourceCode, parseOption)
  /* 
    const excludeConsoleData = swc.transformSync(ast, {
      plugin: m => new ExcludeConsole().visitProgram(m)
    })
  
    const beforeAst = swc.parseSync(excludeConsoleData.code, parseOption)
  
    const data = swc.transformSync(beforeAst, {
      plugin: program => new MockWebpackPlugin(entry).visitProgram(program)
    }) */


  const data = swc.transformSync(ast, {
    plugin: program => new MockWebpackPlugin(entry).visitProgram(program)
  })
  return {
    entry,
    code: data.code,
    id: currentModuleId
  }
}

function createModuleWrapper(code) {
  return `
  (function(exports, require, module) {
    ${code}
  })`
}

function createBundleTemplate(entry) {
  // 执行这步 为了收集依赖
  const module0 = collectRelyOn(entry)
  const modules = deps.sort((a, b) => a.id - b.id)
  modules.unshift(module0)
  return `
  {
    // 构建modules
    const modules = [
      ${modules.map(module => createModuleWrapper(module.code))}
    ]

    // 缓存模块
    const cacheModules = {}

    // 加载模块
    function webpackRequire(moduleId) {
      const cachedModule = cacheModules[moduleId]
      if (cachedModule) {
        return cachedModule.exports
      }
      const targetModule = { exports: {} }
      modules[moduleId](targetModule.exports, webpackRequire, targetModule)
      cacheModules[moduleId] = targetModule
      return targetModule.exports
    }

    // 运行入口函数
    webpackRequire(0)
  }
  `
}

function build(entry) {

  const code = createBundleTemplate(entry)
  fs.writeFileSync('./output.js', code)
}

build('./example/index.js')
