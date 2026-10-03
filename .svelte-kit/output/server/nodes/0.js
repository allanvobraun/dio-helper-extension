import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["app/immutable/nodes/0.G4cL45Z7.js","app/immutable/chunks/BIqnDU1-.js"];
export const stylesheets = ["app/immutable/assets/0.C7WfpMGi.css"];
export const fonts = [];
