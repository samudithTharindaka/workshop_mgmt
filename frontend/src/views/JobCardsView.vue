<template>
	<div class="mx-auto max-w-7xl space-y-8">
		<WxBreadcrumb :items="breadcrumbItems" />

		<div>
			<h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Job cards</h2>
			<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
				Select a row to open the full workshop job card page. Desk remains available for edge cases.
			</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="portal-card">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total loaded</p>
				<p class="mt-2 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">{{ stats.total }}</p>
				<p class="mt-1 text-xs text-slate-500">Up to 100 most recently modified</p>
			</div>
			<div class="portal-card">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">In progress</p>
				<p class="mt-2 text-2xl font-semibold tabular-nums text-sky-700 dark:text-sky-300">{{ stats.inProgress }}</p>
				<p class="mt-1 text-xs text-slate-500">On the floor now</p>
			</div>
			<div class="portal-card">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ready to invoice</p>
				<p class="mt-2 text-2xl font-semibold tabular-nums text-amber-800 dark:text-amber-200">{{ stats.readyToInvoice }}</p>
				<p class="mt-1 text-xs text-slate-500">Billing queue</p>
			</div>
			<div class="portal-card">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Active pipeline</p>
				<p class="mt-2 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">{{ stats.activePipeline }}</p>
				<p class="mt-1 text-xs text-slate-500">Draft through in progress</p>
			</div>
		</div>

		<p v-if="listError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
			{{ listError }}
		</p>

		<div class="portal-filter-bar flex flex-col gap-5 xl:flex-row xl:flex-wrap xl:items-end">
			<div class="min-w-0 flex-1 xl:min-w-[18rem]">
				<label class="portal-label" for="jc-filter-search">Search</label>
				<UiInput
					id="jc-filter-search"
					v-model="docSearch"
					type="search"
					placeholder="ID, customer, vehicle, appointment…"
					autocomplete="off"
				/>
			</div>
			<div class="w-full sm:max-w-[14rem]">
				<label class="portal-label" for="jc-filter-status">Status</label>
				<UiSelect id="jc-filter-status" v-model="filterStatus" :options="statusOptions" placeholder="All statuses" />
			</div>
			<div class="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4 dark:border-slate-700 xl:border-0 xl:pt-0">
				<span class="mr-1 self-center text-xs font-medium text-slate-500 dark:text-slate-400">View</span>
				<SelectButton v-model="viewMode" :options="viewModeOptions" option-label="label" option-value="value" aria-labelledby="jc-view-label" />
				<span id="jc-view-label" class="sr-only">Table or kanban</span>
			</div>
			<UiButton type="button" variant="secondary" class="shrink-0" @click="clearListFilters">Clear filters</UiButton>
		</div>

		<div v-if="viewMode === 'table'" class="portal-table-wrap">
			<DataTable
				v-model:selection="selectedRows"
				v-model:rows="tableRows"
				v-model:first="tableFirst"
				:value="filteredRows"
				data-key="name"
				:loading="loading"
				:pt="{ pcPaginator: dataTablePaginatorPt }"
				paginator
				:rows-per-page-options="[5, 10, 20, 50]"
				paginator-template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
				current-page-report-template="{first} to {last} of {totalRecords}"
				:always-show-paginator="true"
				table-class="portal-table"
				table-style="min-width: 50rem"
				@row-click="onRowClick($event)"
			>
				<template #paginatorstart>
					<Button type="button" icon="pi pi-refresh" text aria-label="Refresh list" @click="loadList" />
				</template>
				<template #paginatorend>
					<Button type="button" icon="pi pi-download" text aria-label="Download CSV" @click="downloadJobCardsCsv" />
				</template>
				<template #empty>
					{{ allRows.length ? "No matches — adjust filters" : "No job cards" }}
				</template>
				<Column header-style="min-width: 14rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-user" aria-hidden="true" />
							<span>Customer</span>
						</div>
					</template>
					<template #body="{ data }">
						<div class="flex min-w-0 items-center gap-3">
							<img
								v-if="customerAvatarSrc(data.customer)"
								:src="customerAvatarSrc(data.customer)"
								:alt="''"
								class="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover dark:border-slate-600"
								loading="lazy"
							/>
							<div
								v-else
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
								aria-hidden="true"
							>
								{{ customerInitials(data.customer) }}
							</div>
							<span class="min-w-0 truncate font-medium text-slate-800 dark:text-slate-100">{{ customerDisplayName(data.customer) }}</span>
						</div>
					</template>
				</Column>
				<Column field="vehicle" header-style="min-width: 10rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-car" aria-hidden="true" />
							<span>Vehicle</span>
						</div>
					</template>
					<template #body="{ data }">
						<span class="text-slate-600 dark:text-slate-400">{{ data.vehicle || "—" }}</span>
					</template>
				</Column>
				<Column field="status" header-style="min-width: 10rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-verified" aria-hidden="true" />
							<span>Status</span>
						</div>
					</template>
					<template #body="{ data }">
						<span class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium" :class="statusPillClass(data.status)">
							{{ data.status }}
						</span>
					</template>
				</Column>
				<Column field="appointment" header-style="min-width: 10rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-calendar" aria-hidden="true" />
							<span>Appointment</span>
						</div>
					</template>
					<template #body="{ data }">
						<span class="font-mono text-xs text-slate-600 dark:text-slate-500">{{ data.appointment || "—" }}</span>
					</template>
				</Column>
				<Column header-style="min-width: 15rem; width: 18rem" body-style="min-width: 15rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-bolt" aria-hidden="true" />
							<span>Actions</span>
						</div>
					</template>
					<template #body="{ data }">
						<div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-stretch">
							<Button
								as="a"
								:href="deskFormUrl('Job Card', data.name)"
								target="_blank"
								rel="noopener noreferrer"
								severity="secondary"
								outlined
								size="small"
								class="portal-pv-desk-link !shrink-0"
								icon="pi pi-external-link"
								label="Open in Desk"
								@click.stop
							/>
							<Button
								size="small"
								severity="primary"
								class="!shrink-0 !whitespace-nowrap"
								label="Open in workshop"
								icon="pi pi-wrench"
								@click.stop="openJobCard(data.name)"
							/>
						</div>
					</template>
				</Column>
			</DataTable>
		</div>

		<div v-else-if="viewMode === 'kanban'" class="space-y-3">
			<p v-if="kanbanMoveError" class="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-900 dark:text-amber-100">
				{{ kanbanMoveError }}
			</p>
			<div class="overflow-x-auto pb-2">
				<div v-if="loading" class="py-16 text-center text-sm text-slate-600 dark:text-slate-500">Loading…</div>
				<div v-else-if="!allRows.length" class="py-16 text-center text-sm text-slate-600 dark:text-slate-500">No job cards</div>
				<template v-else>
					<p v-if="!filteredRows.length" class="mb-2 text-center text-sm text-slate-600 dark:text-slate-500">
						No cards match your filters — all status columns are shown empty.
					</p>
					<p class="mb-2 text-center text-xs text-slate-600 dark:text-slate-500">
						Drag a card onto another column to change status (same rules as Desk workflow).
					</p>
					<div class="flex min-h-[18rem] gap-4" style="min-width: min-content">
						<div
							v-for="col in kanbanColumns"
							:key="col.key"
							class="flex w-[min(100vw-2rem,17rem)] shrink-0 flex-col rounded-xl border bg-slate-100/80 dark:bg-slate-900/40 transition-colors"
							:class="
								kanbanDragOverKey === col.key
									? 'border-blue-500/60 ring-2 ring-blue-400/40 dark:ring-blue-500/30'
									: 'border-slate-200 dark:border-slate-800'
							"
							@dragover.prevent="onKanbanColumnDragOver(col.key, $event)"
							@dragleave="onKanbanColumnDragLeave(col.key, $event)"
							@drop.prevent="onKanbanColumnDrop(col.key, $event)"
						>
							<div class="border-b border-slate-200 dark:border-slate-800 px-3 py-2">
								<p class="text-xs font-semibold text-slate-600 dark:text-slate-400">{{ col.label }}</p>
								<p class="text-xs text-slate-600 dark:text-slate-500">{{ col.items.length }} card(s)</p>
							</div>
							<div class="flex max-h-[calc(100vh-14rem)] min-h-[6rem] flex-1 flex-col gap-2 overflow-y-auto p-2">
								<div
									v-for="r in col.items"
									:key="r.name"
									draggable="true"
									class="w-full cursor-grab rounded-lg border border-slate-300/90 dark:border-slate-700/90 bg-white/95 dark:bg-slate-950/80 p-3 text-left shadow-sm transition hover:border-blue-500/40 hover:bg-slate-200 dark:hover:bg-slate-800/60 active:cursor-grabbing"
									:class="{ 'opacity-50': kanbanSavingName === r.name }"
									@dragstart="onKanbanCardDragStart(r, $event)"
									@dragend="onKanbanCardDragEnd"
									@click="openJobCard(r.name)"
								>
									<p class="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">{{ r.name }}</p>
									<p class="mt-1 truncate text-xs text-slate-700 dark:text-slate-300">{{ customerDisplayName(r.customer) || "—" }}</p>
									<p class="truncate text-xs text-slate-600 dark:text-slate-500">{{ r.vehicle || "—" }}</p>
									<p v-if="r.appointment" class="mt-1 truncate font-mono text-xs text-slate-600 dark:text-slate-500">{{ r.appointment }}</p>
								</div>
								<p v-if="!col.items.length" class="py-6 text-center text-xs text-slate-600 dark:text-slate-500">Drop cards here</p>
							</div>
						</div>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { restResourceList, frappeCall } from "../utils/api";
import { deskFormUrl } from "../utils/desk.js";
import { downloadCsv } from "../utils/csv.js";
import { dataTablePaginatorPt } from "../utils/dataTablePaginatorPt.js";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import WxBreadcrumb from "../components/layout/WxBreadcrumb.vue";
import UiButton from "../components/ui/UiButton.vue";
import UiInput from "../components/ui/UiInput.vue";
import UiSelect from "../components/ui/UiSelect.vue";
import { useCustomerMeta } from "../composables/useCustomerMeta.js";

const { customerDisplayName, customerAvatarSrc, customerInitials, enrichCustomersForRows } = useCustomerMeta();

const route = useRoute();
const router = useRouter();

const docSearch = inject("wxDocSearch", ref(""));

const breadcrumbItems = [
	{ label: "Workshop", to: "/" },
	{ label: "Job cards" },
];

const viewModeOptions = [
	{ label: "Table", value: "table" },
	{ label: "Kanban", value: "kanban" },
];

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

const JOB_CARD_STATUS_OPTIONS = [
	"Draft",
	"Checked In",
	"Inspected",
	"Estimated",
	"Approved",
	"In Progress",
	"Ready to Invoice",
	"Invoiced",
	"Closed",
	"Cancelled",
];
const JOB_CARD_KANBAN_ORDER = [...JOB_CARD_STATUS_OPTIONS];
const statusOptions = computed(() => [
	{ label: "All statuses", value: "" },
	...JOB_CARD_STATUS_OPTIONS.map((s) => ({ label: s, value: s })),
]);
const selectedRows = ref([]);

const loading = ref(true);
const listError = ref("");
const allRows = ref([]);
const filterStatus = ref("");
const viewMode = ref("table");

const tableRows = ref(5);
const tableFirst = ref(0);

const kanbanDragOverKey = ref("");
const kanbanMoveError = ref("");
const kanbanSavingName = ref("");

const filteredRows = computed(() => {
	let list = allRows.value || [];
	const st = filterStatus.value;
	if (st) list = list.filter((r) => (r.status || "") === st);
	const q = (docSearch.value && String(docSearch.value).trim().toLowerCase()) || "";
	if (!q) return list;
	return list.filter((r) => {
		const blob = [r.name, r.customer, r.vehicle, r.status, r.appointment, r.posting_date]
			.map((x) => String(x ?? "").toLowerCase())
			.join(" ");
		return blob.includes(q);
	});
});

const stats = computed(() => {
	const list = allRows.value || [];
	const byStatus = (s) => list.filter((r) => (r.status || "") === s).length;
	const active = [
		"Draft",
		"Checked In",
		"Inspected",
		"Estimated",
		"Approved",
		"In Progress",
	].reduce((acc, s) => acc + byStatus(s), 0);
	return {
		total: list.length,
		inProgress: byStatus("In Progress"),
		readyToInvoice: byStatus("Ready to Invoice"),
		activePipeline: active,
	};
});

watch([filterStatus, docSearch], () => {
	tableFirst.value = 0;
});

function normalizeKanbanStatus(status) {
	return (status && String(status).trim()) || "Draft";
}

const kanbanColumns = computed(() => {
	const rowsList = filteredRows.value;
	const buckets = {};
	for (const r of rowsList) {
		const s = normalizeKanbanStatus(r.status);
		if (!buckets[s]) buckets[s] = [];
		buckets[s].push(r);
	}
	const fixed = JOB_CARD_KANBAN_ORDER.map((s) => ({
		key: s,
		label: s,
		items: buckets[s] || [],
	}));
	const extra = [];
	for (const s of Object.keys(buckets)) {
		if (!JOB_CARD_KANBAN_ORDER.includes(s)) {
			extra.push({ key: s, label: s, items: buckets[s] });
		}
	}
	return [...fixed, ...extra];
});

function onKanbanCardDragStart(row, event) {
	kanbanMoveError.value = "";
	event.dataTransfer.setData("application/json", JSON.stringify({ name: row.name }));
	event.dataTransfer.effectAllowed = "move";
	try {
		event.dataTransfer.setData("text/plain", row.name);
	} catch {
		/* ignore */
	}
}

function onKanbanCardDragEnd() {
	kanbanDragOverKey.value = "";
}

function onKanbanColumnDragOver(columnKey, event) {
	event.dataTransfer.dropEffect = "move";
	kanbanDragOverKey.value = columnKey;
}

function onKanbanColumnDragLeave(columnKey, event) {
	const next = event.relatedTarget;
	if (next && event.currentTarget.contains(next)) return;
	if (kanbanDragOverKey.value === columnKey) kanbanDragOverKey.value = "";
}

function onKanbanColumnDrop(columnKey, event) {
	kanbanDragOverKey.value = "";
	let raw = event.dataTransfer.getData("application/json");
	if (!raw) raw = event.dataTransfer.getData("text/plain");
	let jobName = "";
	try {
		const parsed = JSON.parse(raw || "{}");
		jobName = typeof parsed?.name === "string" ? parsed.name : "";
	} catch {
		jobName = (raw || "").trim();
	}
	if (!jobName) return;
	moveJobCardToStatus(jobName, columnKey);
}

async function moveJobCardToStatus(jobName, targetStatus) {
	const row = allRows.value.find((r) => r.name === jobName);
	if (!row) return;
	if (normalizeKanbanStatus(row.status) === targetStatus) return;

	kanbanSavingName.value = jobName;
	kanbanMoveError.value = "";
	try {
		await frappeCall("workshop_mgmt.api.job_card_set_status", {
			name: jobName,
			status: targetStatus,
		});
		await loadList();
	} catch (e) {
		kanbanMoveError.value = e.message || "Could not update status";
	} finally {
		kanbanSavingName.value = "";
	}
}

function clearListFilters() {
	docSearch.value = "";
	filterStatus.value = "";
}

const LIST_FIELDS =
	'["name","customer","vehicle","status","appointment","posting_date","modified"]';

async function loadList() {
	loading.value = true;
	listError.value = "";
	try {
		allRows.value = await restResourceList("Job Card", {
			fields: LIST_FIELDS,
			order_by: "modified desc",
			limit_page_length: 100,
		});
		await enrichCustomersForRows(allRows.value);
	} catch (e) {
		listError.value = e.message || "Failed to load list";
	} finally {
		loading.value = false;
	}
}

function downloadJobCardsCsv() {
	const list = filteredRows.value || [];
	const headers = ["ID", "Customer", "Vehicle", "Status", "Appointment"];
	const rows = list.map((r) => [
		r.name,
		r.customer || "",
		r.vehicle || "",
		r.status || "",
		r.appointment || "",
	]);
	downloadCsv(`job-cards-${Date.now()}.csv`, headers, rows);
}

function openJobCard(name) {
	if (!name) return;
	router.push({ name: "job-card-detail", params: { id: name } });
}

function onRowClick(event) {
	const name = event?.data?.name;
	if (name) openJobCard(name);
}

watch(
	() => route.query.open,
	(id) => {
		if (typeof id === "string" && id) {
			router.replace({ path: route.path, query: {} });
			openJobCard(id);
		}
	},
	{ immediate: true }
);

onMounted(loadList);
</script>
