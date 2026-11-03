import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const js = ts.transpileModule(fs.readFileSync(process.env.SHEET_MODAL_SOURCE ?? new URL('../src/components/SheetModal.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText;
function mount(os, animated = true, native = false) {
  const slots = []; let index = 0, close, cancelled = 0, saved = 0, other = 0;
  const react = { createContext: () => ({}), useEffect: () => {}, useCallback: fn => fn, useRef: initial => { const i = index++; return slots[i] ??= { current: initial }; }, useState: initial => { const i = index++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }]; } };
  const exports = {};
  new Function('exports', 'require', js)(exports, id => id === 'react' ? react : id === 'react/jsx-runtime' ? require(id) : id === '@/theme/tokens' ? { colors: { bg: '#f4f6f8' } } : { Platform: { OS: os }, Modal: 'NativeModal', View: 'View', Keyboard: { dismiss() {} }, StyleSheet: { absoluteFill: {} } });
  const element = exports.SheetModal({ animateClose: animated, nativeOffset: native ? 69 : undefined, onClose: () => cancelled++, children: request => { close = request; return null; }, backdrop: null });
  const render = () => { index = 0; return element.type(element.props); };
  render();
  return { render, close: callback => close(callback), save: () => saved++, alternative: () => other++, counts: () => ({ cancelled, saved, other }) };
}
const transition = modal => Array.isArray(modal.props.children) ? modal.props.children[0] : modal.props.children;
const ios = mount('ios'); ios.close(ios.save); ios.close(ios.alternative);
let modal = ios.render(); assert.equal(transition(modal).props.closing, true); assert.deepEqual(ios.counts(), { cancelled: 0, saved: 0, other: 0 });
transition(modal).props.onHidden(); modal = ios.render(); assert.equal(modal.props.visible, false); assert.equal(ios.counts().saved, 0);
modal.props.onDismiss(); modal.props.onDismiss(); assert.deepEqual(ios.counts(), { cancelled: 0, saved: 1, other: 0 });
const cancel = mount('ios'); cancel.render().props.onRequestClose(); modal = cancel.render(); transition(modal).props.onHidden(); modal = cancel.render(); assert.equal(cancel.counts().cancelled, 0); modal.props.onDismiss(); assert.equal(cancel.counts().cancelled, 1);
for (const os of ['android', 'web']) { const instance = mount(os); instance.close(instance.save); modal = instance.render(); transition(modal).props.onHidden(); assert.equal(instance.counts().saved, 1); modal.props.onDismiss(); assert.equal(instance.counts().saved, 1); }
const instant = mount('ios', false); instant.close(instant.save); assert.equal(instant.counts().saved, 1); assert.equal(transition(instant.render()).props.closing, false);
const swipe = mount('ios', false); transition(swipe.render()).props.onSwipeClose(); modal = swipe.render(); assert.equal(transition(modal).props.closing, true); transition(modal).props.onHidden(); assert.equal(swipe.counts().cancelled, 0); swipe.render().props.onDismiss(); assert.deepEqual(swipe.counts(), { cancelled: 1, saved: 0, other: 0 });
const page = mount('ios', true, true); modal = page.render(); assert.equal(modal.props.presentationStyle, 'pageSheet'); assert.equal(modal.props.transparent, false); assert.equal(modal.props.allowSwipeDismissal, true); page.close(page.save); modal = page.render(); assert.equal(modal.props.visible, false); assert.equal(page.counts().saved, 0); modal.props.onDismiss(); assert.equal(page.counts().saved, 1);
const nativeSwipe = mount('ios', true, true); modal = nativeSwipe.render(); modal.props.onRequestClose(); modal.props.onRequestClose(); assert.equal(nativeSwipe.counts().cancelled, 1);
for (const os of ['android', 'web']) { const fallback = mount(os, true, true); const view = fallback.render(); assert.equal(view.props.transparent, true); assert.equal(view.props.presentationStyle, undefined); }
const scrollPage = mount('ios', true, true); modal = scrollPage.render(); const gate = modal.props.children.props.children.props.value; gate.begin(false); gate.update(true); modal = scrollPage.render(); assert.equal(modal.props.allowSwipeDismissal, false); modal.props.onRequestClose(); assert.equal(scrollPage.counts().cancelled, 0); gate.end(true); await new Promise(resolve => setTimeout(resolve, 280)); assert.equal(scrollPage.render().props.allowSwipeDismissal, true); gate.end(true); gate.update(false); await new Promise(resolve => setTimeout(resolve, 280)); assert.equal(scrollPage.render().props.allowSwipeDismissal, false); gate.dispose();
const stale = mount('ios', true, true); const staleModal = stale.render(); const staleGate = staleModal.props.children.props.children.props.value; staleGate.begin(false); staleModal.props.onRequestClose(); assert.equal(stale.counts().cancelled, 0, 'Native dismissal attempt must not close via a stale React handler'); staleGate.update(true); staleModal.props.onRequestClose(); assert.equal(stale.counts().cancelled, 0, 'Returning to top in the same gesture must stay blocked'); staleGate.end(true); await new Promise(resolve => setTimeout(resolve, 280)); staleModal.props.onRequestClose(); assert.equal(stale.counts().cancelled, 1); staleGate.dispose();
console.log('Modal lifecycle: iOS dismiss barrier, first action wins, once-only completion OK');
