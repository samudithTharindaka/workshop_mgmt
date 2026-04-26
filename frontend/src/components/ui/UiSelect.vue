<template>
	<Select
		:model-value="modelValue"
		:options="options"
		:option-label="optionLabel"
		:option-value="optionValue"
		:placeholder="placeholder"
		class="portal-input"
		v-bind="$attrs"
		@update:model-value="onUpdate"
	/>
</template>

<script setup>
import Select from "primevue/select";

defineOptions({ inheritAttrs: false });

const props = defineProps({
	modelValue: { type: [String, Number, Boolean, Object, null], default: "" },
	options: { type: Array, default: () => [] },
	optionLabel: { type: String, default: "label" },
	optionValue: { type: String, default: "value" },
	placeholder: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

function onUpdate(value) {
	emit("update:modelValue", value ?? "");
}
</script>
