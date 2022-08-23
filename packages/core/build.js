const webpack = require('webpack')

function multipleEntry() {
  return webpack([
    {
      entry: './index.js',
      mode: 'production',
      output: {
        filename: 'main.production.js'
      }
    },
    {
      entry: './index.js',
      mode: 'development',
      output: {
        filename: 'main.development.js'
      }
    },
    {
      entry: './index.js',
      output: {
        filename: 'main.unknow.js'
      }
    },
  ])
}

function singleEntry() {
  return webpack({
    entry: './index.js',
    mode: 'none',
    output: {
      iife: false,
      pathinfo: 'verbose'
    }
  })
}

singleEntry().run()


// multipleEntry().run((err, stat) => {
//   stat.stats.map((stat, index) => console.log(`第${index+1}次打包, 打包时间: ${stat.endTime - stat.startTime}`))
// })
