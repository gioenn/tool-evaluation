const csv = require('csv-parser')
const fs = require('fs')

async function parseCSV(path) {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(path)
            .pipe(csv())
            .on('data', (data) => {
                results.push(data)
            })
            .on('end', () => {
                resolve(results);
            });
    })
}

module.exports = {
    parseCSV,
}
