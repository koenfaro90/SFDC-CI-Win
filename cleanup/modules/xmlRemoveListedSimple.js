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
							var keep = true;
							if (args.indexOf(y) > -1) {
								keep = false;
							}
							if (!keep) {
								delete result[x][y];
							}
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
