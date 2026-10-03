import { xt as resolve } from "../../../chunks/internal.js";
import { a as attr } from "../../../chunks/server2.js";
//#region src/routes/demo/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<a${attr("href", resolve("/demo/playwright"))}>playwright</a>`);
	});
}
//#endregion
export { _page as default };

//# sourceMappingURL=_page.svelte.js.map