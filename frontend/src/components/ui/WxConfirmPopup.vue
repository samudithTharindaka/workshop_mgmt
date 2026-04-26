<template>
	<ConfirmDialog
		:pt="{
			root: { class: 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden w-[90vw] max-w-md m-4' },
			header: { class: 'px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50' },
			title: { class: 'text-lg font-semibold text-slate-900 dark:text-slate-100' },
			content: { class: 'p-6 flex items-start gap-4' },
			icon: { class: 'text-2xl text-amber-500 mt-0.5' },
			message: { class: 'text-sm leading-relaxed text-slate-700 dark:text-slate-300 m-0' },
			footer: { class: 'px-5 py-4 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50' },
			rejectButton: { root: { style: { backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' } } },
			acceptButton: { root: { style: { backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', marginLeft: '0.5rem' } } },
			closeButton: { class: 'w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none' },
			closeButtonIcon: { class: 'text-sm' },
			mask: { class: 'bg-slate-900/60 backdrop-blur-sm' }
		}"
	/>
</template>

<script setup>
import ConfirmDialog from "primevue/confirmdialog";
</script>
