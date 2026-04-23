<template>
	<div class="space-y-6">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<h2 class="text-lg font-bold">Vehicle inspections</h2>
				<p class="text-xs text-slate-500 mt-0.5">
					Load the standard checklist, set status and notes per line, save. Create job card when ready (lines added in Desk).
				</p>
			</div>
			<button
				type="button"
				class="rounded-lg bg-gradient-to-r from-violet-600 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95 transition"
				@click="openNewModal"
			>
				+ New inspection
			</button>
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
							<th class="px-4 py-3">Appointment</th>
							<th class="px-4 py-3">Customer</th>
							<th class="px-4 py-3">Vehicle</th>
							<th class="px-4 py-3">Date</th>
							<th class="px-4 py-3 w-24">Desk</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-800">
						<tr v-if="loading" class="text-slate-500">
							<td colspan="6" class="px-4 py-8 text-center">Loading…</td>
						</tr>
						<tr v-else-if="!rows.length" class="text-slate-500">
							<td colspan="6" class="px-4 py-8 text-center">No inspections</td>
						</tr>
						<tr
							v-for="r in rows"
							:key="r.name"
							class="hover:bg-slate-900/50 cursor-pointer"
							@click="openEditor(r.name)"
						>
							<td class="px-4 py-2 font-mono text-sky-300">{{ r.name }}</td>
							<td class="px-4 py-2 font-mono text-xs text-slate-400">{{ r.appointment || "—" }}</td>
							<td class="px-4 py-2 text-slate-300">{{ r.customer || "—" }}</td>
							<td class="px-4 py-2 text-slate-400">{{ r.vehicle || "—" }}</td>
							<td class="px-4 py-2 text-slate-400">{{ r.inspection_date || "—" }}</td>
							<td class="px-4 py-2">
								<a
									:href="deskUrl('Vehicle Inspection', r.name)"
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

		<!-- Editor -->
		<Teleport to="body">
			<div
				v-if="editorOpen"
				class="fixed inset-0 z-[55] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
				@click.self="closeEditor"
			>
				<div
					class="w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
					role="dialog"
					aria-modal="true"
				>
					<div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 p-4 shrink-0">
						<div>
							<h3 class="text-lg font-bold text-slate-100">Inspection</h3>
							<p class="font-mono text-sm text-sky-300">{{ editName }}</p>
							<a
								v-if="editName"
								:href="deskUrl('Vehicle Inspection', editName)"
								target="_blank"
								rel="noopener noreferrer"
								class="mt-1 inline-block text-xs text-slate-500 hover:text-sky-400"
								>Open in Desk →</a
							>
						</div>
						<div class="flex flex-wrap gap-2">
							<button
								type="button"
								class="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
								:disabled="editorLoading || saveLoading"
								@click="loadStandardChecklist"
							>
								Load standard checklist
							</button>
							<button
								type="button"
								class="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
								:disabled="editorLoading || saveLoading || !editDoc"
								@click="saveInspection"
							>
								{{ saveLoading ? "Saving…" : "Save" }}
							</button>
							<button
								type="button"
								class="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800"
								@click="closeEditor"
							>
								Close
							</button>
						</div>
					</div>

					<div v-if="editorLoading" class="p-12 text-center text-slate-500">Loading…</div>
					<div v-else-if="editDoc" class="flex-1 overflow-y-auto p-4 space-y-4">
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
							<div>
								<label class="block text-[11px] uppercase text-slate-500 mb-1">Appointment</label>
								<input
									:value="editDoc.appointment || ''"
									disabled
									class="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-slate-400"
								/>
							</div>
							<div>
								<label class="block text-[11px] uppercase text-slate-500 mb-1">Customer</label>
								<input
									:value="editDoc.customer || ''"
									disabled
									class="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-slate-400"
								/>
							</div>
							<div>
								<label class="block text-[11px] uppercase text-slate-500 mb-1">Vehicle</label>
								<input
									:value="editDoc.vehicle || ''"
									disabled
									class="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-slate-400"
								/>
							</div>
							<div>
								<label class="block text-[11px] uppercase text-slate-500 mb-1">Inspection date</label>
								<input
									v-model="editDoc.inspection_date"
									type="date"
									class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
								/>
							</div>
							<div class="sm:col-span-2">
								<label class="block text-[11px] uppercase text-slate-500 mb-1">Inspector (optional)</label>
								<input
									v-model="editDoc.inspector"
									class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
									placeholder="User ID"
								/>
							</div>
							<div class="flex flex-wrap items-end gap-x-2 gap-y-1 sm:col-span-2">
								<a
									v-if="editDoc.appointment"
									:href="deskUrl('Service Appointment', editDoc.appointment)"
									target="_blank"
									class="text-xs text-sky-400 hover:underline"
									>Appointment</a
								>
								<template v-if="editDoc.job_card">
									<span v-if="editDoc.appointment" class="text-slate-600">·</span>
									<a
										:href="deskUrl('Job Card', editDoc.job_card)"
										target="_blank"
										class="text-xs text-sky-400 hover:underline"
										>Job card (Desk)</a
									>
									<RouterLink
										:to="{ path: '/job-cards', query: { open: editDoc.job_card } }"
										class="text-xs font-medium text-emerald-400 hover:underline"
										@click="closeEditor"
									>
										Job card (workshop)
									</RouterLink>
								</template>
							</div>
						</div>

						<div
							v-if="editDoc.name && !editDoc.job_card"
							class="rounded-lg border border-slate-800 bg-slate-950/50 p-3 flex flex-wrap gap-2 items-center"
						>
							<button
								type="button"
								class="rounded-lg bg-amber-700 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
								@click="openJobCardFromInspection"
							>
								Create job card from inspection
							</button>
							<span class="text-xs text-slate-500">Uses Desk logic (company, warehouse). Add service/parts on the job card in Desk.</span>
						</div>

						<div class="rounded-xl border border-slate-800 overflow-hidden">
							<div class="overflow-x-auto max-h-[50vh] overflow-y-auto">
								<table class="w-full text-xs min-w-[480px]">
									<thead class="bg-slate-950 text-left text-slate-500 uppercase tracking-wide sticky top-0 z-10">
										<tr>
											<th class="px-2 py-2 w-40">Section</th>
											<th class="px-2 py-2 min-w-[140px]">Check item</th>
											<th class="px-2 py-2 min-w-[9rem]">Status</th>
											<th class="px-2 py-2 min-w-[160px]">Notes</th>
											<th class="px-2 py-2 w-20"></th>
										</tr>
									</thead>
									<tbody class="divide-y divide-slate-800">
										<tr v-for="(row, idx) in editDoc.inspection_items || []" :key="row.name || 'n-' + idx">
											<td class="px-1 py-1 align-top">
												<select
													v-model="row.section"
													class="w-full rounded border border-slate-700 bg-slate-950 px-1 py-1.5 text-slate-200"
												>
													<option v-for="s in SECTION_OPTIONS" :key="s" :value="s">{{ s }}</option>
												</select>
											</td>
											<td class="px-1 py-1 align-top">
												<input
													v-model="row.check_item"
													class="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200"
													placeholder="Check item"
												/>
											</td>
											<td class="px-1 py-1 align-top">
												<div class="flex gap-1 mb-1">
													<button
														type="button"
														class="flex-1 rounded border border-emerald-700/80 bg-emerald-950/60 px-1.5 py-1 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-900/70"
														title="Mark OK"
														@click="row.status = STATUS_QUICK_OK"
													>
														OK
													</button>
													<button
														type="button"
														class="flex-1 rounded border border-amber-700/80 bg-amber-950/60 px-1.5 py-1 text-[11px] font-semibold text-amber-200 hover:bg-amber-900/70"
														title="Needs attention"
														@click="row.status = STATUS_QUICK_REPORT"
													>
														Report
													</button>
												</div>
												<select
													v-model="row.status"
													class="w-full rounded border border-slate-700 bg-slate-950 px-1 py-1.5"
												>
													<option v-for="st in STATUS_OPTIONS" :key="st" :value="st">{{ st }}</option>
												</select>
											</td>
											<td class="px-1 py-1 align-top">
												<textarea
													v-model="row.notes"
													rows="2"
													class="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200"
												/>
											</td>
											<td class="px-1 py-1 align-top">
												<button
													type="button"
													class="text-rose-400 text-[11px] hover:underline"
													@click="removeLine(idx)"
												>
													Remove
												</button>
											</td>
										</tr>
										<tr v-if="!(editDoc.inspection_items || []).length">
											<td colspan="5" class="px-4 py-8 text-center text-slate-500">
												No lines — use “Load standard checklist” or add rows in Desk.
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						<button
							type="button"
							class="text-sm text-sky-400 hover:underline"
							@click="addBlankLine"
						>
							+ Add blank line
						</button>
					</div>
					<p v-else-if="editorError" class="p-6 text-red-300 text-sm">{{ editorError }}</p>

					<p v-if="editorBanner" class="border-t border-slate-800 px-4 py-2 text-sm text-amber-200 bg-amber-950/30">
						{{ editorBanner }}
					</p>
				</div>
			</div>
		</Teleport>

		<!-- New inspection: pick checked-in appointment -->
		<Teleport to="body">
			<div
				v-if="newOpen"
				class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
				@click.self="newOpen = false"
			>
				<div class="w-full max-w-md rounded-2xl border border-slate-600 bg-slate-900 p-5 shadow-2xl">
					<h4 class="text-base font-bold text-slate-100 mb-1">New inspection</h4>
					<p class="text-xs text-slate-500 mb-4">Choose a checked-in appointment without an inspection yet.</p>
					<select
						v-model="newAppointment"
						class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
						:disabled="newLoading"
					>
						<option value="">{{ newLoading ? "Loading…" : "Select appointment…" }}</option>
						<option v-for="a in newAppointmentChoices" :key="a.name" :value="a.name">
							{{ a.name }} — {{ a.customer }} ({{ a.vehicle }})
						</option>
					</select>
					<p v-if="newError" class="mt-3 text-sm text-red-300">{{ newError }}</p>
					<div class="mt-5 flex justify-end gap-2">
						<button
							type="button"
							class="rounded-lg border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
							@click="newOpen = false"
						>
							Cancel
						</button>
						<button
							type="button"
							class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
							:disabled="newSaving || !newAppointment"
							@click="submitNewInspection"
						>
							{{ newSaving ? "Creating…" : "Create" }}
						</button>
					</div>
				</div>
			</div>
		</Teleport>

		<!-- Job card from inspection -->
		<Teleport to="body">
			<div
				v-if="jcOpen"
				class="fixed inset-0 z-[65] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
				@click.self="jcOpen = false"
			>
				<div class="w-full max-w-md rounded-2xl border border-slate-600 bg-slate-900 p-5 shadow-2xl">
					<h4 class="text-base font-bold text-slate-100 mb-1">Create job card</h4>
					<p class="text-xs text-slate-500 mb-4">Company and warehouse (same as Desk). Service and part lines are added on the job card.</p>
					<div class="space-y-3">
						<div>
							<label class="block text-[11px] uppercase text-slate-500 mb-1">Company</label>
							<select
								v-model="jcCompany"
								class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
								:disabled="jcMetaLoading"
								@change="onJCCompanyChange"
							>
								<option value="">{{ jcMetaLoading ? "Loading…" : "Select company…" }}</option>
								<option v-for="c in jcCompanies" :key="c.name" :value="c.name">{{ c.name }}</option>
							</select>
						</div>
						<div>
							<label class="block text-[11px] uppercase text-slate-500 mb-1">Warehouse</label>
							<select
								v-model="jcWarehouse"
								class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
								:disabled="!jcCompany || jcWarehousesLoading"
							>
								<option value="">{{ jcWarehousePlaceholder }}</option>
								<option v-for="w in jcWarehouses" :key="w.name" :value="w.name">
									{{ w.warehouse_name && w.warehouse_name !== w.name ? `${w.warehouse_name} (${w.name})` : w.name }}
								</option>
							</select>
						</div>
					</div>
					<p v-if="jcError" class="mt-3 text-sm text-red-300">{{ jcError }}</p>
					<div class="mt-5 flex justify-end gap-2">
						<button type="button" class="rounded-lg border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800" @click="jcOpen = false">
							Cancel
						</button>
						<button
							type="button"
							class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
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
import { ref, computed, onMounted, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
	restResourceList,
	restResourceGet,
	restResourcePut,
	frappeCall,
} from "../utils/api";

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

const loading = ref(true);
const listError = ref("");
const rows = ref([]);

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

function deskUrl(doctype, name) {
	const slug =
		doctype === "Vehicle Inspection"
			? "vehicle-inspection"
			: doctype === "Service Appointment"
				? "service-appointment"
				: doctype === "Job Card"
					? "job-card"
					: doctype.toLowerCase().replace(/\s+/g, "-");
	return `/app/${slug}/${encodeURIComponent(name)}`;
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
		rows.value = await restResourceList("Vehicle Inspection", {
			fields: '["name","appointment","customer","vehicle","inspection_date","modified"]',
			order_by: "modified desc",
			limit_page_length: 100,
		});
	} catch (e) {
		listError.value = e.message || "Failed to load";
	} finally {
		loading.value = false;
	}
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
			router.push({ path: "/job-cards", query: { open: String(jobName) } });
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
