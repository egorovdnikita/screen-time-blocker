import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const compile = file => ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText;
const tokens = {}; new Function('exports', compile('../src/theme/tokens.ts'))(tokens);
const js = compile('../src/components/SessionPrimitives.tsx');
function component(os) {
  const exports = {};
  new Function('exports', 'require', js)(exports, id => {
    if (id === 'react' || id === 'react/jsx-runtime') return require(id);
    if (id === 'react-native') return { Platform: { OS: os }, Switch: 'SystemSwitch', StyleSheet: { create: x => x }, Animated: {} };
    if (id === '@/theme/tokens') return tokens;
    return {};
  });
  return exports.FlowSwitch;
}
for (const os of ['ios', 'android']) {
  const element = component(os)({ label: 'Строгий режим', value: true, onChange() {}, width: 61, height: 27, thumbWidth: 34 });
  assert.equal(element.type, 'SystemSwitch'); assert.equal(element.props.value, true);
  for (const name of ['style', 'width', 'height', 'thumbWidth', 'transform']) assert.equal(element.props[name], undefined);
  if (os === 'ios') assert.equal(element.props.thumbColor, undefined);
  const disabled = component(os)({ label: 'Недоступный', value: false, disabled: true, onChange() {} }); assert.equal(disabled.props.disabled, true);
}
const web = component('web')({ label: 'Превью', value: true, onChange() {}, width: 61, height: 27, thumbWidth: 34 });
assert.equal(web.type.name, 'WebFlowSwitch'); assert.equal(web.props.width, 61); assert.equal(web.props.height, 27); assert.equal(web.props.thumbWidth, 34);
console.log('Native Switch intrinsic size preserved');
