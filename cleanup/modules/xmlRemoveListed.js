var	fs = require('fs'),
    xml2js = require('xml2js'),
    _ = require('underscore'),
    Promise = require('bluebird'),
	util = require(__dirname + '/../util.js');



function action(root, path, args) {
	return util.performOperationOnFolder(root + path, function(filename) {
		return new Promise(function(resolve, reject) {
			fs.readFile(filename, function(err, data) {
				if (err) {
					return reject(err);
				}
				var parser = new xml2js.Parser();
				parser.parseString(data, function (err, result) {
					if (err) {
						return reject(err);
					}
					for (var x in result) {
						for (var y in result[x]) {
							for (var z in result[x][y]) {
								var record = result[x][y][z];
								var keep = true;
								if (args[y] != undefined) {
									for (var a in args[y]) {
										var obj = args[y][a];
										var val = null;
										var key = null;
										for (var b in obj) {
											val = obj[b];
											key = b;
										}
										if (record[key].indexOf(val) > -1) {
											keep = false;
										}
									}
								}
								if (!keep) {
									result[x][y][z] = null;
								}
							}
							result[x][y] = _.without(result[x][y], null);
						}
					}
					var builder = new xml2js.Builder();
					var xml = util.convertToSFCompliantXML(builder.buildObject(result));
					fs.writeFile(filename, xml, function(err, result) {
						if (err) {
							return reject(err);
						}
						resolve();
					});
				});
			});
		});
	});
}

module.exports = action
