import AsyncStorage from '@react-native-async-storage/async-storage';

import { art } from '@/data/art';

// Постоянное хранение пользовательских данных на устройстве (APP-01).
// Один снимок с версией; картинки записываются по имени из реестра art,
// потому что числовые id ассетов Metro меняются между сборками.
export const STORAGE_KEY = 'block.state';
export const STORAGE_VERSION = 1;

type Snapshot = Record<string, unknown>;
export type LoadResult =
  | { status: 'empty' }
  | { status: 'ok'; data: Snapshot }
  | { status: 'corrupt'; backupKey: string | null }
  | { status: 'error' };

const IMAGE_KEYS = new Set(['image', 'preview', 'menuImage']);
const artByAsset = new Map<unknown, string>(Object.entries(art).map(([name, asset]) => [asset, name]));
const artRegistry = art as Record<string, unknown>;

export function encodeSnapshot(data: Snapshot): string {
  return JSON.stringify({ version: STORAGE_VERSION, data }, (key, value) =>
    IMAGE_KEYS.has(key) && artByAsset.has(value) ? { $art: artByAsset.get(value) } : value);
}

export function decodeSnapshot(raw: string): Snapshot | null {
  const parsed = JSON.parse(raw, (_key, value) =>
    value && typeof value === 'object' && typeof value.$art === 'string' ? artRegistry[value.$art] ?? null : value);
  if (!parsed || typeof parsed !== 'object' || typeof parsed.data !== 'object' || parsed.data === null) return null;
  return migrate(parsed.version, parsed.data);
}

// Миграции версий данных. Неизвестная (более новая) версия не читается, чтобы не испортить данные.
function migrate(version: unknown, data: Snapshot): Snapshot | null {
  if (version === STORAGE_VERSION) return data;
  return null;
}

export async function loadSnapshot(): Promise<LoadResult> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return { status: 'error' };
  }
  if (raw === null) return { status: 'empty' };
  let data: Snapshot | null = null;
  try { data = decodeSnapshot(raw); } catch { data = null; }
  if (data) return { status: 'ok', data };
  // Повреждённую или несовместимую запись не удаляем молча: переносим в резервный ключ.
  const backupKey = `${STORAGE_KEY}.backup-${Date.now()}`;
  try {
    await AsyncStorage.setItem(backupKey, raw);
    await AsyncStorage.removeItem(STORAGE_KEY);
    return { status: 'corrupt', backupKey };
  } catch {
    return { status: 'corrupt', backupKey: null };
  }
}

export async function saveSnapshot(encoded: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, encoded);
    return true;
  } catch {
    return false;
  }
}

export async function clearSnapshot(): Promise<boolean> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys.filter(key => key === STORAGE_KEY || key.startsWith(`${STORAGE_KEY}.`)));
    return true;
  } catch {
    return false;
  }
}
