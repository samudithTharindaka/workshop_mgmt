<template>
	<div class="mx-auto max-w-7xl min-w-0 space-y-8">
		<WxToast />
		<WxConfirmPopup />
		<WxBreadcrumb :items="breadcrumbItems" />
		
					<div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
			<div>
				<h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Service appointments</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Schedule, check-in, and follow-up</p>
			</div>
			<UiButton type="button" class="shrink-0" @click="openModal">
				<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
				</svg>
				New appointment
			</UiButton>
		</div>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="portal-card">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total loaded</p>
				<p class="mt-2 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">{{ stats.total }}</p>
				<p class="mt-1 text-xs text-slate-500">Recent window</p>
			</div>
			<div class="portal-card">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Scheduled</p>
				<p class="mt-2 text-2xl font-semibold tabular-nums text-amber-800 dark:text-amber-200">{{ stats.scheduled }}</p>
			</div>
			<div class="portal-card">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">On site</p>
				<p class="mt-2 text-2xl font-semibold tabular-nums text-sky-700 dark:text-sky-300">{{ stats.onSite }}</p>
			</div>
			<div class="portal-card">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Completed</p>
				<p class="mt-2 text-2xl font-semibold tabular-nums text-emerald-800 dark:text-emerald-200">{{ stats.completed }}</p>
			</div>
		</div>



		<p v-if="listError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
			{{ listError }}
		</p>
		<p v-if="cancelError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
			{{ cancelError }}
		</p>

		<div class="portal-filter-bar rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
			<div class="mb-3 flex items-center justify-between gap-3">
				<div class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
					<i class="pi pi-sliders-h text-slate-500 dark:text-slate-400" aria-hidden="true" />
					<span>Filter appointments</span>
				</div>
			</div>
			<div class="flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-end">
				<div class="w-full sm:max-w-[14rem]">
					<label class="portal-label inline-flex items-center gap-1.5" for="appt-filter-status">
						<i class="pi pi-tag text-xs text-slate-500" aria-hidden="true" />
						<span>Status</span>
					</label>
				<UiSelect
					id="appt-filter-status"
					v-model="filterStatus"
					:options="statusOptions"
					placeholder="All statuses"
					:pt="{
						root: {
							style: {
								background: '#ffffff',
								border: '1px solid #cbd5e1',
								borderRadius: '10px',
								minHeight: '2.75rem',
								height: '2.75rem',
								display: 'flex',
								alignItems: 'center',
								flexWrap: 'nowrap'
							}
						},
						label: {
							style: {
								background: '#ffffff',
								color: '#334155',
								padding: '0.45rem 0.7rem',
								flex: '1 1 auto',
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis'
							}
						},
						dropdown: {
							style: {
								background: '#ffffff',
								color: '#334155',
								marginLeft: 'auto',
								alignSelf: 'stretch',
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								padding: '0 0.65rem',
								borderLeft: '1px solid #e2e8f0'
							}
						},
						overlay: {
							style: {
								background: '#ffffff',
								border: '1px solid #cbd5e1',
								borderRadius: '10px',
								boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)'
							}
						},
						list: { style: { background: '#ffffff', color: '#334155' } },
						option: { style: { background: '#ffffff', color: '#334155' } }
					}"
				/>
				</div>
				<div class="w-full sm:max-w-[11rem]">
					<label class="portal-label inline-flex items-center gap-1.5" for="appt-filter-from">
						<i class="pi pi-calendar-plus text-xs text-slate-500" aria-hidden="true" />
						<span>Scheduled from</span>
					</label>
					<UiInput id="appt-filter-from" v-model="filterDateFrom" type="date" />
				</div>
				<div class="w-full sm:max-w-[11rem]">
					<label class="portal-label inline-flex items-center gap-1.5" for="appt-filter-to">
						<i class="pi pi-calendar-minus text-xs text-slate-500" aria-hidden="true" />
						<span>Scheduled to</span>
					</label>
					<UiInput id="appt-filter-to" v-model="filterDateTo" type="date" />
				</div>
				<div class="min-w-0 flex-1 lg:min-w-[16rem]">
					<label class="portal-label inline-flex items-center gap-1.5" for="appt-filter-customer">
						<i class="pi pi-user text-xs text-slate-500" aria-hidden="true" />
						<span>Customer</span>
					</label>
					<UiSelect
						id="appt-filter-customer"
						v-model="filterCustomer"
						:options="customerFilterOptions"
						placeholder="All customers"
						:pt="{
							root: {
								style: {
									background: '#ffffff',
									border: '1px solid #cbd5e1',
									borderRadius: '10px',
								minHeight: '2.75rem',
								height: '2.75rem',
									display: 'flex',
									alignItems: 'center',
									flexWrap: 'nowrap'
								}
							},
							label: {
								style: {
									background: '#ffffff',
									color: '#334155',
									padding: '0.45rem 0.7rem',
									flex: '1 1 auto',
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis'
								}
							},
							dropdown: {
								style: {
									background: '#ffffff',
									color: '#334155',
									marginLeft: 'auto',
									alignSelf: 'stretch',
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									padding: '0 0.65rem',
									borderLeft: '1px solid #e2e8f0'
								}
							},
							overlay: {
								style: {
									background: '#ffffff',
									border: '1px solid #cbd5e1',
									borderRadius: '10px',
									boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)'
								}
							},
							list: { style: { background: '#ffffff', color: '#334155' } },
							option: { style: { background: '#ffffff', color: '#334155' } }
						}"
					/>
				</div>
				<Button
					type="button"
					severity="contrast"
					icon="pi pi-filter-slash"
					label="Clear filters"
					class="!min-h-10 !shrink-0 !rounded-lg !border-0 !px-4 !text-white"
					style="background: linear-gradient(135deg, #334155 0%, #1e293b 100%);"
					@click="clearListFilters"
				/>
			</div>
		</div>

		<div class="portal-table-wrap">
			<DataTable
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
				table-style="min-width: 42rem"
				@row-click="openDetail($event.data.name)"
			>
			
				<template #paginatorstart>
					<div style="display: flex; align-items: center; justify-content: center; padding: 0 12px;">
						<Button
							type="button"
							icon="pi pi-refresh"
							text
							aria-label="Refresh list"
							style="border: 1px solid #cbd5e1; border-radius: 10px; width: 2.25rem; height: 2.25rem; color: #334155; background: #ffffff;"
							@mouseenter="(event) => { event.currentTarget.style.background = '#f8fafc'; event.currentTarget.style.borderColor = '#94a3b8'; }"
							@mouseleave="(event) => { event.currentTarget.style.background = '#ffffff'; event.currentTarget.style.borderColor = '#cbd5e1'; }"
							@click="loadList"
						/>
					</div>
				</template>
				<template #paginatorend>
					<div style="display: flex; align-items: center; justify-content: center; padding: 0 12px;">
						<Button
							type="button"
							icon="pi pi-download"
							text
							aria-label="Download CSV"
							style="border: 1px solid #cbd5e1; border-radius: 10px; width: 2.25rem; height: 2.25rem; color: #334155; background: #ffffff;"
							@mouseenter="(event) => { event.currentTarget.style.background = '#f8fafc'; event.currentTarget.style.borderColor = '#94a3b8'; }"
							@mouseleave="(event) => { event.currentTarget.style.background = '#ffffff'; event.currentTarget.style.borderColor = '#cbd5e1'; }"
							@click="downloadAppointmentsCsv"
						/>
					</div>
				</template>
				<template #empty>
					{{ allRows.length ? "No matches — adjust filters" : "No appointments" }}
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
				<Column header-style="min-width: 10rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-calendar" aria-hidden="true" />
							<span>Scheduled</span>
						</div>
					</template>
					<template #body="{ data }">
						<span class="tabular-nums text-sm text-slate-600 dark:text-slate-400">{{ formatDt(data.scheduled_start) }}</span>
					</template>
				</Column>
				<Column header-style="min-width: 9rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-clock" aria-hidden="true" />
							<span>Countdown</span>
						</div>
					</template>
					<template #body="{ data }">
						<span class="text-sm font-medium tabular-nums" :class="countdownClass(data)">{{ scheduleCountdown(data) }}</span>
					</template>
				</Column>
				<Column field="status" header-style="min-width: 8rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-verified" aria-hidden="true" />
							<span>Status</span>
						</div>
					</template>
					<template #body="{ data }">
						<span class="inline-flex min-h-7 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusPillClass(data.status)">
							{{ data.status }}
						</span>
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
								:href="deskFormUrl('Service Appointment', data.name)"
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
							<WxDangerButton
								v-if="canCancelAppointment(data.status)"
								size="small"
								class="!shrink-0 !whitespace-nowrap"
								label="Cancel"
								icon="pi pi-times"
								:loading="cancellingName === data.name"
								:disabled="cancellingName !== '' && cancellingName !== data.name"
								@click.stop="confirmCancelAppointment($event, data.name)"
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
					v-if="detailOpen"
					class="fixed inset-0 z-[55] flex justify-end bg-black/50 backdrop-blur-sm"
					role="presentation"
				>
					<div class="min-w-0 flex-1" @click="closeDetail" />
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
											v-if="detailName"
											as="a"
											:href="deskFormUrl('Service Appointment', detailName)"
											target="_blank"
											rel="noopener noreferrer"
											class="!border-white/30 !bg-white/10 !px-3 !py-1.5 !text-xs !font-semibold !text-white backdrop-blur-md transition hover:!bg-white/20 rounded-lg"
											icon="pi pi-external-link"
											label="Open in Desk"
										/>
									</div>
								</div>
								<button type="button" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20" @click="closeDetail" aria-label="Close">
									<i class="pi pi-times" aria-hidden="true" />
								</button>
							</div>

							<div v-if="detailLoading" class="relative z-10 mt-auto py-8 text-center text-sm font-medium text-sky-100">Loading…</div>
							
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

						<template v-if="!detailLoading && detailDoc">

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
									:disabled="detailActionLoading"
									@click="runCheckIn"
								>
									Check in
								</button>

								<template v-if="detailDoc.status === 'Checked-In'">
									<button
										v-if="!detailDoc.inspection"
										type="button"
										class="portal-btn-primary w-full !bg-sky-600 hover:!bg-sky-500 focus:!ring-sky-500/35"
										:disabled="detailActionLoading"
										@click="runCreateInspection"
									>
										Create inspection
									</button>
									<button
										v-if="!detailDoc.job_card"
										type="button"
										class="portal-btn-primary w-full !bg-amber-600 hover:!bg-amber-500 focus:!ring-amber-500/35"
										:disabled="detailActionLoading"
										@click="openJobCardWizard"
									>
										Create job card
									</button>
								</template>

								<button
									v-if="detailDoc.status === 'In Progress'"
									type="button"
									class="portal-btn-primary w-full !bg-slate-800 hover:!bg-slate-700 focus:!ring-slate-500/35 dark:!bg-slate-100 dark:!text-slate-900 dark:hover:!bg-white"
									:disabled="detailActionLoading"
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
									:loading="cancellingName === detailName"
									:disabled="detailActionLoading"
									@click="confirmCancelAppointment($event, detailName, true)"
								/>
							</div>
						</template>
						<p v-else-if="detailError" class="text-sm text-red-700 dark:text-red-300">{{ detailError }}</p>
						<p v-if="detailActionError" class="mt-3 text-sm text-red-700 dark:text-red-300">{{ detailActionError }}</p>
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

		<Teleport to="body">
			<div
				v-if="modalOpen"
				class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
				@click.self="modalOpen = false"
			>
				<div class="portal-modal-panel max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
					<h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">New service appointment</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-500">Customer, vehicle, and schedule.</p>
					<div class="mt-6 space-y-4">
						<div>
							<div class="mb-2 flex items-center justify-between gap-2">
								<label class="portal-label !mb-0">Customer</label>
								<button
									type="button"
									class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950/30"
									@click="openNewCustomerModal"
								>
									<i class="pi pi-plus" style="font-size: 9px" aria-hidden="true" />
									New
								</button>
							</div>
							<UiSelect
								v-model="form.customer"
								:options="customerSelectOptions"
								:filter="true"
								filter-placeholder="Search customers…"
								:placeholder="loadingCustomers ? 'Loading customers…' : 'Select customer…'"
								:disabled="loadingCustomers"
								:pt="customerVehicleSelectPt"
								@update:model-value="onCustomerChange"
							/>
						</div>
						<div>
							<div class="mb-2 flex items-center justify-between gap-2">
								<label class="portal-label !mb-0">Vehicle</label>
								<button
									type="button"
									class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-brand-300 dark:hover:bg-brand-950/30"
									:disabled="!form.customer"
									:title="form.customer ? 'Add a vehicle for this customer' : 'Pick a customer first'"
									@click="openNewVehicleModal"
								>
									<i class="pi pi-plus" style="font-size: 9px" aria-hidden="true" />
									New
								</button>
							</div>
							<UiSelect
								v-model="form.vehicle"
								:options="vehicleSelectOptions"
								:filter="vehicles.length > 5"
								filter-placeholder="Search vehicles…"
								:placeholder="vehicleSelectPlaceholder"
								:disabled="!form.customer || loadingVehicles"
								:pt="customerVehicleSelectPt"
							/>
							<p v-if="form.customer && !loadingVehicles && !vehicles.length" class="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
								<i class="pi pi-info-circle opacity-70" style="font-size: 11px" aria-hidden="true" />
								No vehicles for this customer — click "+ New" to add one.
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
							<input v-model="form.service_advisor" class="portal-input" placeholder="User ID" />
						</div>
						<div>
							<label class="portal-label">Remarks</label>
							<textarea v-model="form.remarks" rows="3" class="portal-input resize-y" />
						</div>
					</div>
					<p v-if="pickerError" class="mt-4 text-sm text-amber-600 dark:text-amber-400">{{ pickerError }}</p>
					<p v-if="saveError" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ saveError }}</p>
					<div class="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
						<UiButton type="button" variant="secondary" @click="modalOpen = false">Cancel</UiButton>
						<UiButton type="button" :disabled="saving" @click="submit">{{ saving ? "Saving…" : "Create" }}</UiButton>
					</div>
				</div>
			</div>
		</Teleport>

		<!-- Quick-create: new customer -->
		<Teleport to="body">
			<div
				v-if="newCustomerOpen"
				class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
				@click.self="newCustomerOpen = false"
			>
				<div class="portal-modal-panel" role="dialog" aria-modal="true">
					<div class="flex items-start gap-3">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
							<i class="pi pi-user-plus" style="font-size: 16px" aria-hidden="true" />
						</div>
						<div class="min-w-0">
							<h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">New customer</h3>
							<p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Quick-create. You can fill in the rest in Desk later.</p>
						</div>
					</div>
					<div class="mt-6 space-y-4">
						<div>
							<label class="portal-label">Customer name <span class="text-red-500">*</span></label>
							<input
								v-model="newCustomerForm.customer_name"
								class="portal-input"
								placeholder="e.g. Acme Industries"
								autofocus
								@keydown.enter.prevent="submitNewCustomer"
							/>
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label class="portal-label">Mobile <span class="font-normal normal-case text-slate-400">(optional)</span></label>
								<input v-model="newCustomerForm.mobile_no" class="portal-input" placeholder="+1 555 0123" />
							</div>
							<div>
								<label class="portal-label">Email <span class="font-normal normal-case text-slate-400">(optional)</span></label>
								<input v-model="newCustomerForm.email_id" type="email" class="portal-input" placeholder="contact@acme.com" />
							</div>
						</div>
					</div>
					<p v-if="newCustomerError" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
						<i class="pi pi-times-circle mr-1.5 opacity-70" aria-hidden="true" />{{ newCustomerError }}
					</p>
					<div class="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
						<UiButton type="button" variant="secondary" @click="newCustomerOpen = false">Cancel</UiButton>
						<UiButton
							type="button"
							:disabled="newCustomerSaving || !newCustomerForm.customer_name.trim()"
							@click="submitNewCustomer"
						>
							{{ newCustomerSaving ? "Creating…" : "Create customer" }}
						</UiButton>
					</div>
				</div>
			</div>
		</Teleport>

		<!-- Quick-create: new vehicle -->
		<Teleport to="body">
			<div
				v-if="newVehicleOpen"
				class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
				@click.self="newVehicleOpen = false"
			>
				<div class="portal-modal-panel" role="dialog" aria-modal="true">
					<div class="flex items-start gap-3">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
							<i class="pi pi-car" style="font-size: 16px" aria-hidden="true" />
						</div>
						<div class="min-w-0">
							<h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">New vehicle</h3>
							<p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
								For customer
								<span class="font-mono text-xs font-semibold text-brand-700 dark:text-brand-300">{{ form.customer }}</span>
							</p>
						</div>
					</div>
					<div class="mt-6 space-y-4">
						<div>
							<label class="portal-label">License plate <span class="text-red-500">*</span></label>
							<input
								v-model="newVehicleForm.license_plate"
								class="portal-input"
								placeholder="ABC-1234"
								autofocus
								@keydown.enter.prevent="submitNewVehicle"
							/>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="portal-label">Make</label>
								<input v-model="newVehicleForm.make" class="portal-input" placeholder="Toyota" />
							</div>
							<div>
								<label class="portal-label">Model</label>
								<input v-model="newVehicleForm.model" class="portal-input" placeholder="Corolla" />
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="portal-label">Year</label>
								<input v-model="newVehicleForm.year" type="number" min="1900" max="2099" class="portal-input" placeholder="2024" />
							</div>
							<div>
								<label class="portal-label">Color</label>
								<input v-model="newVehicleForm.color" class="portal-input" placeholder="Black" />
							</div>
						</div>
						<div>
							<label class="portal-label">VIN <span class="font-normal normal-case text-slate-400">(optional)</span></label>
							<input v-model="newVehicleForm.vin" class="portal-input" placeholder="17-character VIN" />
						</div>
					</div>
					<p v-if="newVehicleError" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
						<i class="pi pi-times-circle mr-1.5 opacity-70" aria-hidden="true" />{{ newVehicleError }}
					</p>
					<div class="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
						<UiButton type="button" variant="secondary" @click="newVehicleOpen = false">Cancel</UiButton>
						<UiButton
							type="button"
							:disabled="newVehicleSaving || !newVehicleForm.license_plate.trim()"
							@click="submitNewVehicle"
						>
							{{ newVehicleSaving ? "Creating…" : "Create vehicle" }}
						</UiButton>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { restResourceList, restResourceGet, restInsert, frappeCall } from "../utils/api";
import { deskFormUrl } from "../utils/desk.js";
import { downloadCsv } from "../utils/csv.js";
import { dataTablePaginatorPt } from "../utils/dataTablePaginatorPt.js";
import { useCustomerVehicleSelects } from "../composables/useCustomerVehicleSelects";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import WxBreadcrumb from "../components/layout/WxBreadcrumb.vue";
import WxConfirmPopup from "../components/ui/WxConfirmPopup.vue";
import UiButton from "../components/ui/UiButton.vue";
import UiInput from "../components/ui/UiInput.vue";
import UiSelect from "../components/ui/UiSelect.vue";
import WxToast from "../components/ui/WxToast.vue";
import WxDangerButton from "../components/ui/WxDangerButton.vue";

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const breadcrumbItems = [
	{ label: "Workshop", to: "/" },
	{ label: "Appointments" },
];

const LIST_FIELDS =
	'["name","customer","vehicle","status","scheduled_start","scheduled_end","inspection","job_card","remarks","service_advisor"]';

const APPOINTMENT_STATUS_OPTIONS = [
	"Scheduled",
	"Checked-In",
	"In Progress",
	"Cancelled",
	"Completed",
	"No-Show",
];

const statusOptions = computed(() => [
	{ label: "All statuses", value: "" },
	...APPOINTMENT_STATUS_OPTIONS.map((s) => ({ label: s, value: s })),
]);

const tableRows = ref(10);
const tableFirst = ref(0);
const loading = ref(true);
const listError = ref("");
const allRows = ref([]);
const filterStatus = ref("");
const filterDateFrom = ref("");
const filterDateTo = ref("");
const filterCustomer = ref("");

const customerRows = ref([]);
const customerFilterOptions = computed(() => [
	{ label: "All customers", value: "" },
	...customerRows.value.map((c) => ({
		label: (c.customer_name || "").trim() || c.name,
		value: c.name,
	})),
]);

/** @type {import('vue').Ref<Record<string, { customer_name?: string; image?: string }>>} */
const customerMeta = ref({});

const nowTick = ref(Date.now());
let countdownTimer;

const stats = computed(() => {
	const list = allRows.value || [];
	const c = (s) => list.filter((r) => (r.status || "") === s).length;
	return {
		total: list.length,
		scheduled: c("Scheduled"),
		onSite: c("Checked-In") + c("In Progress"),
		completed: c("Completed"),
	};
});

function scheduleDateKey(iso) {
	if (!iso) return "";
	const s = String(iso).trim();
	const day = s.length >= 10 ? s.slice(0, 10) : "";
	return day;
}

const filteredRows = computed(() => {
	let list = allRows.value || [];
	const st = filterStatus.value;
	if (st) list = list.filter((r) => (r.status || "") === st);
	const cust = filterCustomer.value;
	if (cust) list = list.filter((r) => (r.customer || "") === cust);

	const from = filterDateFrom.value;
	const to = filterDateTo.value;
	if (from) {
		list = list.filter((r) => scheduleDateKey(r.scheduled_start) >= from);
	}
	if (to) {
		list = list.filter((r) => scheduleDateKey(r.scheduled_start) <= to);
	}
	return list;
});

watch([filterStatus, filterDateFrom, filterDateTo, filterCustomer], () => {
	tableFirst.value = 0;
	cancelError.value = "";
});

function statusPillClass(status) {
	if (status === "Completed") return "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200";
	if (status === "In Progress" || status === "Checked-In")
		return "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100";
	if (status === "Cancelled" || status === "No-Show")
		return "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200";
	if (status === "Scheduled") return "bg-amber-100 text-amber-950 dark:bg-amber-500/20 dark:text-amber-100";
	return "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300";
}

function customerDisplayName(customerId) {
	if (!customerId) return "—";
	const m = customerMeta.value[customerId];
	if (m?.customer_name) return m.customer_name;
	return customerId;
}

function customerAvatarSrc(customerId) {
	const img = customerMeta.value[customerId]?.image;
	if (!img || !String(img).trim()) return "";
	const u = String(img).trim();
	if (u.startsWith("http://") || u.startsWith("https://")) return u;
	return u.startsWith("/") ? u : `/${u}`;
}

function customerInitials(customerId) {
	const name = customerDisplayName(customerId);
	const s = (name || "?").trim();
	if (!s) return "?";
	const parts = s.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	return s.slice(0, 2).toUpperCase();
}

function parseScheduleMs(iso) {
	if (!iso) return NaN;
	const s = String(iso).trim().replace(" ", "T");
	const t = Date.parse(s);
	return Number.isFinite(t) ? t : NaN;
}

function formatDuration(ms) {
	if (!Number.isFinite(ms) || ms <= 0) return "Due now";
	const sec = Math.floor(ms / 1000);
	const d = Math.floor(sec / 86400);
	const h = Math.floor((sec % 86400) / 3600);
	const m = Math.floor((sec % 3600) / 60);
	const x = sec % 60;
	if (d > 0) return `${d}d ${h}h ${m}m`;
	if (h > 0) return `${h}h ${m}m ${x}s`;
	if (m > 0) return `${m}m ${x}s`;
	return `${x}s`;
}

function scheduleCountdown(row) {
	const status = row?.status;
	const start = row?.scheduled_start;
	const terminal = ["Completed", "Cancelled", "No-Show"];
	if (terminal.includes(status || "")) return "—";
	const target = parseScheduleMs(start);
	if (!Number.isFinite(target)) return "—";
	const ms = target - nowTick.value;
	if (status === "Scheduled") {
		if (ms <= 0) return "Overdue";
		return formatDuration(ms);
	}
	if (status === "Checked-In" || status === "In Progress") {
		if (ms > 0) return formatDuration(ms);
		return "Started";
	}
	return "—";
}

function countdownClass(row) {
	const status = row?.status;
	if (status !== "Scheduled") return "text-slate-600 dark:text-slate-400";
	const ms = parseScheduleMs(row?.scheduled_start) - nowTick.value;
	if (!Number.isFinite(ms)) return "text-slate-600 dark:text-slate-400";
	if (ms <= 0) return "text-red-600 dark:text-red-400";
	if (ms < 3600000) return "text-amber-700 dark:text-amber-300";
	return "text-emerald-700 dark:text-emerald-300";
}

function formatDt(v) {
	if (!v) return "—";
	const t = parseScheduleMs(v);
	if (!Number.isFinite(t)) return "—";
	return new Date(t).toLocaleString();
}

async function loadCustomerDirectory() {
	try {
		customerRows.value = await restResourceList("Customer", {
			fields: '["name","customer_name","image"]',
			order_by: "customer_name asc",
			limit_page_length: 500,
		});
		const map = { ...customerMeta.value };
		for (const c of customerRows.value) {
			map[c.name] = { customer_name: c.customer_name || "", image: c.image || "" };
		}
		customerMeta.value = map;
	} catch {
		customerRows.value = [];
	}
}

async function enrichCustomersForRows(rows) {
	const ids = [...new Set((rows || []).map((r) => r.customer).filter(Boolean))];
	const missing = ids.filter((id) => !customerMeta.value[id]);
	if (!missing.length) return;
	try {
		const chunk = await restResourceList("Customer", {
			fields: '["name","customer_name","image"]',
			filters: [["name", "in", missing]],
			limit_page_length: missing.length + 10,
		});
		const map = { ...customerMeta.value };
		for (const c of chunk || []) {
			map[c.name] = { customer_name: c.customer_name || "", image: c.image || "" };
		}
		customerMeta.value = map;
	} catch {
		/* ignore */
	}
}

async function loadList() {
	loading.value = true;
	listError.value = "";
	try {
		const data = await restResourceList("Service Appointment", {
			fields: LIST_FIELDS,
			order_by: "scheduled_start desc",
			limit_page_length: 100,
		});
		allRows.value = data;
		await enrichCustomersForRows(data);
		const len = filteredRows.value.length;
		const per = tableRows.value;
		if (len === 0) tableFirst.value = 0;
		else if (tableFirst.value >= len) tableFirst.value = Math.max(0, (Math.ceil(len / per) - 1) * per);
	} catch (e) {
		listError.value = e.message || "Failed to load list";
	} finally {
		loading.value = false;
	}
}

function clearListFilters() {
	filterStatus.value = "";
	filterDateFrom.value = "";
	filterDateTo.value = "";
	filterCustomer.value = "";
}

function downloadAppointmentsCsv() {
	const headers = ["Customer", "Vehicle", "Status", "Scheduled start", "Scheduled end"];
	const list = filteredRows.value || [];
	const rows = list.map((r) => [
		customerDisplayName(r.customer),
		r.vehicle || "",
		r.status || "",
		r.scheduled_start || "",
		r.scheduled_end || "",
	]);
	downloadCsv(`service-appointments-${Date.now()}.csv`, headers, rows);
}

const cancelError = ref("");
const cancellingName = ref("");

function canCancelAppointment(status) {
	return status === "Scheduled" || status === "Checked-In";
}

function confirmCancelAppointment(event, name, fromDetail = false) {
	confirm.require({
		header: 'Cancel Appointment',
		message: 'Are you sure you want to cancel this appointment?',
		icon: 'pi pi-exclamation-triangle',
		acceptLabel: 'Yes, cancel it',
		rejectLabel: 'Keep it',
		accept: () => {
			runCancelAppointment(name, fromDetail);
		}
	});
}

async function runCancelAppointment(name, fromDetail = false) {
	cancelError.value = "";
	detailActionError.value = "";
	cancellingName.value = name;
	try {
		await frappeCall("workshop_mgmt.api.appointment_cancel", { name });
		await loadList();
		if (fromDetail) await refreshDetail();
		toast.add({
			severity: "success",
			summary: "Appointment cancelled",
			detail: `${name} was set to Cancelled.`,
			life: 2800,
		});
	} catch (e) {
		const msg = e.message || "Could not cancel";
		if (fromDetail) detailActionError.value = msg;
		else cancelError.value = msg;
		toast.add({
			severity: "error",
			summary: "Cancel failed",
			detail: msg,
			life: 3600,
		});
	} finally {
		cancellingName.value = "";
	}
}

function goOpenJobCard(name) {
	closeDetail();
	router.push({ name: "job-card-detail", params: { id: name } });
}

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
	loadVehiclesForCustomer,
	onCustomerChange,
	resetPickerLists,
} = useCustomerVehicleSelects(form);

// Customer + vehicle options shaped for UiSelect (PrimeVue Select)
const customerSelectOptions = computed(() =>
	customers.value.map((c) => ({ label: formatCustomerOption(c), value: c.name }))
);
const vehicleSelectOptions = computed(() =>
	vehicles.value.map((v) => ({ label: formatVehicleOption(v), value: v.name }))
);

// Shared PrimeVue Select PT: clean, light, brand-aligned overlay
const customerVehicleSelectPt = {
	root: {
		style: {
			background: "#ffffff",
			border: "1px solid #e2e8f0",
			borderRadius: "12px",
			minHeight: "2.75rem",
			height: "2.75rem",
			display: "flex",
			alignItems: "center",
			flexWrap: "nowrap",
			boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
		},
	},
	label: {
		style: {
			background: "#ffffff",
			color: "#0f172a",
			padding: "0.55rem 0.85rem",
			flex: "1 1 auto",
			whiteSpace: "nowrap",
			overflow: "hidden",
			textOverflow: "ellipsis",
		},
	},
	dropdown: {
		style: {
			background: "#ffffff",
			color: "#64748b",
			marginLeft: "auto",
			alignSelf: "stretch",
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "0 0.7rem",
			borderLeft: "1px solid #e2e8f0",
		},
	},
	overlay: {
		style: {
			background: "#ffffff",
			border: "1px solid #e2e8f0",
			borderRadius: "12px",
			boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
			marginTop: "4px",
			overflow: "hidden",
		},
	},
	listContainer: { style: { background: "#ffffff" } },
	list: { style: { background: "#ffffff", padding: "0.375rem" } },
	option: {
		style: {
			background: "#ffffff",
			color: "#334155",
			padding: "0.55rem 0.75rem",
			borderRadius: "8px",
			fontSize: "0.875rem",
			cursor: "pointer",
			transition: "background-color 0.15s ease, color 0.15s ease",
		},
	},
	header: {
		style: {
			background: "#f8fafc",
			padding: "0.5rem",
			borderBottom: "1px solid #e2e8f0",
		},
	},
	pcFilter: {
		root: {
			style: {
				width: "100%",
				background: "#ffffff",
				border: "1px solid #e2e8f0",
				borderRadius: "8px",
				padding: "0.45rem 0.65rem",
				fontSize: "0.85rem",
				color: "#334155",
			},
		},
	},
	emptyMessage: {
		style: {
			padding: "0.75rem",
			color: "#94a3b8",
			textAlign: "center",
			fontSize: "0.8rem",
		},
	},
};

const modalOpen = ref(false);
const saving = ref(false);
const saveError = ref("");

// ── Quick-create: new customer ────────────────────────────────────────────────
const newCustomerOpen = ref(false);
const newCustomerSaving = ref(false);
const newCustomerError = ref("");
const newCustomerForm = reactive({
	customer_name: "",
	mobile_no: "",
	email_id: "",
});

function openNewCustomerModal() {
	newCustomerError.value = "";
	newCustomerForm.customer_name = "";
	newCustomerForm.mobile_no = "";
	newCustomerForm.email_id = "";
	newCustomerOpen.value = true;
}

async function submitNewCustomer() {
	const name = newCustomerForm.customer_name.trim();
	if (!name) {
		newCustomerError.value = "Customer name is required.";
		return;
	}
	newCustomerError.value = "";
	newCustomerSaving.value = true;
	try {
		const doc = {
			customer_name: name,
			customer_type: "Individual",
		};
		if (newCustomerForm.mobile_no.trim()) doc.mobile_no = newCustomerForm.mobile_no.trim();
		if (newCustomerForm.email_id.trim()) doc.email_id = newCustomerForm.email_id.trim();
		const created = await restInsert("Customer", doc);
		newCustomerOpen.value = false;
		await loadCustomersForModal();
		await loadCustomerDirectory();
		form.customer = created.name;
		await onCustomerChange();
		toast.add({
			severity: "success",
			summary: "Customer created",
			detail: created.customer_name || created.name,
			life: 2500,
		});
	} catch (e) {
		newCustomerError.value = e.message || "Could not create customer";
	} finally {
		newCustomerSaving.value = false;
	}
}

// ── Quick-create: new vehicle ─────────────────────────────────────────────────
const newVehicleOpen = ref(false);
const newVehicleSaving = ref(false);
const newVehicleError = ref("");
const newVehicleForm = reactive({
	license_plate: "",
	make: "",
	model: "",
	year: "",
	color: "",
	vin: "",
});

function openNewVehicleModal() {
	if (!form.customer) return;
	newVehicleError.value = "";
	newVehicleForm.license_plate = "";
	newVehicleForm.make = "";
	newVehicleForm.model = "";
	newVehicleForm.year = "";
	newVehicleForm.color = "";
	newVehicleForm.vin = "";
	newVehicleOpen.value = true;
}

async function submitNewVehicle() {
	const plate = newVehicleForm.license_plate.trim();
	if (!plate) {
		newVehicleError.value = "License plate is required.";
		return;
	}
	if (!form.customer) {
		newVehicleError.value = "Pick a customer first.";
		return;
	}
	newVehicleError.value = "";
	newVehicleSaving.value = true;
	try {
		const doc = {
			customer: form.customer,
			license_plate: plate,
		};
		if (newVehicleForm.make.trim()) doc.make = newVehicleForm.make.trim();
		if (newVehicleForm.model.trim()) doc.model = newVehicleForm.model.trim();
		if (newVehicleForm.year) doc.year = Number(newVehicleForm.year);
		if (newVehicleForm.color.trim()) doc.color = newVehicleForm.color.trim();
		if (newVehicleForm.vin.trim()) doc.vin = newVehicleForm.vin.trim();
		const created = await restInsert("Vehicle", doc);
		newVehicleOpen.value = false;
		await loadVehiclesForCustomer(form.customer);
		form.vehicle = created.name;
		toast.add({
			severity: "success",
			summary: "Vehicle created",
			detail: created.license_plate || created.name,
			life: 2500,
		});
	} catch (e) {
		newVehicleError.value = e.message || "Could not create vehicle";
	} finally {
		newVehicleSaving.value = false;
	}
}

function pad2(n) {
	return String(n).padStart(2, "0");
}
function toLocal(dt) {
	return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}T${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
}

function localToFrappe(val) {
	if (!val) return "";
	let s = String(val).replace("T", " ");
	if (s.length === 16) s += ":00";
	return s;
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
	if (jcWarehousesLoading.value) return "Loading…";
	if (!jcCompany.value) return "Select company first…";
	return "Select warehouse…";
});

function formatWarehouseOption(w) {
	if (w.warehouse_name && w.warehouse_name !== w.name) return `${w.warehouse_name} (${w.name})`;
	return w.name;
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

async function refreshDetail() {
	if (!detailName.value) return;
	detailLoading.value = true;
	detailError.value = "";
	try {
		detailDoc.value = await restResourceGet("Service Appointment", detailName.value);
		if (detailDoc.value?.customer) {
			await enrichCustomersForRows([{ customer: detailDoc.value.customer }]);
		}
	} catch (e) {
		detailDoc.value = null;
		detailError.value = e.message || "Failed to load appointment";
	} finally {
		detailLoading.value = false;
	}
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
		detailActionError.value = e.message || "Could not mark complete";
	} finally {
		detailActionLoading.value = false;
	}
}

async function runCreateInspection() {
	detailActionError.value = "";
	detailActionLoading.value = true;
	try {
		await frappeCall("workshop_mgmt.api.create_inspection_for_appointment", { appointment: detailName.value });
		await refreshDetail();
		await loadList();
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
		await refreshDetail();
		if (msg?.name) {
			closeDetail();
			router.push({ name: "job-card-detail", params: { id: String(msg.name) } });
		}
	} catch (e) {
		jcError.value = e.message || "Could not create job card";
	} finally {
		jcSubmitting.value = false;
	}
}

onMounted(async () => {
	await loadCustomerDirectory();
	await loadList();
	countdownTimer = window.setInterval(() => {
		nowTick.value = Date.now();
	}, 1000);
});

onUnmounted(() => {
	if (countdownTimer) window.clearInterval(countdownTimer);
});
</script>
