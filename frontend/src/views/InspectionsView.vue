<template>
	<div class="mx-auto max-w-7xl space-y-8">
		<WxBreadcrumb :items="breadcrumbItems" />

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="portal-card">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total loaded</p>
				<p class="mt-2 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">{{ stats.total }}</p>
			</div>
			<div class="portal-card">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Linked to job card</p>
				<p class="mt-2 text-2xl font-semibold tabular-nums text-emerald-800 dark:text-emerald-200">{{ stats.withJobCard }}</p>
			</div>
			<div class="portal-card">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Awaiting job card</p>
				<p class="mt-2 text-2xl font-semibold tabular-nums text-amber-800 dark:text-amber-200">{{ stats.withoutJobCard }}</p>
			</div>
			<div class="portal-card">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">This week</p>
				<p class="mt-2 text-2xl font-semibold tabular-nums text-sky-800 dark:text-sky-200">{{ stats.thisWeek }}</p>
				<p class="mt-1 text-xs text-slate-500">By inspection date</p>
			</div>
		</div>

		<div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
			<div>
				<h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Vehicle inspections</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Load the standard checklist, set status and notes per line, save. Create job card when ready (lines added in Desk).
				</p>
			</div>
			<UiButton type="button" class="shrink-0" @click="openNewModal">
				<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
				</svg>
				New inspection
			</UiButton>
		</div>

		<p v-if="listError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
			{{ listError }}
		</p>
		<div class="portal-filter-bar flex flex-col gap-5 xl:flex-row xl:flex-wrap xl:items-end">
			<div class="min-w-0 flex-1 xl:min-w-[18rem]">
				<label class="portal-label" for="ins-filter-search">Search</label>
				<UiInput
					id="ins-filter-search"
					v-model="docSearch"
					type="search"
					placeholder="ID, appointment, customer, vehicle…"
					autocomplete="off"
				/>
			</div>
			<div class="w-full sm:max-w-[11rem]">
				<label class="portal-label" for="ins-filter-jc">Job card</label>
				<UiSelect id="ins-filter-jc" v-model="filterJobCard" :options="jobCardFilterOptions" placeholder="All" />
			</div>
			<div class="w-full sm:max-w-[11rem]">
				<label class="portal-label" for="ins-filter-from">From date</label>
				<UiInput id="ins-filter-from" v-model="filterDateFrom" type="date" />
			</div>
			<div class="w-full sm:max-w-[11rem]">
				<label class="portal-label" for="ins-filter-to">To date</label>
				<UiInput id="ins-filter-to" v-model="filterDateTo" type="date" />
			</div>
			<UiButton type="button" variant="secondary" class="shrink-0" @click="clearListFilters">Clear filters</UiButton>
		</div>

		<div class="portal-table-wrap">
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
				@row-click="openEditor($event.data.name)"
			>
				<template #paginatorstart>
					<Button type="button" icon="pi pi-refresh" text aria-label="Refresh list" @click="loadList" />
				</template>
				<template #paginatorend>
					<Button type="button" icon="pi pi-download" text aria-label="Download CSV" @click="downloadInspectionsCsv" />
				</template>
				<template #empty>
					{{ allRows.length ? "No matches — adjust filters" : "No inspections" }}
				</template>
				<Column selection-mode="multiple" header-style="width: 3rem" />
				<Column field="name" header="ID">
					<template #body="{ data }">
						<span class="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">{{ data.name }}</span>
					</template>
				</Column>
				<Column field="appointment" header="Appointment">
					<template #body="{ data }">
						<span class="font-mono text-xs text-slate-600 dark:text-slate-500">{{ data.appointment || "—" }}</span>
					</template>
				</Column>
				<Column field="customer" header="Customer">
					<template #body="{ data }">
						<span class="text-slate-800 dark:text-slate-200">{{ data.customer || "—" }}</span>
					</template>
				</Column>
				<Column field="vehicle" header="Vehicle">
					<template #body="{ data }">
						<span class="text-slate-600 dark:text-slate-400">{{ data.vehicle || "—" }}</span>
					</template>
				</Column>
				<Column field="inspection_date" header="Date">
					<template #body="{ data }">
						<span class="tabular-nums text-slate-600 dark:text-slate-400">{{ data.inspection_date || "—" }}</span>
					</template>
				</Column>
				<Column field="job_card" header="Job card">
					<template #body="{ data }">
						<span class="font-mono text-xs text-slate-600 dark:text-slate-500">{{ data.job_card || "—" }}</span>
					</template>
				</Column>
				<Column header="Actions" header-style="min-width: 14rem; width: 18rem" body-style="min-width: 14rem">
					<template #body="{ data }">
						<div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-stretch">
							<Button
								as="a"
								:href="deskFormUrl('Vehicle Inspection', data.name)"
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
								v-if="data.job_card"
								size="small"
								severity="help"
								class="!shrink-0 !whitespace-nowrap"
								label="Job card"
								icon="pi pi-wrench"
								@click.stop="goJobCard(data.job_card)"
							/>
						</div>
					</template>
				</Column>
			</DataTable>
		</div>

		<Teleport to="body">
			<Transition
				enter-active-class="transition-opacity duration-200 ease-out"
				leave-active-class="transition-opacity duration-150 ease-in"
				enter-from-class="opacity-0"
				leave-to-class="opacity-0"
			>
				<div
					v-if="editorOpen"
					class="fixed inset-0 z-[55] flex justify-end bg-black/50 backdrop-blur-sm"
					role="presentation"
				>
					<div class="min-w-0 flex-1" @click="closeEditor" />
					<aside
						class="portal-drawer-panel-xl portal-drawer-animate max-h-screen shrink-0 overflow-hidden"
						role="dialog"
						aria-modal="true"
						@click.stop
					>
					<div class="flex max-h-screen min-h-0 flex-col">
					<div class="sticky top-0 z-20 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-slate-100/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur-sm">
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div class="min-w-0">
								<h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Inspection</h3>
								<p class="mt-0.5 font-mono text-sm text-blue-600 dark:text-blue-400">{{ editName }}</p>
								<Button
									v-if="editName"
									as="a"
									:href="deskFormUrl('Vehicle Inspection', editName)"
									target="_blank"
									rel="noopener noreferrer"
									class="portal-pv-desk-link mt-2"
									severity="secondary"
									outlined
									size="small"
									icon="pi pi-external-link"
									label="Open in Desk"
								/>
							</div>
							<div class="flex flex-wrap gap-2">
								<button
									type="button"
									class="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
									:disabled="editorLoading || saveLoading"
									@click="loadStandardChecklist"
								>
									Load standard checklist
								</button>
								<button
									type="button"
									class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
									:disabled="editorLoading || saveLoading || !editDoc"
									@click="saveInspection"
								>
									{{ saveLoading ? "Saving…" : "Save" }}
								</button>
								<button
									type="button"
									class="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
									@click="closeEditor"
								>
									Close
								</button>
							</div>
						</div>
					</div>

					<div class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
					<div v-if="editorLoading" class="py-16 text-center text-sm text-slate-600 dark:text-slate-500">Loading…</div>
					<div v-else-if="editDoc" class="space-y-6">
						<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
							<div>
								<label class="portal-label">Appointment</label>
								<input
									:value="editDoc.appointment || ''"
									disabled
									class="portal-input opacity-80"
								/>
							</div>
							<div>
								<label class="portal-label">Customer</label>
								<input
									:value="editDoc.customer || ''"
									disabled
									class="portal-input opacity-80"
								/>
							</div>
							<div>
								<label class="portal-label">Vehicle</label>
								<input
									:value="editDoc.vehicle || ''"
									disabled
									class="portal-input opacity-80"
								/>
							</div>
							<div>
								<label class="portal-label">Inspection date</label>
								<input
									v-model="editDoc.inspection_date"
									type="date"
									class="portal-input"
								/>
							</div>
							<div class="sm:col-span-2">
								<label class="portal-label">Inspector (optional)</label>
								<input
									v-model="editDoc.inspector"
									class="portal-input"
									placeholder="User ID"
								/>
							</div>
							<div class="flex flex-wrap items-end gap-x-2 gap-y-1 sm:col-span-2">
								<a
									v-if="editDoc.appointment"
									:href="deskFormUrl('Service Appointment', editDoc.appointment)"
									target="_blank"
									class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
									>Appointment</a
								>
								<template v-if="editDoc.job_card">
									<span v-if="editDoc.appointment" class="text-slate-600 dark:text-slate-500">·</span>
									<a
										:href="deskFormUrl('Job Card', editDoc.job_card)"
										target="_blank"
										class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
										>Job card (Desk)</a
									>
									<button
										type="button"
										class="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
										@click="goJobCardFromEditor(editDoc.job_card)"
									>
										Job card (workshop)
									</button>
								</template>
							</div>
						</div>

						<div
							v-if="editDoc.name && !editDoc.job_card"
							class="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4"
						>
							<button
								type="button"
								class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500"
								@click="openJobCardFromInspection"
							>
								Create job card
							</button>
							<span class="text-xs text-slate-600 dark:text-slate-500">Company and warehouse in Desk. Add lines on the job card in Desk.</span>
						</div>

						<div class="portal-table-wrap overflow-hidden">
							<div class="max-h-[50vh] overflow-auto">
								<table class="portal-table min-w-[520px] text-xs">
									<thead>
										<tr>
											<th class="w-40">Section</th>
											<th class="min-w-[140px]">Check item</th>
											<th class="min-w-[9rem]">Status</th>
											<th class="min-w-[180px]">Notes</th>
											<th class="w-20"></th>
										</tr>
									</thead>
									<tbody>
										<tr v-for="(row, idx) in editDoc.inspection_items || []" :key="row.name || 'n-' + idx">
											<td class="align-top">
												<select
													v-model="row.section"
													class="portal-input py-2 text-xs"
												>
													<option v-for="s in SECTION_OPTIONS" :key="s" :value="s">{{ s }}</option>
												</select>
											</td>
											<td class="align-top">
												<input
													v-model="row.check_item"
													class="portal-input py-2 text-xs"
													placeholder="Check item"
												/>
											</td>
											<td class="align-top">
												<div class="mb-2 flex gap-2">
													<button
														type="button"
														class="flex-1 rounded-lg border border-emerald-800/80 bg-emerald-950/40 px-2 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition hover:bg-emerald-900/50"
														title="Mark OK"
														@click="row.status = STATUS_QUICK_OK"
													>
														OK
													</button>
													<button
														type="button"
														class="flex-1 rounded-lg border border-amber-800/80 bg-amber-950/40 px-2 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-900/50"
														title="Needs attention"
														@click="row.status = STATUS_QUICK_REPORT"
													>
														Report
													</button>
												</div>
												<select
													v-model="row.status"
													class="portal-input py-2 text-xs"
												>
													<option v-for="st in STATUS_OPTIONS" :key="st" :value="st">{{ st }}</option>
												</select>
											</td>
											<td class="align-top">
												<textarea
													v-model="row.notes"
													rows="2"
													class="portal-input resize-y text-xs"
												/>
											</td>
											<td class="align-top">
												<button
													type="button"
													class="text-xs font-medium text-red-400 hover:text-red-700 dark:text-red-300"
													@click="removeLine(idx)"
												>
													Remove
												</button>
											</td>
										</tr>
										<tr v-if="!(editDoc.inspection_items || []).length">
											<td colspan="5" class="py-10 text-center text-slate-600 dark:text-slate-500">
												No lines — use “Load standard checklist” or add rows in Desk.
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						<button
							type="button"
							class="text-sm font-semibold text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300"
							@click="addBlankLine"
						>
							+ Add blank line
						</button>
					</div>
					<p v-else-if="editorError" class="text-sm text-red-400">{{ editorError }}</p>

					<p v-if="editorBanner" class="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
						{{ editorBanner }}
					</p>
					</div>
					</div>
					</aside>
				</div>
			</Transition>
		</Teleport>

		<Teleport to="body">
			<div
				v-if="newOpen"
				class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
				@click.self="newOpen = false"
			>
				<div class="portal-modal-panel" role="dialog" aria-modal="true">
					<h4 class="text-lg font-semibold text-slate-900 dark:text-slate-100">New inspection</h4>
					<p class="mt-2 text-sm text-slate-600 dark:text-slate-500">Choose a checked-in appointment without an inspection yet.</p>
					<select v-model="newAppointment" class="portal-input mt-6" :disabled="newLoading">
						<option value="">{{ newLoading ? "Loading…" : "Select appointment…" }}</option>
						<option v-for="a in newAppointmentChoices" :key="a.name" :value="a.name">
							{{ a.name }} — {{ a.customer }} ({{ a.vehicle }})
						</option>
					</select>
					<p v-if="newError" class="mt-4 text-sm text-red-400">{{ newError }}</p>
					<div class="mt-8 flex justify-end gap-3 border-t border-slate-200/90 dark:border-slate-800/80 pt-6">
						<button
							type="button"
							class="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
							@click="newOpen = false"
						>
							Cancel
						</button>
						<button
							type="button"
							class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
							:disabled="newSaving || !newAppointment"
							@click="submitNewInspection"
						>
							{{ newSaving ? "Creating…" : "Create" }}
						</button>
					</div>
				</div>
			</div>
		</Teleport>

		<Teleport to="body">
			<div
				v-if="jcOpen"
				class="fixed inset-0 z-[65] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
				@click.self="jcOpen = false"
			>
				<div class="portal-modal-panel" role="dialog" aria-modal="true">
					<h4 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Create job card</h4>
					<p class="mt-2 text-sm text-slate-600 dark:text-slate-500">
						Company and warehouse (same as Desk). Service and part lines are added on the job card.
					</p>
					<div class="mt-6 space-y-4">
						<div>
							<label class="portal-label">Company</label>
							<select
								v-model="jcCompany"
								class="portal-input"
								:disabled="jcMetaLoading"
								@change="onJCCompanyChange"
							>
								<option value="">{{ jcMetaLoading ? "Loading…" : "Select company…" }}</option>
								<option v-for="c in jcCompanies" :key="c.name" :value="c.name">{{ c.name }}</option>
							</select>
						</div>
						<div>
							<label class="portal-label">Warehouse</label>
							<select
								v-model="jcWarehouse"
								class="portal-input"
								:disabled="!jcCompany || jcWarehousesLoading"
							>
								<option value="">{{ jcWarehousePlaceholder }}</option>
								<option v-for="w in jcWarehouses" :key="w.name" :value="w.name">
									{{ w.warehouse_name && w.warehouse_name !== w.name ? `${w.warehouse_name} (${w.name})` : w.name }}
								</option>
							</select>
						</div>
					</div>
					<p v-if="jcError" class="mt-4 text-sm text-red-400">{{ jcError }}</p>
					<div class="mt-8 flex justify-end gap-3 border-t border-slate-200/90 dark:border-slate-800/80 pt-6">
						<button
							type="button"
							class="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
							@click="jcOpen = false"
						>
							Cancel
						</button>
						<button
							type="button"
							class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
							:disabled="jcSubmitting || !jcCompany || !jcWarehouse"
							@click="submitJobCardFromInspection"
						>
							{{ jcSubmitting ? "Creating…" : "Create" }}
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
	restResourceList,
	restResourceGet,
	restResourcePut,
	frappeCall,
} from "../utils/api";
import { deskFormUrl } from "../utils/desk.js";
import { downloadCsv } from "../utils/csv.js";
import { dataTablePaginatorPt } from "../utils/dataTablePaginatorPt.js";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import WxBreadcrumb from "../components/layout/WxBreadcrumb.vue";
import UiButton from "../components/ui/UiButton.vue";
import UiInput from "../components/ui/UiInput.vue";
import UiSelect from "../components/ui/UiSelect.vue";

const STATUS_OPTIONS = ["OK", "Good", "Fair", "Worn", "Needs Attention", "Critical", "N/A"];
/** Quick buttons in the inspection grid */
const STATUS_QUICK_OK = "OK";
const STATUS_QUICK_REPORT = "Needs Attention";
const SECTION_OPTIONS = [
	"Engine & Fluids",
	"Braking System",
	"Tires & Wheels",
	"Battery & Electrical",
	"Suspension & Steering",
	"Exterior & Interior",
];

const route = useRoute();
const router = useRouter();

const breadcrumbItems = [
	{ label: "Workshop", to: "/" },
	{ label: "Inspections" },
];

const docSearch = inject("wxDocSearch", ref(""));
const jobCardFilterOptions = [
	{ label: "All", value: "" },
	{ label: "Linked", value: "yes" },
	{ label: "Not linked", value: "no" },
];
const selectedRows = ref([]);
const tableRows = ref(5);
const tableFirst = ref(0);

const INSPECTION_LIST_FIELDS =
	'["name","appointment","customer","vehicle","inspection_date","job_card","modified"]';

const loading = ref(true);
const listError = ref("");
const allRows = ref([]);
const filterJobCard = ref("");
const filterDateFrom = ref("");
const filterDateTo = ref("");

const filteredRows = computed(() => {
	let list = allRows.value || [];
	const q = (docSearch.value && String(docSearch.value).trim().toLowerCase()) || "";
	if (q) {
		list = list.filter((r) => {
			const blob = [r.name, r.appointment, r.customer, r.vehicle, r.inspection_date, r.job_card]
				.map((x) => String(x ?? "").toLowerCase())
				.join(" ");
			return blob.includes(q);
		});
	}
	const jc = filterJobCard.value;
	if (jc === "yes") list = list.filter((r) => !!(r.job_card && String(r.job_card).trim()));
	if (jc === "no") list = list.filter((r) => !(r.job_card && String(r.job_card).trim()));
	const from = filterDateFrom.value;
	const to = filterDateTo.value;
	if (from) {
		list = list.filter((r) => {
			const d = (r.inspection_date && String(r.inspection_date).slice(0, 10)) || "";
			return d >= from;
		});
	}
	if (to) {
		list = list.filter((r) => {
			const d = (r.inspection_date && String(r.inspection_date).slice(0, 10)) || "";
			return d && d <= to;
		});
	}
	return list;
});

const stats = computed(() => {
	const list = allRows.value || [];
	const withJc = list.filter((r) => r.job_card && String(r.job_card).trim()).length;
	const now = new Date();
	const weekAgo = new Date(now.getTime() - 7 * 86400000);
	const thisWeek = list.filter((r) => {
		const raw = r.inspection_date && String(r.inspection_date).slice(0, 10);
		if (!raw) return false;
		const d = new Date(raw + "T12:00:00");
		return !Number.isNaN(d.getTime()) && d >= weekAgo;
	}).length;
	return {
		total: list.length,
		withJobCard: withJc,
		withoutJobCard: list.length - withJc,
		thisWeek,
	};
});

watch([docSearch, filterJobCard, filterDateFrom, filterDateTo], () => {
	tableFirst.value = 0;
});

function clearListFilters() {
	docSearch.value = "";
	filterJobCard.value = "";
	filterDateFrom.value = "";
	filterDateTo.value = "";
}


const editorOpen = ref(false);
const editorLoading = ref(false);
const editorError = ref("");
const editorBanner = ref("");
const editDoc = ref(null);
const editName = ref("");
const saveLoading = ref(false);

const newOpen = ref(false);
const newLoading = ref(false);
const newSaving = ref(false);
const newError = ref("");
const newAppointment = ref("");
const newAppointmentChoices = ref([]);

const jcOpen = ref(false);
const jcMetaLoading = ref(false);
const jcWarehousesLoading = ref(false);
const jcSubmitting = ref(false);
const jcError = ref("");
const jcCompanies = ref([]);
const jcWarehouses = ref([]);
const jcCompany = ref("");
const jcWarehouse = ref("");

const jcWarehousePlaceholder = computed(() => {
	if (!jcCompany.value) return "Select company first…";
	if (jcWarehousesLoading.value) return "Loading warehouses…";
	return "Select warehouse…";
});

function goJobCard(name) {
	if (!name) return;
	router.push({ name: "job-card-detail", params: { id: String(name) } });
}

function goJobCardFromEditor(name) {
	closeEditor();
	goJobCard(name);
}

function stripForPut(doc) {
	const out = JSON.parse(JSON.stringify(doc));
	delete out.estimated_total;
	delete out.attachments;
	for (const k of Object.keys(out)) {
		if (k.startsWith("__")) delete out[k];
	}
	const items = out.inspection_items || [];
	out.inspection_items = items.map((row, i) => {
		const r = {
			doctype: "Inspection Item",
			parent: doc.name,
			parenttype: "Vehicle Inspection",
			parentfield: "inspection_items",
			idx: row.idx != null ? row.idx : i + 1,
			section: row.section,
			check_item: row.check_item,
			status: row.status || "N/A",
			notes: row.notes || "",
			recommended_service: "",
			estimated_price: 0,
		};
		if (row.name) r.name = row.name;
		if (row.photo) r.photo = row.photo;
		return r;
	});
	return out;
}

async function loadList() {
	loading.value = true;
	listError.value = "";
	try {
		allRows.value = await restResourceList("Vehicle Inspection", {
			fields: INSPECTION_LIST_FIELDS,
			order_by: "modified desc",
			limit_page_length: 100,
		});
	} catch (e) {
		listError.value = e.message || "Failed to load";
	} finally {
		loading.value = false;
	}
}

function downloadInspectionsCsv() {
	const list = filteredRows.value || [];
	const headers = ["ID", "Appointment", "Customer", "Vehicle", "Inspection date", "Job card"];
	const rows = list.map((r) => [
		r.name,
		r.appointment || "",
		r.customer || "",
		r.vehicle || "",
		r.inspection_date || "",
		r.job_card || "",
	]);
	downloadCsv(`vehicle-inspections-${Date.now()}.csv`, headers, rows);
}

async function openEditor(name) {
	editorBanner.value = "";
	editorError.value = "";
	editName.value = name;
	editorOpen.value = true;
	editorLoading.value = true;
	editDoc.value = null;
	try {
		const data = await restResourceGet("Vehicle Inspection", name);
		editDoc.value = JSON.parse(JSON.stringify(data));
		if (!Array.isArray(editDoc.value.inspection_items)) {
			editDoc.value.inspection_items = [];
		}
	} catch (e) {
		editorError.value = e.message || "Load failed";
	} finally {
		editorLoading.value = false;
	}
}

function closeEditor() {
	editorOpen.value = false;
	editDoc.value = null;
	editName.value = "";
	editorError.value = "";
	editorBanner.value = "";
	loadList();
}

async function loadStandardChecklist() {
	if (!editDoc.value) return;
	const existing = editDoc.value.inspection_items || [];
	if (
		existing.length &&
		!window.confirm("Replace all inspection lines with the standard checklist?")
	) {
		return;
	}
	editorBanner.value = "";
	try {
		const template = await frappeCall(
			"workshop_mgmt.workshop_management.vehicle_inspection_template.get_standard_vehicle_inspection_checklist"
		);
		const list = Array.isArray(template) ? template : [];
		editDoc.value.inspection_items = list.map((t, i) => ({
			section: t.section,
			check_item: t.check_item,
			status: "N/A",
			notes: "",
			idx: i + 1,
			doctype: "Inspection Item",
			parent: editDoc.value.name,
			parenttype: "Vehicle Inspection",
			parentfield: "inspection_items",
		}));
		editorBanner.value = "Checklist loaded — review and press Save.";
	} catch (e) {
		editorBanner.value = e.message || "Could not load checklist";
	}
}

async function saveInspection() {
	if (!editDoc.value?.name) return;
	saveLoading.value = true;
	editorBanner.value = "";
	try {
		const payload = stripForPut(editDoc.value);
		const saved = await restResourcePut("Vehicle Inspection", editDoc.value.name, payload);
		editDoc.value = JSON.parse(JSON.stringify(saved));
		if (!Array.isArray(editDoc.value.inspection_items)) {
			editDoc.value.inspection_items = [];
		}
		editorBanner.value = "Saved.";
		await loadList();
	} catch (e) {
		editorBanner.value = e.message || "Save failed";
	} finally {
		saveLoading.value = false;
	}
}

function removeLine(idx) {
	if (!editDoc.value?.inspection_items) return;
	editDoc.value.inspection_items.splice(idx, 1);
}

function addBlankLine() {
	if (!editDoc.value) return;
	if (!Array.isArray(editDoc.value.inspection_items)) {
		editDoc.value.inspection_items = [];
	}
	editDoc.value.inspection_items.push({
		section: SECTION_OPTIONS[0],
		check_item: "",
		status: "N/A",
		notes: "",
		idx: editDoc.value.inspection_items.length + 1,
		doctype: "Inspection Item",
		parent: editDoc.value.name,
		parenttype: "Vehicle Inspection",
		parentfield: "inspection_items",
	});
}

async function openNewModal() {
	newError.value = "";
	newAppointment.value = "";
	newOpen.value = true;
	newLoading.value = true;
	try {
		const appts = await restResourceList("Service Appointment", {
			fields: '["name","customer","vehicle","status","inspection"]',
			order_by: "modified desc",
			limit_page_length: 150,
			filters: [["status", "=", "Checked-In"]],
		});
		newAppointmentChoices.value = (appts || []).filter((a) => !a.inspection);
	} catch (e) {
		newError.value = e.message || "Could not load appointments";
	} finally {
		newLoading.value = false;
	}
}

async function submitNewInspection() {
	newError.value = "";
	newSaving.value = true;
	try {
		const msg = await frappeCall("workshop_mgmt.api.create_inspection_for_appointment", {
			appointment: newAppointment.value,
		});
		newOpen.value = false;
		const insName = msg?.name ?? (typeof msg === "string" ? msg : null);
		if (typeof insName === "string" && insName) {
			await openEditor(insName);
		}
		await loadList();
	} catch (e) {
		newError.value = e.message || "Create failed";
	} finally {
		newSaving.value = false;
	}
}

async function openJobCardFromInspection() {
	if (!editDoc.value?.name) return;
	jcError.value = "";
	jcCompany.value = "";
	jcWarehouse.value = "";
	jcOpen.value = true;
	jcMetaLoading.value = true;
	try {
		jcCompanies.value = await restResourceList("Company", {
			fields: '["name"]',
			order_by: "name asc",
			limit_page_length: 100,
		});
	} catch (e) {
		jcError.value = e.message || "Could not load companies";
	} finally {
		jcMetaLoading.value = false;
	}
}

async function onJCCompanyChange() {
	jcWarehouse.value = "";
	jcWarehouses.value = [];
	if (!jcCompany.value) return;
	jcWarehousesLoading.value = true;
	try {
		jcWarehouses.value = await restResourceList("Warehouse", {
			fields: '["name","warehouse_name"]',
			order_by: "name asc",
			limit_page_length: 200,
			filters: [
				["company", "=", jcCompany.value],
				["is_group", "=", 0],
			],
		});
	} catch (e) {
		jcError.value = e.message || "Could not load warehouses";
	} finally {
		jcWarehousesLoading.value = false;
	}
}

async function submitJobCardFromInspection() {
	if (!editDoc.value?.name) return;
	jcError.value = "";
	jcSubmitting.value = true;
	try {
		const jobName = await frappeCall("workshop_mgmt.api.create_job_card_from_inspection", {
			inspection: editDoc.value.name,
			company: jcCompany.value,
			warehouse: jcWarehouse.value,
			populate_from_recommendations: 0,
		});
		jcOpen.value = false;
		await loadList();
		if (jobName) {
			router.push({ name: "job-card-detail", params: { id: String(jobName) } });
		} else {
			await openEditor(editDoc.value.name);
		}
	} catch (e) {
		jcError.value = e.message || "Could not create job card";
	} finally {
		jcSubmitting.value = false;
	}
}

watch(
	() => route.query.open,
	(id) => {
		if (typeof id === "string" && id) {
			openEditor(id);
			router.replace({ path: route.path, query: {} });
		}
	},
	{ immediate: true }
);

onMounted(loadList);
</script>
