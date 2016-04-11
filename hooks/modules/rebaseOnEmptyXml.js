var	fs = require('fs'),
    xml2js = require('xml2js'),
    _ = require('underscore'),
    Promise = require('bluebird'),
	util = require(__dirname + '/../util.js');

function action(root, path, args) {
	return new Promise(function(resolve, reject) {
		readAndParseFile(root +  '/' + args.rebaseOnto).then(function(emptyFile) {
			util.performOperationOnFolderSequence(root + path, function(filename) {
				return new Promise(function(resolve, reject) {
					fs.readFile(filename, function(err, data) {
						if (err) {
							return reject(err);
						}
						var parser = new xml2js.Parser();
						parser.parseString(data, function (err, currentFile) {
							if (err) {
								return reject(err);
							}

							var jsonToFind = [],
								jsonToReplace = [],
								foundIndexes = [],
								findOriginMap = [];

							for (var x in currentFile) {
								for (var y in currentFile[x]) {
									for (var z in currentFile[x][y]) {
										var record = currentFile[x][y][z];
										var toFind = null;
										if (y == 'layoutAssignments') {
											// This is special, the first element before the first dash in the layout attribute is the object name, if there is no recordType property then this needs to be unique, if there is a recordType property then this + recordtype needs to be unique
											//console.log('record', record);
											if (record.layout != undefined) {
												var toReplace = JSON.stringify(record);
												var splits = record.layout[0].split('-');
												var objectName = splits.shift();
												record.layout[0] = objectName + '-!LAYOUT!'
												toFind = JSON.stringify(record);
												//console.log('tofind', toFind, toReplace);
											}
										} else {
											if (args.replaceTags[y] != undefined) {
												toFind = JSON.stringify(args.replaceTags[y]);
												//console.log('rebaseOntoEmptyXML', filename, y, toFind);
											} else {
												toFind = JSON.stringify(record);
											}
											var toReplace = JSON.stringify(record);
											toFind = toFind.replace(/true/g, 'false');
											toFind = toFind.replace(/DefaultOn/g, 'DefaultOff');
										}
										if (toFind != null) {
											jsonToFind.push(toFind);
											jsonToReplace.push(toReplace);
											findOriginMap.push({
												x: x,
												y: y,
												z: z
											})
										}
									}
								}
							}

							var copyEmptyFile = JSON.parse(JSON.stringify(emptyFile));

							for (var x in copyEmptyFile) {
								for (var y in copyEmptyFile[x]) {
									for (var z in copyEmptyFile[x][y]) {
										var record = copyEmptyFile[x][y][z];
										var current = JSON.stringify(record);
										var foundIndex = jsonToFind.indexOf(current);
										if (foundIndex > -1) {
											copyEmptyFile[x][y][z] = JSON.parse(jsonToReplace[foundIndex]);
											foundIndexes.push(foundIndex);
										} else {
											if (args.replaceTags[y] != undefined) {
												//console.log(y, record, current, foundIndex);
											}
											// This string was not found in the original profile - so we leave it intact at its current status (which should be false) - thats fine
										}
									}
								}
							}

							for (var x in copyEmptyFile) {
								for (var y in copyEmptyFile[x]) {
									for (var z in copyEmptyFile[x][y]) {
										var record = copyEmptyFile[x][y][z];
										var current = JSON.stringify(record);
										if (current.indexOf('!') > -1) {
											//console.log('DELETE ITEM', x, y, z, current);
											delete copyEmptyFile[x][y][z];
										}
									}
								}
							}
							
							var ignoreLength = 0;
							for (var x in args.ignore) {
								for (var y in args.ignore[x]) {
									ignoreLength++;
								} 
							}

							if (foundIndexes.length + ignoreLength == jsonToFind.length || foundIndexes.length + ignoreLength > jsonToFind.length) {
								var builder = new xml2js.Builder();
								var xml = util.convertToSFCompliantXML(builder.buildObject(copyEmptyFile));
								fs.writeFile(filename, xml, function(err, result) {
									if (err) {
										return reject(err);
									}
									resolve();
								});
							} else {
								console.error('Error processing file', filename, 'only found', foundIndexes.length, 'in the empty file while I expected to find', jsonToFind.length);
								for (var i = 0; i < jsonToFind.length; i++) {
									if (foundIndexes.indexOf(i) == -1) {
										console.log('Missing index', i, jsonToFind[i], findOriginMap[i]);
									}
								}
								return reject('Error processing file', filename, 'only found', foundIndexes.length, 'in the empty file while I expected to find', jsonToFind.length);
							}
						});
					});
				});
			}).then(function() {
				resolve();
			}).catch(function(err) {
				reject(err);
			})
		}).catch(function(err) {
			reject(err);
		})
	})
}

function readAndParseFile(filename) {
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
				resolve(result);
			})
		});
	});
}

module.exports = action
