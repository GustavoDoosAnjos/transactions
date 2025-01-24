'use strict';

const path = require('path');

const fs = jest.createMockFromModule('fs');

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = Object.create(null);
function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    const dir = path.dirname(file);

    if (!mockFiles[dir]) {
      mockFiles[dir] = [];
    }
    mockFiles[dir].push(path.basename(file));
  }
}

function readdirSync(directoryPath) {
  return mockFiles[directoryPath] || [];
}

function readFile() {
  return JSON.stringify({ valor: 20, dataHora: new Date() });
}

fs.__setMockFiles = __setMockFiles;
fs.readdirSync = readdirSync;
fs.readFile = readFile;

export default fs;
