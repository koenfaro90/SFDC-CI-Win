var	fs = require('fs'),
    _ = require('underscore'),
    Promise = require('bluebird');


function util() {

}

util.prototype = {
	performOperationOnFolder: function(path, operation) {
		return new Promise(function(resolve, reject) {
			var list = [];
			fs.readdir(path, function(err, result) {
				for (var x in result) {
					list.push(operation(path + '\\' + result[x]));
				}
				Promise.all(list).then(function() {
					resolve();
				}).catch(function(err) {
					reject(err);
				});
			});
		})
	},
	sequence: function(tasks) {
		var current = Promise.cast(), results = [];
		for (var k = 0; k < tasks.length; ++k) {
			results.push(current = current.then(tasks[k]));
		}
		return Promise.all(results);
	},
	convertToSFCompliantXML: function(string) {
		string = string.replace(/  /g,'    ');
		string = string.replace('0="http', 'xmlns="http');
		string = string.replace(' standalone="yes"', '');
		string = string + "\n";
		return string;
	}
}

module.exports = new util();
