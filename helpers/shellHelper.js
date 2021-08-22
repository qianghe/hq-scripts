var childProcess = require('child_process')

// execute a single shell command where "cmd" is a string
exports.exec = function(cmd, cb){
  // this would be way easier on a shell/bash script :P
  var parts = cmd.split(/\s+/g)
  var p = childProcess.spawn(parts[0], parts.slice(1), { stdio: 'inherit' })
  
  p.on('exit', function(code){
      var err = null
      if (code) {
        err = new Error('command "'+ cmd +'" exited with wrong status code "'+ code +'"')
        err.code = code
        err.cmd = cmd
      }
      if (cb) cb(err)
  });
};


// execute multiple commands in series
// this could be replaced by any flow control lib
exports.series = function(cmds, cb){
  const execNext = function() {
    exports.exec(cmds.shift(), function(err) {
        if (err) {
          cb(err)
        } else {
          if (cmds.length) execNext()
          else cb(null)
        }
    })
  }
  execNext()
}