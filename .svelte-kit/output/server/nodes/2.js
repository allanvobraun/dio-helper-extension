

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["app/immutable/nodes/2.Bzm_zz3a.js","app/immutable/chunks/BIqnDU1-.js"];
export const stylesheets = [];
export const fonts = [];
