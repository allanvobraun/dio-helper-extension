import "../../chunks/server-errors.js";
import { i as getContext, o as escape_html } from "../../chunks/server2.js";
//#region node_modules/.pnpm/@sveltejs+kit@3.0.0_@sveltejs+vite-plugin-svelte@7.3.1_svelte@5.57.1_vite@8.3.2_@types+_ddbd3553e09e04fb87f355352d04b5de/node_modules/@sveltejs/kit/src/runtime/app/state/server.js
function context() {
	return getContext("__request__");
}
var page = {
	get data() {
		return context().page.data;
	},
	get error() {
		return context().page.error;
	},
	get form() {
		return context().page.form;
	},
	get params() {
		return context().page.params;
	},
	get route() {
		return context().page.route;
	},
	get shallow() {
		return context().page.shallow;
	},
	get state() {
		return context().page.state;
	},
	get status() {
		return context().page.status;
	},
	get url() {
		return context().page.url;
	}
};
//#endregion
//#region node_modules/.pnpm/@sveltejs+kit@3.0.0_@sveltejs+vite-plugin-svelte@7.3.1_svelte@5.57.1_vite@8.3.2_@types+_ddbd3553e09e04fb87f355352d04b5de/node_modules/@sveltejs/kit/src/runtime/components/error.svelte
function Error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>${escape_html(page.status)}</h1> <p>${escape_html(page.error?.message)}</p>`);
	});
}
//#endregion
export { Error as default };

//# sourceMappingURL=error.svelte.js.map