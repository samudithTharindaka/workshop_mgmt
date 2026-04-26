<template>
	<InputText :model-value="modelValue" class="portal-input" v-bind="$attrs" @update:model-value="onUpdate" />
</template>

<script setup>
import InputText from "primevue/inputtext";

defineOptions({ inheritAttrs: false });

const props = defineProps({
	modelValue: { type: [String, Number], default: "" },
});

const emit = defineEmits(["update:modelValue"]);

function onUpdate(value) {
	emit("update:modelValue", value ?? "");
}
</script>
