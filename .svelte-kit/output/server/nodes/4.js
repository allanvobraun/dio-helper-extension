

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/demo/playwright/_page.svelte.js')).default;
export const imports = ["app/immutable/nodes/4.DRx6DxYx.js","app/immutable/chunks/BIqnDU1-.js"];
export const stylesheets = [];
export const fonts = [];
