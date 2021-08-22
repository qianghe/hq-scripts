const path = require('path')
const fs = require('fs')

module.exports = () => {
	const nodeModules = path.resolve(process.cwd(), './node_modules')

	if (!fs.existsSync(nodeModules)) {
		console.log('Warning: you haven\'t install packages\n please run `npm install`。')
		return false
	}

	return true
}