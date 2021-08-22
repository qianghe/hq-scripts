#!/usr/bin/env node
const exitsNodeModule = require('./helpers/exitsNodeModule')
if (!exitsNodeModule()) {
	process.exit(0)
}

const program = require('commander')
const chalk = require('chalk')

// base info
program
	.version(`${require('./package').version}`)
	.usage('<command> [options]')

// pre-check command
program
	.command('pre-check')
	.description('help check whether exits packages are not installed')
	.option('-s, --skip', 'if not exits, return true')
	.option('-n, --next <exec>', 'if pre-check is ok, support next exec command')
	.action((options) => {
		console.log('options::', options)
		require('./npm/pre-check')(options)
	})

// --help tooltip
program.on('--help', () => {
	console.log()
	console.log(`  Run ${chalk.cyan(`hq-scripts <command> --help`)} for detailed usage of given command.`)
	console.log()
})

program.parse(process.argv)
  

 