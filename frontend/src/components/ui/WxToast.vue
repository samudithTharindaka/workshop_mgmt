<template>
	<Toast position="top-right">
		<template #message="{ message }">
			<div
				:style="{
					minWidth: '18rem',
					maxWidth: '24rem',
					padding: '0.8rem 0.95rem',
					borderRadius: '12px',
					border: `1px solid ${palette(message).border}`,
					background: palette(message).bg,
					color: '#ffffff',
					boxShadow: '0 12px 26px rgba(15, 23, 42, 0.24)'
				}"
			>
				<div style="font-weight: 700; font-size: 0.92rem;">
					{{ message.summary || "Notice" }}
				</div>
				<div style="margin-top: 0.2rem; font-size: 0.84rem; opacity: 0.96;">
					{{ message.detail }}
				</div>
			</div>
		</template>
	</Toast>
</template>

<script setup>
import Toast from "primevue/toast";

function palette(message) {
	const severity = message?.severity || "info";
	if (severity === "success") return { bg: "#166534", border: "#14532d" };
	if (severity === "error") return { bg: "#b91c1c", border: "#991b1b" };
	if (severity === "warn") return { bg: "#b45309", border: "#92400e" };
	return { bg: "#1e293b", border: "#334155" };
}
</script>
