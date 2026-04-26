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
<div class="relative -mx-6 -mt-6 mb-6 flex min-h-[40vh] flex-col overflow-hidden bg-gradient-to-br from-sky-400 to-blue-600 px-6 pb-8 pt-6 shadow-sm dark:from-sky-600 dark:to-blue-800">
<div class="absolute inset-0 opacity-[0.15] mix-blend-overlay" style="background-image: url('data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' viewBox=\'0 0 16 16\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M8 0l8 8-8 8-8-8 8-8zm0 2L2 8l6 6 6-6-6-6z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E');"></div>
<div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay"></div>

<div class="relative z-10 flex items-start justify-between gap-3">
<div class="min-w-0">
<p class="text-xs font-semibold uppercase tracking-wider text-sky-100">Appointment</p>
<p class="mt-1 truncate text-2xl font-bold text-white drop-shadow-sm">
{{ detailDoc ? customerDisplayName(detailDoc.customer) : "…" }}
</p>
<p v-if="detailDoc?.scheduled_start" class="mt-1 text-sm font-medium text-sky-50">
{{ formatDt(detailDoc.scheduled_start) }}
</p>
<div class="mt-4 flex flex-wrap gap-2">
<Button
v-if="appointmentId"
as="a"
:href="deskFormUrl('Service Appointment', appointmentId)"
target="_blank"
rel="noopener noreferrer"
class="!border-white/30 !bg-white/10 !px-3 !py-1.5 !text-xs !font-semibold !text-white backdrop-blur-md transition hover:!bg-white/20 rounded-lg"
icon="pi pi-external-link"
label="Open in Desk"
/>
</div>
</div>
<button type="button" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20" @click="close" aria-label="Close">
<i class="pi pi-times" aria-hidden="true" />
</button>
</div>

<div v-if="loading" class="relative z-10 mt-auto py-8 text-center text-sm font-medium text-sky-100">Loading…</div>

<div v-else-if="detailDoc" class="relative z-10 mt-auto flex items-end gap-4 pt-10">
<img
v-if="customerAvatarSrc(detailDoc.customer)"
:src="customerAvatarSrc(detailDoc.customer)"
alt=""
class="h-16 w-16 shrink-0 rounded-full border-2 border-white/50 object-cover shadow-lg"
/>
<div
v-else
class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white/50 bg-white/10 text-xl font-bold text-white shadow-lg backdrop-blur-md"
>
{{ customerInitials(detailDoc.customer) }}
</div>
<div class="min-w-0 pb-1">
<p class="text-xs font-medium text-sky-100 drop-shadow-sm">Countdown to start</p>
<p class="mt-0.5 text-3xl font-bold tabular-nums tracking-tight text-white drop-shadow-md">{{ scheduleCountdown(detailDoc) }}</p>
</div>
</div>
</div>

<template v-if="!loading && detailDoc">
<div class="mb-6 grid grid-cols-1 gap-0 text-sm">
<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-1.5 dark:border-slate-800">
<span class="text-slate-600 dark:text-slate-500">Status</span>
<span class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium shadow-sm" :class="statusPillClass(detailDoc.status)">{{ detailDoc.status }}</span>
</div>
<div class="flex justify-between gap-2 border-b border-slate-200 py-1.5 dark:border-slate-800">
<span class="text-slate-600 dark:text-slate-500">Vehicle</span>
<span class="text-right text-slate-800 dark:text-slate-200 break-all">{{ detailDoc.vehicle || "—" }}</span>
</div>
<div class="flex justify-between gap-2 border-b border-slate-200 py-1.5 dark:border-slate-800">
<span class="text-slate-600 dark:text-slate-500">Scheduled end</span>
<span class="text-slate-700 dark:text-slate-300">{{ formatDt(detailDoc.scheduled_end) }}</span>
</div>
<div v-if="detailDoc.remarks" class="py-1.5">
<span class="mb-1 block text-slate-600 dark:text-slate-500">Remarks</span>
<span class="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{{ detailDoc.remarks }}</span>
</div>
</div>

<div class="flex flex-col gap-3">
<button
v-if="detailDoc.status === 'Scheduled'"
type="button"
class="portal-btn-primary w-full !bg-emerald-600 hover:!bg-emerald-500 focus:!ring-emerald-500/35"
:disabled="actionLoading"
@click="runCheckIn"
>
Check in
</button>

<template v-if="detailDoc.status === 'Checked-In'">
<button
v-if="!detailDoc.inspection"
type="button"
class="portal-btn-primary w-full !bg-sky-600 hover:!bg-sky-500 focus:!ring-sky-500/35"
:disabled="actionLoading"
@click="runCreateInspection"
>
Create inspection
</button>
<button
v-if="!detailDoc.job_card"
type="button"
class="portal-btn-primary w-full !bg-amber-600 hover:!bg-amber-500 focus:!ring-amber-500/35"
:disabled="actionLoading"
@click="openJobCardWizard"
>
Create job card
</button>
</template>

<button
v-if="detailDoc.status === 'In Progress'"
type="button"
class="portal-btn-primary w-full !bg-slate-800 hover:!bg-slate-700 focus:!ring-slate-500/35 dark:!bg-slate-100 dark:!text-slate-900 dark:hover:!bg-white"
:disabled="actionLoading"
@click="runMarkComplete"
>
Mark complete
</button>

<Button v-if="detailDoc.job_card" class="w-full" severity="help" @click="goOpenJobCard(detailDoc.job_card)">
Open job card in workshop
</Button>
<WxDangerButton
v-if="detailDoc && canCancelAppointment(detailDoc.status)"
class="w-full"
label="Cancel appointment"
icon="pi pi-times"
:loading="cancelling"
:disabled="actionLoading"
@click="confirmCancelAppointment($event)"
/>
</div>
</template>
<p v-else-if="error" class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
<p v-if="actionError" class="mt-3 text-sm text-red-700 dark:text-red-300">{{ actionError }}</p>
</aside>
</div>
</Transition>
</Teleport>

<Teleport to="body">
<div
v-if="jcOpen"
class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
@click.self="jcOpen = false"
>
<div class="portal-modal-panel max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
<h4 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Create job card</h4>
<p class="mt-2 text-sm text-slate-600 dark:text-slate-500">Choose company and warehouse (same as Desk).</p>
<div class="mt-6 space-y-4">
<div>
<label class="portal-label">Company</label>
<select v-model="jcCompany" class="portal-input" :disabled="jcMetaLoading" @change="onJCCompanyChange">
<option value="">{{ jcMetaLoading ? "Loading…" : "Select company…" }}</option>
<option v-for="c in jcCompanies" :key="c.name" :value="c.name">{{ c.name }}</option>
</select>
</div>
<div>
<label class="portal-label">Warehouse</label>
<select v-model="jcWarehouse" class="portal-input" :disabled="!jcCompany || jcWarehousesLoading">
<option value="">{{ jcWarehousePlaceholder }}</option>
<option v-for="w in jcWarehouses" :key="w.name" :value="w.name">{{ formatWarehouseOption(w) }}</option>
</select>
</div>
</div>
<p v-if="jcError" class="mt-4 text-sm text-red-400">{{ jcError }}</p>
<div class="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
<UiButton type="button" variant="secondary" @click="jcOpen = false">Cancel</UiButton>
<UiButton type="button" :disabled="jcSubmitting || !jcCompany || !jcWarehouse" @click="submitJobCard">
{{ jcSubmitting ? "Creating…" : "Create" }}
</UiButton>
</div>
</div>
</div>
</Teleport>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { frappeCall, restResourceGet, restResourceList } from "../../utils/api";
import { deskFormUrl } from "../../utils/desk.js";
import { useCustomerMeta } from "../../composables/useCustomerMeta.js";
import Button from "primevue/button";
import WxDangerButton from "./WxDangerButton.vue";
import UiButton from "./UiButton.vue";

const props = defineProps({
open: { type: Boolean, default: false },
appointmentId: { type: String, default: "" },
});

const emit = defineEmits(["update:open", "updated"]);

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const { customerDisplayName, customerAvatarSrc, customerInitials, enrichCustomersForRows } = useCustomerMeta();

const detailDoc = ref(null);
const loading = ref(false);
const error = ref("");
const actionLoading = ref(false);
const actionError = ref("");
const cancelling = ref(false);

const nowTick = ref(Date.now());
let countdownTimer;

watch(() => props.open, (isOpen) => {
if (isOpen && props.appointmentId) {
loadDetail();
startTimer();
} else {
detailDoc.value = null;
stopTimer();
}
});

watch(() => props.appointmentId, (newId) => {
if (props.open && newId) {
loadDetail();
}
});

function startTimer() {
stopTimer();
countdownTimer = setInterval(() => {
nowTick.value = Date.now();
}, 10000);
}

function stopTimer() {
if (countdownTimer) {
clearInterval(countdownTimer);
countdownTimer = null;
}
}

onUnmounted(stopTimer);

function close() {
emit("update:open", false);
}

function formatDt(iso) {
if (!iso) return "";
const t = parseScheduleMs(iso);
if (isNaN(t)) return iso;
return new Date(t).toLocaleString();
}

function parseScheduleMs(iso) {
if (!iso) return NaN;
const s = String(iso).trim().replace(" ", "T");
const t = Date.parse(s);
if (!isNaN(t)) return t;
if (s.length >= 19) {
const parts = s.split(/[-T: ]/);
if (parts.length >= 6) {
const d = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
return d.getTime();
}
}
return NaN;
}

function scheduleCountdown(r) {
if (!r || !r.scheduled_start) return "—";
const t = parseScheduleMs(r.scheduled_start);
if (isNaN(t)) return "—";
let diff = t - nowTick.value;
if (diff < 0) diff = 0;
if (diff === 0) return "0h 0m";
const d = Math.floor(diff / 86400000);
const h = Math.floor((diff % 86400000) / 3600000);
const m = Math.floor((diff % 3600000) / 60000);
if (d > 0) return `${d}d ${h}h`;
return `${h}h ${m}m`;
}

function statusPillClass(status) {
if (status === "Completed") return "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200";
if (status === "In Progress" || status === "Checked-In")
return "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100";
if (status === "Cancelled" || status === "No-Show")
return "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200";
if (status === "Scheduled") return "bg-amber-100 text-amber-950 dark:bg-amber-500/20 dark:text-amber-100";
return "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300";
}

async function loadDetail() {
loading.value = true;
error.value = "";
actionError.value = "";
try {
const doc = await restResourceGet("Service Appointment", props.appointmentId);
detailDoc.value = doc;
if (doc.customer) {
await enrichCustomersForRows([doc]);
}
} catch (e) {
error.value = e.message || "Failed to load detail";
detailDoc.value = null;
} finally {
loading.value = false;
}
}

async function runCheckIn() {
if (!props.appointmentId) return;
actionError.value = "";
actionLoading.value = true;
try {
await frappeCall("workshop_mgmt.api.appointment_check_in", { name: props.appointmentId });
await loadDetail();
emit("updated");
toast.add({
severity: "success",
summary: "Checked in",
detail: "Status changed to Checked-In",
life: 2500,
});
} catch (e) {
actionError.value = e.message || "Check-in failed";
} finally {
actionLoading.value = false;
}
}

async function runCreateInspection() {
if (!props.appointmentId) return;
actionError.value = "";
actionLoading.value = true;
try {
const res = await frappeCall("workshop_mgmt.api.create_inspection_for_appointment", { appointment: props.appointmentId });
const d = res.message || res;
await loadDetail();
emit("updated");
toast.add({
severity: "success",
summary: "Inspection created",
detail: `Created ${d.name || "record"}`,
life: 2500,
});
} catch (e) {
actionError.value = e.message || "Failed to create inspection";
} finally {
actionLoading.value = false;
}
}

async function runMarkComplete() {
if (!props.appointmentId) return;
actionError.value = "";
actionLoading.value = true;
try {
await frappeCall("workshop_mgmt.api.appointment_mark_complete", { name: props.appointmentId });
await loadDetail();
emit("updated");
toast.add({
severity: "success",
summary: "Completed",
detail: "Status changed to Completed",
life: 2500,
});
} catch (e) {
actionError.value = e.message || "Failed to complete";
} finally {
actionLoading.value = false;
}
}

function canCancelAppointment(status) {
return status === "Scheduled" || status === "Checked-In";
}

function confirmCancelAppointment(event) {
confirm.require({
header: 'Cancel Appointment',
message: 'Are you sure you want to cancel this appointment?',
icon: 'pi pi-exclamation-triangle',
acceptLabel: 'Yes, cancel it',
rejectLabel: 'Keep it',
accept: () => {
runCancelAppointment();
}
});
}

async function runCancelAppointment() {
actionError.value = "";
cancelling.value = true;
actionLoading.value = true;
try {
await frappeCall("workshop_mgmt.api.appointment_cancel", { name: props.appointmentId });
await loadDetail();
emit("updated");
toast.add({
severity: "success",
summary: "Appointment cancelled",
detail: `${props.appointmentId} was set to Cancelled.`,
life: 2800,
});
} catch (e) {
actionError.value = e.message || "Could not cancel";
toast.add({
severity: "error",
summary: "Cancel failed",
detail: actionError.value,
life: 3600,
});
} finally {
cancelling.value = false;
actionLoading.value = false;
}
}

function goOpenJobCard(name) {
close();
router.push({ name: "job-card-detail", params: { id: name } });
}

// Job Card Wizard
const jcOpen = ref(false);
const jcMetaLoading = ref(false);
const jcCompanies = ref([]);
const jcWarehouses = ref([]);
const jcCompany = ref("");
const jcWarehouse = ref("");
const jcError = ref("");
const jcSubmitting = ref(false);

const jcWarehousePlaceholder = computed(() => {
if (!jcCompany.value) return "Select company first…";
if (jcWarehouses.value.length === 0) return "No warehouses available";
return "Select warehouse…";
});

function formatWarehouseOption(w) {
if (w.warehouse_name && w.warehouse_name !== w.name) {
return `${w.warehouse_name} (${w.name})`;
}
return w.name;
}

async function openJobCardWizard() {
jcOpen.value = true;
jcError.value = "";
if (!jcCompanies.value.length) {
loadJCMeta();
}
}

async function loadJCMeta() {
jcMetaLoading.value = true;
jcError.value = "";
try {
jcCompanies.value = await restResourceList("Company", {
fields: '["name"]',
order_by: "name asc",
limit_page_length: 100,
});
if (jcCompanies.value.length === 1) {
jcCompany.value = jcCompanies.value[0].name;
onJCCompanyChange();
}
} catch (e) {
jcError.value = e.message || "Could not load companies";
} finally {
jcMetaLoading.value = false;
}
}

const jcWarehousesLoading = ref(false);
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
if (jcWarehouses.value.length === 1) {
jcWarehouse.value = jcWarehouses.value[0].name;
} else {
const ws = jcWarehouses.value.find((w) => String(w.name).toLowerCase().includes("workshop"));
if (ws) jcWarehouse.value = ws.name;
}
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
const res = await frappeCall("workshop_mgmt.api.create_job_card_for_appointment", {
appointment: props.appointmentId,
company: jcCompany.value,
warehouse: jcWarehouse.value,
});
const d = res.message || res;
jcOpen.value = false;
await loadDetail();
emit("updated");
if (d?.name) {
goOpenJobCard(d.name);
} else {
toast.add({
severity: "success",
summary: "Job card created",
detail: "Job card has been successfully created.",
life: 2500,
});
}
} catch (e) {
jcError.value = e.message || "Could not create job card";
} finally {
jcSubmitting.value = false;
}
}
</script>
