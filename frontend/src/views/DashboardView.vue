<template>
	<div
		class="dash-wrap rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/95 via-slate-950 to-[#020617] p-5 shadow-2xl"
	>
		<div class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-sm font-bold text-white shadow-lg"
				>
					CC
				</div>
				<div>
					<h2 class="text-xl font-bold tracking-tight text-slate-100">Garage dashboard</h2>
					<p class="text-xs text-slate-500">Real-time operations</p>
				</div>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<button
					type="button"
					class="rounded-full border border-rose-500/40 bg-gradient-to-r from-rose-600/30 to-amber-600/30 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:border-sky-500/50"
					@click="openModal"
				>
					+ New appointment
				</button>
				<button
					type="button"
					class="rounded-full border border-slate-600/80 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700/80"
					@click="loadAll"
				>
					Refresh
				</button>
				<RouterLink
					to="/appointments"
					class="rounded-full border border-slate-600/80 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700/80"
				>
					Appointments page
				</RouterLink>
				<RouterLink
					to="/job-cards"
					class="rounded-full border border-slate-600/80 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700/80"
				>
					Job cards
				</RouterLink>
				<RouterLink
					to="/inspections"
					class="rounded-full border border-slate-600/80 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700/80"
				>
					Inspections
				</RouterLink>
			</div>
		</div>

		<div class="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
			<a
				v-for="s in shortcuts"
				:key="s.href"
				:href="s.href"
				class="flex items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/40 py-2.5 text-center text-xs font-semibold text-slate-200 transition hover:border-sky-500/50 hover:bg-sky-500/10"
			>
				{{ s.label }}
			</a>
		</div>

		<p
			v-if="error"
			class="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
		>
			{{ error }}
		</p>

		<div v-if="loading" class="py-16 text-center text-sm text-slate-500">Loading dashboard…</div>

		<div v-else class="space-y-5">
			<!-- KPI row -->
			<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<div
					v-for="c in kpiCards"
					:key="c.label"
					class="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5 shadow-lg transition hover:-translate-y-0.5"
				>
					<p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ c.label }}</p>
					<p class="mt-3 text-2xl font-extrabold tabular-nums text-slate-50">{{ c.value }}</p>
					<p v-if="c.hint" class="mt-1 text-[11px] text-slate-500">{{ c.hint }}</p>
				</div>
			</div>

			<!-- Job status | Top services | Appointments -->
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
				<div class="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5 lg:col-span-5">
					<h4 class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Job status</h4>
					<div v-if="!jobStatus.length" class="mt-4 text-sm text-slate-500">No job card data.</div>
					<div v-else class="mt-3 space-y-2">
						<div v-for="row in jobStatus" :key="row.status">
							<div class="flex justify-between text-xs text-slate-300">
								<span>{{ row.status }}</span>
								<span class="tabular-nums">{{ row.count }}</span>
							</div>
							<div class="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
								<div
									class="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500"
									:style="{ width: jobBarPct(row.count) + '%' }"
								/>
							</div>
						</div>
					</div>
				</div>
				<div class="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5 lg:col-span-5">
					<h4 class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Top services (month)</h4>
					<div v-if="!topServices.length" class="mt-4 text-sm text-slate-500">No service data yet.</div>
					<div v-else class="mt-3 space-y-2">
						<div v-for="x in topServices" :key="x.item_code" class="flex justify-between gap-2 text-xs">
							<span class="truncate text-slate-300">{{ x.item_name }}</span>
							<span class="shrink-0 font-semibold tabular-nums text-slate-200">{{ money(x.amount) }}</span>
						</div>
					</div>
				</div>
				<div class="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5 lg:col-span-2">
					<h4 class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Appointments</h4>
					<p class="mt-3 text-3xl font-extrabold tabular-nums text-slate-50">{{ kpi.today_appointments ?? 0 }}</p>
					<p class="mt-1 text-[11px] text-slate-500">Today (count)</p>
					<div class="mt-3 space-y-1.5 text-xs text-slate-400">
						<div class="flex justify-between">
							<span>In progress</span>
							<span class="tabular-nums text-slate-200">{{ kpi.in_progress_appointments ?? 0 }}</span>
						</div>
						<div class="flex justify-between">
							<span>Upcoming</span>
							<span class="tabular-nums text-slate-200">{{ kpi.upcoming_appointments ?? 0 }}</span>
						</div>
						<div class="flex justify-between border-t border-slate-800/80 pt-2 text-[11px]">
							<span>Month completion</span>
							<span class="text-sky-400">{{ formatPct(kpi.completion_rate) }}</span>
						</div>
					</div>
					<p class="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Next appointments</p>
					<div class="mt-2 space-y-1.5">
						<div
							v-for="x in upcomingApptDisplay"
							:key="x.key"
							class="flex justify-between gap-2 text-xs text-slate-400"
						>
							<span class="truncate">{{ x.left }}</span>
							<span class="shrink-0 tabular-nums">{{ x.right }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Appointment status + revenue trend -->
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div class="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5">
					<h4 class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Appointment status mix</h4>
					<div v-if="!appointmentStatus.length" class="mt-4 text-sm text-slate-500">No data.</div>
					<ul v-else class="mt-3 max-h-40 space-y-1.5 overflow-y-auto text-xs">
						<li v-for="r in appointmentStatus.slice(0, 8)" :key="r.status" class="flex justify-between text-slate-300">
							<span>{{ r.status }}</span>
							<span class="tabular-nums font-semibold">{{ r.count }}</span>
						</li>
					</ul>
				</div>
				<div class="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5">
					<h4 class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Revenue trend</h4>
					<p class="mt-1 text-[10px] text-slate-600">{{ trendStart }} — {{ trendEnd }}</p>
					<svg class="mt-2 h-28 w-full text-sky-400" viewBox="0 0 600 120" preserveAspectRatio="none">
						<polyline :points="sparkFill" fill="rgba(56,189,248,0.08)" stroke="none" />
						<polyline
							:points="sparkLine"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							vector-effect="non-scaling-stroke"
						/>
					</svg>
				</div>
			</div>

			<!-- Recent jobs | Top parts -->
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div class="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5">
					<h4 class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Recent jobs</h4>
					<table class="mt-3 w-full text-left text-xs">
						<tbody>
							<tr v-for="x in recentJobs" :key="x.name" class="border-b border-slate-800/80">
								<td class="py-2.5 pr-2">
									<RouterLink
										:to="{ path: '/job-cards', query: { open: x.name } }"
										class="font-mono text-sky-400 hover:underline"
									>
										{{ x.name }}
									</RouterLink>
								</td>
								<td class="py-2.5 pr-2 text-slate-400">{{ x.customer || "—" }}</td>
								<td class="py-2.5">
									<span class="rounded-full bg-slate-800 px-2 py-0.5 text-[10px]">{{ x.status }}</span>
								</td>
							</tr>
							<tr v-if="!recentJobs.length">
								<td colspan="3" class="py-6 text-center text-slate-500">No recent jobs</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5">
					<h4 class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Top parts (month)</h4>
					<div v-if="!topParts.length" class="mt-4 text-sm text-slate-500">No parts data yet.</div>
					<div v-else class="mt-3 space-y-2">
						<div v-for="x in topParts" :key="x.item_code" class="flex justify-between gap-2 text-xs">
							<span class="truncate text-slate-300">{{ x.item_name }}</span>
							<span class="shrink-0 font-semibold tabular-nums text-slate-200">{{ money(x.amount) }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Service appointments table -->
			<div class="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5">
				<h4 class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Service appointments</h4>
				<div class="mt-3 flex flex-wrap items-center gap-2">
					<button
						type="button"
						class="rounded-full border border-rose-500/40 bg-gradient-to-r from-rose-600/25 to-amber-600/25 px-3 py-1.5 text-xs font-semibold text-slate-100"
						@click="openModal"
					>
						+ New appointment
					</button>
					<button
						type="button"
						class="rounded-full border px-3 py-1.5 text-xs font-medium transition"
						:class="
							apptMode === 'today'
								? 'border-sky-500/50 bg-sky-500/15 text-sky-200'
								: 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
						"
						@click="setApptMode('today')"
					>
						Today
					</button>
					<button
						type="button"
						class="rounded-full border px-3 py-1.5 text-xs font-medium transition"
						:class="
							apptMode === 'upcoming'
								? 'border-sky-500/50 bg-sky-500/15 text-sky-200'
								: 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
						"
						@click="setApptMode('upcoming')"
					>
						Upcoming
					</button>
					<span class="ml-auto text-[11px] text-slate-500">{{ apptHint }}</span>
				</div>
				<table class="mt-4 w-full text-left text-xs">
					<thead>
						<tr class="border-b border-slate-800 text-slate-500">
							<th class="pb-2 font-medium">Appointment</th>
							<th class="pb-2 font-medium">Customer</th>
							<th class="pb-2 font-medium">Scheduled start</th>
							<th class="pb-2 font-medium">Status</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="x in filteredAppointments" :key="x.name" class="border-b border-slate-800/80">
							<td class="py-2.5 font-mono text-slate-200">{{ x.name }}</td>
							<td class="py-2.5 text-slate-400">{{ x.customer || "—" }}</td>
							<td class="py-2.5 text-slate-400">{{ formatDt(x.scheduled_start) }}</td>
							<td class="py-2.5">
								<span class="rounded-full px-2 py-0.5 text-[10px]" :class="pillClass(x.status)">{{
									x.status || "—"
								}}</span>
							</td>
						</tr>
						<tr v-if="!filteredAppointments.length">
							<td colspan="4" class="py-8 text-center text-slate-500">No appointments found</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- Modal -->
		<Teleport to="body">
			<div
				v-if="modalOpen"
				class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
				@click.self="modalOpen = false"
			>
				<div
					class="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
					role="dialog"
					aria-modal="true"
				>
					<h3 class="text-lg font-bold text-slate-100">New service appointment</h3>
					<p class="mt-1 text-xs text-slate-500">
						Choose a customer, then one of their vehicles. Lists use your desk permissions.
					</p>
					<div class="mt-4 space-y-3">
						<div>
							<label class="mb-1 block text-[11px] uppercase text-slate-500">Customer</label>
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
							<label class="mb-1 block text-[11px] uppercase text-slate-500">Vehicle</label>
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
							<p
								v-if="form.customer && !loadingVehicles && !vehicles.length"
								class="mt-1 text-xs text-amber-400"
							>
								No vehicles for this customer. Add one in Desk → Vehicle.
							</p>
						</div>
						<div>
							<label class="mb-1 block text-[11px] uppercase text-slate-500">Scheduled start</label>
							<input
								v-model="form.scheduled_start"
								type="datetime-local"
								class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
							/>
						</div>
						<div>
							<label class="mb-1 block text-[11px] uppercase text-slate-500">Scheduled end</label>
							<input
								v-model="form.scheduled_end"
								type="datetime-local"
								class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
							/>
						</div>
						<div>
							<label class="mb-1 block text-[11px] uppercase text-slate-500">Advisor (optional)</label>
							<input
								v-model="form.service_advisor"
								class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
							/>
						</div>
						<div>
							<label class="mb-1 block text-[11px] uppercase text-slate-500">Remarks</label>
							<textarea
								v-model="form.remarks"
								rows="2"
								class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
							/>
						</div>
					</div>
					<p v-if="pickerError" class="mt-3 text-sm text-amber-300">{{ pickerError }}</p>
					<p v-if="saveError" class="mt-3 text-sm text-rose-300">{{ saveError }}</p>
					<div class="mt-5 flex justify-end gap-2">
						<button
							type="button"
							class="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
							@click="modalOpen = false"
						>
							Cancel
						</button>
						<button
							type="button"
							class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
							:disabled="saving"
							@click="submitAppointment"
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
import { RouterLink } from "vue-router";
import { frappeCall, restResourceList, restInsert } from "../utils/api";
import { useCustomerVehicleSelects } from "../composables/useCustomerVehicleSelects";

const DASHBOARD_METHOD =
	"workshop_mgmt.workshop_management.page.garage_business_dashboard.garage_business_dashboard.get_dashboard_data";

const shortcuts = [
	{ label: "Job cards", href: "/app/job-card" },
	{ label: "Appointments", href: "/app/service-appointment" },
	{ label: "Inspections", href: "/app/vehicle-inspection" },
	{ label: "Vehicles", href: "/app/vehicle" },
	{ label: "Customers", href: "/app/customer" },
	{ label: "Invoices", href: "/app/sales-invoice" },
];

const loading = ref(true);
const error = ref("");
const kpi = ref({});
const jobStatus = ref([]);
const appointmentStatus = ref([]);
const revenueTrend = ref([]);
const topServices = ref([]);
const topParts = ref([]);
const recentJobs = ref([]);
const upcomingAppointments = ref([]);
const appointmentRows = ref([]);
const serverToday = ref("");
const apptMode = ref("today");

const modalOpen = ref(false);
const saving = ref(false);
const saveError = ref("");
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

const currency = () => window?.frappe?.boot?.sysdefaults?.currency || "USD";

function money(v) {
	try {
		return new Intl.NumberFormat(undefined, { style: "currency", currency: currency() }).format(
			Number(v || 0)
		);
	} catch {
		return "$" + Number(v || 0).toLocaleString();
	}
}

function formatPct(v) {
	return `${Number(v || 0).toFixed(1)}%`;
}

function formatDt(v) {
	if (!v) return "—";
	const d = new Date(String(v).replace(" ", "T"));
	if (Number.isNaN(d.getTime())) return String(v);
	return d.toLocaleString();
}

function apptDateKey(scheduledStart) {
	if (!scheduledStart) return "";
	return String(scheduledStart).split(" ")[0];
}

function pillClass(status) {
	if (status === "Completed") return "bg-emerald-500/20 text-emerald-300";
	if (status === "In Progress" || status === "Checked-In") return "bg-sky-500/20 text-sky-300";
	if (status === "Cancelled" || status === "No-Show") return "bg-rose-500/20 text-rose-300";
	return "bg-slate-700 text-slate-300";
}

const kpiCards = computed(() => {
	const k = kpi.value || {};
	return [
		{ label: "Today revenue", value: money(k.today_revenue) },
		{ label: "Month revenue", value: money(k.month_revenue) },
		{ label: "Outstanding", value: money(k.outstanding) },
		{
			label: "Open jobs",
			value: String(k.open_jobs ?? 0),
			hint:
				k.ready_to_invoice != null
					? `Ready to invoice: ${k.ready_to_invoice}`
					: "",
		},
	];
});

const jobStatusMax = computed(() => {
	const m = Math.max(1, ...jobStatus.value.map((x) => Number(x.count || 0)));
	return m;
});

function jobBarPct(count) {
	return Math.min(100, (Number(count || 0) / jobStatusMax.value) * 100);
}

const upcomingApptDisplay = computed(() => {
	const rows = upcomingAppointments.value || [];
	if (!rows.length) {
		return [{ key: "empty", left: "No upcoming appointments", right: "—" }];
	}
	return rows.map((x, i) => ({
		key: x.name || String(i),
		left: x.customer || x.name || "—",
		right: formatDt(x.scheduled_start),
	}));
});

const trendStart = computed(() => {
	const t = revenueTrend.value;
	return t.length ? t[0].label : "—";
});
const trendEnd = computed(() => {
	const t = revenueTrend.value;
	return t.length ? t[t.length - 1].label : "—";
});

const sparkLine = computed(() => {
	const t = revenueTrend.value;
	if (!t.length) return "";
	const vals = t.map((x) => Number(x.amount || 0));
	const max = Math.max(1, ...vals);
	const w = 600;
	const h = 110;
	const step = vals.length > 1 ? w / (vals.length - 1) : w;
	return vals
		.map((v, i) => {
			const x = i * step;
			const y = h - (v / max) * (h - 10) - 5;
			return `${x},${y}`;
		})
		.join(" ");
});

const sparkFill = computed(() => {
	const line = sparkLine.value;
	if (!line) return "";
	return `0,110 ${line} 600,110`;
});

const filteredAppointments = computed(() => {
	const rows = appointmentRows.value || [];
	const t = serverToday.value || "";
	if (apptMode.value === "today") {
		return rows.filter((x) => apptDateKey(x.scheduled_start) === t);
	}
	if (apptMode.value === "upcoming") {
		return rows.filter((x) => apptDateKey(x.scheduled_start) > t);
	}
	return rows;
});

const apptHint = computed(() => {
	if (apptMode.value === "today") {
		return serverToday.value ? `Server date: ${serverToday.value}` : "";
	}
	return `After ${serverToday.value || "today"}`;
});

function setApptMode(mode) {
	apptMode.value = mode;
}

function pad2(n) {
	return String(n).padStart(2, "0");
}
function toLocal(dt) {
	return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}T${pad2(dt.getHours())}:${pad2(
		dt.getMinutes()
	)}`;
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
	const end = new Date(start.getTime() + 3600000);
	form.scheduled_start = toLocal(start);
	form.scheduled_end = toLocal(end);
	modalOpen.value = true;
	await loadCustomersForModal();
}

function localToFrappe(val) {
	if (!val) return "";
	let s = String(val).replace("T", " ");
	if (s.length === 16) s += ":00";
	return s;
}

async function submitAppointment() {
	saveError.value = "";
	const customer = form.customer.trim();
	const vehicle = form.vehicle.trim();
	const scheduled_start = localToFrappe(form.scheduled_start);
	const scheduled_end = localToFrappe(form.scheduled_end);
	if (!customer || !vehicle || !scheduled_start || !scheduled_end) {
		saveError.value = "Customer, vehicle, start, and end are required.";
		return;
	}
	if (!window?.frappe?.csrf_token) {
		saveError.value = "Missing CSRF — stay logged in on this site.";
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
		await loadAppointments();
		await loadDashboard();
	} catch (e) {
		saveError.value = e.message || "Save failed";
	} finally {
		saving.value = false;
	}
}

async function loadDashboard() {
	const msg = await frappeCall(DASHBOARD_METHOD, { days: 7 });
	kpi.value = msg?.kpis || {};
	jobStatus.value = msg?.job_status || [];
	appointmentStatus.value = msg?.appointment_status || [];
	revenueTrend.value = msg?.revenue_trend || [];
	topServices.value = msg?.top_services || [];
	topParts.value = msg?.top_parts || [];
	recentJobs.value = msg?.recent_jobs || [];
	upcomingAppointments.value = msg?.upcoming_appointments || [];
	serverToday.value = kpi.value.today_date || "";
}

async function loadAppointments() {
	const data = await restResourceList("Service Appointment", {
		fields: '["name","customer","status","scheduled_start"]',
		order_by: "scheduled_start desc",
		limit_page_length: 100,
	});
	appointmentRows.value = data;
}

async function loadAll() {
	loading.value = true;
	error.value = "";
	try {
		await Promise.all([loadDashboard(), loadAppointments()]);
		apptMode.value = "today";
	} catch (e) {
		error.value = e.message || "Failed to load";
	} finally {
		loading.value = false;
	}
}

onMounted(loadAll);
</script>
