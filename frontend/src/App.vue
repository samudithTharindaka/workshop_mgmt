<template>
	<div class="min-h-screen flex flex-col">
		<header
			class="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40"
		>
			<div class="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<div
						class="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-sm font-bold text-white shadow"
					>
						W
					</div>
					<div>
						<h1 class="text-lg font-bold tracking-tight">Workshop Portal</h1>
						<p class="text-xs text-slate-500">Garage — without opening Desk forms</p>
					</div>
				</div>
				<nav class="flex items-center gap-2 text-sm">
					<RouterLink
						to="/"
						class="px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-600 hover:bg-slate-800/80 transition"
						active-class="!border-sky-500/40 !bg-sky-500/10 text-sky-300"
					>
						Dashboard
					</RouterLink>
					<RouterLink
						to="/appointments"
						class="px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-600 hover:bg-slate-800/80 transition"
						active-class="!border-sky-500/40 !bg-sky-500/10 text-sky-300"
					>
						Appointments
					</RouterLink>
					<RouterLink
						to="/job-cards"
						class="px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-600 hover:bg-slate-800/80 transition"
						active-class="!border-sky-500/40 !bg-sky-500/10 text-sky-300"
					>
						Job cards
					</RouterLink>
					<RouterLink
						to="/inspections"
						class="px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-600 hover:bg-slate-800/80 transition"
						active-class="!border-sky-500/40 !bg-sky-500/10 text-sky-300"
					>
						Inspections
					</RouterLink>
					<a
						href="/app"
						class="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition"
					>
						Desk
					</a>
				</nav>
			</div>
		</header>
		<main class="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
			<RouterView />
		</main>
		<footer class="border-t border-slate-800 py-3 text-center text-xs text-slate-600">
			{{ userLabel }}
		</footer>
	</div>
</template>

<script setup>
import { computed } from "vue";

const userLabel = computed(() => {
	const u = window?.frappe?.boot?.user;
	if (u?.fullname) return `Signed in as ${u.fullname}`;
	if (u?.name) return `Signed in as ${u.name}`;
	return "Workshop Management";
});
</script>
