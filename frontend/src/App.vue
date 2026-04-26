<template>
	<div
		class="flex min-h-screen bg-slate-100/90 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100"
	>
		<!-- Sidebar — Workshop Executive -->
		<aside
			class="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex"
			aria-label="Main navigation"
		>
			<div class="flex h-16 items-center gap-3 border-b border-slate-100 px-4 dark:border-slate-800">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-sm font-bold text-white shadow-sm"
				>
					W
				</div>
				<div class="min-w-0">
					<div class="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">Workshop Portal</div>
					<div class="truncate text-xs text-slate-500 dark:text-slate-400">Operations</div>
				</div>
			</div>
			<nav class="flex flex-1 flex-col gap-1 p-3">
				<RouterLink
					v-for="item in navItems"
					:key="item.to"
					:to="item.to"
					class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100"
					active-class="!bg-sky-50 !text-sky-900 dark:!bg-sky-950/50 dark:!text-sky-200"
				>
					<span class="shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" v-html="item.icon" />
					<span>{{ item.label }}</span>
				</RouterLink>
			</nav>
			<div class="border-t border-slate-100 p-3 dark:border-slate-800">
				<a
					href="/app"
					class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 dark:text-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-slate-300"
				>
					<svg class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path
							fill-rule="evenodd"
							d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z"
							clip-rule="evenodd"
						/>
					</svg>
					Desk
				</a>
			</div>
		</aside>

		<div class="flex min-w-0 flex-1 flex-col">
			<!-- Sticky top bar -->
			<header
				class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/90 bg-white/95 px-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:gap-4 md:px-6"
			>
				<div id="wx-top-nav-title" class="min-w-0 shrink-0 flex items-center md:max-w-[20rem] lg:max-w-[30rem]">
					<div class="wx-default-title truncate text-sm font-semibold text-slate-900 dark:text-slate-100 md:hidden">Workshop Portal</div>
					<h1 class="wx-default-title truncate text-lg font-semibold text-slate-900 dark:text-slate-50 hidden md:block">{{ pageTitle }}</h1>
				</div>

				<div class="mx-auto hidden min-w-0 max-w-md flex-1 px-2 md:block">
					<label class="sr-only" for="wx-header-search">Search records</label>
					<div class="relative">
						<span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400" aria-hidden="true">
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
							</svg>
						</span>
						<input
							id="wx-header-search"
							v-model="docSearch"
							type="search"
							autocomplete="off"
							class="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-inner focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400"
							placeholder="Search…"
						/>
					</div>
				</div>

				<div class="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
					<span
						class="hidden h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)] sm:inline-block"
						aria-hidden="true"
						title="Online"
					/>
					<div class="hidden min-w-0 flex-col text-right sm:flex">
						<span class="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{{ userLabel }}</span>
					</div>
					<div
						class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-gradient-to-br from-rose-50 to-sky-50 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:from-rose-950/40 dark:to-sky-950/40 dark:text-slate-200"
						:title="userLabel"
						aria-hidden="true"
					>
						{{ userInitials }}
					</div>
					<div ref="settingsRoot" class="relative">
						<button
							type="button"
							class="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800"
							aria-haspopup="menu"
							:aria-expanded="settingsOpen"
							aria-label="Settings menu"
							@click.stop="settingsOpen = !settingsOpen"
						>
							<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path
									fill-rule="evenodd"
									d="M11.078 2.25c.917 0 1.699.663 1.85 1.573l.091.549a.798.798 0 0 1 .517.608 7.45 7.45 0 0 1 .598 2.103.798.798 0 0 1-.454.791l-.45.15a.75.75 0 0 0-.553.98 7.46 7.46 0 0 1 0 2.827.75.75 0 0 0 .554.98l.45.149a.798.798 0 0 1 .454.791 7.45 7.45 0 0 1-.598 2.103.798.798 0 0 1-.517.608l-.091.549c-.15.91-.933 1.573-1.85 1.573H8.922c-.917 0-1.7-.663-1.85-1.573l-.091-.549a.798.798 0 0 1-.517-.608 7.448 7.448 0 0 1-.598-2.103.798.798 0 0 1 .454-.791l.45-.15a.75.75 0 0 0 .553-.98 7.45 7.45 0 0 1 0-2.827.75.75 0 0 0-.554-.98l-.45-.149a.798.798 0 0 1-.454-.791 7.448 7.448 0 0 1 .598-2.103.798.798 0 0 1 .517-.608l.091-.549c.15-.91.933-1.573 1.85-1.573h2.156Z"
									clip-rule="evenodd"
								/>
								<path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
							</svg>
						</button>
						<div
							v-show="settingsOpen"
							class="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900 dark:ring-white/10"
							role="menu"
							aria-label="Settings"
						>
							<p class="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-500">Appearance</p>
							<button
								type="button"
								role="menuitemradio"
								:aria-checked="theme === 'dark'"
								class="flex w-full min-h-11 items-center gap-2 px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80"
								@click="pickTheme('dark')"
							>
								<svg class="h-4 w-4 shrink-0 text-slate-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
									<path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586Z" />
								</svg>
								<span class="flex-1">Dark</span>
								<span v-if="theme === 'dark'" class="text-sky-600 dark:text-sky-400" aria-hidden="true">✓</span>
							</button>
							<button
								type="button"
								role="menuitemradio"
								:aria-checked="theme === 'light'"
								class="flex w-full min-h-11 items-center gap-2 px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80"
								@click="pickTheme('light')"
							>
								<svg class="h-4 w-4 shrink-0 text-amber-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
									<path
										d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 1 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5.25 10.75a.75.75 0 0 1 0-1.5h-1.5a.75.75 0 0 1 0 1.5h1.5Zm9.596 5.303a.75.75 0 1 0 1.06-1.06l-1.06-1.061a.75.75 0 0 0-1.06 1.06l1.06 1.06ZM5.404 4.343a.75.75 0 0 0-1.06 1.06l1.06 1.061a.75.75 0 1 0 1.06-1.06L5.404 4.343Z"
									/>
								</svg>
								<span class="flex-1">Light</span>
								<span v-if="theme === 'light'" class="text-sky-600 dark:text-sky-400" aria-hidden="true">✓</span>
							</button>
						</div>
					</div>
				</div>
			</header>

			<!-- Mobile nav -->
			<nav
				class="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 dark:border-slate-800 dark:bg-slate-900 md:hidden"
				aria-label="Mobile navigation"
			>
				<RouterLink
					v-for="item in navItems"
					:key="'m-' + item.to"
					:to="item.to"
					class="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/70"
					active-class="!bg-sky-50 !text-sky-900 dark:!bg-sky-950/50 dark:!text-sky-200"
				>
					<span class="shrink-0 opacity-80" aria-hidden="true" v-html="item.iconSm" />
					{{ item.label }}
				</RouterLink>
				<a
					href="/app"
					class="flex min-h-11 shrink-0 items-center rounded-xl px-3 text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
				>
					Desk
				</a>
			</nav>

			<div class="border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900 md:hidden">
				<label class="sr-only" for="wx-header-search-mobile">Search</label>
				<input
					id="wx-header-search-mobile"
					v-model="docSearch"
					type="search"
					class="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-800"
					placeholder="Search…"
					autocomplete="off"
				/>
			</div>

			<main class="min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
				<RouterView />
			</main>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, provide, ref } from "vue";
import { useRoute } from "vue-router";
import { useTheme } from "./composables/useTheme.js";

const route = useRoute();
const { theme, setTheme } = useTheme();

/** Shared text filter: header search + list pages (appointments first). */
const docSearch = ref("");
provide("wxDocSearch", docSearch);

const settingsOpen = ref(false);
const settingsRoot = ref(null);

const iconDashboard =
	'<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h4.5A2.25 2.25 0 0 1 11 4.25v3.5A2.25 2.25 0 0 1 8.75 10h-4.5A2.25 2.25 0 0 1 2 7.75v-3.5ZM4.25 3.5a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75h-4.5ZM13 4.25A2.25 2.25 0 0 1 15.25 2h1.5A2.25 2.25 0 0 1 19 4.25v1.5A2.25 2.25 0 0 1 16.75 8h-1.5A2.25 2.25 0 0 1 13 5.75v-1.5Zm2.25-.75a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75h-1.5ZM13 12.25A2.25 2.25 0 0 1 15.25 10h1.5A2.25 2.25 0 0 1 19 12.25v3.5A2.25 2.25 0 0 1 16.75 18h-1.5A2.25 2.25 0 0 1 13 15.75v-3.5Zm2.25-.75a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75h-1.5ZM2 12.25A2.25 2.25 0 0 1 4.25 10h4.5A2.25 2.25 0 0 1 11 12.25v3.5A2.25 2.25 0 0 1 8.75 18h-4.5A2.25 2.25 0 0 1 2 15.75v-3.5Zm2.25-.75a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75h-4.5Z"/></svg>';
const iconDashboardSm =
	'<svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h4.5A2.25 2.25 0 0 1 11 4.25v3.5A2.25 2.25 0 0 1 8.75 10h-4.5A2.25 2.25 0 0 1 2 7.75v-3.5ZM13 4.25A2.25 2.25 0 0 1 15.25 2h1.5A2.25 2.25 0 0 1 19 4.25v1.5A2.25 2.25 0 0 1 16.75 8h-1.5A2.25 2.25 0 0 1 13 5.75v-1.5ZM13 12.25A2.25 2.25 0 0 1 15.25 10h1.5A2.25 2.25 0 0 1 19 12.25v3.5A2.25 2.25 0 0 1 16.75 18h-1.5A2.25 2.25 0 0 1 13 15.75v-3.5ZM2 12.25A2.25 2.25 0 0 1 4.25 10h4.5A2.25 2.25 0 0 1 11 12.25v3.5A2.25 2.25 0 0 1 8.75 18h-4.5A2.25 2.25 0 0 1 2 15.75v-3.5Z"/></svg>';

const iconCalendar =
	'<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd"/></svg>';
const iconCalendarSm =
	'<svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Z" clip-rule="evenodd"/></svg>';

const iconWrench =
	'<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M14.5 1.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V3.56l-3.22 3.22a5.25 5.25 0 1 1-1.06 1.06L9.94 4.56 6.72 7.78a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.25a.75.75 0 0 1 0-1.5h7.25Zm-5.22 8.47a3.75 3.75 0 1 0 5.3 5.3 3.75 3.75 0 0 0-5.3-5.3Z" clip-rule="evenodd"/></svg>';
const iconWrenchSm =
	'<svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.5 1.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V3.56l-3.22 3.22a5.25 5.25 0 1 1-1.06 1.06L9.94 4.56 6.72 7.78a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.25a.75.75 0 0 1 0-1.5h7.25Z" clip-rule="evenodd"/></svg>';

const iconClipboard =
	'<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 15.5 2h-11ZM4.5 3.5h11v13h-11v-13Z" clip-rule="evenodd"/><path d="M9.25 7.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5Z"/></svg>';
const iconClipboardSm =
	'<svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 15.5 2h-11Z" clip-rule="evenodd"/></svg>';

const navItems = [
	{ to: "/", label: "Dashboard", icon: iconDashboard, iconSm: iconDashboardSm },
	{ to: "/appointments", label: "Appointments", icon: iconCalendar, iconSm: iconCalendarSm },
	{ to: "/job-cards", label: "Job cards", icon: iconWrench, iconSm: iconWrenchSm },
	{ to: "/inspections", label: "Inspections", icon: iconClipboard, iconSm: iconClipboardSm },
];

const pageTitle = computed(() => {
	const m = {
		dashboard: "Dashboard",
		appointments: "Appointments",
		"job-cards": "Job cards",
		"job-card-detail": "Job card",
		inspections: "Inspections",
	};
	return m[route.name] || "Workshop Portal";
});

const userLabel = computed(() => {
	const u = window?.frappe?.boot?.user;
	if (u?.fullname) return u.fullname;
	if (u?.name) return u.name;
	return "Signed in";
});

const userInitials = computed(() => {
	const s = userLabel.value.trim();
	if (!s) return "?";
	const parts = s.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	return s.slice(0, 2).toUpperCase();
});

function pickTheme(t) {
	setTheme(t);
	settingsOpen.value = false;
}

function onDocPointerDown(event) {
	if (!settingsOpen.value) return;
	const el = settingsRoot.value;
	if (el && !el.contains(event.target)) {
		settingsOpen.value = false;
	}
}

onMounted(() => {
	document.addEventListener("pointerdown", onDocPointerDown, true);
});
onUnmounted(() => {
	document.removeEventListener("pointerdown", onDocPointerDown, true);
});
</script>

<style>
#wx-top-nav-title:has(nav) .wx-default-title {
	display: none !important;
}
</style>
