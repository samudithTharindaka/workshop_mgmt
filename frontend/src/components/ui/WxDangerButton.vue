<template>
	<Button
		severity="danger"
		:label="label"
		:icon="icon"
		:loading="loading"
		:disabled="disabled"
		:size="size"
		:style="{
			background: '#dc2626',
			color: '#ffffff',
			border: '1px solid #b91c1c',
			borderRadius: '10px',
			padding: '0.5rem 0.9rem',
			fontWeight: '600',
			lineHeight: '1.1'
		}"
		@mouseenter="onMouseEnter"
		@mouseleave="onMouseLeave"
		@click="$emit('click', $event)"
	>
		<slot />
	</Button>
</template>

<script setup>
import Button from "primevue/button";

defineProps({
	label: { type: String, default: "" },
	icon: { type: String, default: "" },
	loading: { type: Boolean, default: false },
	disabled: { type: Boolean, default: false },
	size: { type: String, default: undefined },
});

defineEmits(["click"]);

function onMouseEnter(event) {
	const el = event?.currentTarget;
	if (!el) return;
	el.style.background = "#b91c1c";
	el.style.borderColor = "#991b1b";
}

function onMouseLeave(event) {
	const el = event?.currentTarget;
	if (!el) return;
	el.style.background = "#dc2626";
	el.style.borderColor = "#b91c1c";
}
</script>
