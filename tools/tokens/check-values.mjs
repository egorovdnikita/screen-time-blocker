// Проверяет сохранение всех исходных выражений после раскрытия новых токенов.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '../..');
const baselineFile = path.join(root, 'tools/tokens/appearance-baseline.json');
const source = f => fs.readFileSync(path.join(root, f), 'utf8');
function evaluate(text, dependencies = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports,
    require: name => {
      if (!(name in dependencies)) throw Error(name);
      return dependencies[name];
    },
  });
  return exports;
}
const generated = evaluate(source('src/theme/box-ui.generated.ts'));
const { localMaterials } = evaluate(source('src/theme/tokens.ts'), { './box-ui.generated': generated });
function fingerprint(file, content) {
  const ast = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const transformed = ts.transform(ast, [
    ctx => {
      function visit(n) {
        if (ts.isImportSpecifier(n) && n.name.text === 'localMaterials') return undefined;
        if (
          ts.isImportDeclaration(n) &&
          (/box-ui.generated/.test(n.moduleSpecifier.text) ||
            n.importClause?.namedBindings?.elements?.every(e => e.name.text === 'localMaterials'))
        )
          return undefined;
        if (
          ts.isVariableStatement(n) &&
          n.declarationList.declarations.some(d => d.name.getText(ast) === 'localMaterials')
        )
          return undefined;
        if (ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)) {
          const text = n.getText(ast);
          if (/^(box\.|localMaterials\.)/.test(text)) {
            const value = vm.runInNewContext(text, { box: generated.box, localMaterials });
            if (typeof value === 'string') return ts.factory.createStringLiteral(value);
            if (typeof value === 'number') return ts.factory.createNumericLiteral(value);
          }
        }
        // Нормализуем кавычки для сравнения AST.
        if (ts.isStringLiteral(n))
          return ts.factory.createStringLiteral(
            n.text === '@/theme/tokens' && file === 'src/theme/typography.tsx' ? './tokens' : n.text,
          );
        return ts.visitEachChild(n, visit, ctx);
      }
      return node => ts.visitNode(node, visit);
    },
  ]);
  function shape(n) {
    if (ts.isParenthesizedExpression(n)) return shape(n.expression);
    const children = [];
    ts.forEachChild(n, child => {
      children.push(shape(child));
    });
    if (ts.isSourceFile(n)) {
      const imports = children
        .filter(child => child[0] === ts.SyntaxKind.ImportDeclaration)
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), 'en'));
      const rest = children.filter(child => child[0] !== ts.SyntaxKind.ImportDeclaration);
      children.splice(0, children.length, ...imports, ...rest);
    }
    let text = ts.isSourceFile(n) ? undefined : n.text;
    if (ts.isNumericLiteral(n)) text = Number(n.text);
    if (ts.isJsxText(n)) text = n.text.replace(/\s+/g, ' ').trim();
    return [n.kind, text ?? null, children];
  }
  const value = JSON.stringify(shape(transformed.transformed[0]));
  transformed.dispose();
  return createHash('sha256').update(value).digest('hex');
}
if (process.argv.includes('--record')) {
  const base = process.argv[process.argv.indexOf('--record') + 1];
  const files = execFileSync('git', ['ls-tree', '-r', '--name-only', base, 'src'], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(f => /\.tsx?$/.test(f) && !f.startsWith('src/icons/') && !/(?:art|remainingArt)\.ts$/.test(f));
  const hashes = Object.fromEntries(
    files.map(file => [
      file,
      fingerprint(file, execFileSync('git', ['show', `${base}:${file}`], { encoding: 'utf8', maxBuffer: 20e6 })),
    ]),
  );
  fs.writeFileSync(baselineFile, JSON.stringify({ base, hashes }, null, 2) + '\n');
}
const { hashes } = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
for (const [file, hash] of Object.entries(hashes))
  if (fingerprint(file, source(file)) !== hash) throw Error(`Изменилось выражение или значение: ${file}`);
console.log(`${Object.keys(hashes).length} файлов: исходные выражения после раскрытия токенов совпадают`);
