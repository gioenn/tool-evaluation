const Util = require('./util.js')
const CSV = require('./csv_utils.js')
const regex = RegExp('/.md|index|util|\.xml|\.iml|\.gitignore|\.json|_|\.spec.js/');



async function run(){
    const files = []
    await Util.walk('csv-files', 'csv', regex, files);
    const manualDecomposition = require('./microservices.json');
    const m1op = [];
    const m2op = [];
    const m3op = [];
    const m4op = [];
    const m1e = [];
    const m2e = [];
    const m3e = [];
    const m4e = [];
    
    for await (const m of manualDecomposition) {
        for await (const op of m.operations) {
            if (m.id === 'm1'){
                m1op.push(op.id.toUpperCase())
            }
            if (m.id === 'm2'){
                m2op.push(op.id.toUpperCase())
            }
            if (m.id === 'm3'){
                m3op.push(op.id.toUpperCase())
            }
            if (m.id === 'm4'){
                m4op.push(op.id.toUpperCase())
            }
        }
        for await (const e of m.entities) {
            if (m.id === 'm1'){
                m1e.push(e.id.toUpperCase())
            }
            if (m.id === 'm2'){
                m2e.push(e.id.toUpperCase())
            }
            if (m.id === 'm3'){
                m3e.push(e.id.toUpperCase())
            }
            if (m.id === 'm4'){
                m4e.push(e.id.toUpperCase())
            }
        }
    }
    
    const manualOpArrays = [m1op,m2op,m3op,m4op];
    const manualEArrays = [m1e,m2e,m3e,m4e];

    const result = [];

    for await (const file of files) {
        const opM1 = []
        const opM2 = []
        const opM3 = []
        const opM4 = []
        const eM1 = []
        const eM2 = []
        const eM3 = []
        const eM4 = []
        const rows = await CSV.parseCSV(file)
        const entities = rows.slice(15,60);
        const operations = rows.slice(62,138)
        for await (const e of entities) {
            if (e['_1'] === '1'){
                eM1.push(e['_0'])
            }
            if (e['_2'] === '1'){
                eM2.push(e['_0'])
            }
            if (e['_3'] === '1'){
                eM3.push(e['_0'])
            }
            if (e['_4'] === '1'){
                eM4.push(e['_0'])
            }
        }
        for await (const op of operations){
            if (op['_1'] === '1') {
                opM1.push(op['_0'])
            }
            if (op['_2'] === '1') {
                opM2.push(op['_0'])
            }
            if (op['_3'] === '1') {
                opM3.push(op['_0'])
            }
            if (op['_4'] === '1') {
                opM4.push(op['_0'])
            }
        }
        const opArrays = [opM1, opM2, opM3, opM4];
        const eArrays = [eM1, eM2, eM3, eM4];
        let intersectionOp = 0;
        let intersectionE = 0;
        let differenceE = 0;
        let differenceOp = 0;
        let totalOp = 0;
        let totalE = 0;
        for (let i=2; i < 72; i++){
            for (let j=1; j < i; j++){
                let areTogetherManual = false;
                for await (const x of manualOpArrays) {
                    if (x.includes('OP' + i) && x.includes('OP' + j)){
                        areTogetherManual = true;
                        break;
                    }
                }
                let areTogetherPangaea = false;
                for await (const y of opArrays){
                    if (y.includes('OP' + i) && y.includes('OP' + j)){
                        areTogetherPangaea = true;
                        break;
                    }
                }
                if (areTogetherManual !== areTogetherPangaea){
                    totalOp++;
                }
            }
        }
        for (let i=2; i < 72; i++){
            for (let j=1; j < i; j++){
                let areTogetherManual = false;
                for await (const x of manualEArrays) {
                    if (x.includes('E' + i) && x.includes('E' + j)){
                        areTogetherManual = true;
                        break;
                    }
                }
                let areTogetherPangaea = false;
                for await (const y of eArrays){
                    if (y.includes('E' + i) && y.includes('E' + j)){
                        areTogetherPangaea = true;
                        break;
                    }
                }
                if (areTogetherManual !== areTogetherPangaea){
                    totalE++;
                }
            }
        }
        /*console.log('##### OPERATIONS')
        for await (const x of manualOpArrays) {
            for await (const y of opArrays){
                intersectionOp += intersect(x,y);
                differenceOp += difference(x,y);
            }
        }
        console.log('##### ENTITIES')
        for await (const x of manualEArrays) {
            for await (const y of eArrays){
                intersectionE += intersect(x,y);
                differenceE += difference(x,y);
            }
        }*/
        result.push({
            file,
            total: totalOp + totalE,
            totalE,
            totalOp
            /*intersectionE,
            intersectionOp,
            differenceE,
            differenceOp*/
        })
    }
    const byIntersectionE = result.slice(0);
    byIntersectionE.sort(function(a,b) {
        return a.totalOp - b.totalOp;
    });
    console.log(byIntersectionE)
}

function intersect(a, b) {
    const setA = new Set(a);
    const setB = new Set(b);
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const res = Array.from(intersection)
    return res.length;
}

function difference(a,b){
    const setA = new Set(a);
    const setB = new Set(b);
    let difference = new Set(
        [...setA].filter(x => !setB.has(x)));
    const res = Array.from(difference)
    return res.length;
    
}

run().then(()=> console.log('##########\nDONE\n##########'))
