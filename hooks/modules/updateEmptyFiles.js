var	fs = require('fs'),
    xml2js = require('xml2js'),
    _ = require('underscore'),
    Promise = require('bluebird'),
	util = require(__dirname + '/../util.js');

function action(root, path, args) {
	return new Promise(function(resolve, reject) {
		readAndParseFile(root +  '/' + args.emptyFile).then(function(emptyFile) {
			//console.log('FILE', emptyFile);
			util.performOperationOnFolderSequence(root + path, function(filename) {
				return new Promise(function(resolve, reject) {
					fs.readFile(filename, function(err, data) {
						if (err) {
							return reject(err);
						}
						//console.log('L', emptyFile['Profile'].fieldPermissions.length);
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
										var toReplace = null;
										if (y == 'layoutAssignments') {
											// This is special, the first element before the first dash in the layout attribute is the object name, if there is no recordType property then this needs to be unique, if there is a recordType property then this + recordtype needs to be unique
											//console.log('record', record);
											if (record.layout != undefined) {
												var splits = record.layout[0].split('-');
												var objectName = splits.shift();
												record.layout[0] = objectName + '-!LAYOUT!'
												toReplace = JSON.stringify(record);
												toFind = toReplace;
												//console.log('toFind', toFind);
											}
										} else {
											if (args.replaceTags[y] != undefined) {
												//console.log('updateEmptyFiles', filename, y);
												//toFind = JSON.stringify(args.replaceTags[y]);
											} else {
												var ignore = false;
												if (args.ignore[y] != undefined) {
													if (args.ignore[y].indexOf(record.name[0]) != -1) {
														console.log('FOUND!');
														ignore = true;
													}
												}
												if (ignore == false) {
													toFind = JSON.stringify(record);
													toFind = toFind.replace(/true/g, 'false');
													toFind = toFind.replace(/DefaultOn/g, 'DefaultOff');
													toReplace = toFind;
												}
											}
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

							for (var x in emptyFile) {
								for (var y in emptyFile[x]) {
									for (var z in emptyFile[x][y]) {
										var record = emptyFile[x][y][z];
										var current = JSON.stringify(record);
										var foundIndex = jsonToFind.indexOf(current);
										if (foundIndex > -1) {
											emptyFile[x][y][z] = JSON.parse(jsonToReplace[foundIndex]);
											foundIndexes.push(foundIndex);
										}
									}
								}
							}

							//console.log('F', foundIndexes.length, jsonToFind.length);

							var foundNewProperties = false;
							for (var i = 0; i < jsonToFind.length; i++) {
								if (foundIndexes.indexOf(i) == -1 && findOriginMap[i]['y'] != 'label' && findOriginMap[i]['y'] != 'userLicense' && findOriginMap[i]['y'] != '$') {
									
									// The string we are looking for because it was in the currentFile was not found in the emptyFile
									//console.log('Didnt find', jsonToFind[i], findOriginMap[i]);
									// This means we add it into the empty profile with everything set to false and re-run
									var originPosition = findOriginMap[i];
									foundNewProperties = true;
									if (emptyFile[originPosition['x']] == undefined) {
										emptyFile[originPosition['x']] = {};
									}
									if (emptyFile[originPosition['x']][originPosition['y']] == undefined) {
										emptyFile[originPosition['x']][originPosition['y']] = [];
									}
									//console.log('pushing', i, originPosition, jsonToFind[i]);
									emptyFile[originPosition['x']][originPosition['y']].push(JSON.parse(jsonToFind[i]));
								}
							}

							if (foundNewProperties == true) {
								console.log('Found new properties in', filename,'adding these to' + args.emptyFile);
								var builder = new xml2js.Builder();
								var xml = util.convertToSFCompliantXML(builder.buildObject(emptyFile));
								fs.writeFile(root + '/' + args.emptyFile, xml, function(err, result) {
									if (err) {
										return reject(err);
									}
									resolve();
								});
							} else {
								resolve();
							}
						});
					});
				});
			}).then(function() {
				resolve();
			}).catch(function(err) {
				reject(err);
			});
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
