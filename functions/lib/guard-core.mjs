import * as importedCore from '../../dist/guard-core.js';

// Node exposes the UMD file as CommonJS default; Cloudflare/workerd executes
// the browser branch and exposes FranklinGuardCore on globalThis/self.
const Core = importedCore.default || globalThis.FranklinGuardCore;

if (!Core?.check) {
  throw new Error('FranklinGuardCore failed to initialize in the server runtime.');
}

export default Core;
export const check = Core.check;
export const normalize = Core.normalize;
export const addWords = Core.addWords;
export const addAllow = Core.addAllow;
