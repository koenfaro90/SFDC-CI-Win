/* Requires */
var fs = require('fs'),
    xml2js = require('xml2js'),
    _ = require('underscore'),
    Promise = require('bluebird'),
	allConfigs = JSON.parse(fs.readFileSync(__dirname + '/config.json').toString()),
	util = require(__dirname  + '/util.js'),
	argv = require('yargs').usage('Usage: hooks.js  [options]')
						    .demand('c')
						    .alias('c', 'config')
						    .nargs('c', 1)
						    .describe('c', 'Configuration')
							.choices('c', Object.keys(allConfigs))
							.demand('p')
						    .alias('p', 'path')
						    .nargs('p', 1)
						    .describe('p', 'Path')
							.demand('s')
						    .alias('s', 'stage')
						    .nargs('s', 1)
						    .describe('s', 'Stage')
							.choices('s', ['update', 'deploy'])
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
	path = argv.path,
	stage = argv.stage;

var config = allConfigs[selectedConfig];

if (config == undefined || config == null) {
	console.error('The configuration you have specified (' + selectedConfig + ') did not exist');
	process.exit();
}

var stageConfig = config[stage];

if (stageConfig == undefined || stageConfig == null) {
	console.error('The configuration you have specified (' + selectedConfig + ') exists but does not have a configuration for the selected stage: ', stage);
	process.exit();
}

var actionPromiseList = [];
for (var x in stageConfig.actions) {
	var action = stageConfig.actions[x];
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

run(actionPromiseList);

function run(promiseList) {
	util.sequence(actionPromiseList).then(function(results) {
		console.log('Done processing actions');
	}).catch(function(err) {
		console.error('Error', err);
		if (err == 'RESTART') {
			run(promiseList);
		} else {
			console.log('Exiting');
			process.exit(1);
		}
	});
}
