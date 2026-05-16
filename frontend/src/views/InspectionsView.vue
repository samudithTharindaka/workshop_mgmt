<template>
	<div class="mx-auto max-w-7xl space-y-8">
		<WxToast />
		<WxConfirmPopup />
		<WxBreadcrumb :items="breadcrumbItems" />

		<!-- Stats — subtle hairline border + 2px top accent -->
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="portal-card flex items-start gap-4 border-t-2 border-t-slate-300 hover:shadow-md dark:border-t-slate-600">
				<div class="flex-1 min-w-0">
					<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total loaded</p>
					<p class="mt-1.5 text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">{{ stats.total }}</p>
				</div>
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
					<i class="pi pi-list text-slate-400 dark:text-slate-500" style="font-size: 1rem" aria-hidden="true" />
				</div>
			</div>
			<div class="portal-card flex items-start gap-4 border-t-2 border-t-brand-600 hover:shadow-md dark:border-t-brand-500">
				<div class="flex-1 min-w-0">
					<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Linked to job card</p>
					<p class="mt-1.5 text-3xl font-bold tabular-nums text-brand-700 dark:text-brand-300">{{ stats.withJobCard }}</p>
				</div>
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
					<i class="pi pi-wrench text-brand-600 dark:text-brand-400" style="font-size: 1rem" aria-hidden="true" />
				</div>
			</div>
			<div class="portal-card flex items-start gap-4 border-t-2 border-t-amber-400 hover:shadow-md dark:border-t-amber-500">
				<div class="flex-1 min-w-0">
					<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Awaiting job card</p>
					<p class="mt-1.5 text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-300">{{ stats.withoutJobCard }}</p>
				</div>
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
					<i class="pi pi-clock text-amber-500 dark:text-amber-400" style="font-size: 1rem" aria-hidden="true" />
				</div>
			</div>
			<div class="portal-card flex items-start gap-4 border-t-2 border-t-slate-300 hover:shadow-md dark:border-t-slate-600">
				<div class="flex-1 min-w-0">
					<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">This week</p>
					<p class="mt-1.5 text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">{{ stats.thisWeek }}</p>
					<p class="mt-1 text-xs text-slate-400 dark:text-slate-500">By inspection date</p>
				</div>
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
					<i class="pi pi-calendar text-slate-400 dark:text-slate-500" style="font-size: 1rem" aria-hidden="true" />
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Vehicle inspections</h2>
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
		<div class="portal-filter-bar">
			<div class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
				<i class="pi pi-sliders-h text-slate-500 dark:text-slate-400" aria-hidden="true" />
				<span>Filter inspections</span>
			</div>
			<div class="flex flex-col gap-5 xl:flex-row xl:flex-wrap xl:items-end">
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
				<Column field="appointment" header-style="min-width: 11rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-calendar" aria-hidden="true" />
							<span>Appointment</span>
						</div>
					</template>
					<template #body="{ data }">
						<button
							v-if="data.appointment"
							type="button"
							class="font-mono text-xs font-medium text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
							@click.stop="openApptDrawer(data.appointment)"
						>{{ data.appointment }}</button>
						<span v-else class="font-mono text-xs text-slate-400 dark:text-slate-500">—</span>
					</template>
				</Column>
				<Column field="customer" header-style="min-width: 12rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-user" aria-hidden="true" />
							<span>Customer</span>
						</div>
					</template>
					<template #body="{ data }">
						<span class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ data.customer || "—" }}</span>
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
						<span class="text-sm text-slate-600 dark:text-slate-400">{{ data.vehicle || "—" }}</span>
					</template>
				</Column>
				<Column field="inspection_date" header-style="min-width: 9rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-clock" aria-hidden="true" />
							<span>Date</span>
						</div>
					</template>
					<template #body="{ data }">
						<span class="text-sm tabular-nums text-slate-600 dark:text-slate-400">{{ data.inspection_date || "—" }}</span>
					</template>
				</Column>
				<Column field="job_card" header-style="min-width: 11rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-wrench" aria-hidden="true" />
							<span>Job card</span>
						</div>
					</template>
					<template #body="{ data }">
						<button
							v-if="data.job_card"
							type="button"
							class="font-mono text-xs font-medium text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
							@click.stop="openJobCardDrawer(data.job_card)"
						>{{ data.job_card }}</button>
						<span v-else class="font-mono text-xs text-slate-400 dark:text-slate-500">—</span>
					</template>
				</Column>
				<Column header-style="min-width: 10rem; width: 12rem" body-style="min-width: 10rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-bolt" aria-hidden="true" />
							<span>Actions</span>
						</div>
					</template>
					<template #body="{ data }">
						<Button
							as="a"
							:href="deskFormUrl('Vehicle Inspection', data.name)"
							target="_blank"
							rel="noopener noreferrer"
							size="small"
							class="portal-action-secondary"
							icon="pi pi-external-link"
							label="Open in Desk"
							@click.stop
						/>
					</template>
				</Column>
			</DataTable>
		</div>

		<WxAppointmentDrawer
			v-model:open="apptDrawerOpen"
			:appointment-id="apptDrawerId"
			@updated="loadList"
		/>
		<WxJobCardDrawer v-model:open="jobCardDrawerOpen" :job-card-id="jobCardDrawerId" />

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
					<!-- Gradient header -->
					<div class="relative shrink-0 overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 px-6 pb-6 pt-6 shadow-sm dark:from-brand-700 dark:to-brand-900">
						<div
							class="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
							style="background-image: url('data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' viewBox=\'0 0 16 16\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M8 0l8 8-8 8-8-8 8-8zm0 2L2 8l6 6 6-6-6-6z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E');"
							aria-hidden="true"
						/>
						<div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay" aria-hidden="true" />
						<div class="relative z-10 flex items-start justify-between gap-3">
							<div class="min-w-0">
								<p class="text-xs font-semibold uppercase tracking-wider text-brand-100">Vehicle Inspection</p>
								<p class="mt-1 truncate font-mono text-2xl font-bold text-white drop-shadow-sm">{{ editName || "…" }}</p>
								<p v-if="editDoc?.customer" class="mt-1 truncate text-sm font-medium text-brand-50">{{ editDoc.customer }}</p>
								<p v-if="editDoc?.vehicle" class="mt-0.5 text-sm text-brand-100">
									<i class="pi pi-car mr-1.5 opacity-70" style="font-size: 12px" aria-hidden="true" />{{ editDoc.vehicle }}
								</p>
								<div class="mt-4 flex flex-wrap items-center gap-2">
									<Button
										v-if="editName"
										as="a"
										:href="deskFormUrl('Vehicle Inspection', editName)"
										target="_blank"
										rel="noopener noreferrer"
										class="!inline-flex !items-center !gap-2 !rounded-lg !border-white/30 !bg-white/10 !px-3 !py-1.5 !text-xs !font-semibold !text-white backdrop-blur-md transition hover:!bg-white/20"
										icon="pi pi-external-link"
										label="Open in Desk"
									/>
									<span v-if="editDoc?.job_card" class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
										<i class="pi pi-link" style="font-size: 9px" aria-hidden="true" />Job card linked
									</span>
									<span v-else-if="editDoc" class="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 px-2.5 py-1 text-xs font-semibold text-amber-900 shadow-sm">
										<i class="pi pi-clock" style="font-size: 9px" aria-hidden="true" />Awaiting job card
									</span>
								</div>
							</div>
							<button
								type="button"
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
								aria-label="Close"
								@click="closeEditor"
							>
								<i class="pi pi-times" aria-hidden="true" />
							</button>
						</div>
					</div>

					<!-- Action bar -->
					<div class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
						<button
							type="button"
							class="portal-action-secondary"
							:disabled="editorLoading || saveLoading"
							@click="loadStandardChecklist"
						>
							<i class="pi pi-refresh" style="font-size: 11px" aria-hidden="true" />
							Load standard checklist
						</button>
						<button
							type="button"
							class="portal-action-primary"
							:disabled="editorLoading || saveLoading || !editDoc"
							@click="saveInspection"
						>
							<i class="pi pi-save" style="font-size: 11px" aria-hidden="true" />
							{{ saveLoading ? "Saving…" : "Save changes" }}
						</button>
					</div>

					<div class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
					<div v-if="editorLoading" class="flex flex-col items-center py-20 text-slate-500 dark:text-slate-500">
						<i class="pi pi-spin pi-spinner mb-3 text-3xl opacity-50" aria-hidden="true" />
						<p class="text-sm">Loading inspection…</p>
					</div>
					<div v-else-if="editDoc" class="space-y-6">
						<!-- Editable fields -->
						<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
							<div>
								<label class="portal-label">Inspection date</label>
								<input v-model="editDoc.inspection_date" type="date" class="portal-input" />
							</div>
							<div>
								<label class="portal-label">Inspector <span class="font-normal normal-case text-slate-400">(optional)</span></label>
								<input v-model="editDoc.inspector" class="portal-input" placeholder="User ID" />
							</div>
						</div>

						<!-- Linked record chips -->
						<div v-if="editDoc.appointment || editDoc.job_card" class="flex flex-wrap items-center gap-2">
							<a
								v-if="editDoc.appointment"
								:href="deskFormUrl('Service Appointment', editDoc.appointment)"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
							>
								<i class="pi pi-calendar" style="font-size: 10px" aria-hidden="true" />
								<span class="font-mono">{{ editDoc.appointment }}</span>
								<i class="pi pi-external-link opacity-50" style="font-size: 9px" aria-hidden="true" />
							</a>
							<a
								v-if="editDoc.job_card"
								:href="deskFormUrl('Job Card', editDoc.job_card)"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
							>
								<i class="pi pi-wrench" style="font-size: 10px" aria-hidden="true" />
								<span class="font-mono">{{ editDoc.job_card }}</span>
								<i class="pi pi-external-link opacity-50" style="font-size: 9px" aria-hidden="true" />
							</a>
							<button
								v-if="editDoc.job_card"
								type="button"
								class="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:border-brand-300 hover:bg-brand-100 dark:border-brand-700/40 dark:bg-brand-950/40 dark:text-brand-300"
								@click="goJobCardFromEditor(editDoc.job_card)"
							>
								<i class="pi pi-arrow-right" style="font-size: 10px" aria-hidden="true" />
								Open in workshop
							</button>
						</div>

						<div
							v-if="editDoc.name && !editDoc.job_card"
							class="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-amber-700/40 dark:from-amber-950/30 dark:to-orange-950/20"
						>
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
								<i class="pi pi-bolt" style="font-size: 16px" aria-hidden="true" />
							</div>
							<div class="min-w-0 flex-1">
								<p class="text-sm font-semibold text-amber-900 dark:text-amber-200">Ready to create the job card?</p>
								<p class="mt-0.5 text-xs text-amber-800/80 dark:text-amber-300/80">Pick company and warehouse on the next step. Lines are added on the job card itself.</p>
							</div>
							<button
								type="button"
								class="portal-action-primary !bg-amber-600 hover:!bg-amber-700 focus:!ring-amber-500/35 active:!bg-amber-800"
								@click="openJobCardFromInspection"
							>
								<i class="pi pi-plus" style="font-size: 11px" aria-hidden="true" />
								Create job card
							</button>
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
												<select v-model="row.section" class="portal-select py-1.5 text-xs">
													<option v-for="s in SECTION_OPTIONS" :key="s" :value="s">{{ s }}</option>
												</select>
											</td>
											<td class="align-top">
												<input v-model="row.check_item" class="portal-input py-1.5 text-xs" placeholder="Check item" />
											</td>
											<td class="align-top">
												<div class="mb-2 flex gap-1.5">
													<button
														type="button"
														class="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition"
														:class="
															row.status === STATUS_QUICK_OK
																? 'border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-500'
																: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40'
														"
														title="Mark OK"
														@click="row.status = STATUS_QUICK_OK"
													>
														<i class="pi pi-check" style="font-size: 10px" aria-hidden="true" />
														OK
													</button>
													<button
														type="button"
														class="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition"
														:class="
															row.status === STATUS_QUICK_REPORT
																? 'border-amber-600 bg-amber-600 text-white shadow-sm hover:bg-amber-500'
																: 'border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/40'
														"
														title="Needs attention"
														@click="row.status = STATUS_QUICK_REPORT"
													>
														<i class="pi pi-exclamation-triangle" style="font-size: 10px" aria-hidden="true" />
														Report
													</button>
												</div>
												<select v-model="row.status" class="portal-select py-1.5 text-xs">
													<option v-for="st in STATUS_OPTIONS" :key="st" :value="st">{{ st }}</option>
												</select>
											</td>
											<td class="align-top">
												<textarea v-model="row.notes" rows="2" class="portal-input resize-y py-1.5 text-xs" />
											</td>
											<td class="align-top">
												<button
													type="button"
													class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
													aria-label="Remove row"
													@click="removeLine(idx)"
												>
													<i class="pi pi-times" style="font-size: 11px" aria-hidden="true" />
												</button>
											</td>
										</tr>
										<tr v-if="!(editDoc.inspection_items || []).length">
											<td colspan="5" class="py-14 text-center">
												<i class="pi pi-clipboard mb-2 block text-3xl text-slate-300 dark:text-slate-700" aria-hidden="true" />
												<p class="text-sm font-medium text-slate-500 dark:text-slate-400">No checklist items yet</p>
												<p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Click "Load standard checklist" above, or "Add line" to start.</p>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						<button
							type="button"
							class="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:bg-brand-950/30 dark:hover:text-brand-300"
							@click="addBlankLine"
						>
							<i class="pi pi-plus" style="font-size: 10px" aria-hidden="true" />
							Add blank line
						</button>
					</div>
					<p
						v-else-if="editorError"
						class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
					>
						<i class="pi pi-times-circle mr-1.5 opacity-70" aria-hidden="true" />{{ editorError }}
					</p>

					<p
						v-if="editorBanner"
						class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-200"
					>
						<i class="pi pi-info-circle mr-1.5 opacity-70" aria-hidden="true" />{{ editorBanner }}
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
import WxToast from "../components/ui/WxToast.vue";
import WxConfirmPopup from "../components/ui/WxConfirmPopup.vue";
import WxAppointmentDrawer from "../components/ui/WxAppointmentDrawer.vue";
import WxJobCardDrawer from "../components/ui/WxJobCardDrawer.vue";
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

// Side-drawer peeks (appointment + job card)
const apptDrawerOpen = ref(false);
const apptDrawerId = ref("");
const jobCardDrawerOpen = ref(false);
const jobCardDrawerId = ref("");

function openApptDrawer(id) {
	if (!id) return;
	apptDrawerId.value = String(id);
	apptDrawerOpen.value = true;
}

function openJobCardDrawer(id) {
	if (!id) return;
	jobCardDrawerId.value = String(id);
	jobCardDrawerOpen.value = true;
}

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
