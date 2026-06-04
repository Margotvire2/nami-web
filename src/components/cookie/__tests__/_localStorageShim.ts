/**
 * Vitest 4 + Node 22+ / jsdom : `window.localStorage` est l'objet natif
 * Node mais n'expose pas l'API Storage complète (setItem/getItem/clear
 * undefined). Pattern repris de `StructureSwitcher.test.tsx`.
 *
 * À appeler une fois par fichier de test, AVANT les `beforeEach`.
 */
const fakeStorage: Record<string, string> = {};
const memStorage: Storage = {
  get length() {
    return Object.keys(fakeStorage).length;
  },
  clear: () => {
    for (const k of Object.keys(fakeStorage)) delete fakeStorage[k];
  },
  getItem: (k: string) => (k in fakeStorage ? fakeStorage[k] : null),
  setItem: (k: string, v: string) => {
    fakeStorage[k] = v;
  },
  removeItem: (k: string) => {
    delete fakeStorage[k];
  },
  key: (i: number) => Object.keys(fakeStorage)[i] ?? null,
};

export function installLocalStorageShim() {
  Object.defineProperty(window, "localStorage", {
    value: memStorage,
    configurable: true,
    writable: true,
  });
}
