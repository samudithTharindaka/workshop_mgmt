import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
	plugins: [vue()],
	css: {
		postcss: {
			plugins: [tailwindcss(), autoprefixer()],
		},
	},
	server: {
		port: 8081,
		proxy: {
			"^/(api|assets|files|private|app)": {
				target: "http://127.0.0.1:8000",
				changeOrigin: true,
				ws: true,
			},
		},
	},
	build: {
		outDir: "../workshop_mgmt/public/frontend",
		emptyOutDir: true,
		target: "es2015",
	},
});
