<template>
	<div class="mx-auto max-w-5xl space-y-6">
		<WxBreadcrumb :items="breadcrumbItems" />

		<div class="flex flex-wrap items-start justify-between gap-4">
			<div class="min-w-0">
				<p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Job card</p>
				<h1 class="mt-1 font-mono text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-2xl">
					{{ detailName || "—" }}
				</h1>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<Button
					v-if="detailName"
					as="a"
					:href="deskFormUrl('Job Card', detailName)"
					target="_blank"
					rel="noopener noreferrer"
					severity="secondary"
					outlined
					size="small"
					class="portal-pv-desk-link"
					icon="pi pi-external-link"
					label="Open in Desk"
				/>
				<Button :as="RouterLink" :to="{ name: 'job-cards' }" severity="secondary" outlined size="small" icon="pi pi-arrow-left" label="Back to list" />
			</div>
		</div>

		<p v-if="detailError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
			{{ detailError }}
		</p>

		<div v-if="detailLoading" class="py-20 text-center text-sm text-slate-600 dark:text-slate-500">Loading job card…</div>

		<template v-else-if="detailDoc">
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div class="portal-card">
					<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</p>
					<p class="mt-2">
						<span class="inline-flex rounded-md px-2.5 py-1 text-xs font-semibold" :class="statusPillClass(detailDoc.status)">
							{{ detailDoc.status || "—" }}
						</span>
					</p>
				</div>
				<div class="portal-card sm:col-span-2">
					<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Customer & vehicle</p>
					<p class="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{{ detailDoc.customer || "—" }}</p>
					<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">{{ detailDoc.vehicle || "—" }}</p>
				</div>
				<div class="portal-card">
					<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Posting date</p>
					<p class="mt-2 text-sm tabular-nums text-slate-800 dark:text-slate-200">{{ detailDoc.posting_date || "—" }}</p>
				</div>
			</div>

			<div class="portal-card">
				<h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Workshop details</h2>
				<div class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
					<div class="flex justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800 sm:col-span-2">
						<span class="text-slate-500">Company</span>
						<span class="text-right font-medium text-slate-800 dark:text-slate-200 break-all">{{ detailDoc.company || "—" }}</span>
					</div>
					<div class="flex justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800 sm:col-span-2">
						<span class="text-slate-500">Warehouse</span>
						<span class="text-right font-medium text-slate-800 dark:text-slate-200 break-all">{{ detailDoc.warehouse || "—" }}</span>
					</div>
					<div class="flex justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
						<span class="text-slate-500">Advisor</span>
						<span class="text-right text-slate-700 dark:text-slate-300 break-all">{{ detailDoc.service_advisor || "—" }}</span>
					</div>
					<div class="flex justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
						<span class="text-slate-500">Appointment</span>
						<span class="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{{ detailDoc.appointment || "—" }}</span>
					</div>
					<div class="flex justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800 sm:col-span-2">
						<span class="text-slate-500">Inspection</span>
						<span class="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{{ detailDoc.inspection || "—" }}</span>
					</div>
					<div class="flex justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800 sm:col-span-2">
						<span class="text-slate-500">Quotation</span>
						<span class="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{{ detailDoc.quotation || "—" }}</span>
					</div>
					<div class="flex justify-between gap-2 sm:col-span-2">
						<span class="text-slate-500">Sales invoice</span>
						<span class="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{{ detailDoc.sales_invoice || "—" }}</span>
					</div>
					<div v-if="detailDoc.complaint_summary" class="sm:col-span-2 pt-2">
						<span class="block text-xs font-semibold uppercase tracking-wide text-slate-500">Complaint</span>
						<p class="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{{ detailDoc.complaint_summary }}</p>
					</div>
				</div>
			</div>

			<div class="portal-card">
				<div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
					<h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Mechanic line items</h2>
					<div class="flex flex-wrap gap-2">
						<Button size="small" severity="secondary" outlined @click="addServiceLine">+ Service</Button>
						<Button size="small" severity="secondary" outlined @click="addPartLine">+ Part</Button>
						<Button size="small" :disabled="lineItemsSaving" @click="saveLineItems">
							{{ lineItemsSaving ? "Saving…" : "Save line items" }}
						</Button>
					</div>
				</div>
				<p v-if="lineItemsError" class="mt-3 text-sm text-red-700 dark:text-red-300">{{ lineItemsError }}</p>
				<div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
					<div class="rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40">
						<h4 class="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-800 dark:text-slate-500">
							Service items ({{ (detailDoc.service_items || []).length }})
						</h4>
						<div class="max-h-72 overflow-auto p-2 text-xs">
							<div
								v-for="(row, idx) in detailDoc.service_items || []"
								:key="'s' + idx"
								class="mb-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900/40"
							>
								<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
									<select v-model="row.item_code" class="portal-input !min-h-9 py-1 text-xs" @change="recalcRowAmount(row)">
										<option value="">Select service item…</option>
										<option v-for="it in itemOptions" :key="'svc-' + it.value" :value="it.value">{{ it.label }}</option>
									</select>
									<div class="flex items-center gap-2">
										<UiInput v-model="row.qty" type="number" min="0" step="0.01" class="!min-h-9 py-1 text-xs" @input="recalcRowAmount(row)" />
										<UiInput v-model="row.rate" type="number" min="0" step="0.01" class="!min-h-9 py-1 text-xs" @input="recalcRowAmount(row)" />
									</div>
								</div>
								<div class="mt-1 flex items-center justify-between">
									<span class="text-slate-500 dark:text-slate-500">Amount: {{ fmtMoney(row.amount) }}</span>
									<Button link size="small" class="!min-h-8 !p-0 !text-red-600" @click="removeServiceLine(idx)">Remove</Button>
								</div>
							</div>
							<p v-if="!(detailDoc.service_items || []).length" class="px-1 py-2 text-slate-600 dark:text-slate-500">No service lines yet.</p>
						</div>
					</div>
					<div class="rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40">
						<h4 class="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-800 dark:text-slate-500">
							Part items ({{ (detailDoc.part_items || []).length }})
						</h4>
						<div class="max-h-72 overflow-auto p-2 text-xs">
							<div
								v-for="(row, idx) in detailDoc.part_items || []"
								:key="'p' + idx"
								class="mb-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900/40"
							>
								<div class="grid grid-cols-1 gap-2">
									<select v-model="row.item_code" class="portal-input !min-h-9 py-1 text-xs" @change="recalcRowAmount(row)">
										<option value="">Select part item…</option>
										<option v-for="it in itemOptions" :key="'prt-' + it.value" :value="it.value">{{ it.label }}</option>
									</select>
									<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
										<UiInput v-model="row.qty" type="number" min="0" step="0.01" class="!min-h-9 py-1 text-xs" @input="recalcRowAmount(row)" />
										<UiInput v-model="row.rate" type="number" min="0" step="0.01" class="!min-h-9 py-1 text-xs" @input="recalcRowAmount(row)" />
										<select v-model="row.warehouse" class="portal-input !min-h-9 py-1 text-xs">
											<option value="">Warehouse (optional)</option>
											<option v-for="w in warehouseOptions" :key="'w-' + w.value" :value="w.value">{{ w.label }}</option>
										</select>
									</div>
								</div>
								<div class="mt-1 flex items-center justify-between">
									<span class="text-slate-500 dark:text-slate-500">Amount: {{ fmtMoney(row.amount) }}</span>
									<Button link size="small" class="!min-h-8 !p-0 !text-red-600" @click="removePartLine(idx)">Remove</Button>
								</div>
							</div>
							<p v-if="!(detailDoc.part_items || []).length" class="px-1 py-2 text-slate-600 dark:text-slate-500">No part lines yet.</p>
						</div>
					</div>
				</div>
			</div>

			<div class="portal-card">
				<h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Workflow</h2>
				<div class="mt-4 flex flex-col gap-2">
					<Button
						v-for="t in workflowTransitions"
						:key="t.action + '-' + (t.next_state || '')"
						severity="secondary"
						outlined
						class="!justify-start"
						:disabled="detailActionLoading"
						@click="runWorkflow(t.action)"
					>
						<span class="text-left font-semibold">{{ workflowActionLabel(t.action) }}</span>
						<span class="ml-1 text-slate-500">→ {{ t.next_state }}</span>
					</Button>
					<p v-if="!workflowTransitions.length" class="text-xs text-slate-600 dark:text-slate-500">
						No actions for your role, or workflow not active. Use Desk to advance status.
					</p>
				</div>
			</div>

			<div class="portal-card">
				<h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Create documents</h2>
				<p class="mt-1 text-xs text-slate-500">Same rules as Desk.</p>
				<div class="mt-4 flex flex-col gap-2">
					<Button v-if="canCreateQuotation" :disabled="detailActionLoading" @click="runCreateQuotation">Create quotation</Button>
					<Button v-if="canCreateSalesInvoice" severity="success" :disabled="detailActionLoading" @click="runCreateSalesInvoice">
						Create sales invoice
					</Button>
				</div>
			</div>

			<div class="portal-card">
				<h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Linked records</h2>
				<div class="mt-4 flex flex-col gap-2">
					<Button
						v-if="detailDoc.appointment"
						as="a"
						:href="deskFormUrl('Service Appointment', detailDoc.appointment)"
						target="_blank"
						rel="noopener noreferrer"
						severity="secondary"
						outlined
						class="portal-pv-desk-link w-full"
						icon="pi pi-external-link"
						label="Appointment in Desk"
					/>
					<Button
						v-if="detailDoc.inspection"
						as="a"
						:href="deskFormUrl('Vehicle Inspection', detailDoc.inspection)"
						target="_blank"
						rel="noopener noreferrer"
						severity="secondary"
						outlined
						class="portal-pv-desk-link w-full"
						icon="pi pi-external-link"
						label="Inspection in Desk"
					/>
					<Button
						v-if="detailDoc.quotation"
						as="a"
						:href="deskFormUrl('Quotation', detailDoc.quotation)"
						target="_blank"
						rel="noopener noreferrer"
						severity="secondary"
						outlined
						class="portal-pv-desk-link w-full"
						icon="pi pi-external-link"
						label="Quotation in Desk"
					/>
					<Button
						v-if="detailDoc.sales_invoice"
						as="a"
						:href="deskFormUrl('Sales Invoice', detailDoc.sales_invoice)"
						target="_blank"
						rel="noopener noreferrer"
						severity="secondary"
						outlined
						class="portal-pv-desk-link w-full"
						icon="pi pi-external-link"
						label="Sales invoice in Desk"
					/>
				</div>
			</div>
		</template>

		<p v-if="detailActionError" class="text-sm text-red-700 dark:text-red-300">{{ detailActionError }}</p>
	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import Button from "primevue/button";
import { restResourceList, restResourceGet, frappeCall } from "../utils/api";
import { deskFormUrl } from "../utils/desk.js";
import WxBreadcrumb from "../components/layout/WxBreadcrumb.vue";
import UiInput from "../components/ui/UiInput.vue";

const route = useRoute();

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

function workflowActionLabel(action) {
	return WORKFLOW_ACTION_LABELS[action] || action;
}

function statusPillClass(status) {
	const s = String(status || "");
	if (s === "Invoiced" || s === "Closed")
		return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
	if (s === "Cancelled") return "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300";
	if (s === "Ready to Invoice" || s === "Approved")
		return "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200";
	if (s === "In Progress") return "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100";
	return "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
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

const detailName = computed(() => (route.params.id ? String(route.params.id) : "").trim());

const breadcrumbItems = computed(() => [
	{ label: "Workshop", to: "/" },
	{ label: "Job cards", to: "/job-cards" },
	{ label: detailName.value || "Detail" },
]);

const detailLoading = ref(false);
const detailError = ref("");
const detailDoc = ref(null);
const detailActionLoading = ref(false);
const detailActionError = ref("");
const workflowTransitions = ref([]);
const lineItemsSaving = ref(false);
const lineItemsError = ref("");
const itemOptions = ref([]);
const warehouseOptions = ref([]);

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

async function loadLineItemReferences() {
	if (itemOptions.value.length && warehouseOptions.value.length) return;
	try {
		const [items, warehouses] = await Promise.all([
			restResourceList("Item", {
				fields: '["name","item_name"]',
				order_by: "modified desc",
				limit_page_length: 300,
			}),
			restResourceList("Warehouse", {
				fields: '["name","warehouse_name"]',
				order_by: "name asc",
				limit_page_length: 300,
				filters: [["is_group", "=", 0]],
			}),
		]);
		itemOptions.value = (items || []).map((it) => ({
			value: it.name,
			label: it.item_name && it.item_name !== it.name ? `${it.item_name} (${it.name})` : it.name,
		}));
		warehouseOptions.value = (warehouses || []).map((w) => ({
			value: w.name,
			label: w.warehouse_name && w.warehouse_name !== w.name ? `${w.warehouse_name} (${w.name})` : w.name,
		}));
	} catch {
		/* optional */
	}
}

async function refreshDetail() {
	if (!detailName.value) return;
	detailLoading.value = true;
	detailError.value = "";
	try {
		detailDoc.value = await restResourceGet("Job Card", detailName.value);
		if (!Array.isArray(detailDoc.value.service_items)) detailDoc.value.service_items = [];
		if (!Array.isArray(detailDoc.value.part_items)) detailDoc.value.part_items = [];
		await loadWorkflowTransitions();
		await loadLineItemReferences();
	} catch (e) {
		detailDoc.value = null;
		detailError.value = e.message || "Failed to load job card";
	} finally {
		detailLoading.value = false;
	}
}

function toNum(v, def = 0) {
	const n = Number(v);
	return Number.isFinite(n) ? n : def;
}

function recalcRowAmount(row) {
	row.qty = toNum(row.qty, 0);
	row.rate = toNum(row.rate, 0);
	row.amount = toNum(row.qty, 0) * toNum(row.rate, 0);
}

function addServiceLine() {
	if (!detailDoc.value) return;
	if (!Array.isArray(detailDoc.value.service_items)) detailDoc.value.service_items = [];
	detailDoc.value.service_items.push({ item_code: "", qty: 1, rate: 0, amount: 0 });
}

function removeServiceLine(idx) {
	if (!detailDoc.value?.service_items) return;
	detailDoc.value.service_items.splice(idx, 1);
}

function addPartLine() {
	if (!detailDoc.value) return;
	if (!Array.isArray(detailDoc.value.part_items)) detailDoc.value.part_items = [];
	detailDoc.value.part_items.push({ item_code: "", qty: 1, rate: 0, amount: 0, warehouse: "" });
}

function removePartLine(idx) {
	if (!detailDoc.value?.part_items) return;
	detailDoc.value.part_items.splice(idx, 1);
}

async function saveLineItems() {
	if (!detailName.value || !detailDoc.value) return;
	lineItemsSaving.value = true;
	lineItemsError.value = "";
	try {
		const service_items = (detailDoc.value.service_items || []).map((r) => ({
			item_code: (r.item_code || "").trim(),
			qty: toNum(r.qty, 0),
			rate: toNum(r.rate, 0),
		}));
		const part_items = (detailDoc.value.part_items || []).map((r) => ({
			item_code: (r.item_code || "").trim(),
			qty: toNum(r.qty, 0),
			rate: toNum(r.rate, 0),
			warehouse: (r.warehouse || "").trim(),
		}));
		await frappeCall("workshop_mgmt.api.job_card_update_line_items", {
			name: detailName.value,
			service_items,
			part_items,
		});
		await refreshDetail();
	} catch (e) {
		lineItemsError.value = e.message || "Could not save line items";
	} finally {
		lineItemsSaving.value = false;
	}
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
	if (!window.confirm("This will create a Sales Invoice and update stock (same as Desk). Continue?")) {
		return;
	}
	detailActionError.value = "";
	detailActionLoading.value = true;
	try {
		const inv = await frappeCall("workshop_mgmt.api.job_card_create_sales_invoice", {
			name: detailName.value,
		});
		await refreshDetail();
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
	() => route.params.id,
	() => {
		detailActionError.value = "";
		lineItemsError.value = "";
		if (detailName.value) {
			refreshDetail();
		} else {
			detailDoc.value = null;
		}
	},
	{ immediate: true }
);

onMounted(() => {
	if (detailName.value) refreshDetail();
});
</script>
