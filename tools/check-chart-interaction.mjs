import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const exports={};new Function('exports',ts.transpileModule(fs.readFileSync(new URL('../src/data/chartInteraction.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(exports);
const hour=exports.chartHourFromPress;
assert.equal(hour({offsetX:145},10,true),14); // MouseEvent не содержит locationX.
assert.equal(hour({locationX:145},10,false),14);
assert.equal(hour({offsetX:205},10,true),20);
assert.equal(hour({locationX:240},10,false),23);
assert.equal(hour({},10,true),null); // Клавиатура не должна создавать фиктивный час.
assert.equal(hour({offsetX:NaN},10,true),null);
assert.equal(hour({locationX:10},0,false),null);
console.log('Chart coordinates: web/native, occupied/empty hour and invalid events OK');
