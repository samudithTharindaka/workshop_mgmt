<template>
	<Teleport to="body">
		<Transition
			enter-active-class="transition-opacity duration-200 ease-out"
			leave-active-class="transition-opacity duration-150 ease-in"
			enter-from-class="opacity-0"
			leave-to-class="opacity-0"
		>
			<div
				v-if="open"
				class="fixed inset-0 z-[55] flex justify-end bg-black/50 backdrop-blur-sm"
				role="presentation"
			>
				<div class="min-w-0 flex-1" @click="close" />
				<aside
					class="portal-drawer-panel portal-drawer-animate max-h-screen w-full max-w-lg shrink-0 overflow-y-auto p-6"
					role="dialog"
					aria-modal="true"
					@click.stop
				>
					<!-- Gradient header -->
					<div class="relative -mx-6 -mt-6 mb-6 flex min-h-[34vh] flex-col overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 px-6 pb-8 pt-6 shadow-sm dark:from-brand-700 dark:to-brand-900">
						<div
							class="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
							style="background-image: url('data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' viewBox=\'0 0 16 16\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M8 0l8 8-8 8-8-8 8-8zm0 2L2 8l6 6 6-6-6-6z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E');"
							aria-hidden="true"
						/>
						<div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay" aria-hidden="true" />

						<div class="relative z-10 flex items-start justify-between gap-3">
							<div class="min-w-0">
								<p class="text-xs font-semibold uppercase tracking-wider text-brand-100">Job Card</p>
								<p class="mt-1 truncate font-mono text-2xl font-bold text-white drop-shadow-sm">{{ jobCardId || "…" }}</p>
								<p v-if="detailDoc" class="mt-1 truncate text-sm font-medium text-brand-50">
									{{ customerDisplayName(detailDoc.customer) || detailDoc.customer || "—" }}
								</p>
								<div class="mt-4 flex flex-wrap gap-2">
									<Button
										v-if="jobCardId"
										as="a"
										:href="deskFormUrl('Job Card', jobCardId)"
										target="_blank"
										rel="noopener noreferrer"
										class="!inline-flex !items-center !gap-2 !border-white/30 !bg-white/10 !rounded-lg !px-3 !py-1.5 !text-xs !font-semibold !text-white backdrop-blur-md transition hover:!bg-white/20"
										icon="pi pi-external-link"
										label="Open in Desk"
									/>
								</div>
							</div>
							<button
								type="button"
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
								aria-label="Close"
								@click="close"
							>
								<i class="pi pi-times" aria-hidden="true" />
							</button>
						</div>

						<div v-if="loading" class="relative z-10 mt-auto py-8 text-center text-sm font-medium text-brand-100">Loading…</div>

						<div v-else-if="detailDoc" class="relative z-10 mt-auto flex items-end gap-4 pt-10">
							<img
								v-if="customerAvatarSrc(detailDoc.customer)"
								:src="customerAvatarSrc(detailDoc.customer)"
								alt=""
								class="h-16 w-16 shrink-0 rounded-full border-2 border-white/50 object-cover shadow-lg"
							/>
							<div
								v-else
								class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-white/15 text-xl font-bold text-white shadow-lg backdrop-blur-md"
							>
								{{ customerInitials(detailDoc.customer) }}
							</div>
							<div class="min-w-0 pb-1">
								<p class="text-xs font-medium text-brand-100 drop-shadow-sm">Vehicle</p>
								<p class="mt-0.5 truncate text-lg font-bold text-white drop-shadow-sm">{{ detailDoc.vehicle || "—" }}</p>
							</div>
						</div>
					</div>

					<template v-if="!loading && detailDoc">
						<div class="mb-6 grid grid-cols-1 gap-0 text-sm">
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">Status</span>
								<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" :class="statusPillClass(detailDoc.status)">
									<span class="h-1.5 w-1.5 rounded-full" :class="statusDotClass(detailDoc.status)" aria-hidden="true" />
									{{ detailDoc.status || "—" }}
								</span>
							</div>
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">Posting date</span>
								<span class="tabular-nums text-slate-800 dark:text-slate-200">{{ detailDoc.posting_date || "—" }}</span>
							</div>
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">Company</span>
								<span class="break-all text-right text-slate-800 dark:text-slate-200">{{ detailDoc.company || "—" }}</span>
							</div>
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">Warehouse</span>
								<span class="break-all text-right text-slate-800 dark:text-slate-200">{{ detailDoc.warehouse || "—" }}</span>
							</div>
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">Appointment</span>
								<span class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ detailDoc.appointment || "—" }}</span>
							</div>
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">Inspection</span>
								<span class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ detailDoc.inspection || "—" }}</span>
							</div>
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">Quotation</span>
								<span class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ detailDoc.quotation || "—" }}</span>
							</div>
							<div class="flex items-center justify-between gap-2 py-2">
								<span class="text-slate-500 dark:text-slate-400">Sales invoice</span>
								<span class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ detailDoc.sales_invoice || "—" }}</span>
							</div>
						</div>

						<button type="button" class="portal-btn-primary w-full" @click="goOpenJobCard">
							<i class="pi pi-wrench" aria-hidden="true" />
							Open in workshop
						</button>
					</template>
					<p v-else-if="error" class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
				</aside>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { restResourceGet } from "../../utils/api";
import { deskFormUrl } from "../../utils/desk.js";
import { useCustomerMeta } from "../../composables/useCustomerMeta.js";
import Button from "primevue/button";

const props = defineProps({
	open: { type: Boolean, default: false },
	jobCardId: { type: String, default: "" },
});

const emit = defineEmits(["update:open"]);

const router = useRouter();
const { customerDisplayName, customerAvatarSrc, customerInitials, enrichCustomersForRows } = useCustomerMeta();

const detailDoc = ref(null);
const loading = ref(false);
const error = ref("");

watch(
	() => props.open,
	(isOpen) => {
		if (isOpen && props.jobCardId) {
			loadDetail();
		} else {
			detailDoc.value = null;
		}
	}
);

watch(
	() => props.jobCardId,
	(newId) => {
		if (props.open && newId) loadDetail();
	}
);

function close() {
	emit("update:open", false);
}

async function loadDetail() {
	loading.value = true;
	error.value = "";
	try {
		const doc = await restResourceGet("Job Card", props.jobCardId);
		detailDoc.value = doc;
		if (doc.customer) await enrichCustomersForRows([doc]);
	} catch (e) {
		error.value = e.message || "Failed to load job card";
		detailDoc.value = null;
	} finally {
		loading.value = false;
	}
}

function goOpenJobCard() {
	const id = props.jobCardId;
	close();
	router.push({ name: "job-card-detail", params: { id: String(id) } });
}

function statusPillClass(status) {
	const s = String(status || "");
	if (s === "Invoiced" || s === "Closed")
		return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
	if (s === "Cancelled") return "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300";
	if (s === "Ready to Invoice" || s === "Approved")
		return "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200";
	if (s === "In Progress") return "bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-100";
	return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
}

function statusDotClass(status) {
	const s = String(status || "");
	if (s === "Invoiced" || s === "Closed") return "bg-emerald-500";
	if (s === "Cancelled") return "bg-red-500";
	if (s === "Ready to Invoice" || s === "Approved") return "bg-amber-500";
	if (s === "In Progress") return "bg-brand-500";
	return "bg-slate-400";
}
</script>
