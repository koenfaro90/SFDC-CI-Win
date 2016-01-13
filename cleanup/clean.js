/* Requires */
var fs = require('fs'),
    xml2js = require('xml2js'),
    _ = require('underscore'),
    Promise = require('bluebird'),
	allConfigs = JSON.parse(fs.readFileSync(__dirname + '/config.json').toString()),
	util = require(__dirname  + '/util.js'),
	argv = require('yargs').usage('Usage: clean.js  [options]')
						    .demand('c')
						    .alias('c', 'config')
						    .nargs('c', 1)
						    .describe('c', 'Configuration')
							.choices('c', Object.keys(allConfigs))
							.demand('p')
						    .alias('p', 'path')
						    .nargs('p', 1)
						    .describe('p', 'Path')
						    .epilog('Copyright 2015')
						    .argv;

process.on('uncaughtException', function(err) {
	console.log('Caught exception:', err, err.stack);
	process.exit();
});

process.on('unhandledRejecction', function(reason, p) {
	console.log('Unhandled rejection:', reason, p);
});


/* Arguments */
var selectedConfig = argv.config,
	path = argv.path;

var config = allConfigs[selectedConfig];

var actionPromiseList = [];
for (var x in config.actions) {
	var action = config.actions[x];
	try {
		var mod = require(__dirname + '/modules/' + action.module);
		actionPromiseList.push(mod.bind(null, path + '\\', action.path, action.arguments));
	} catch (e) {
		console.error('Error loading module', action.module, e)
		console.error(e.stack)
		console.error('Action: ', action);
		process.exit();
	}
}

util.sequence(actionPromiseList).then(function(results) {
	console.log('Done processing actions');
}).catch(function(err) {
	console.error('Error', err);
});
