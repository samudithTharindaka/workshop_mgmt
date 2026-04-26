import { ref } from "vue";

const STORAGE_KEY = "workshop-portal-theme";

/** @type {import('vue').Ref<'dark' | 'light'>} */
export const theme = ref("dark");

function readStored() {
	try {
		const v = localStorage.getItem(STORAGE_KEY);
		return v === "light" ? "light" : "dark";
	} catch {
		return "dark";
	}
}

/** Call before Vue mounts — syncs <html data-theme> and localStorage. */
export function initThemeFromStorage() {
	const t = readStored();
	document.documentElement.setAttribute("data-theme", t);
	theme.value = t;
}

export function useTheme() {
	function setTheme(next) {
		const t = next === "light" ? "light" : "dark";
		document.documentElement.setAttribute("data-theme", t);
		try {
			localStorage.setItem(STORAGE_KEY, t);
		} catch {
			/* ignore */
		}
		theme.value = t;
	}

	return { theme, setTheme };
}
