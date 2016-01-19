var	fs = require('fs'),
    xml2js = require('xml2js'),
    _ = require('underscore'),
    Promise = require('bluebird'),
	util = require(__dirname + '/../util.js');



function action(root, path, args) {
	return util.performOperationOnFolder(root + path, function(filename) {
		return new Promise(function(resolve, reject) {
			var splits = filename.split('\\');
			var filenameWithoutPath = splits[splits.length-1];
			if (args.indexOf(filenameWithoutPath) > -1) {
				fs.unlink(filename, function(err) {
					if (err) {
						return reject(err);
					}
					resolve();
				})
			} else {
				resolve();
			}
		});
	});
}

module.exports = action
