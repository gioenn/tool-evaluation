const fs = require('fs');
const path = require('path');

async function walk(dir, fileExtension, blacklistRegexp, results) {
    let currentDir = {};
    fs.readdirSync(dir)
        .filter(function blacklist(file) {
            return !blacklistRegexp.test(file);
        }).forEach(function (file) {
        let
            filePath = path.join(dir, file),
            stat = fs.statSync(filePath);

        let exportName = path.basename(file, fileExtension).replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });

        // in case is a dir, recurse
        if (stat.isDirectory()) {
            currentDir[exportName] = walk(filePath, fileExtension, blacklistRegexp, results);
        } else {
            results.push(filePath)
        }
    });
    return currentDir;
}

module.exports = {
    walk
}
