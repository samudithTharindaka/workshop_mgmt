<template>
	<div class="mx-auto max-w-5xl space-y-6">
		<WxToast />
		<WxBreadcrumb :items="breadcrumbItems" />

		<!-- Top action bar -->
		<div class="flex flex-wrap items-center justify-end gap-2">
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
			<Button :as="RouterLink" :to="{ name: 'job-cards' }" size="small" class="portal-pv-desk-link" icon="pi pi-arrow-left" label="Back to list" />
		</div>

		<p v-if="detailError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
			{{ detailError }}
		</p>

		<div v-if="detailLoading" class="flex flex-col items-center py-24 text-slate-500 dark:text-slate-500">
			<i class="pi pi-spin pi-spinner mb-3 text-3xl opacity-50" aria-hidden="true" />
			<p class="text-sm">Loading job card…</p>
		</div>

		<template v-else-if="detailDoc">

			<!-- Hero card -->
			<div class="relative overflow-hidden rounded-2xl border border-brand-700/30 bg-gradient-to-br from-brand-500 to-brand-700 p-6 shadow-sm dark:from-brand-700 dark:to-brand-900">
				<!-- Vector pattern overlay -->
				<div
					class="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
					style="background-image: url('data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' viewBox=\'0 0 16 16\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M8 0l8 8-8 8-8-8 8-8zm0 2L2 8l6 6 6-6-6-6z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E');"
					aria-hidden="true"
				/>
				<div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden="true" />
				<div class="relative z-10 flex flex-wrap items-start justify-between gap-4">
					<div class="flex items-start gap-4 min-w-0">
						<img
							v-if="customerAvatarSrc(detailDoc.customer)"
							:src="customerAvatarSrc(detailDoc.customer)"
							alt=""
							class="h-14 w-14 shrink-0 rounded-full border-2 border-white/50 shadow-lg object-cover"
						/>
						<div
							v-else
							class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-white/15 text-lg font-bold text-white shadow-lg backdrop-blur-md"
							aria-hidden="true"
						>
							{{ customerInitials(detailDoc.customer) }}
						</div>
						<div class="min-w-0">
							<p class="text-xs font-semibold uppercase tracking-wider text-brand-100">Job Card</p>
							<h1 class="font-mono text-xl font-bold tracking-tight text-white drop-shadow-sm">{{ detailName || "—" }}</h1>
							<p class="mt-0.5 text-base font-semibold text-brand-50 truncate">{{ customerDisplayName(detailDoc.customer) || detailDoc.customer || "—" }}</p>
							<p class="mt-0.5 text-sm text-brand-100">
								<i class="pi pi-car mr-1.5 opacity-70" style="font-size: 12px" aria-hidden="true" />{{ detailDoc.vehicle || "No vehicle" }}
							</p>
						</div>
					</div>
					<div class="flex shrink-0 flex-col items-end gap-2">
						<span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm" :class="statusPillClass(detailDoc.status)">
							<span class="h-2 w-2 rounded-full" :class="statusDotClass(detailDoc.status)" aria-hidden="true" />
							{{ detailDoc.status || "—" }}
						</span>
						<p class="text-xs text-brand-100 tabular-nums">
							<i class="pi pi-calendar mr-1 opacity-70" style="font-size: 11px" aria-hidden="true" />{{ detailDoc.posting_date || "—" }}
						</p>
					</div>
				</div>
			</div>

			<!-- Primary actions — loose row, no card, sits high on the page -->
			<div
				v-if="workflowTransitions.length || canCreateQuotation || canCreateSalesInvoice"
				class="flex flex-wrap items-center gap-2"
			>
				<Button
					v-for="(t, i) in workflowTransitions"
					:key="t.action + '-' + (t.next_state || '')"
					:class="i === 0 ? 'portal-btn-primary' : 'portal-btn-secondary'"
					:disabled="detailActionLoading"
					@click="runWorkflow(t.action)"
				>
					<span class="font-semibold">{{ workflowActionLabel(t.action) }}</span>
					<span class="text-xs opacity-70">→ {{ t.next_state }}</span>
				</Button>

				<span
					v-if="workflowTransitions.length && (canCreateQuotation || canCreateSalesInvoice)"
					class="mx-1 hidden h-7 w-px bg-slate-200 dark:bg-slate-700 sm:block"
					aria-hidden="true"
				/>

				<Button
					v-if="canCreateQuotation"
					class="portal-btn-secondary"
					:disabled="detailActionLoading"
					icon="pi pi-file"
					label="Create quotation"
					@click="runCreateQuotation"
				/>
				<Button
					v-if="canCreateSalesInvoice"
					class="portal-btn-primary !bg-emerald-600 hover:!bg-emerald-700 focus:!ring-emerald-500/35 active:!bg-emerald-800"
					:disabled="detailActionLoading"
					icon="pi pi-receipt"
					label="Create sales invoice"
					@click="runCreateSalesInvoice"
				/>
			</div>

			<!-- Status timeline -->
			<div class="portal-card">
				<p class="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Progress</p>
				<div v-if="detailDoc.status === 'Cancelled'" class="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-500/10">
					<i class="pi pi-times-circle text-red-500 dark:text-red-400 text-lg" aria-hidden="true" />
					<p class="text-sm font-semibold text-red-700 dark:text-red-300">This job card has been cancelled.</p>
				</div>
				<div v-else class="overflow-x-auto pb-1">
					<div class="flex items-start" style="min-width: min-content">
						<template v-for="(step, i) in WORKFLOW_STEPS" :key="step">
							<!-- Connector -->
							<div
								v-if="i > 0"
								class="mt-3 h-0.5 w-6 shrink-0 transition-colors"
								:class="currentStepIndex > i - 1 ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-slate-200 dark:bg-slate-700'"
							/>
							<!-- Step node + label -->
							<div class="flex w-16 shrink-0 flex-col items-center gap-1.5">
								<div
									class="flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all"
									:class="stepNodeClass(i)"
								>
									<i v-if="currentStepIndex > i" class="pi pi-check text-white" style="font-size: 9px" aria-hidden="true" />
									<span v-else-if="currentStepIndex === i" class="h-2.5 w-2.5 rounded-full bg-white dark:bg-sky-200" />
								</div>
								<span
									class="text-center text-[10px] font-medium leading-tight"
									:class="currentStepIndex === i ? 'text-sky-700 dark:text-sky-300 font-semibold' : currentStepIndex > i ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'"
								>{{ step }}</span>
							</div>
						</template>
					</div>
				</div>
			</div>

			<!-- Workshop details -->
			<div class="portal-card">
				<h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Workshop details</h2>
				<dl class="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
					<div>
						<dt class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Company</dt>
						<dd class="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200 break-all">{{ detailDoc.company || "—" }}</dd>
					</div>
					<div>
						<dt class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Warehouse</dt>
						<dd class="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200 break-all">{{ detailDoc.warehouse || "—" }}</dd>
					</div>
					<div>
						<dt class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Service advisor</dt>
						<dd class="mt-1 text-sm text-slate-700 dark:text-slate-300 break-all">{{ detailDoc.service_advisor || "—" }}</dd>
					</div>
					<div>
						<dt class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Appointment</dt>
						<dd class="mt-1 font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{{ detailDoc.appointment || "—" }}</dd>
					</div>
					<div>
						<dt class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Inspection</dt>
						<dd class="mt-1 font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{{ detailDoc.inspection || "—" }}</dd>
					</div>
					<div>
						<dt class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Quotation</dt>
						<dd class="mt-1 font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{{ detailDoc.quotation || "—" }}</dd>
					</div>
					<div>
						<dt class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Sales invoice</dt>
						<dd class="mt-1 font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{{ detailDoc.sales_invoice || "—" }}</dd>
					</div>
					<div v-if="detailDoc.complaint_summary" class="sm:col-span-2 lg:col-span-3">
						<dt class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Complaint</dt>
						<dd class="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{{ detailDoc.complaint_summary }}</dd>
					</div>
				</dl>
			</div>

			<!-- Line items -->
			<div class="portal-card space-y-6">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Mechanic line items</h2>
					<div class="flex flex-wrap gap-2">
						<Button size="small" class="portal-action-secondary" icon="pi pi-plus" label="Service" @click="addServiceLine" />
						<Button size="small" class="portal-action-secondary" icon="pi pi-plus" label="Part" @click="addPartLine" />
						<Button size="small" class="portal-action-primary" :disabled="lineItemsSaving" icon="pi pi-save" :label="lineItemsSaving ? 'Saving…' : 'Save'" @click="saveLineItems" />
					</div>
				</div>

				<p v-if="lineItemsError" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{{ lineItemsError }}</p>

				<!-- Services table -->
				<div>
					<div class="mb-2 flex items-center gap-2">
						<i class="pi pi-cog text-slate-400 dark:text-slate-500 text-xs" aria-hidden="true" />
						<h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
							Service items <span class="ml-1 font-normal normal-case text-slate-400">({{ (detailDoc.service_items || []).length }})</span>
						</h3>
					</div>
					<div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
						<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
							<thead>
								<tr class="bg-slate-50/80 dark:bg-slate-900/50">
									<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Item</th>
									<th class="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-24">Qty</th>
									<th class="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-28">Rate</th>
									<th class="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-28">Amount</th>
									<th class="px-3 py-2.5 w-10" />
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-transparent">
								<tr v-for="(row, idx) in detailDoc.service_items || []" :key="'s' + idx" class="group transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/20">
									<td class="px-3 py-2">
										<select v-model="row.item_code" class="portal-input !min-h-9 py-1.5 text-xs" @change="recalcRowAmount(row)">
											<option value="">Select service item…</option>
											<option v-for="it in itemOptions" :key="'svc-' + it.value" :value="it.value">{{ it.label }}</option>
										</select>
									</td>
									<td class="px-3 py-2">
										<UiInput v-model="row.qty" type="number" min="0" step="0.01" class="!min-h-9 py-1.5 text-xs text-right" @input="recalcRowAmount(row)" />
									</td>
									<td class="px-3 py-2">
										<UiInput v-model="row.rate" type="number" min="0" step="0.01" class="!min-h-9 py-1.5 text-xs text-right" @input="recalcRowAmount(row)" />
									</td>
									<td class="px-3 py-2 text-right font-medium tabular-nums text-slate-700 dark:text-slate-300">
										{{ fmtMoney(row.amount) }}
									</td>
									<td class="px-3 py-2">
										<button
											type="button"
											class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
											aria-label="Remove row"
											@click="removeServiceLine(idx)"
										>
											<i class="pi pi-times" style="font-size: 11px" />
										</button>
									</td>
								</tr>
								<tr v-if="!(detailDoc.service_items || []).length">
									<td colspan="5" class="px-3 py-8 text-center text-sm text-slate-400 dark:text-slate-600">
										No service items yet — click <strong class="text-slate-600 dark:text-slate-400">+ Service</strong> to add.
									</td>
								</tr>
							</tbody>
							<tfoot v-if="(detailDoc.service_items || []).length">
								<tr class="border-t border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30">
									<td colspan="3" class="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Subtotal</td>
									<td class="px-3 py-2.5 text-right text-sm font-bold tabular-nums text-slate-800 dark:text-slate-200">{{ fmtMoney(serviceSubtotal) }}</td>
									<td />
								</tr>
							</tfoot>
						</table>
					</div>
				</div>

				<!-- Parts table -->
				<div>
					<div class="mb-2 flex items-center gap-2">
						<i class="pi pi-box text-slate-400 dark:text-slate-500 text-xs" aria-hidden="true" />
						<h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
							Part items <span class="ml-1 font-normal normal-case text-slate-400">({{ (detailDoc.part_items || []).length }})</span>
						</h3>
					</div>
					<div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
						<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
							<thead>
								<tr class="bg-slate-50/80 dark:bg-slate-900/50">
									<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Item</th>
									<th class="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-24">Qty</th>
									<th class="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-28">Rate</th>
									<th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-36">Warehouse</th>
									<th class="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-28">Amount</th>
									<th class="px-3 py-2.5 w-10" />
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-transparent">
								<tr v-for="(row, idx) in detailDoc.part_items || []" :key="'p' + idx" class="group transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/20">
									<td class="px-3 py-2">
										<select v-model="row.item_code" class="portal-input !min-h-9 py-1.5 text-xs" @change="recalcRowAmount(row)">
											<option value="">Select part item…</option>
											<option v-for="it in itemOptions" :key="'prt-' + it.value" :value="it.value">{{ it.label }}</option>
										</select>
									</td>
									<td class="px-3 py-2">
										<UiInput v-model="row.qty" type="number" min="0" step="0.01" class="!min-h-9 py-1.5 text-xs text-right" @input="recalcRowAmount(row)" />
									</td>
									<td class="px-3 py-2">
										<UiInput v-model="row.rate" type="number" min="0" step="0.01" class="!min-h-9 py-1.5 text-xs text-right" @input="recalcRowAmount(row)" />
									</td>
									<td class="px-3 py-2">
										<select v-model="row.warehouse" class="portal-input !min-h-9 py-1.5 text-xs">
											<option value="">Optional…</option>
											<option v-for="w in warehouseOptions" :key="'w-' + w.value" :value="w.value">{{ w.label }}</option>
										</select>
									</td>
									<td class="px-3 py-2 text-right font-medium tabular-nums text-slate-700 dark:text-slate-300">
										{{ fmtMoney(row.amount) }}
									</td>
									<td class="px-3 py-2">
										<button
											type="button"
											class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
											aria-label="Remove row"
											@click="removePartLine(idx)"
										>
											<i class="pi pi-times" style="font-size: 11px" />
										</button>
									</td>
								</tr>
								<tr v-if="!(detailDoc.part_items || []).length">
									<td colspan="6" class="px-3 py-8 text-center text-sm text-slate-400 dark:text-slate-600">
										No part items yet — click <strong class="text-slate-600 dark:text-slate-400">+ Part</strong> to add.
									</td>
								</tr>
							</tbody>
							<tfoot v-if="(detailDoc.part_items || []).length">
								<tr class="border-t border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30">
									<td colspan="4" class="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Subtotal</td>
									<td class="px-3 py-2.5 text-right text-sm font-bold tabular-nums text-slate-800 dark:text-slate-200">{{ fmtMoney(partSubtotal) }}</td>
									<td />
								</tr>
							</tfoot>
						</table>
					</div>
				</div>

				<!-- Grand total -->
				<div v-if="(detailDoc.service_items || []).length || (detailDoc.part_items || []).length" class="flex justify-end">
					<div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
						<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Grand total</p>
						<p class="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-50">{{ fmtMoney(serviceSubtotal + partSubtotal) }}</p>
					</div>
				</div>
			</div>

			<!-- Linked records -->
			<div class="portal-card">
				<h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Linked records</h2>
				<div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
					<Button
						v-if="detailDoc.appointment"
						as="a"
						:href="deskFormUrl('Service Appointment', detailDoc.appointment)"
						target="_blank"
						rel="noopener noreferrer"
						severity="secondary"
						outlined
						class="portal-pv-desk-link !justify-start w-full gap-3"
						@click.stop
					>
						<i class="pi pi-calendar shrink-0" />
						<span class="min-w-0">
							<span class="block text-[10px] font-semibold uppercase tracking-wide opacity-60">Appointment</span>
							<span class="block truncate font-mono text-xs">{{ detailDoc.appointment }}</span>
						</span>
						<i class="pi pi-external-link ml-auto shrink-0 opacity-50" style="font-size: 10px" />
					</Button>
					<Button
						v-if="detailDoc.inspection"
						as="a"
						:href="deskFormUrl('Vehicle Inspection', detailDoc.inspection)"
						target="_blank"
						rel="noopener noreferrer"
						severity="secondary"
						outlined
						class="portal-pv-desk-link !justify-start w-full gap-3"
						@click.stop
					>
						<i class="pi pi-search shrink-0" />
						<span class="min-w-0">
							<span class="block text-[10px] font-semibold uppercase tracking-wide opacity-60">Inspection</span>
							<span class="block truncate font-mono text-xs">{{ detailDoc.inspection }}</span>
						</span>
						<i class="pi pi-external-link ml-auto shrink-0 opacity-50" style="font-size: 10px" />
					</Button>
					<Button
						v-if="detailDoc.quotation"
						as="a"
						:href="deskFormUrl('Quotation', detailDoc.quotation)"
						target="_blank"
						rel="noopener noreferrer"
						severity="secondary"
						outlined
						class="portal-pv-desk-link !justify-start w-full gap-3"
						@click.stop
					>
						<i class="pi pi-file shrink-0" />
						<span class="min-w-0">
							<span class="block text-[10px] font-semibold uppercase tracking-wide opacity-60">Quotation</span>
							<span class="block truncate font-mono text-xs">{{ detailDoc.quotation }}</span>
						</span>
						<i class="pi pi-external-link ml-auto shrink-0 opacity-50" style="font-size: 10px" />
					</Button>
					<Button
						v-if="detailDoc.sales_invoice"
						as="a"
						:href="deskFormUrl('Sales Invoice', detailDoc.sales_invoice)"
						target="_blank"
						rel="noopener noreferrer"
						severity="secondary"
						outlined
						class="portal-pv-desk-link !justify-start w-full gap-3"
						@click.stop
					>
						<i class="pi pi-receipt shrink-0" />
						<span class="min-w-0">
							<span class="block text-[10px] font-semibold uppercase tracking-wide opacity-60">Sales invoice</span>
							<span class="block truncate font-mono text-xs">{{ detailDoc.sales_invoice }}</span>
						</span>
						<i class="pi pi-external-link ml-auto shrink-0 opacity-50" style="font-size: 10px" />
					</Button>
					<p
						v-if="!detailDoc.appointment && !detailDoc.inspection && !detailDoc.quotation && !detailDoc.sales_invoice"
						class="col-span-full rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-500"
					>
						No linked records yet.
					</p>
				</div>
			</div>

		</template>

	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import { restResourceList, restResourceGet, frappeCall } from "../utils/api";
import { deskFormUrl } from "../utils/desk.js";
import WxBreadcrumb from "../components/layout/WxBreadcrumb.vue";
import WxToast from "../components/ui/WxToast.vue";
import UiInput from "../components/ui/UiInput.vue";
import { useCustomerMeta } from "../composables/useCustomerMeta.js";

const route = useRoute();
const toast = useToast();
const { customerDisplayName, customerAvatarSrc, customerInitials, enrichCustomersForRows } = useCustomerMeta();

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

const WORKFLOW_STEPS = [
	"Draft",
	"Checked In",
	"Inspected",
	"Estimated",
	"Approved",
	"In Progress",
	"Ready to Invoice",
	"Invoiced",
	"Closed",
];

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
	return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
}

function statusDotClass(status) {
	const s = String(status || "");
	if (s === "Invoiced" || s === "Closed") return "bg-emerald-500";
	if (s === "Cancelled") return "bg-red-500";
	if (s === "Ready to Invoice" || s === "Approved") return "bg-amber-500";
	if (s === "In Progress") return "bg-sky-500";
	return "bg-slate-400";
}

const currentStepIndex = computed(() => {
	const s = detailDoc.value?.status || "";
	const idx = WORKFLOW_STEPS.indexOf(s);
	return idx >= 0 ? idx : -1;
});

function stepNodeClass(i) {
	if (currentStepIndex.value > i)
		return "border-emerald-400 bg-emerald-400 dark:border-emerald-500 dark:bg-emerald-500";
	if (currentStepIndex.value === i)
		return "border-sky-500 bg-sky-500 dark:border-sky-400 dark:bg-sky-400";
	return "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900";
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
const workflowTransitions = ref([]);
const lineItemsSaving = ref(false);
const lineItemsError = ref("");
const itemOptions = ref([]);
const warehouseOptions = ref([]);

const serviceSubtotal = computed(() =>
	(detailDoc.value?.service_items || []).reduce((sum, r) => sum + toNum(r.amount, 0), 0)
);

const partSubtotal = computed(() =>
	(detailDoc.value?.part_items || []).reduce((sum, r) => sum + toNum(r.amount, 0), 0)
);

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
		await enrichCustomersForRows([detailDoc.value]);
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
	detailActionLoading.value = true;
	try {
		await frappeCall("frappe.model.workflow.apply_workflow", {
			doc: { doctype: "Job Card", name: detailName.value },
			action,
		});
		await refreshDetail();
	} catch (e) {
		toast.add({
			severity: "error",
			summary: "Workflow action failed",
			detail: e.message || "Workflow action failed",
			life: 4000,
		});
	} finally {
		detailActionLoading.value = false;
	}
}

async function runCreateQuotation() {
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
		toast.add({
			severity: "error",
			summary: "Could not create quotation",
			detail: e.message || "Could not create quotation",
			life: 4000,
		});
	} finally {
		detailActionLoading.value = false;
	}
}

async function runCreateSalesInvoice() {
	if (!window.confirm("This will create a Sales Invoice and update stock (same as Desk). Continue?")) {
		return;
	}
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
		toast.add({
			severity: "error",
			summary: "Could not create invoice",
			detail: e.message || "Could not create invoice",
			life: 4000,
		});
	} finally {
		detailActionLoading.value = false;
	}
}

watch(
	() => route.params.id,
	() => {
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
