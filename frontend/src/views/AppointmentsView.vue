<template>
	<div class="space-y-6">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<h2 class="text-lg font-bold">Service appointments</h2>
			<button
				type="button"
				class="rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95 transition"
				@click="openModal"
			>
				+ New appointment
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
							<th class="px-4 py-3">Customer</th>
							<th class="px-4 py-3">Start</th>
							<th class="px-4 py-3">Status</th>
							<th class="px-4 py-3 w-24">Desk</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-800">
						<tr v-if="loading" class="text-slate-500">
							<td colspan="5" class="px-4 py-8 text-center">Loading…</td>
						</tr>
						<tr v-else-if="!rows.length" class="text-slate-500">
							<td colspan="5" class="px-4 py-8 text-center">No appointments</td>
						</tr>
						<tr
							v-for="r in rows"
							:key="r.name"
							class="hover:bg-slate-900/50 cursor-pointer"
							@click="openDetail(r.name)"
						>
							<td class="px-4 py-2 font-mono text-sky-300">{{ r.name }}</td>
							<td class="px-4 py-2 text-slate-300">{{ r.customer || "—" }}</td>
							<td class="px-4 py-2 text-slate-400">{{ formatDt(r.scheduled_start) }}</td>
							<td class="px-4 py-2">
								<span
									class="rounded-full px-2 py-0.5 text-xs font-medium"
									:class="statusPillClass(r.status)"
									>{{ r.status }}</span
								>
							</td>
							<td class="px-4 py-2">
								<a
									:href="deskFormUrl('Service Appointment', r.name)"
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

		<!-- Appointment detail -->
		<Teleport to="body">
			<div
				v-if="detailOpen"
				class="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
				@click.self="closeDetail"
			>
				<div
					class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
					role="dialog"
					aria-modal="true"
				>
					<div class="flex items-start justify-between gap-3 mb-4">
						<div>
							<h3 class="text-lg font-bold text-slate-100">Appointment</h3>
							<p class="font-mono text-sm text-sky-300">{{ detailName }}</p>
							<a
								v-if="detailName"
								:href="deskFormUrl('Service Appointment', detailName)"
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
						<div class="grid grid-cols-1 gap-2 text-sm mb-5">
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5">
								<span class="text-slate-500">Status</span>
								<span class="font-medium text-slate-200">{{ detailDoc.status }}</span>
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
								<span class="text-slate-500">Scheduled start</span>
								<span class="text-slate-300">{{ formatDt(detailDoc.scheduled_start) }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5">
								<span class="text-slate-500">Scheduled end</span>
								<span class="text-slate-300">{{ formatDt(detailDoc.scheduled_end) }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5">
								<span class="text-slate-500">Advisor</span>
								<span class="text-slate-300 break-all">{{ detailDoc.service_advisor || "—" }}</span>
							</div>
							<div v-if="detailDoc.remarks" class="py-1.5">
								<span class="text-slate-500 block mb-1">Remarks</span>
								<span class="text-slate-300 whitespace-pre-wrap">{{ detailDoc.remarks }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-800 py-1.5">
								<span class="text-slate-500">Inspection</span>
								<span class="text-slate-300 font-mono text-xs break-all">{{ detailDoc.inspection || "—" }}</span>
							</div>
							<div class="flex justify-between gap-2 py-1.5">
								<span class="text-slate-500">Job card</span>
								<span class="text-slate-300 font-mono text-xs break-all">{{ detailDoc.job_card || "—" }}</span>
							</div>
						</div>

						<p class="text-xs text-slate-500 mb-3">
							Actions match the Service Appointment desk form (check-in, inspection, job card, complete).
						</p>

						<div class="flex flex-col gap-2">
							<button
								v-if="detailDoc.status === 'Scheduled'"
								type="button"
								class="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
								:disabled="detailActionLoading"
								@click="runCheckIn"
							>
								Check in
							</button>

							<template v-if="detailDoc.status === 'Checked-In'">
								<button
									v-if="!detailDoc.inspection"
									type="button"
									class="rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-50"
									:disabled="detailActionLoading"
									@click="runCreateInspection"
								>
									Create inspection
								</button>
								<button
									v-if="!detailDoc.job_card"
									type="button"
									class="rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
									:disabled="detailActionLoading"
									@click="openJobCardWizard"
								>
									Create job card
								</button>
							</template>

							<button
								v-if="detailDoc.status === 'In Progress'"
								type="button"
								class="rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600 disabled:opacity-50"
								:disabled="detailActionLoading"
								@click="runMarkComplete"
							>
								Mark complete
							</button>

							<a
								v-if="detailDoc.inspection"
								:href="deskFormUrl('Vehicle Inspection', detailDoc.inspection)"
								target="_blank"
								rel="noopener noreferrer"
								class="rounded-lg border border-slate-600 px-4 py-2.5 text-center text-sm text-slate-200 hover:bg-slate-800"
							>
								View inspection in Desk
							</a>
							<a
								v-if="detailDoc.job_card"
								:href="deskFormUrl('Job Card', detailDoc.job_card)"
								target="_blank"
								rel="noopener noreferrer"
								class="rounded-lg border border-slate-600 px-4 py-2.5 text-center text-sm text-slate-200 hover:bg-slate-800"
							>
								View job card in Desk
							</a>
							<RouterLink
								v-if="detailDoc.job_card"
								:to="{ path: '/job-cards', query: { open: detailDoc.job_card } }"
								class="rounded-lg border border-sky-600/40 bg-sky-500/10 px-4 py-2.5 text-center text-sm font-medium text-sky-200 hover:bg-sky-500/15"
								@click="closeDetail"
							>
								Open job card in workshop
							</RouterLink>
						</div>
					</template>
					<p v-else-if="detailError" class="text-sm text-red-300">{{ detailError }}</p>

					<p v-if="detailActionError" class="mt-3 text-sm text-red-300">{{ detailActionError }}</p>
				</div>
			</div>
		</Teleport>

		<!-- Job card: company / warehouse -->
		<Teleport to="body">
			<div
				v-if="jcOpen"
				class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
				@click.self="jcOpen = false"
			>
				<div class="w-full max-w-md rounded-2xl border border-slate-600 bg-slate-900 p-5 shadow-2xl">
					<h4 class="text-base font-bold text-slate-100 mb-1">Create job card</h4>
					<p class="text-xs text-slate-500 mb-4">Same as Desk: choose company and warehouse.</p>
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
									{{ formatWarehouseOption(w) }}
								</option>
							</select>
						</div>
					</div>
					<p v-if="jcError" class="mt-3 text-sm text-red-300">{{ jcError }}</p>
					<div class="mt-5 flex justify-end gap-2">
						<button
							type="button"
							class="rounded-lg border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
							@click="jcOpen = false"
						>
							Cancel
						</button>
						<button
							type="button"
							class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
							:disabled="jcSubmitting || !jcCompany || !jcWarehouse"
							@click="submitJobCard"
						>
							{{ jcSubmitting ? "Creating…" : "Create" }}
						</button>
					</div>
				</div>
			</div>
		</Teleport>

		<Teleport to="body">
			<div
				v-if="modalOpen"
				class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
				@click.self="modalOpen = false"
			>
				<div
					class="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
					role="dialog"
					aria-modal="true"
				>
					<h3 class="text-lg font-bold mb-1">New appointment</h3>
					<p class="text-xs text-slate-500 mb-4">
						Choose a customer, then one of their vehicles. Lists use your desk permissions.
					</p>
					<div class="space-y-3">
						<div>
							<label class="block text-[11px] uppercase text-slate-500 mb-1">Customer</label>
							<select
								v-model="form.customer"
								class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
								:disabled="loadingCustomers"
								@change="onCustomerChange"
							>
								<option value="">{{ loadingCustomers ? "Loading customers…" : "Select customer…" }}</option>
								<option v-for="c in customers" :key="c.name" :value="c.name">
									{{ formatCustomerOption(c) }}
								</option>
							</select>
						</div>
						<div>
							<label class="block text-[11px] uppercase text-slate-500 mb-1">Vehicle</label>
							<select
								v-model="form.vehicle"
								class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
								:disabled="!form.customer || loadingVehicles"
							>
								<option value="">{{ vehicleSelectPlaceholder }}</option>
								<option v-for="v in vehicles" :key="v.name" :value="v.name">
									{{ formatVehicleOption(v) }}
								</option>
							</select>
							<p v-if="form.customer && !loadingVehicles && !vehicles.length" class="mt-1 text-xs text-amber-400">
								No vehicles for this customer. Add one in Desk → Vehicle.
							</p>
						</div>
						<div>
							<label class="block text-[11px] uppercase text-slate-500 mb-1">Scheduled start</label>
							<input
								v-model="form.scheduled_start"
								type="datetime-local"
								class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
							/>
						</div>
						<div>
							<label class="block text-[11px] uppercase text-slate-500 mb-1">Scheduled end</label>
							<input
								v-model="form.scheduled_end"
								type="datetime-local"
								class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
							/>
						</div>
						<div>
							<label class="block text-[11px] uppercase text-slate-500 mb-1">Advisor (optional)</label>
							<input
								v-model="form.service_advisor"
								class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
								placeholder="User ID"
							/>
						</div>
						<div>
							<label class="block text-[11px] uppercase text-slate-500 mb-1">Remarks</label>
							<textarea
								v-model="form.remarks"
								rows="2"
								class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
							/>
						</div>
					</div>
					<p v-if="pickerError" class="mt-3 text-sm text-amber-300">{{ pickerError }}</p>
					<p v-if="saveError" class="mt-3 text-sm text-red-300">{{ saveError }}</p>
					<div class="mt-5 flex justify-end gap-2">
						<button
							type="button"
							class="rounded-lg border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
							@click="modalOpen = false"
						>
							Cancel
						</button>
						<button
							type="button"
							class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
							:disabled="saving"
							@click="submit"
						>
							{{ saving ? "Saving…" : "Create" }}
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { restResourceList, restResourceGet, restInsert, frappeCall } from "../utils/api";
import { useCustomerVehicleSelects } from "../composables/useCustomerVehicleSelects";

const router = useRouter();

const DOCTYPE_ROUTE = {
	"Service Appointment": "service-appointment",
	"Vehicle Inspection": "vehicle-inspection",
	"Job Card": "job-card",
};

function deskFormUrl(doctype, name) {
	const slug = DOCTYPE_ROUTE[doctype] || doctype.toLowerCase().replace(/\s+/g, "-");
	return `/app/${slug}/${encodeURIComponent(name)}`;
}

function statusPillClass(status) {
	if (status === "Completed") return "bg-emerald-500/20 text-emerald-300";
	if (status === "In Progress" || status === "Checked-In") return "bg-sky-500/20 text-sky-300";
	if (status === "Cancelled" || status === "No-Show") return "bg-rose-500/20 text-rose-300";
	return "bg-slate-800 text-slate-300";
}

const loading = ref(true);
const listError = ref("");
const rows = ref([]);
const modalOpen = ref(false);
const saving = ref(false);
const saveError = ref("");

const detailOpen = ref(false);
const detailName = ref("");
const detailLoading = ref(false);
const detailError = ref("");
const detailDoc = ref(null);
const detailActionLoading = ref(false);
const detailActionError = ref("");

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

const form = reactive({
	customer: "",
	vehicle: "",
	scheduled_start: "",
	scheduled_end: "",
	service_advisor: "",
	remarks: "",
});

const {
	customers,
	vehicles,
	loadingCustomers,
	loadingVehicles,
	pickerError,
	vehicleSelectPlaceholder,
	formatCustomerOption,
	formatVehicleOption,
	loadCustomersForModal,
	onCustomerChange,
	resetPickerLists,
} = useCustomerVehicleSelects(form);

const LIST_FIELDS = '["name","customer","status","scheduled_start"]';
const LIST_ORDER = "scheduled_start desc";

function formatWarehouseOption(w) {
	const n = w.name || "";
	const label = (w.warehouse_name || "").trim();
	if (label && label !== n) return `${label} (${n})`;
	return n || "—";
}

function formatDt(v) {
	if (!v) return "—";
	const d = new Date(String(v).replace(" ", "T"));
	if (Number.isNaN(d.getTime())) return String(v);
	return d.toLocaleString();
}

function pad2(n) {
	return String(n).padStart(2, "0");
}
function toLocal(dt) {
	return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}T${pad2(dt.getHours())}:${pad2(
		dt.getMinutes()
	)}`;
}

function localToFrappe(val) {
	if (!val) return "";
	let s = String(val).replace("T", " ");
	if (s.length === 16) s += ":00";
	return s;
}

async function loadList() {
	loading.value = true;
	listError.value = "";
	try {
		const data = await restResourceList("Service Appointment", {
			fields: LIST_FIELDS,
			order_by: LIST_ORDER,
			limit_page_length: 100,
		});
		rows.value = data;
	} catch (e) {
		listError.value = e.message || "Failed to load list";
	} finally {
		loading.value = false;
	}
}

async function refreshDetail() {
	if (!detailName.value) return;
	detailLoading.value = true;
	detailError.value = "";
	try {
		detailDoc.value = await restResourceGet("Service Appointment", detailName.value);
	} catch (e) {
		detailDoc.value = null;
		detailError.value = e.message || "Failed to load appointment";
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
}

async function runCheckIn() {
	detailActionError.value = "";
	detailActionLoading.value = true;
	try {
		await frappeCall("workshop_mgmt.api.appointment_check_in", { name: detailName.value });
		await refreshDetail();
		await loadList();
	} catch (e) {
		detailActionError.value = e.message || "Check-in failed";
	} finally {
		detailActionLoading.value = false;
	}
}

async function runMarkComplete() {
	detailActionError.value = "";
	detailActionLoading.value = true;
	try {
		await frappeCall("workshop_mgmt.api.appointment_mark_complete", { name: detailName.value });
		await refreshDetail();
		await loadList();
	} catch (e) {
		detailActionError.value = e.message || "Could not complete";
	} finally {
		detailActionLoading.value = false;
	}
}

async function runCreateInspection() {
	detailActionError.value = "";
	detailActionLoading.value = true;
	try {
		const msg = await frappeCall("workshop_mgmt.api.create_inspection_for_appointment", {
			appointment: detailName.value,
		});
		await refreshDetail();
		await loadList();
		const insName = msg && typeof msg === "object" ? msg.name : msg;
		if (insName) {
			detailOpen.value = false;
			router.push({ path: "/inspections", query: { open: String(insName) } });
		}
	} catch (e) {
		detailActionError.value = e.message || "Could not create inspection";
	} finally {
		detailActionLoading.value = false;
	}
}

async function openJobCardWizard() {
	jcError.value = "";
	jcCompany.value = "";
	jcWarehouse.value = "";
	jcWarehouses.value = [];
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

async function submitJobCard() {
	jcError.value = "";
	jcSubmitting.value = true;
	try {
		const msg = await frappeCall("workshop_mgmt.api.create_job_card_for_appointment", {
			appointment: detailName.value,
			company: jcCompany.value,
			warehouse: jcWarehouse.value,
		});
		jcOpen.value = false;
		await loadList();
		if (msg?.name) {
			closeDetail();
			router.push({ path: "/job-cards", query: { open: String(msg.name) } });
		} else {
			await refreshDetail();
		}
	} catch (e) {
		jcError.value = e.message || "Could not create job card";
	} finally {
		jcSubmitting.value = false;
	}
}

async function openModal() {
	saveError.value = "";
	form.customer = "";
	form.vehicle = "";
	resetPickerLists();
	form.service_advisor = "";
	form.remarks = "";
	const start = new Date();
	start.setMinutes(0, 0, 0);
	start.setHours(start.getHours() + 1);
	const end = new Date(start.getTime() + 60 * 60 * 1000);
	form.scheduled_start = toLocal(start);
	form.scheduled_end = toLocal(end);
	modalOpen.value = true;
	await loadCustomersForModal();
}

async function submit() {
	saveError.value = "";
	const customer = form.customer.trim();
	const vehicle = form.vehicle.trim();
	const scheduled_start = localToFrappe(form.scheduled_start);
	const scheduled_end = localToFrappe(form.scheduled_end);
	if (!customer || !vehicle || !scheduled_start || !scheduled_end) {
		saveError.value = "Fill customer, vehicle, start, and end.";
		return;
	}
	if (!window?.frappe?.csrf_token) {
		saveError.value = "Missing CSRF. Open this app from /workshop while logged in.";
		return;
	}
	saving.value = true;
	try {
		const doc = {
			customer,
			vehicle,
			scheduled_start,
			scheduled_end,
			status: "Scheduled",
		};
		if (form.service_advisor.trim()) doc.service_advisor = form.service_advisor.trim();
		if (form.remarks.trim()) doc.remarks = form.remarks.trim();
		await restInsert("Service Appointment", doc);
		modalOpen.value = false;
		await loadList();
	} catch (e) {
		saveError.value = e.message || "Save failed";
	} finally {
		saving.value = false;
	}
}

onMounted(loadList);
</script>
