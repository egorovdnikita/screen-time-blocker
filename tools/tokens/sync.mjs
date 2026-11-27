// Снимок читается без Box UI в CI; --source сверяет актуальные исходники только для чтения.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '../..');
const snapshotPath = path.join(root, 'tools/tokens/box-ui.snapshot.json');
const check = process.argv.includes('--check');
const sourceIndex = process.argv.indexOf('--source');
let snapshot = JSON.parse(fs.existsSync(snapshotPath) ? fs.readFileSync(snapshotPath, 'utf8') : '{}');
function artifact(file, content) {
  const target = path.join(root, file);
  if (check) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) throw Error(`Дрейф: ${file}`);
  } else fs.writeFileSync(target, content);
}
if (sourceIndex !== -1) {
  const source = path.resolve(process.argv[sourceIndex + 1]);
  const { parseDumps } = await import(pathToFileURL(path.join(source, 'packages/tokens/scripts/parse-figma.mjs')));
  const model = parseDumps(path.join(source, 'tokens/figma')).filter(c => c.id !== 'brand-icon');
  const files = fs
    .readdirSync(path.join(source, 'tokens/figma'))
    .filter(f => f.endsWith('.txt') && f !== 'brand-icon.txt')
    .sort();
  const hash = createHash('sha256');
  for (const file of files) hash.update(file).update(fs.readFileSync(path.join(source, 'tokens/figma', file)));
  snapshot = {
    revision: execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    sha256: hash.digest('hex'),
    model,
  };
  artifact('tools/tokens/box-ui.snapshot.json', JSON.stringify(snapshot, null, 2) + '\n');
}
const collections = Object.fromEntries(snapshot.model.map(c => [c.id, c]));
export function resolve(collection, name, modes = {}, stack = []) {
  const key = `${collection}:${name}`;
  if (stack.includes(key)) throw Error(`Цикл: ${[...stack, key].join(' → ')}`);
  const c = collections[collection];
  const mode = modes[collection] ?? c?.modes[0];
  const v = c?.variables[name]?.values[mode];
  if (!v) throw Error(`Нет токена/моды: ${key} (${mode})`);
  function value(v) {
    if (v.type === 'alias') return resolve(v.collection, v.ref, modes, [...stack, key]);
    if (v.type === 'alpha') return { color: value(v.base), opacity: v.opacity };
    return v.value;
  }
  return value(v);
}
// Валидация всех путей и каждой моды, включая транзитивные ссылки.
for (const c of snapshot.model)
  for (const name of Object.keys(c.variables)) for (const mode of c.modes) resolve(c.id, name, { [c.id]: mode });
const bindings = {
  white: ['sys-color', 'color/white/base'],
  black: ['sys-color', 'color/black/base'],
  raised: ['sys-theme', 'surface/base/fill/raised'],
};
const output = Object.fromEntries(Object.entries(bindings).map(([name, [c, p]]) => [name, resolve(c, p)]));
for (const [name, id, prefix] of [
  ['spacing', 'prim-spacing', 'spacing/'],
  ['radius', 'prim-rounding', 'rounding/'],
  ['size', 'prim-size', 'size/'],
  ['fontSize', 'prim-type', 'typography/font-size/'],
  ['fontWeight', 'prim-type', 'typography/font-weight/'],
  ['lineHeight', 'prim-type', 'typography/line-height/'],
  ['tracking', 'prim-type', 'typography/letter-spacing/'],
]) {
  output[name] = Object.fromEntries(
    Object.keys(collections[id].variables)
      .filter(p => p.startsWith(prefix))
      .map(p => [p.slice(prefix.length), resolve(id, p)]),
  );
}
const prettier = await import('prettier');
artifact(
  'src/theme/box-ui.generated.ts',
  await prettier.format(
    '// Сгенерировано tools/tokens/sync.mjs. Не редактировать.\n// Семантические значения: Light; примитивы не зависят от темы.\nexport const box = ' +
      JSON.stringify(output) +
      ' as const;\n',
    { parser: 'typescript', printWidth: 120, singleQuote: true },
  ),
);
// Полный AST-реестр литералов оформления и обращений к токенам. Иконки/иллюстрации исключены.
const entries = [];
const references = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'icons') walk(file);
      continue;
    }
    if (!/\.(tsx?|css)$/.test(file) || /(?:art|remainingArt|box-ui.generated)\.ts$/.test(file)) continue;
    const rel = path.relative(root, file);
    const content = fs.readFileSync(file, 'utf8');
    const ast = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const aliases = new Map();
    for (const statement of ast.statements) {
      if (ts.isImportDeclaration(statement) && /(?:theme\/tokens|\.\/tokens)$/.test(statement.moduleSpecifier.text)) {
        for (const element of statement.importClause?.namedBindings?.elements ?? [])
          aliases.set(element.name.text, element.propertyName?.text ?? element.name.text);
      }
    }
    function visit(n) {
      if (ts.isImportDeclaration(n) || ts.isLiteralTypeNode(n)) return;
      if (n.parent && ts.isElementAccessExpression(n.parent) && n.parent.argumentExpression === n) return;
      if (ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)) {
        const expression = n.getText(ast);
        if (
          /^(?:box|colors|radii|shadows|gradients|localMaterials|\w+Theme)\./.test(expression) ||
          aliases.has(expression.split(/[.\[]/)[0])
        )
          references.push({ file: rel, line: ast.getLineAndCharacterOfPosition(n.getStart()).line + 1, expression });
      }
      if (ts.isStringLiteral(n) || ts.isNumericLiteral(n)) {
        const parent = n.parent;
        const property = ts.isPropertyAssignment(parent)
          ? parent.name.getText(ast)
          : ts.isJsxExpression(parent) && ts.isJsxAttribute(parent.parent)
            ? parent.parent.name.getText(ast)
            : '';
        const theme = rel.startsWith('src/theme/');
        if (
          theme ||
          /^(?:color|backgroundColor|border.*|.*Color|opacity|font.*|lineHeight|letterSpacing|size|weight|ls|padding.*|margin.*|gap|rowGap|columnGap|width|height|minWidth|maxWidth|minHeight|maxHeight|boxShadow|shadow.*)$/.test(
            property,
          ) ||
          /^(?:#(?:[\da-f]{3,8})$|rgba?\(|.*(?:rgba?\(|#[\da-f]{3,8}))/i.test(n.text)
        ) {
          if (!ts.isImportDeclaration(parent))
            entries.push({
              kind: theme ? 'local-token' : 'local-measurement',
              file: rel,
              line: ast.getLineAndCharacterOfPosition(n.getStart()).line + 1,
              property,
              value: ts.isNumericLiteral(n) ? Number(n.text) : n.text,
            });
        }
      }
      ts.forEachChild(n, visit);
    }
    visit(ast);
  }
}
walk(path.join(root, 'src'));
artifact('docs/audits/token-inventory.json', JSON.stringify({ literals: entries, references }, null, 2) + '\n');
console.log(
  `Box UI: ${snapshot.model.length} коллекций, ${entries.length} использований; ${check ? 'дрейфа нет' : 'снимок и реестр обновлены'}`,
);
