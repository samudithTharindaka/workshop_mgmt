<template>
	<div class="space-y-6">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<h2 class="text-lg font-bold">Job cards</h2>
				<p class="text-xs text-slate-500 mt-0.5">
					Workflow matches Desk (Workshop Job Card). Use Desk for line edits and complex changes.
				</p>
			</div>
		</div>

		<p v-if="listError" class="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
			{{ listError }}
		</p>

		<div class="rounded-xl border border-slate-800 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-900 text-left text-slate-500 uppercase text-[11px] tracking-wide">
						<tr>
							<th class="px-4 py-3">ID</th>
							<th class="px-4 py-3">Customer</th>
							<th class="px-4 py-3">Vehicle</th>
							<th class="px-4 py-3">Status</th>
							<th class="px-4 py-3">Appointment</th>
							<th class="px-4 py-3 w-24">Desk</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-800">
						<tr v-if="loading" class="text-slate-500">
							<td colspan="6" class="px-4 py-8 text-center">Loading…</td>
						</tr>
						<tr v-else-if="!rows.length" class="text-slate-500">
							<td colspan="6" class="px-4 py-8 text-center">No job cards</td>
						</tr>
						<tr
							v-for="r in rows"
							:key="r.name"
							class="hover:bg-slate-900/50 cursor-pointer"
							@click="openDetail(r.name)"
						>
							<td class="px-4 py-2 font-mono text-sky-300">{{ r.name }}</td>
							<td class="px-4 py-2 text-slate-300">{{ r.customer || "—" }}</td>
							<td class="px-4 py-2 text-slate-400">{{ r.vehicle || "—" }}</td>
							<td class="px-4 py-2">
								<span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusPillClass(r.status)">{{
									r.status
								}}</span>
							</td>
							<td class="px-4 py-2 font-mono text-xs text-slate-500">{{ r.appointment || "—" }}</td>
							<td class="px-4 py-2">
								<a
									:href="deskFormUrl('Job Card', r.name)"
									class="text-xs text-slate-500 hover:text-sky-400"
									@click.stop
									target="_blank"
									rel="noopener noreferrer"
									>Open</a
								>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<Teleport to="body">
			<div
				v-if="detailOpen"
				class="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
				@click.self="closeDetail"
			>
				<div
					class="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
					role="dialog"
					aria-modal="true"
				>
					<div class="flex items-start justify-between gap-3 mb-4">
						<div>
							<h3 class="text-lg font-bold text-slate-100">Job card</h3>
							<p class="font-mono text-sm text-sky-300">{{ detailName }}</p>
							<a
								v-if="detailName"
								:href="deskFormUrl('Job Card', detailName)"
								target="_blank"
								rel="noopener noreferrer"
								class="mt-1 inline-block text-xs text-slate-500 hover:text-sky-400"
								>Open full form in Desk →</a
							>
						</div>
						<button
							type="button"
							class="rounded-lg border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800"
							@click="closeDetail"
						>
							Close
						</button>
					</div>

					<div v-if="detailLoading" class="py-12 text-center text-slate-500">Loading…</div>
					<template v-else-if="detailDoc">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4">
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5 sm:col-span-2">
								<span class="text-slate-500">Status</span>
								<span class="font-medium text-slate-200">{{ detailDoc.status }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5">
								<span class="text-slate-500">Company</span>
								<span class="text-slate-200 text-right break-all">{{ detailDoc.company || "—" }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5">
								<span class="text-slate-500">Warehouse</span>
								<span class="text-slate-200 text-right break-all">{{ detailDoc.warehouse || "—" }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5">
								<span class="text-slate-500">Customer</span>
								<span class="text-slate-200 text-right break-all">{{ detailDoc.customer || "—" }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5">
								<span class="text-slate-500">Vehicle</span>
								<span class="text-slate-200 text-right break-all">{{ detailDoc.vehicle || "—" }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5">
								<span class="text-slate-500">Posting date</span>
								<span class="text-slate-300">{{ detailDoc.posting_date || "—" }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5">
								<span class="text-slate-500">Advisor</span>
								<span class="text-slate-300 break-all">{{ detailDoc.service_advisor || "—" }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5 sm:col-span-2">
								<span class="text-slate-500">Appointment</span>
								<span class="font-mono text-xs text-slate-300 break-all">{{ detailDoc.appointment || "—" }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5 sm:col-span-2">
								<span class="text-slate-500">Inspection</span>
								<span class="font-mono text-xs text-slate-300 break-all">{{ detailDoc.inspection || "—" }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5 sm:col-span-2">
								<span class="text-slate-500">Quotation</span>
								<span class="font-mono text-xs text-slate-300 break-all">{{ detailDoc.quotation || "—" }}</span>
							</div>
							<div class="flex justify-between gap-2 py-1.5 sm:col-span-2">
								<span class="text-slate-500">Sales invoice</span>
								<span class="font-mono text-xs text-slate-300 break-all">{{ detailDoc.sales_invoice || "—" }}</span>
							</div>
							<div v-if="detailDoc.complaint_summary" class="sm:col-span-2 py-1.5">
								<span class="text-slate-500 block mb-1">Complaint</span>
								<span class="text-slate-300 whitespace-pre-wrap text-sm">{{ detailDoc.complaint_summary }}</span>
							</div>
						</div>

						<!-- Line items (read-only summary) -->
						<div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
							<div class="rounded-lg border border-slate-800 overflow-hidden">
								<h4 class="bg-slate-950 px-3 py-2 text-[11px] font-semibold uppercase text-slate-500">
									Service items ({{ (detailDoc.service_items || []).length }})
								</h4>
								<div class="max-h-40 overflow-y-auto text-xs">
									<table class="w-full">
										<thead class="text-slate-500 text-left">
											<tr>
												<th class="px-2 py-1">Item</th>
												<th class="px-2 py-1 text-right">Qty</th>
												<th class="px-2 py-1 text-right">Amount</th>
											</tr>
										</thead>
										<tbody>
											<tr v-for="(row, idx) in detailDoc.service_items || []" :key="'s' + idx" class="border-t border-slate-800">
												<td class="px-2 py-1 text-slate-300">{{ row.item_code }}</td>
												<td class="px-2 py-1 text-right text-slate-400">{{ row.qty }}</td>
												<td class="px-2 py-1 text-right text-slate-300">{{ fmtMoney(row.amount) }}</td>
											</tr>
											<tr v-if="!(detailDoc.service_items || []).length">
												<td colspan="3" class="px-2 py-2 text-slate-600">None</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
							<div class="rounded-lg border border-slate-800 overflow-hidden">
								<h4 class="bg-slate-950 px-3 py-2 text-[11px] font-semibold uppercase text-slate-500">
									Part items ({{ (detailDoc.part_items || []).length }})
								</h4>
								<div class="max-h-40 overflow-y-auto text-xs">
									<table class="w-full">
										<thead class="text-slate-500 text-left">
											<tr>
												<th class="px-2 py-1">Item</th>
												<th class="px-2 py-1 text-right">Qty</th>
												<th class="px-2 py-1 text-right">Amount</th>
											</tr>
										</thead>
										<tbody>
											<tr v-for="(row, idx) in detailDoc.part_items || []" :key="'p' + idx" class="border-t border-slate-800">
												<td class="px-2 py-1 text-slate-300">{{ row.item_code }}</td>
												<td class="px-2 py-1 text-right text-slate-400">{{ row.qty }}</td>
												<td class="px-2 py-1 text-right text-slate-300">{{ fmtMoney(row.amount) }}</td>
											</tr>
											<tr v-if="!(detailDoc.part_items || []).length">
												<td colspan="3" class="px-2 py-2 text-slate-600">None</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>

						<p class="text-xs text-slate-500 mb-2">Workflow</p>
						<div class="flex flex-col gap-2 mb-4">
							<button
								v-for="t in workflowTransitions"
								:key="t.action + '-' + (t.next_state || '')"
								type="button"
								class="rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 text-left text-sm text-slate-100 hover:bg-slate-700 disabled:opacity-50"
								:disabled="detailActionLoading"
								@click="runWorkflow(t.action)"
							>
								<span class="font-semibold">{{ workflowActionLabel(t.action) }}</span>
								<span class="text-slate-500"> → {{ t.next_state }}</span>
							</button>
							<p v-if="!workflowTransitions.length" class="text-xs text-slate-600">
								No actions for your role, or workflow not active. Use Desk to advance status.
							</p>
						</div>

						<p class="text-xs text-slate-500 mb-2">Create documents (same rules as Desk)</p>
						<div class="flex flex-col gap-2 mb-4">
							<button
								v-if="canCreateQuotation"
								type="button"
								class="rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-50"
								:disabled="detailActionLoading"
								@click="runCreateQuotation"
							>
								Create quotation
							</button>
							<button
								v-if="canCreateSalesInvoice"
								type="button"
								class="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
								:disabled="detailActionLoading"
								@click="runCreateSalesInvoice"
							>
								Create sales invoice
							</button>
						</div>

						<p class="text-xs text-slate-500 mb-2">Linked records</p>
						<div class="flex flex-col gap-2">
							<a
								v-if="detailDoc.appointment"
								:href="deskFormUrl('Service Appointment', detailDoc.appointment)"
								target="_blank"
								rel="noopener noreferrer"
								class="rounded-lg border border-slate-600 px-4 py-2 text-center text-sm text-slate-200 hover:bg-slate-800"
								>Appointment in Desk</a
							>
							<a
								v-if="detailDoc.inspection"
								:href="deskFormUrl('Vehicle Inspection', detailDoc.inspection)"
								target="_blank"
								rel="noopener noreferrer"
								class="rounded-lg border border-slate-600 px-4 py-2 text-center text-sm text-slate-200 hover:bg-slate-800"
								>Inspection in Desk</a
							>
							<a
								v-if="detailDoc.quotation"
								:href="deskFormUrl('Quotation', detailDoc.quotation)"
								target="_blank"
								rel="noopener noreferrer"
								class="rounded-lg border border-slate-600 px-4 py-2 text-center text-sm text-slate-200 hover:bg-slate-800"
								>Quotation in Desk</a
							>
							<a
								v-if="detailDoc.sales_invoice"
								:href="deskFormUrl('Sales Invoice', detailDoc.sales_invoice)"
								target="_blank"
								rel="noopener noreferrer"
								class="rounded-lg border border-slate-600 px-4 py-2 text-center text-sm text-slate-200 hover:bg-slate-800"
								>Sales invoice in Desk</a
							>
						</div>
					</template>
					<p v-else-if="detailError" class="text-sm text-red-300">{{ detailError }}</p>

					<p v-if="detailActionError" class="mt-3 text-sm text-red-300">{{ detailActionError }}</p>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { restResourceList, restResourceGet, frappeCall } from "../utils/api";

const route = useRoute();
const router = useRouter();

const DOCTYPE_ROUTE = {
	"Job Card": "job-card",
	"Service Appointment": "service-appointment",
	"Vehicle Inspection": "vehicle-inspection",
	Quotation: "quotation",
	"Sales Invoice": "sales-invoice",
};

const WORKFLOW_ACTION_LABELS = {
	"WS Check In": "Check in",
	"WS Inspect": "Record inspection",
	"WS Estimate": "Submit estimate",
	"WS Approve": "Approve",
	"WS Start Work": "Start work",
	"WS Ready To Invoice": "Ready to invoice",
	"WS Close": "Close",
	"WS Cancel": "Cancel job",
};

function deskFormUrl(doctype, name) {
	const slug = DOCTYPE_ROUTE[doctype] || doctype.toLowerCase().replace(/\s+/g, "-");
	return `/app/${slug}/${encodeURIComponent(name)}`;
}

function statusPillClass(status) {
	const s = String(status || "");
	if (s === "Invoiced" || s === "Closed") return "bg-emerald-500/20 text-emerald-300";
	if (s === "Cancelled") return "bg-rose-500/20 text-rose-300";
	if (s === "Ready to Invoice" || s === "Approved") return "bg-amber-500/20 text-amber-200";
	if (s === "In Progress") return "bg-sky-500/20 text-sky-300";
	return "bg-slate-800 text-slate-300";
}

function workflowActionLabel(action) {
	return WORKFLOW_ACTION_LABELS[action] || action;
}

function fmtMoney(v) {
	const n = Number(v || 0);
	try {
		const cur = window?.frappe?.boot?.sysdefaults?.currency || "USD";
		return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(n);
	} catch {
		return n.toFixed(2);
	}
}

const loading = ref(true);
const listError = ref("");
const rows = ref([]);

const detailOpen = ref(false);
const detailName = ref("");
const detailLoading = ref(false);
const detailError = ref("");
const detailDoc = ref(null);
const detailActionLoading = ref(false);
const detailActionError = ref("");
const workflowTransitions = ref([]);

const LIST_FIELDS =
	'["name","customer","vehicle","status","appointment","posting_date","modified"]';

const canCreateQuotation = computed(() => {
	const d = detailDoc.value;
	if (!d) return false;
	if (d.quotation) return false;
	return ["Inspected", "Estimated"].includes(d.status);
});

const canCreateSalesInvoice = computed(() => {
	const d = detailDoc.value;
	if (!d) return false;
	if (d.sales_invoice) return false;
	return ["Approved", "Ready to Invoice"].includes(d.status);
});

async function loadList() {
	loading.value = true;
	listError.value = "";
	try {
		rows.value = await restResourceList("Job Card", {
			fields: LIST_FIELDS,
			order_by: "modified desc",
			limit_page_length: 100,
		});
	} catch (e) {
		listError.value = e.message || "Failed to load list";
	} finally {
		loading.value = false;
	}
}

async function loadWorkflowTransitions() {
	workflowTransitions.value = [];
	if (!detailName.value) return;
	try {
		const list = await frappeCall("frappe.model.workflow.get_transitions", {
			doc: { doctype: "Job Card", name: detailName.value },
		});
		workflowTransitions.value = Array.isArray(list) ? list : [];
	} catch {
		workflowTransitions.value = [];
	}
}

async function refreshDetail() {
	if (!detailName.value) return;
	detailLoading.value = true;
	detailError.value = "";
	try {
		detailDoc.value = await restResourceGet("Job Card", detailName.value);
		await loadWorkflowTransitions();
	} catch (e) {
		detailDoc.value = null;
		detailError.value = e.message || "Failed to load job card";
	} finally {
		detailLoading.value = false;
	}
}

async function openDetail(name) {
	detailName.value = name;
	detailActionError.value = "";
	detailOpen.value = true;
	await refreshDetail();
}

function closeDetail() {
	detailOpen.value = false;
	detailDoc.value = null;
	detailName.value = "";
	detailError.value = "";
	detailActionError.value = "";
	workflowTransitions.value = [];
}

async function runWorkflow(action) {
	detailActionError.value = "";
	detailActionLoading.value = true;
	try {
		await frappeCall("frappe.model.workflow.apply_workflow", {
			doc: { doctype: "Job Card", name: detailName.value },
			action,
		});
		await refreshDetail();
		await loadList();
	} catch (e) {
		detailActionError.value = e.message || "Workflow action failed";
	} finally {
		detailActionLoading.value = false;
	}
}

async function runCreateQuotation() {
	detailActionError.value = "";
	detailActionLoading.value = true;
	try {
		const qname = await frappeCall("workshop_mgmt.api.job_card_create_quotation", {
			name: detailName.value,
		});
		await refreshDetail();
		await loadList();
		if (qname) {
			window.open(deskFormUrl("Quotation", qname), "_blank", "noopener,noreferrer");
		}
	} catch (e) {
		detailActionError.value = e.message || "Could not create quotation";
	} finally {
		detailActionLoading.value = false;
	}
}

async function runCreateSalesInvoice() {
	if (
		!window.confirm(
			"This will create a Sales Invoice and update stock (same as Desk). Continue?"
		)
	) {
		return;
	}
	detailActionError.value = "";
	detailActionLoading.value = true;
	try {
		const inv = await frappeCall("workshop_mgmt.api.job_card_create_sales_invoice", {
			name: detailName.value,
		});
		await refreshDetail();
		await loadList();
		if (inv) {
			window.open(deskFormUrl("Sales Invoice", inv), "_blank", "noopener,noreferrer");
		}
	} catch (e) {
		detailActionError.value = e.message || "Could not create invoice";
	} finally {
		detailActionLoading.value = false;
	}
}

watch(
	() => route.query.open,
	(id) => {
		if (typeof id === "string" && id) {
			openDetail(id);
			router.replace({ path: route.path, query: {} });
		}
	},
	{ immediate: true }
);

onMounted(loadList);
</script>
