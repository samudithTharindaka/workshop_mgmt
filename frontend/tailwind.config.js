export default {
	darkMode: ["selector", '[data-theme="dark"]'],
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				// "Premium Industrial" — deep teal, anchored at #006D77
				brand: {
					50: "#F0FAFB",
					100: "#DBF1F3",
					200: "#BAE3E7",
					300: "#8ACED5",
					400: "#52AFB9",
					500: "#2A929D",
					600: "#006D77",
					700: "#015A63",
					800: "#064951",
					900: "#0A3C44",
					950: "#02262C",
				},
			},
			fontFamily: {
				sans: [
					"Inter",
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					'"Segoe UI"',
					"Roboto",
					'"Helvetica Neue"',
					"Arial",
					"sans-serif",
				],
				mono: [
					"ui-monospace",
					"SFMono-Regular",
					'"SF Mono"',
					"Menlo",
					"Monaco",
					"Consolas",
					'"Liberation Mono"',
					'"Courier New"',
					"monospace",
				],
			},
		},
	},
	plugins: [],
};
