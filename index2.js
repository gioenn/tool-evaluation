const Util = require("./util.js");
const regex = RegExp("/.md|index|util|.xml|.iml|.gitignore|.csv|_|.spec.js/");
const fs = require("fs");

async function run() {
  const files = [];
  await Util.walk("json-files", "json", regex, files);
  const manualRaw = fs.readFileSync("microservices.json", "utf8");
  const manualData = JSON.parse(manualRaw);
  const [manualEArrays, manualOpArrays] = extractMicroservices(manualData);
  const allEntities = [].concat.apply([], manualEArrays);
  const allOps = [].concat.apply([], manualOpArrays);

  const result = [];

  for (const file of files) {
    const solutionRaw = fs.readFileSync(file, "utf8");
    const solutionData = JSON.parse(solutionRaw);
    const [eArrays, opArrays] = extractMicroservices(solutionData);

    let totalOp = countDiff(allOps, manualOpArrays, opArrays);
    let totalE = countDiff(allEntities, manualEArrays, eArrays);
    let totalOpE = countDiffOperationsEntities(
      allOps,
      allEntities,
      manualOpArrays,
      opArrays,
      manualEArrays,
      eArrays
    );

    result.push({
      file,
      total: totalOp + totalE + totalOpE,
      totalE,
      totalOp,
      totalOpE,
    });
  }
  const byIntersectionE = result.slice(0);
  byIntersectionE.sort(function (a, b) {
    return a.totalOp - b.totalOp;
  });
  console.log(byIntersectionE);
}

function eqSet(as, bs) {
  for (var a of as)
    if (!bs.has(a)) {
      console.log(a);
    }
  for (var a of bs)
    if (!as.has(a)) {
      console.log(a);
    }

  return true;
}

function extractMicroservices(data) {
  const entities = {};
  const ops = {};

  if (data.microservices) data = data.microservices;

  for (const m of data) {
    console.log(m.entities);
    entities[m.id] = [];
    ops[m.id] = [];
    for (const op of m.operations) {
      if (op.label) ops[m.id].push(op.label);
      else ops[m.id].push(op.split(".")[0]);
    }
    for (const e of m.entities) {
      if (e.label) entities[m.id].push(e.label);
      else entities[m.id].push(e.split(".")[0]);
    }
  }
  const entityRes = [];
  const opRes = [];

  for (const m in entities) {
    entityRes.push(entities[m]);
    opRes.push(ops[m]);
  }
  return [entityRes, opRes];
}

function countDiff(all, s1, s2) {
  let diff = 0;
  for (let i = 1; i < all.length; i++) {
    const c1 = all[i];
    for (let j = 0; j < i; j++) {
      const c2 = all[j];
      let tog1 = false;
      for (const x of s1) {
        if (x.includes(c1) && x.includes(c2)) {
          tog1 = true;
          break;
        }
      }
      let tog2 = false;
      for (const y of s2) {
        if (y.includes(c1) && y.includes(c2)) {
          tog2 = true;
          break;
        }
      }
      if (tog2 !== tog1) {
        diff++;
      }
    }
  }
  return diff;
}

function countDiffOperationsEntities(
  allOps,
  allEntities,
  ops1,
  ops2,
  en1,
  en2
) {
  let diff = 0;
  for (const op of allOps) {
    for (const en of allEntities) {
      let tog1 = false;
      for (let i = 0; i < ops1.length; i++) {
        if (ops1[i].includes(op) && en1[i].includes(en)) {
          tog1 = true;
          break;
        }
      }
      let tog2 = false;
      for (let i = 0; i < ops2.length; i++) {
        if (ops2[i].includes(op) && en2[i].includes(en)) {
          tog2 = true;
          break;
        }
      }
      if (tog2 !== tog1) {
        diff++;
      }
    }
  }
  return diff;
}

run().then(() => console.log("##########\nDONE\n##########"));
