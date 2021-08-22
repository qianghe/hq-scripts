const requireEsModule = require('./requireEsModule')

module.exports = requireEsModule('chalk-pipe').export((chalkPipe) => {
  const consoleMethods = {
    warning: chalkPipe('orange.bold'),
    error: chalkPipe('red.underline.bold')
  }

  const wrappedConsoleMethods = Object.entries(consoleMethods)
    .reduce((methodsMap, [key, method]) => {
      methodsMap[key] = (...args) => console.log(method.call(null, ...args))
      return methodsMap
    }, {})

  return wrappedConsoleMethods
})