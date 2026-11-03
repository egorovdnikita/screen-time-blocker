/** Pressable: на web приходит MouseEvent, на native — координата locationX. */
export function chartHourFromPress(event: { locationX?: number; offsetX?: number }, slot: number, web: boolean): number | null {
  const x = web ? event.offsetX ?? event.locationX : event.locationX;
  if (typeof x !== 'number' || !Number.isFinite(x) || !Number.isFinite(slot) || slot <= 0) return null;
  return Math.max(0, Math.min(23, Math.floor(x / slot)));
}
