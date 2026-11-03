// Геометрия плавающего листа: исходная позиция на852pt, адаптация на низких экранах.
export function floatingSheetTop(height: number, safeTop: number, referenceTop: number, referenceHeight: number, bottom = 8) {
  return Math.max(safeTop, Math.min(referenceTop, height - bottom - referenceHeight));
}
