
  {
    // 构建modules
    const modules = [
      
  (function(exports, require, module) {
    var inc = require("1").increment;
var hello = require("3");
var a = 1;
void 0;
void 0;

  }),
  (function(exports, require, module) {
    var add = require("2").add;
exports.increment = function(x) {
    return add(x, 1);
};

  }),
  (function(exports, require, module) {
    exports.add = function() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    return args.reduce(function(x, y) {
        return x + y;
    }, 0);
};

  }),
  (function(exports, require, module) {
    module.exports = "hello, world";

  })
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
  