const EventEmitter = require('events')

const requireEsModule = (moduleName) => {
  const instance = new EventEmitter()
  let moduleTransformer = null
 
  const register = async (moduleName) => {
    const esModule = (await import(moduleName)).default
    const exportModule = moduleTransformer ? moduleTransformer.call(null, esModule) : esModule
    
    instance.emit('ready', exportModule)
  }

  register(moduleName)

  return {
    export: (fn) => {  
      moduleTransformer = fn 

      return function loadCurrentEsModule() {
        return new Promise(resolve => {
          instance.on('ready', esModule => {
            resolve(esModule)
          })
        })
      }
    }
  }
}

module.exports = requireEsModule