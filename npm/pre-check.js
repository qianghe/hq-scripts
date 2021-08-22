const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec
const inquirer = require('inquirer')
const ora = require('ora')
const { joinKeyVal, diff } = require('../helpers/util')
const asyncConsoleEsModule = require('../helpers/console')
const shellHelper = require('../helpers/shellHelper')

let Console = null
let spinner = null

// 指令安装
const installPackages = async (unInstallPackages, packageJson) => {
  const { dependencies, devDependencies } = packageJson
  const [dep, devDep] = unInstallPackages.reduce(([dep, devDep], pkg) => {
    if (dependencies[pkg]) {
      dep[pkg] = dependencies[pkg]
    } else if (devDependencies[pkg]) {
      devDep[pkg] = devDependencies[pkg]
    }

    return [dep, devDep]
  }, [{}, {}])
  const depInstallExecContent = dep ? `npm install ${joinKeyVal(dep)}` : ''
  const devDepInstallExecContent = devDep ? `npm install ${joinKeyVal(devDep)} --save-dev` : ''
  const commands = [depInstallExecContent, devDepInstallExecContent].filter(x => x)
  
  return new Promise((resolve) => {
    shellHelper.series(commands, (err) => {
      if (err instanceof Error) {
        Console.warning('install packages has error:')
        Console.error(err)
        
        process.exit(0)
      }
      resolve()
    })
  })
}

// 是否安装
const invokeInstallQuestion = async({
  dep,
  devDep
}) => {
  const installWarnTip = [
    'Auto check helps you detect packages uninstalled:',
    '-----------'
  ].concat(dep.length ? [
    '***** missing dep ****',
    dep.join('\n'),
  ] : []).concat(devDep.length ? [
    '***** missing devDep ***',
    devDep.join('\n'),
  ] : []).join('\n')

  Console.warning(installWarnTip)

  const { choose } = await inquirer.prompt([{
    type: 'list',
    message: 'Do you want to install them?',
    name: 'choose',
    choices: ['yes', 'no']
  }])

  return choose === 'yes'
}

const checkStatus = async () => {
  return new Promise((resolve, reject) => {
    exec('npm list --depth=0 --json', (err, stdout) => {
      // if (err) reject(new Error(err))
      const json = JSON.parse(stdout)
      const installedPackages = Object.keys(json.dependencies)
      
      // package.json
      const packageJsonRaw = fs.readFileSync(path.resolve(process.cwd(), 'package.json'))
      const packageJson = JSON.parse(packageJsonRaw)
      const packageList = Object.keys(packageJson.dependencies)
        .concat(Object.keys(packageJson.devDependencies))
    
      const unInstallDepPacks = installedPackages.filter(pkgName => {
        const { missing = false } = json.dependencies[pkgName]
        return missing
      })
      const unInstallDevDepPacks = diff(installedPackages, packageList)
      
      spinner.stopAndPersist({
        symbol: '( *︾▽︾)',
        text: 'check done.',
        color: 'gray'
      })
			console.log()

      resolve([
        [
          unInstallDepPacks,
          unInstallDevDepPacks
        ],
        packageJson
      ])
    })
  })
}

const loadGlobalTools = async () => {
  spinner = new ora({
    spinner: 'fistBump',
    text: 'checking whether project has uninstalled packages....',
    color: 'green'
  }).start()

  Console = await asyncConsoleEsModule()
}


module.exports = async ({
	skip = false,
	next: nextExecCommand
}) => {
  await loadGlobalTools()

  // 检测未安装情况
  const checkResult = await checkStatus()

  if (checkResult instanceof Error) {
    Console.warning('run /npm list .../ command has error:\n')
    Console.error(checkResult)
    
    process.exit(0)
  }

  const [[ unInstallDepPacks, unInstallDevDepPacks ], packageJson] = checkResult

  if (unInstallDepPacks.length > 0 || unInstallDevDepPacks > 0) {
    const unInstallPacks = {
      dep: unInstallDepPacks || [],
      devDep: unInstallDevDepPacks || []
    }
    const needInstall = await invokeInstallQuestion(unInstallPacks)
    
    if (needInstall) {
      await installPackages(unInstallDepPacks.concat(unInstallDevDepPacks), packageJson)
    }
  }

  if (nextExecCommand) {
		shellHelper.exec(nextExecCommand)
	} else if (skip) {
		return true
	} else {
		process.exit(0)	
	}
}