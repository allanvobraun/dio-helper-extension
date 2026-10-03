

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/demo/_page.svelte.js')).default;
export const imports = ["app/immutable/nodes/3.BylGveUq.js","app/immutable/chunks/BIqnDU1-.js","app/immutable/chunks/Cyt8LZpN.js","app/immutable/entry/payload.DSmR2FwN.js"];
export const stylesheets = [];
export const fonts = [];
