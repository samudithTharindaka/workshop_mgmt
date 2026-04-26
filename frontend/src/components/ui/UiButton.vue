<template>
	<Button :label="label" :class="buttonClass" :disabled="disabled" v-bind="$attrs">
		<slot />
	</Button>
</template>

<script setup>
import { computed } from "vue";
import Button from "primevue/button";

defineOptions({ inheritAttrs: false });

const props = defineProps({
	variant: { type: String, default: "primary" },
	label: { type: String, default: "" },
	disabled: { type: Boolean, default: false },
	class: { type: String, default: "" },
});

const buttonClass = computed(() => {
	const variant =
		props.variant === "secondary"
			? "portal-btn-secondary"
			: props.variant === "ghost"
				? "inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
				: "portal-btn-primary";
	return `${variant} ${props.class || ""}`.trim();
});
</script>
