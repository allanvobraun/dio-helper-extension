export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	app_dir: "app",
	app_path: "app",
	assets: new Set(["favicon.png","manifest.json","robots.txt","service-worker.js"]),
	mime_types: {".png":"image/png",".json":"application/json",".txt":"text/plain"},
	client: {start:"app/immutable/entry/start.OHVY_QLg.js",app:"app/immutable/entry/app.Dd5GozuH.js",imports:["app/immutable/entry/start.OHVY_QLg.js","app/immutable/entry/payload.DSmR2FwN.js","app/immutable/chunks/BaNbYf_w.js","app/immutable/chunks/zc52FzjX.js","app/immutable/chunks/BIqnDU1-.js","app/immutable/chunks/Cyt8LZpN.js","app/immutable/chunks/kxp24NXk.js","app/immutable/entry/app.Dd5GozuH.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
	
	nodes: [
		__memo(() => import('./nodes/0.js')),
		__memo(() => import('./nodes/1.js')),
		__memo(() => import('./nodes/2.js')),
		__memo(() => import('./nodes/3.js')),
		__memo(() => import('./nodes/4.js'))
	],
	remotes: {
		
	},
	routes: [
		{
			id: "/",
			pattern: /^\/$/,
			params: [],
			page: { layouts: [0,], errors: [1,], leaf: 2 },
			endpoint: null
		},
		{
			id: "/demo",
			pattern: /^\/demo\/?$/,
			params: [],
			page: { layouts: [0,], errors: [1,], leaf: 3 },
			endpoint: null
		},
		{
			id: "/demo/playwright",
			pattern: /^\/demo\/playwright\/?$/,
			params: [],
			page: { layouts: [0,], errors: [1,], leaf: 4 },
			endpoint: null
		}
	],
	prerendered_routes: new Set([]),
	matchers: async () => {
		return {};
	},
	server_assets: {}
}
})();
