<template>
	<Teleport to="#wx-top-nav-title" v-if="mounted">
		<nav aria-label="Breadcrumb">
			<ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
				<li v-for="(item, index) in items" :key="index" class="flex min-w-0 items-center gap-2">
					<span v-if="index > 0" class="text-slate-300 dark:text-slate-600" aria-hidden="true">/</span>
					<RouterLink
						v-if="item.to && index < items.length - 1"
						:to="item.to"
						class="truncate font-medium text-slate-600 transition hover:text-sky-700 dark:text-slate-400 dark:hover:text-sky-400"
					>
						{{ item.label }}
					</RouterLink>
					<span
						v-else
						class="truncate font-medium text-slate-900 dark:text-slate-100"
						:aria-current="index === items.length - 1 ? 'page' : undefined"
					>
						{{ item.label }}
					</span>
				</li>
			</ol>
		</nav>
	</Teleport>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { ref, onMounted } from "vue";

defineProps({
	/** `{ label, to? }` — last item is current page (no link) */
	items: { type: Array, default: () => [] },
});

const mounted = ref(false);
onMounted(() => {
	mounted.value = true;
});
</script>
