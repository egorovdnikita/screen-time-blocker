import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const js = ts.transpileModule(fs.readFileSync(new URL('../src/components/useStatusBar.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function mount(os, hook) {
  const stack = [{ barStyle: 'light-content' }];
  let cleanup;
  const StatusBar = { pushStackEntry: props => { const entry = { ...props }; stack.push(entry); return entry; }, popStackEntry: entry => { const index = stack.indexOf(entry); assert.ok(index > 0); stack.splice(index, 1); }, replaceStackEntry: (entry, props) => { const index = stack.indexOf(entry); assert.ok(index > 0); const next = { ...props }; stack[index] = next; return next; } };
  const exports = {};
  new Function('require', 'exports', js)(id => ({ react: { useRef: value => ({ current: value }), useCallback: fn => fn }, 'expo-router': { useFocusEffect: fn => { cleanup = fn(); } }, 'react-native': { Platform: { OS: os }, StatusBar } })[id], exports);
  return { value: exports[hook](), stack, StatusBar, unmount: () => cleanup?.() };
}
const sky = mount('ios', 'useSkyStatusBar');
const scroll = y => sky.value.onScroll({ nativeEvent: { contentOffset: { y } } });
assert.equal(sky.stack.at(-1).barStyle, 'light-content'); scroll(300); assert.equal(sky.stack.at(-1).barStyle, 'dark-content');
const modal = sky.StatusBar.pushStackEntry({ barStyle: 'light-content' });
scroll(0); scroll(300); sky.value.restore(); assert.equal(sky.stack.at(-1), modal); assert.equal(sky.stack.at(-1).barStyle, 'light-content');
sky.StatusBar.popStackEntry(modal); assert.equal(sky.stack.at(-1).barStyle, 'dark-content'); sky.unmount(); assert.equal(sky.stack.length, 1);
const rules = mount('android', 'useDarkStatusBar'); assert.equal(rules.stack.at(-1).barStyle, 'dark-content'); rules.unmount(); assert.equal(rules.stack.length, 1);
const web = mount('web', 'useSkyStatusBar'); web.value.restore(); web.value.onScroll({ nativeEvent: { contentOffset: { y: 300 } } }); web.unmount(); assert.equal(web.stack.length, 1);
console.log('Status bar layering OK');
