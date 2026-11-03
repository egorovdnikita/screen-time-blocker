import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const source = fs.readFileSync(process.env.SHEET_MODAL_SOURCE ?? new URL('../src/components/SheetModal.tsx', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText;
function mount() {
  const slots = [], contexts = new Map(); let index = 0, cancelled = 0;
  const react = {
    createContext: () => { const context = {}; context.Provider = context; return context; }, useContext: context => contexts.get(context) ?? null,
    useEffect: () => {}, useCallback: fn => fn,
    useRef: initial => { const i = index++; return slots[i] ??= { current: initial }; },
    useState: initial => { const i = index++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }]; },
  };
  const exports = {};
  new Function('exports', 'require', js)(exports, id => id === 'react' ? react : id === 'react/jsx-runtime' ? require(id) : id === '@/theme/tokens' ? { colors: { bg: '#f4f6f8' } } : { Platform: { OS: 'ios' }, Modal: 'NativeModal', ScrollView: 'ScrollView', View: 'View', Keyboard: { dismiss() {} }, StyleSheet: { absoluteFill: {} } });
  const element = exports.SheetModal({ nativeOffset: 69, animateClose: true, onClose: () => cancelled++, children: null, backdrop: null });
  const render = () => { index = 0; return element.type(element.props); };
  const modal = render(), provider = modal.props.children.props.children, gate = provider.props.value;
  contexts.set(provider.type, gate);
  return { gate, render, cancelled: () => cancelled, scroll: props => { index = 100; return exports.SheetScrollView(props).props; } };
}
const event = y => ({ nativeEvent: { contentOffset: { x: 0, y } } });
const settle = () => new Promise(resolve => setTimeout(resolve, 280));
for (const ending of ['onTouchCancel', 'onTouchEnd']) for (const cancelFirst of [true, false]) {
  const instance = mount(), calls = [];
  const scroll = instance.scroll({ [ending]: () => calls.push('cancel'), onScrollBeginDrag: () => calls.push('begin'), onScrollEndDrag: () => calls.push('end') });
  scroll.onScroll(event(180)); scroll.onTouchStart(event(180));
  if (cancelFirst) scroll[ending](event(180));
  scroll.onScrollBeginDrag?.(event(180));
  if (!cancelFirst) scroll[ending](event(180));
  scroll.onScroll(event(0));
  await settle();
  assert.equal(instance.gate.canDismiss(), false, 'Cancellation must not unlock a continuing scroll drag');
  instance.render().props.onRequestClose(); assert.equal(instance.cancelled(), 0);
  scroll.onScrollEndDrag?.(event(0)); await settle();
  assert.equal(instance.gate.canDismiss(), true, 'Completed drag at top must release the dismissal gate');
  assert.deepEqual(calls, cancelFirst ? ['cancel', 'begin', 'end'] : ['begin', 'cancel', 'end']);
  instance.gate.dispose();
}
const cancelled = mount(), list = cancelled.scroll({});
list.onTouchStart(event(0)); list.onScroll(event(150)); list.onScroll(event(0)); list.onTouchCancel?.(event(0));
await settle(); assert.equal(cancelled.gate.canDismiss(), true, 'Cancelled touch without a drag must release the gate'); cancelled.gate.dispose();
const repeated = mount(); repeated.gate.begin(false); repeated.gate.begin(true);
assert.equal(repeated.gate.canDismiss(), false, 'Repeated begin in the same gesture must not reopen dismissal'); repeated.gate.dispose();
const horizontal = mount(), rail = horizontal.scroll({ horizontal: true });
rail.onTouchStart(event(100)); rail.onScrollBeginDrag?.(event(100)); rail.onTouchCancel?.(event(100)); rail.onScroll(event(100)); rail.onScrollEndDrag?.(event(100));
assert.equal(horizontal.gate.canDismiss(), true, 'Horizontal rail must not change vertical dismissal'); horizontal.gate.dispose();
console.log('Native sheet: touch cancellation, drag completion and repeated begin OK');
