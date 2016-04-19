var	fs = require('fs'),
    xml2js = require('xml2js'),
    _ = require('underscore'),
    Promise = require('bluebird'),
	util = require(__dirname + '/../util.js');

var keepWithProperty = {
  editable: 'true',
  readable: 'true',
  enabled: 'true',
  default: 'true',
  allowCreate: 'true',
  allowDelete: 'true',
  allowEdit: 'true',
  allowRead: 'true',
  modifyAllRecords: 'true',
  viewAllRecords: 'true',
  visibility: ['DefaultOn', 'Available', 'Visible']
}

var deleteWithContent = [

];

var keepWithTag = ['label', 'userLicense', 'layoutAssignments'];

function action(root, path, args) {
	if (args.keepWithProperty != undefined) {
		keepWithProperty = args.keepWithProperty;
	}
	if (args.deleteWithContent != undefined) {
		deleteWithContent = args.deleteWithContent;
	}
	if (args.keepWithTag != undefined) {
		keepWithTag = args.keepWithTag;
	}
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
							if (y == '$') {
								continue;
							}
							for (var z in result[x][y]) {
								var record = result[x][y][z];
								var keep = false;
								if (keepWithTag.indexOf(y) > -1) {
									keep = true;
								}
								for (var a in keepWithProperty) {
									if (record[a] != undefined) {
										if (typeof keepWithProperty[a] == "object") {
											if (keepWithProperty[a].indexOf(record[a][0]) > -1) {
												keep = true;
											}
										} else {
											if (record[a] == keepWithProperty[a]) {
												keep = true;
											}
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
