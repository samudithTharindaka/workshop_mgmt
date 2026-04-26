<template>
	<div class="mx-auto max-w-7xl space-y-8">
		<WxBreadcrumb :items="breadcrumbItems" />

		<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Garage dashboard</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Real-time operations</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<button type="button" class="portal-btn-primary" @click="openModal">
					<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
					</svg>
					New appointment
				</button>
				<button type="button" class="portal-btn-secondary" @click="loadAll">Refresh</button>
			</div>
		</div>

		<div class="flex flex-wrap gap-2">
			<a
				v-for="s in shortcuts"
				:key="s.href"
				:href="s.href"
				class="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-sky-600/50 dark:hover:text-sky-300"
			>
				{{ s.label }}
			</a>
		</div>

		<p
			v-if="error"
			class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
		>
			{{ error }}
		</p>

		<div v-if="loading" class="py-20 text-center text-sm text-slate-600 dark:text-slate-500">Loading dashboard…</div>

		<div v-else class="space-y-6">
			<!-- KPI -->
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div
					v-for="c in kpiCards"
					:key="c.label"
					class="portal-card min-h-[7.5rem] transition-shadow hover:shadow-md"
				>
					<p class="text-xs font-medium tracking-wide text-slate-600 dark:text-slate-500">{{ c.label }}</p>
					<p class="mt-3 text-3xl font-semibold tabular-nums text-slate-950 dark:text-slate-50">{{ c.value }}</p>
					<p v-if="c.hint" class="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-500">{{ c.hint }}</p>
				</div>
			</div>

			<!-- Appointment pulse -->
			<div class="portal-card">
				<div class="flex flex-wrap items-end gap-6 border-b border-slate-200/90 dark:border-slate-800/80 pb-4">
					<div>
						<p class="text-xs font-medium tracking-wide text-slate-600 dark:text-slate-500">Today</p>
						<p class="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{{ kpi.today_appointments ?? 0 }}</p>
					</div>
					<div>
						<p class="text-xs text-slate-600 dark:text-slate-500">In progress</p>
						<p class="mt-1 text-lg font-medium tabular-nums text-slate-800 dark:text-slate-200">{{ kpi.in_progress_appointments ?? 0 }}</p>
					</div>
					<div>
						<p class="text-xs text-slate-600 dark:text-slate-500">Upcoming</p>
						<p class="mt-1 text-lg font-medium tabular-nums text-slate-800 dark:text-slate-200">{{ kpi.upcoming_appointments ?? 0 }}</p>
					</div>
					<div class="min-w-[8rem]">
						<p class="text-xs text-slate-600 dark:text-slate-500">Month completion</p>
						<p class="mt-1 text-lg font-medium text-blue-600 dark:text-blue-400">{{ formatPct(kpi.completion_rate) }}</p>
					</div>
				</div>
			</div>

			<!-- Charts -->
			<div class="grid gap-4 lg:grid-cols-2">
				<div class="portal-card">
					<h4 class="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-500">Appointment status mix</h4>
					<div v-if="!appointmentStatus.length" class="mt-4 text-sm text-slate-600 dark:text-slate-500">No data.</div>
					<ul v-else class="mt-4 max-h-48 space-y-2 overflow-y-auto text-sm">
						<li v-for="r in appointmentStatus.slice(0, 12)" :key="r.status" class="flex justify-between gap-4 text-slate-700 dark:text-slate-300">
							<span>{{ r.status }}</span>
							<span class="tabular-nums font-medium text-slate-900 dark:text-slate-100">{{ r.count }}</span>
						</li>
					</ul>
				</div>
				<div class="portal-card">
					<h4 class="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-500">Revenue trend</h4>
					<p class="mt-1 text-xs text-slate-600 dark:text-slate-500">{{ trendStart }} — {{ trendEnd }}</p>
					<svg class="mt-4 h-32 w-full text-blue-500" viewBox="0 0 600 120" preserveAspectRatio="none">
						<polyline :points="sparkFill" fill="rgba(59,130,246,0.12)" stroke="none" />
						<polyline
							:points="sparkLine"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							vector-effect="non-scaling-stroke"
						/>
					</svg>
				</div>
			</div>

			<!-- Activity -->
			<div class="grid gap-4 lg:grid-cols-2">
				<div class="portal-card flex flex-col">
					<h4 class="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-500">Recent jobs</h4>
					<div class="portal-table-wrap mt-4 max-h-72 flex-1 overflow-y-auto">
						<table class="portal-table text-xs">
							<thead>
								<tr>
									<th>Job</th>
									<th>Customer</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="x in recentJobs" :key="x.name">
									<td class="font-mono">
										<RouterLink
											:to="{ name: 'job-card-detail', params: { id: x.name } }"
											class="text-blue-600 dark:text-blue-400 hover:underline"
										>
											{{ x.name }}
										</RouterLink>
									</td>
									<td class="text-slate-600 dark:text-slate-400">{{ x.customer || "—" }}</td>
									<td>
										<span class="inline-flex rounded-md bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">{{
											x.status
										}}</span>
									</td>
								</tr>
								<tr v-if="!recentJobs.length">
									<td colspan="3" class="py-8 text-center text-slate-600 dark:text-slate-500">No recent jobs</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div class="portal-card flex flex-col">
					<h4 class="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-500">Upcoming appointments</h4>
					<div class="mt-4 max-h-72 flex-1 space-y-2 overflow-y-auto text-sm">
						<div
							v-for="x in upcomingApptDisplay"
							:key="x.key"
							class="flex justify-between gap-3 rounded-lg border border-slate-200/80 dark:border-slate-800/60 px-3 py-2.5 text-slate-700 dark:text-slate-300 transition hover:bg-slate-200/50 dark:bg-slate-800/30"
						>
							<span class="min-w-0 truncate">{{ x.left }}</span>
							<span class="shrink-0 tabular-nums text-xs text-slate-600 dark:text-slate-500">{{ x.right }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Operations -->
			<div class="grid gap-4 lg:grid-cols-3">
				<div class="portal-card">
					<h4 class="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-500">Job status</h4>
					<div v-if="!jobStatus.length" class="mt-4 text-sm text-slate-600 dark:text-slate-500">No job card data.</div>
					<div v-else class="mt-4 space-y-3">
						<div v-for="row in jobStatus" :key="row.status">
							<div class="flex justify-between text-xs text-slate-600 dark:text-slate-400">
								<span>{{ row.status }}</span>
								<span class="tabular-nums font-medium text-slate-800 dark:text-slate-200">{{ row.count }}</span>
							</div>
							<div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
								<div
									class="h-full rounded-full bg-blue-600"
									:style="{ width: jobBarPct(row.count) + '%' }"
								/>
							</div>
						</div>
					</div>
				</div>
				<div class="portal-card">
					<h4 class="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-500">Top services (month)</h4>
					<div v-if="!topServices.length" class="mt-4 text-sm text-slate-600 dark:text-slate-500">No service data yet.</div>
					<div v-else class="mt-4 max-h-56 space-y-2 overflow-y-auto text-sm">
						<div v-for="x in topServices" :key="x.item_code" class="flex justify-between gap-2">
							<span class="truncate text-slate-700 dark:text-slate-300">{{ x.item_name }}</span>
							<span class="shrink-0 tabular-nums font-medium text-slate-900 dark:text-slate-100">{{ money(x.amount) }}</span>
						</div>
					</div>
				</div>
				<div class="portal-card">
					<h4 class="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-500">Top parts (month)</h4>
					<div v-if="!topParts.length" class="mt-4 text-sm text-slate-600 dark:text-slate-500">No parts data yet.</div>
					<div v-else class="mt-4 max-h-56 space-y-2 overflow-y-auto text-sm">
						<div v-for="x in topParts" :key="x.item_code" class="flex justify-between gap-2">
							<span class="truncate text-slate-700 dark:text-slate-300">{{ x.item_name }}</span>
							<span class="shrink-0 tabular-nums font-medium text-slate-900 dark:text-slate-100">{{ money(x.amount) }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Appointments table -->
			<div class="portal-card p-0 overflow-hidden">
				<div class="flex flex-col gap-4 border-b border-slate-200/90 dark:border-slate-800/80 p-6 sm:flex-row sm:items-center sm:justify-between">
					<h4 class="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-500">Service appointments</h4>
					<div class="flex flex-wrap items-center gap-2">
						<button
							type="button"
							class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
							@click="openModal"
						>
							+ New
						</button>
						<button
							type="button"
							class="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
							:class="
								apptMode === 'today'
									? 'border-blue-500/50 bg-blue-600/15 text-blue-700 dark:text-blue-300'
									: 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/60'
							"
							@click="setApptMode('today')"
						>
							Today
						</button>
						<button
							type="button"
							class="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
							:class="
								apptMode === 'upcoming'
									? 'border-blue-500/50 bg-blue-600/15 text-blue-700 dark:text-blue-300'
									: 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/60'
							"
							@click="setApptMode('upcoming')"
						>
							Upcoming
						</button>
						<span class="text-xs text-slate-600 dark:text-slate-500">{{ apptHint }}</span>
					</div>
				</div>
				<div class="max-h-[28rem] overflow-y-auto">
					<table class="portal-table text-sm">
						<thead>
							<tr>
								<th>Appointment</th>
								<th>Customer</th>
								<th>Scheduled start</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="x in filteredAppointments" :key="x.name">
								<td class="font-mono text-slate-800 dark:text-slate-200">{{ x.name }}</td>
								<td class="text-slate-600 dark:text-slate-400">{{ x.customer || "—" }}</td>
								<td class="tabular-nums text-slate-600 dark:text-slate-400">{{ formatDt(x.scheduled_start) }}</td>
								<td>
									<span class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium" :class="pillClass(x.status)">{{
										x.status || "—"
									}}</span>
								</td>
							</tr>
							<tr v-if="!filteredAppointments.length">
								<td colspan="4" class="py-12 text-center text-slate-600 dark:text-slate-500">No appointments found</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<Teleport to="body">
			<div
				v-if="modalOpen"
				class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
				@click.self="modalOpen = false"
			>
				<div class="portal-modal-panel max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
					<h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">New service appointment</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-500">
						Choose a customer, then one of their vehicles. Lists use your desk permissions.
					</p>
					<div class="mt-6 space-y-4">
						<div>
							<label class="portal-label">Customer</label>
							<select
								v-model="form.customer"
								class="portal-input"
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
							<label class="portal-label">Vehicle</label>
							<select v-model="form.vehicle" class="portal-input" :disabled="!form.customer || loadingVehicles">
								<option value="">{{ vehicleSelectPlaceholder }}</option>
								<option v-for="v in vehicles" :key="v.name" :value="v.name">
									{{ formatVehicleOption(v) }}
								</option>
							</select>
							<p
								v-if="form.customer && !loadingVehicles && !vehicles.length"
								class="mt-2 text-xs text-amber-500/90"
							>
								No vehicles for this customer. Add one in Desk → Vehicle.
							</p>
						</div>
						<div>
							<label class="portal-label">Scheduled start</label>
							<input v-model="form.scheduled_start" type="datetime-local" class="portal-input" />
						</div>
						<div>
							<label class="portal-label">Scheduled end</label>
							<input v-model="form.scheduled_end" type="datetime-local" class="portal-input" />
						</div>
						<div>
							<label class="portal-label">Advisor (optional)</label>
							<input v-model="form.service_advisor" class="portal-input" />
						</div>
						<div>
							<label class="portal-label">Remarks</label>
							<textarea v-model="form.remarks" rows="3" class="portal-input resize-y" />
						</div>
					</div>
					<p v-if="pickerError" class="mt-4 text-sm text-amber-400">{{ pickerError }}</p>
					<p v-if="saveError" class="mt-4 text-sm text-red-400">{{ saveError }}</p>
					<div class="mt-8 flex justify-end gap-3 border-t border-slate-200/90 dark:border-slate-800/80 pt-6">
						<button
							type="button"
							class="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
							@click="modalOpen = false"
						>
							Cancel
						</button>
						<button
							type="button"
							class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
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
import WxBreadcrumb from "../components/layout/WxBreadcrumb.vue";

const breadcrumbItems = [
	{ label: "Workshop", to: "/" },
	{ label: "Dashboard" },
];

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
	if (status === "Completed") return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300";
	if (status === "In Progress" || status === "Checked-In") return "bg-blue-500/15 text-blue-700 dark:text-blue-300";
	if (status === "Cancelled" || status === "No-Show") return "bg-red-500/15 text-red-700 dark:text-red-300";
	return "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
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
