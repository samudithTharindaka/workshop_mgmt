<template>
	<div class="mx-auto max-w-7xl space-y-8">
		<WxToast />
		<WxConfirmPopup />
		<WxBreadcrumb :items="breadcrumbItems" />

		<!-- Page header -->
		<div class="flex flex-wrap items-end justify-between gap-4">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Job Cards</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Manage workshop job cards — select a row or card to open details.
				</p>
			</div>
		</div>

		<!-- Stats — subtle hairline border + 2px top accent -->
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="portal-card flex items-start gap-4 border-t-2 border-t-slate-300 hover:shadow-md dark:border-t-slate-600">
				<div class="flex-1 min-w-0">
					<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total loaded</p>
					<p class="mt-1.5 text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">{{ stats.total }}</p>
					<p class="mt-1 text-xs text-slate-400 dark:text-slate-500">Up to 100 recently modified</p>
				</div>
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
					<i class="pi pi-list text-slate-400 dark:text-slate-500" style="font-size: 1rem" aria-hidden="true" />
				</div>
			</div>
			<div class="portal-card flex items-start gap-4 border-t-2 border-t-brand-600 hover:shadow-md dark:border-t-brand-500">
				<div class="flex-1 min-w-0">
					<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">In progress</p>
					<p class="mt-1.5 text-3xl font-bold tabular-nums text-brand-700 dark:text-brand-300">{{ stats.inProgress }}</p>
					<p class="mt-1 text-xs text-slate-400 dark:text-slate-500">On the floor now</p>
				</div>
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
					<i class="pi pi-wrench text-brand-600 dark:text-brand-400" style="font-size: 1rem" aria-hidden="true" />
				</div>
			</div>
			<div class="portal-card flex items-start gap-4 border-t-2 border-t-amber-400 hover:shadow-md dark:border-t-amber-500">
				<div class="flex-1 min-w-0">
					<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ready to invoice</p>
					<p class="mt-1.5 text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-300">{{ stats.readyToInvoice }}</p>
					<p class="mt-1 text-xs text-slate-400 dark:text-slate-500">Billing queue</p>
				</div>
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
					<i class="pi pi-file-edit text-amber-500 dark:text-amber-400" style="font-size: 1rem" aria-hidden="true" />
				</div>
			</div>
			<div class="portal-card flex items-start gap-4 border-t-2 border-t-slate-300 hover:shadow-md dark:border-t-slate-600">
				<div class="flex-1 min-w-0">
					<p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Active pipeline</p>
					<p class="mt-1.5 text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">{{ stats.activePipeline }}</p>
					<p class="mt-1 text-xs text-slate-400 dark:text-slate-500">Draft through in progress</p>
				</div>
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
					<i class="pi pi-chart-line text-slate-400 dark:text-slate-500" style="font-size: 1rem" aria-hidden="true" />
				</div>
			</div>
		</div>

		<p v-if="listError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
			{{ listError }}
		</p>

		<!-- Filter bar -->
		<div class="portal-filter-bar">
			<div class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
				<i class="pi pi-sliders-h text-slate-500 dark:text-slate-400" aria-hidden="true" />
				<span>Filter job cards</span>
			</div>
			<div class="flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-end">
				<!-- Search -->
				<div class="min-w-0 flex-1 lg:min-w-[18rem]">
					<label class="portal-label inline-flex items-center gap-1.5" for="jc-filter-search">
						<i class="pi pi-search text-xs text-slate-500" aria-hidden="true" />
						<span>Search</span>
					</label>
					<UiInput
						id="jc-filter-search"
						v-model="docSearch"
						type="search"
						placeholder="ID, customer, vehicle, appointment…"
						autocomplete="off"
					/>
				</div>
				<!-- Status -->
				<div class="w-full sm:max-w-[14rem]">
					<label class="portal-label inline-flex items-center gap-1.5" for="jc-filter-status">
						<i class="pi pi-tag text-xs text-slate-500" aria-hidden="true" />
						<span>Status</span>
					</label>
					<UiSelect
						id="jc-filter-status"
						v-model="filterStatus"
						:options="statusOptions"
						placeholder="All statuses"
						:pt="{
							root: {
								style: {
									background: '#ffffff',
									border: '1px solid #e2e8f0',
									borderRadius: '10px',
									minHeight: '2.75rem',
									height: '2.75rem',
									display: 'flex',
									alignItems: 'center',
									flexWrap: 'nowrap',
									boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
								},
							},
							label: {
								style: {
									background: '#ffffff',
									color: '#334155',
									padding: '0.45rem 0.7rem',
									flex: '1 1 auto',
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
								},
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
									borderLeft: '1px solid #e2e8f0',
								},
							},
							overlay: {
								style: {
									background: '#ffffff',
									border: '1px solid #e2e8f0',
									borderRadius: '10px',
									boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
								},
							},
							list: { style: { background: '#ffffff', color: '#334155' } },
							option: { style: { background: '#ffffff', color: '#334155' } },
						}"
					/>
				</div>
				<!-- View toggle -->
				<div class="w-full sm:max-w-[12rem]">
					<label class="portal-label inline-flex items-center gap-1.5" id="jc-view-label">
						<i class="pi pi-table text-xs text-slate-500" aria-hidden="true" />
						<span>View</span>
					</label>
					<SelectButton v-model="viewMode" :options="viewModeOptions" option-label="label" option-value="value" aria-labelledby="jc-view-label" />
				</div>
				<!-- Clear -->
				<Button
					type="button"
					icon="pi pi-filter-slash"
					label="Clear filters"
					class="!inline-flex !items-center !justify-center !gap-2 !min-h-10 !shrink-0 !rounded-lg !border !border-slate-200 !bg-white !px-4 !text-sm !font-semibold !text-slate-700 !shadow-sm hover:!border-slate-300 hover:!bg-slate-50 dark:!border-slate-600 dark:!bg-slate-900 dark:!text-slate-100 dark:hover:!bg-slate-800"
					@click="clearListFilters"
				/>
			</div>
		</div>

		<!-- Table view -->
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
				paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
				current-page-report-template="{first} to {last} of {totalRecords}"
				:always-show-paginator="true"
				table-class="portal-table"
				table-style="min-width: 52rem"
				@row-click="onRowClick($event)"
			>
				<template #header>
					<div class="flex items-center justify-end gap-2 border-b border-slate-200 px-6 py-3 dark:border-slate-700">
						<label for="jc-rows-per-page" class="text-xs font-medium text-slate-500 dark:text-slate-400">Rows per page</label>
						<select
							id="jc-rows-per-page"
							v-model.number="tableRows"
							class="min-h-9 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-1 pl-3 pr-9 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-300 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/15 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-brand-500"
							style="background-image: url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\' stroke-width=\'2.5\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 0.875rem center; background-size: 0.85rem;"
							@change="tableFirst = 0"
						>
							<option :value="5">5</option>
							<option :value="10">10</option>
							<option :value="20">20</option>
							<option :value="50">50</option>
						</select>
					</div>
				</template>
				<template #paginatorstart>
					<Button type="button" icon="pi pi-refresh" text aria-label="Refresh list" @click="loadList" />
				</template>
				<template #paginatorend>
					<Button type="button" icon="pi pi-download" text aria-label="Download CSV" @click="downloadJobCardsCsv" />
				</template>
				<template #empty>
					<div class="flex flex-col items-center py-10 text-slate-500 dark:text-slate-500">
						<i class="pi pi-inbox mb-3 text-3xl opacity-40" aria-hidden="true" />
						<p class="text-sm font-medium">{{ allRows.length ? "No matches — try adjusting your filters" : "No job cards found" }}</p>
					</div>
				</template>

				<!-- Customer -->
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
								class="h-9 w-9 shrink-0 rounded-full border border-slate-200 object-cover dark:border-slate-600"
								loading="lazy"
							/>
							<div
								v-else
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white shadow-sm"
								aria-hidden="true"
							>
								{{ customerInitials(data.customer) }}
							</div>
							<span class="min-w-0 truncate text-sm font-medium text-slate-800 dark:text-slate-100">{{ customerDisplayName(data.customer) }}</span>
						</div>
					</template>
				</Column>

				<!-- Vehicle -->
				<Column field="vehicle" header-style="min-width: 10rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-car" aria-hidden="true" />
							<span>Vehicle</span>
						</div>
					</template>
					<template #body="{ data }">
						<button
							v-if="data.vehicle"
							type="button"
							class="font-mono text-xs font-medium text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
							@click.stop="openVehicleDetail(data.vehicle)"
						>{{ data.vehicle }}</button>
						<span v-else class="font-mono text-xs text-slate-400 dark:text-slate-500">—</span>
					</template>
				</Column>

				<!-- Status -->
				<Column field="status" header-style="min-width: 10rem">
					<template #header>
						<div class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
							<i class="pi pi-verified" aria-hidden="true" />
							<span>Status</span>
						</div>
					</template>
					<template #body="{ data }">
						<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" :class="statusPillClass(data.status)">
							<span class="h-1.5 w-1.5 rounded-full opacity-80" :class="statusDotClass(data.status)" aria-hidden="true" />
							{{ data.status }}
						</span>
					</template>
				</Column>

				<!-- Appointment -->
				<Column field="appointment" header-style="min-width: 10rem">
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
							@click.stop="openApptDetail(data.appointment)"
						>{{ data.appointment }}</button>
						<span v-else class="font-mono text-xs text-slate-400 dark:text-slate-500">—</span>
					</template>
				</Column>

				<!-- Actions -->
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
								size="small"
								class="portal-action-secondary"
								icon="pi pi-external-link"
								label="Open in Desk"
								@click.stop
							/>
							<Button
								size="small"
								class="portal-action-primary"
								label="Open"
								icon="pi pi-wrench"
								@click.stop="openJobCard(data.name)"
							/>
						</div>
					</template>
				</Column>
			</DataTable>
		</div>

		<!-- Kanban view -->
		<div v-else-if="viewMode === 'kanban'" class="space-y-3">
			<p v-if="kanbanMoveError" class="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-900 dark:text-amber-100">
				{{ kanbanMoveError }}
			</p>
			<div class="overflow-x-auto pb-3">
				<div v-if="loading" class="py-16 text-center text-sm text-slate-500 dark:text-slate-500">Loading…</div>
				<div v-else-if="!allRows.length" class="flex flex-col items-center py-16 text-slate-500 dark:text-slate-500">
					<i class="pi pi-inbox mb-3 text-3xl opacity-40" aria-hidden="true" />
					<p class="text-sm font-medium">No job cards found</p>
				</div>
				<template v-else>
					<p v-if="!filteredRows.length" class="mb-3 text-center text-sm text-slate-500 dark:text-slate-500">
						No cards match your filters — columns shown empty.
					</p>
					<p class="mb-3 text-center text-xs text-slate-400 dark:text-slate-500">
						Drag a card onto another column to change its status.
					</p>
					<div class="flex gap-3" style="min-width: min-content">
						<div
							v-for="col in kanbanColumns"
							:key="col.key"
							class="flex w-[min(100vw-2rem,16rem)] shrink-0 flex-col rounded-2xl border transition-colors"
							:class="
								kanbanDragOverKey === col.key
									? 'border-sky-400/60 bg-sky-50/80 ring-2 ring-sky-400/30 dark:border-sky-500/50 dark:bg-sky-950/20 dark:ring-sky-500/20'
									: 'border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/40'
							"
							@dragover.prevent="onKanbanColumnDragOver(col.key, $event)"
							@dragleave="onKanbanColumnDragLeave(col.key, $event)"
							@drop.prevent="onKanbanColumnDrop(col.key, $event)"
						>
							<!-- Column header -->
							<div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-t-2xl" :class="kanbanColumnHeaderBg(col.key)">
								<div class="flex items-center gap-2 min-w-0">
									<span class="h-2 w-2 shrink-0 rounded-full" :class="kanbanColumnDotClass(col.key)" aria-hidden="true" />
									<p class="truncate text-xs font-semibold" :class="kanbanColumnTextClass(col.key)">{{ col.label }}</p>
								</div>
								<span class="ml-2 inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-white/70 px-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800/70 dark:text-slate-300 shadow-sm">
									{{ col.items.length }}
								</span>
							</div>

							<!-- Cards -->
							<div class="flex max-h-[calc(100vh-15rem)] min-h-[6rem] flex-1 flex-col gap-2 overflow-y-auto p-2">
								<div
									v-for="r in col.items"
									:key="r.name"
									draggable="true"
									class="group w-full cursor-grab rounded-xl border border-slate-200/80 dark:border-slate-700/70 bg-white dark:bg-slate-950/80 p-3 shadow-sm transition-all hover:border-sky-300/60 hover:shadow-md dark:hover:border-sky-600/40 active:cursor-grabbing active:opacity-70"
									:class="{ 'opacity-50 pointer-events-none': kanbanSavingName === r.name }"
									@dragstart="onKanbanCardDragStart(r, $event)"
									@dragend="onKanbanCardDragEnd"
									@click="openJobCard(r.name)"
								>
									<!-- Card ID -->
									<p class="font-mono text-[11px] font-semibold text-sky-600 dark:text-sky-400">{{ r.name }}</p>

									<!-- Customer -->
									<div class="mt-1.5 flex items-center gap-2">
										<div
											class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-[9px] font-bold text-white"
											aria-hidden="true"
										>
											{{ customerInitials(r.customer) }}
										</div>
										<p class="min-w-0 truncate text-xs font-medium text-slate-700 dark:text-slate-300">{{ customerDisplayName(r.customer) || "—" }}</p>
									</div>

									<!-- Vehicle -->
									<p class="mt-1 truncate text-xs text-slate-500 dark:text-slate-500">
										<i class="pi pi-car mr-1 opacity-60" style="font-size: 10px" aria-hidden="true" />{{ r.vehicle || "—" }}
									</p>

									<!-- Appointment -->
									<p v-if="r.appointment" class="mt-1.5 font-mono text-[10px] text-slate-400 dark:text-slate-600">{{ r.appointment }}</p>
								</div>

								<p v-if="!col.items.length" class="flex flex-col items-center py-8 text-center text-xs text-slate-400 dark:text-slate-600">
									<i class="pi pi-inbox mb-1.5 text-lg opacity-40" aria-hidden="true" />
									Drop cards here
								</p>
							</div>
						</div>
					</div>
				</template>
			</div>
		</div>
	</div>

	<!-- Appointment detail drawer -->
	<Teleport to="body">
		<Transition
			enter-active-class="transition-opacity duration-200 ease-out"
			leave-active-class="transition-opacity duration-150 ease-in"
			enter-from-class="opacity-0"
			leave-to-class="opacity-0"
		>
			<div
				v-if="apptDrawerOpen"
				class="fixed inset-0 z-[55] flex justify-end bg-black/50 backdrop-blur-sm"
				role="presentation"
			>
				<div class="min-w-0 flex-1" @click="closeApptDetail" />
				<aside
					class="portal-drawer-panel portal-drawer-animate max-h-screen w-full max-w-lg shrink-0 overflow-y-auto p-6"
					role="dialog"
					aria-modal="true"
					@click.stop
				>
					<!-- Gradient header -->
					<div class="relative -mx-6 -mt-6 mb-6 flex min-h-[40vh] flex-col overflow-hidden bg-gradient-to-br from-sky-400 to-blue-600 px-6 pb-8 pt-6 shadow-sm dark:from-sky-600 dark:to-blue-800">
						<div class="absolute inset-0 opacity-[0.15] mix-blend-overlay" style="background-image: url('data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' viewBox=\'0 0 16 16\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M8 0l8 8-8 8-8-8 8-8zm0 2L2 8l6 6 6-6-6-6z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E');" />
						<div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay" />

						<div class="relative z-10 flex items-start justify-between gap-3">
							<div class="min-w-0">
								<p class="text-xs font-semibold uppercase tracking-wider text-sky-100">Appointment</p>
								<p class="mt-1 truncate text-2xl font-bold text-white drop-shadow-sm">
									{{ apptDrawerDoc ? customerDisplayName(apptDrawerDoc.customer) : "…" }}
								</p>
								<p v-if="apptDrawerDoc?.scheduled_start" class="mt-1 text-sm font-medium text-sky-50">
									{{ formatDt(apptDrawerDoc.scheduled_start) }}
								</p>
								<div class="mt-4 flex flex-wrap gap-2">
									<Button
										v-if="apptDrawerName"
										as="a"
										:href="deskFormUrl('Service Appointment', apptDrawerName)"
										target="_blank"
										rel="noopener noreferrer"
										class="!border-white/30 !bg-white/10 !px-3 !py-1.5 !text-xs !font-semibold !text-white backdrop-blur-md transition hover:!bg-white/20 rounded-lg"
										icon="pi pi-external-link"
										label="Open in Desk"
									/>
								</div>
							</div>
							<button
								type="button"
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
								aria-label="Close"
								@click="closeApptDetail"
							>
								<i class="pi pi-times" aria-hidden="true" />
							</button>
						</div>

						<div v-if="apptDrawerLoading" class="relative z-10 mt-auto py-8 text-center text-sm font-medium text-sky-100">Loading…</div>

						<div v-else-if="apptDrawerDoc" class="relative z-10 mt-auto flex items-end gap-4 pt-10">
							<img
								v-if="customerAvatarSrc(apptDrawerDoc.customer)"
								:src="customerAvatarSrc(apptDrawerDoc.customer)"
								alt=""
								class="h-16 w-16 shrink-0 rounded-full border-2 border-white/50 object-cover shadow-lg"
							/>
							<div
								v-else
								class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white/50 bg-white/10 text-xl font-bold text-white shadow-lg backdrop-blur-md"
							>
								{{ customerInitials(apptDrawerDoc.customer) }}
							</div>
							<div class="min-w-0 pb-1">
								<p class="text-xs font-medium text-sky-100 drop-shadow-sm">Countdown to start</p>
								<p class="mt-0.5 text-3xl font-bold tabular-nums tracking-tight text-white drop-shadow-md">{{ scheduleCountdown(apptDrawerDoc) }}</p>
							</div>
						</div>
					</div>

					<template v-if="!apptDrawerLoading && apptDrawerDoc">
						<!-- Detail rows -->
						<div class="mb-6 grid grid-cols-1 gap-0 text-sm">
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-1.5 dark:border-slate-800">
								<span class="text-slate-600 dark:text-slate-500">Status</span>
								<span class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium shadow-sm" :class="apptStatusPillClass(apptDrawerDoc.status)">{{ apptDrawerDoc.status }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-200 py-1.5 dark:border-slate-800">
								<span class="text-slate-600 dark:text-slate-500">Vehicle</span>
								<span class="break-all text-right text-slate-800 dark:text-slate-200">{{ apptDrawerDoc.vehicle || "—" }}</span>
							</div>
							<div class="flex justify-between gap-2 border-b border-slate-200 py-1.5 dark:border-slate-800">
								<span class="text-slate-600 dark:text-slate-500">Scheduled end</span>
								<span class="text-slate-700 dark:text-slate-300">{{ formatDt(apptDrawerDoc.scheduled_end) }}</span>
							</div>
							<div v-if="apptDrawerDoc.remarks" class="py-1.5">
								<span class="mb-1 block text-slate-600 dark:text-slate-500">Remarks</span>
								<span class="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{{ apptDrawerDoc.remarks }}</span>
							</div>
						</div>

						<!-- Actions -->
						<div class="flex flex-col gap-3">
							<button
								v-if="apptDrawerDoc.status === 'Scheduled'"
								type="button"
								class="portal-btn-primary w-full !bg-emerald-600 hover:!bg-emerald-500 focus:!ring-emerald-500/35"
								:disabled="apptDrawerActionLoading"
								@click="runApptCheckIn"
							>Check in</button>

							<template v-if="apptDrawerDoc.status === 'Checked-In'">
								<button
									v-if="!apptDrawerDoc.inspection"
									type="button"
									class="portal-btn-primary w-full !bg-sky-600 hover:!bg-sky-500 focus:!ring-sky-500/35"
									:disabled="apptDrawerActionLoading"
									@click="runApptCreateInspection"
								>Create inspection</button>
								<button
									v-if="!apptDrawerDoc.job_card"
									type="button"
									class="portal-btn-primary w-full !bg-amber-600 hover:!bg-amber-500 focus:!ring-amber-500/35"
									:disabled="apptDrawerActionLoading"
									@click="openJobCardWizard"
								>Create job card</button>
							</template>

							<button
								v-if="apptDrawerDoc.status === 'In Progress'"
								type="button"
								class="portal-btn-primary w-full !bg-slate-800 hover:!bg-slate-700 focus:!ring-slate-500/35 dark:!bg-slate-100 dark:!text-slate-900 dark:hover:!bg-white"
								:disabled="apptDrawerActionLoading"
								@click="runApptMarkComplete"
							>Mark complete</button>

							<Button
								v-if="apptDrawerDoc.job_card"
								class="w-full"
								severity="help"
								@click="openJobCard(apptDrawerDoc.job_card)"
							>Open job card in workshop</Button>

							<WxDangerButton
								v-if="canCancelAppt(apptDrawerDoc.status)"
								class="w-full"
								label="Cancel appointment"
								icon="pi pi-times"
								:loading="apptCancellingName === apptDrawerName"
								:disabled="apptDrawerActionLoading"
								@click="confirmCancelAppt($event, apptDrawerName, true)"
							/>
						</div>
					</template>

					<p v-else-if="apptDrawerError" class="text-sm text-red-700 dark:text-red-300">{{ apptDrawerError }}</p>
					<p v-if="apptDrawerActionError" class="mt-3 text-sm text-red-700 dark:text-red-300">{{ apptDrawerActionError }}</p>
				</aside>
			</div>
		</Transition>
	</Teleport>

	<!-- Vehicle detail drawer -->
	<Teleport to="body">
		<Transition
			enter-active-class="transition-opacity duration-200 ease-out"
			leave-active-class="transition-opacity duration-150 ease-in"
			enter-from-class="opacity-0"
			leave-to-class="opacity-0"
		>
			<div
				v-if="vehicleDrawerOpen"
				class="fixed inset-0 z-[55] flex justify-end bg-black/50 backdrop-blur-sm"
				role="presentation"
			>
				<div class="min-w-0 flex-1" @click="closeVehicleDetail" />
				<aside
					class="portal-drawer-panel portal-drawer-animate max-h-screen w-full max-w-lg shrink-0 overflow-y-auto p-6"
					role="dialog"
					aria-modal="true"
					@click.stop
				>
					<!-- Gradient header -->
					<div class="relative -mx-6 -mt-6 mb-6 flex min-h-[32vh] flex-col overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-600 px-6 pb-8 pt-6 shadow-sm dark:from-emerald-600 dark:to-teal-800">
						<div class="absolute inset-0 opacity-[0.12] mix-blend-overlay" style="background-image: url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1.5\' fill=\'%23ffffff\'/%3E%3C/svg%3E');" />
						<div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay" />

						<div class="relative z-10 flex items-start justify-between gap-3">
							<div class="min-w-0">
								<p class="text-xs font-semibold uppercase tracking-wider text-emerald-100">Vehicle</p>
								<p class="mt-1 truncate text-2xl font-bold text-white drop-shadow-sm">
									{{ vehicleDrawerDoc ? vehicleDrawerDoc.license_plate : (vehicleDrawerName || "…") }}
								</p>
								<p v-if="vehicleDrawerDoc" class="mt-1 text-sm font-medium text-emerald-50">
									{{ [vehicleDrawerDoc.year, vehicleDrawerDoc.make, vehicleDrawerDoc.model].filter(Boolean).join(" ") || "—" }}
								</p>
								<div class="mt-4 flex flex-wrap gap-2">
									<Button
										v-if="vehicleDrawerName"
										as="a"
										:href="deskFormUrl('Vehicle', vehicleDrawerName)"
										target="_blank"
										rel="noopener noreferrer"
										class="!border-white/30 !bg-white/10 !px-3 !py-1.5 !text-xs !font-semibold !text-white backdrop-blur-md transition hover:!bg-white/20 rounded-lg"
										icon="pi pi-external-link"
										label="Open in Desk"
									/>
								</div>
							</div>
							<button
								type="button"
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
								aria-label="Close"
								@click="closeVehicleDetail"
							>
								<i class="pi pi-times" aria-hidden="true" />
							</button>
						</div>

						<div v-if="vehicleDrawerLoading" class="relative z-10 mt-auto py-8 text-center text-sm font-medium text-emerald-100">Loading…</div>

						<div v-else-if="vehicleDrawerDoc" class="relative z-10 mt-auto flex items-end gap-4 pt-8">
							<div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/10 backdrop-blur-md shadow-lg">
								<i class="pi pi-car text-white" style="font-size:1.8rem" aria-hidden="true" />
							</div>
							<div class="min-w-0 pb-1">
								<p class="text-xs font-medium text-emerald-100">Owner</p>
								<p class="mt-0.5 truncate text-lg font-bold text-white drop-shadow-sm">{{ customerDisplayName(vehicleDrawerDoc.customer) || vehicleDrawerDoc.customer || "—" }}</p>
							</div>
						</div>
					</div>

					<div v-if="vehicleDrawerLoading" class="py-10 text-center text-sm text-slate-400 dark:text-slate-500">Loading vehicle details…</div>

					<template v-else-if="vehicleDrawerDoc">
						<div class="mb-6 grid grid-cols-1 gap-0 text-sm">
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">License Plate</span>
								<span class="font-mono font-semibold text-slate-900 dark:text-slate-100">{{ vehicleDrawerDoc.license_plate || "—" }}</span>
							</div>
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">Customer</span>
								<span class="text-right text-slate-800 dark:text-slate-200">{{ customerDisplayName(vehicleDrawerDoc.customer) || vehicleDrawerDoc.customer || "—" }}</span>
							</div>
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">Make</span>
								<span class="text-slate-800 dark:text-slate-200">{{ vehicleDrawerDoc.make || "—" }}</span>
							</div>
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">Model</span>
								<span class="text-slate-800 dark:text-slate-200">{{ vehicleDrawerDoc.model || "—" }}</span>
							</div>
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">Year</span>
								<span class="text-slate-800 dark:text-slate-200">{{ vehicleDrawerDoc.year || "—" }}</span>
							</div>
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">Color</span>
								<span class="text-slate-800 dark:text-slate-200">{{ vehicleDrawerDoc.color || "—" }}</span>
							</div>
							<div class="flex items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
								<span class="text-slate-500 dark:text-slate-400">VIN</span>
								<span class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ vehicleDrawerDoc.vin || "—" }}</span>
							</div>
							<div class="flex items-center justify-between gap-2 py-2" :class="vehicleDrawerDoc.notes ? 'border-b border-slate-200 dark:border-slate-800' : ''">
								<span class="text-slate-500 dark:text-slate-400">Last Odometer</span>
								<span class="text-slate-800 dark:text-slate-200">{{ vehicleDrawerDoc.odometer_last ? vehicleDrawerDoc.odometer_last.toLocaleString() + ' km' : '—' }}</span>
							</div>
							<div v-if="vehicleDrawerDoc.notes" class="py-2">
								<span class="mb-1 block text-slate-500 dark:text-slate-400">Notes</span>
								<span class="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{{ vehicleDrawerDoc.notes }}</span>
							</div>
						</div>
					</template>

					<p v-else-if="vehicleDrawerError" class="text-sm text-red-700 dark:text-red-300">{{ vehicleDrawerError }}</p>
				</aside>
			</div>
		</Transition>
	</Teleport>

	<!-- Job card creation wizard (triggered from drawer) -->
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
					<button type="button" class="portal-btn-secondary" @click="jcOpen = false">Cancel</button>
					<button type="button" class="portal-btn-primary" :disabled="jcSubmitting || !jcCompany || !jcWarehouse" @click="submitJobCard">
						{{ jcSubmitting ? "Creating…" : "Create" }}
					</button>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { restResourceList, restResourceGet, frappeCall } from "../utils/api";
import { deskFormUrl } from "../utils/desk.js";
import { downloadCsv } from "../utils/csv.js";
import { dataTablePaginatorPt } from "../utils/dataTablePaginatorPt.js";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import WxBreadcrumb from "../components/layout/WxBreadcrumb.vue";
import WxToast from "../components/ui/WxToast.vue";
import WxConfirmPopup from "../components/ui/WxConfirmPopup.vue";
import WxDangerButton from "../components/ui/WxDangerButton.vue";
import UiInput from "../components/ui/UiInput.vue";
import UiSelect from "../components/ui/UiSelect.vue";
import { useCustomerMeta } from "../composables/useCustomerMeta.js";

const { customerDisplayName, customerAvatarSrc, customerInitials, enrichCustomersForRows } = useCustomerMeta();

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

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

function kanbanColumnTextClass(status) {
	const s = String(status || "");
	if (s === "Invoiced" || s === "Closed") return "text-emerald-700 dark:text-emerald-300";
	if (s === "Cancelled") return "text-red-600 dark:text-red-400";
	if (s === "Ready to Invoice" || s === "Approved") return "text-amber-700 dark:text-amber-200";
	if (s === "In Progress") return "text-sky-700 dark:text-sky-300";
	return "text-slate-600 dark:text-slate-400";
}

function kanbanColumnDotClass(status) {
	const s = String(status || "");
	if (s === "Invoiced" || s === "Closed") return "bg-emerald-400 dark:bg-emerald-500";
	if (s === "Cancelled") return "bg-red-400 dark:bg-red-500";
	if (s === "Ready to Invoice" || s === "Approved") return "bg-amber-400 dark:bg-amber-500";
	if (s === "In Progress") return "bg-sky-400 dark:bg-sky-500";
	return "bg-slate-300 dark:bg-slate-600";
}

function kanbanColumnHeaderBg(status) {
	const s = String(status || "");
	if (s === "Invoiced" || s === "Closed") return "bg-emerald-50/60 dark:bg-emerald-950/20";
	if (s === "Cancelled") return "bg-red-50/60 dark:bg-red-950/20";
	if (s === "Ready to Invoice" || s === "Approved") return "bg-amber-50/60 dark:bg-amber-950/20";
	if (s === "In Progress") return "bg-sky-50/60 dark:bg-sky-950/20";
	return "";
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

// ── Countdown ticker ─────────────────────────────────────────────────────────
const nowTick = ref(Date.now());
let countdownTimer;

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
	const terminal = ["Completed", "Cancelled", "No-Show"];
	if (terminal.includes(status || "")) return "—";
	const target = parseScheduleMs(row?.scheduled_start);
	if (!Number.isFinite(target)) return "—";
	const ms = target - nowTick.value;
	if (status === "Scheduled") return ms <= 0 ? "Overdue" : formatDuration(ms);
	if (status === "Checked-In" || status === "In Progress") return ms > 0 ? formatDuration(ms) : "Started";
	return "—";
}

function formatDt(v) {
	if (!v) return "—";
	const t = parseScheduleMs(v);
	return Number.isFinite(t) ? new Date(t).toLocaleString() : "—";
}

// ── Appointment drawer ────────────────────────────────────────────────────────
const apptDrawerOpen = ref(false);
const apptDrawerName = ref("");
const apptDrawerLoading = ref(false);
const apptDrawerError = ref("");
const apptDrawerDoc = ref(null);
const apptDrawerActionLoading = ref(false);
const apptDrawerActionError = ref("");
const apptCancellingName = ref("");

function apptStatusPillClass(status) {
	if (status === "Completed") return "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200";
	if (status === "In Progress" || status === "Checked-In") return "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100";
	if (status === "Cancelled" || status === "No-Show") return "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200";
	if (status === "Scheduled") return "bg-amber-100 text-amber-950 dark:bg-amber-500/20 dark:text-amber-100";
	return "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300";
}

function canCancelAppt(status) {
	return status === "Scheduled" || status === "Checked-In";
}

async function openApptDetail(name) {
	apptDrawerName.value = name;
	apptDrawerActionError.value = "";
	apptDrawerOpen.value = true;
	await refreshApptDetail();
}

function closeApptDetail() {
	apptDrawerOpen.value = false;
	apptDrawerDoc.value = null;
	apptDrawerName.value = "";
	apptDrawerError.value = "";
	apptDrawerActionError.value = "";
}

async function refreshApptDetail() {
	if (!apptDrawerName.value) return;
	apptDrawerLoading.value = true;
	apptDrawerError.value = "";
	try {
		apptDrawerDoc.value = await restResourceGet("Service Appointment", apptDrawerName.value);
		if (apptDrawerDoc.value?.customer) {
			await enrichCustomersForRows([{ customer: apptDrawerDoc.value.customer }]);
		}
	} catch (e) {
		apptDrawerDoc.value = null;
		apptDrawerError.value = e.message || "Failed to load appointment";
	} finally {
		apptDrawerLoading.value = false;
	}
}

function confirmCancelAppt(event, name, fromDetail = false) {
	confirm.require({
		header: "Cancel Appointment",
		message: "Are you sure you want to cancel this appointment?",
		icon: "pi pi-exclamation-triangle",
		acceptLabel: "Yes, cancel it",
		rejectLabel: "Keep it",
		accept: () => runCancelAppt(name, fromDetail),
	});
}

async function runCancelAppt(name, fromDetail = false) {
	apptDrawerActionError.value = "";
	apptCancellingName.value = name;
	try {
		await frappeCall("workshop_mgmt.api.appointment_cancel", { name });
		await loadList();
		if (fromDetail) await refreshApptDetail();
		toast.add({ severity: "success", summary: "Appointment cancelled", detail: `${name} was set to Cancelled.`, life: 2800 });
	} catch (e) {
		const msg = e.message || "Could not cancel";
		apptDrawerActionError.value = msg;
		toast.add({ severity: "error", summary: "Cancel failed", detail: msg, life: 3600 });
	} finally {
		apptCancellingName.value = "";
	}
}

async function runApptCheckIn() {
	apptDrawerActionError.value = "";
	apptDrawerActionLoading.value = true;
	try {
		await frappeCall("workshop_mgmt.api.appointment_check_in", { name: apptDrawerName.value });
		await refreshApptDetail();
		await loadList();
	} catch (e) {
		apptDrawerActionError.value = e.message || "Check-in failed";
	} finally {
		apptDrawerActionLoading.value = false;
	}
}

async function runApptMarkComplete() {
	apptDrawerActionError.value = "";
	apptDrawerActionLoading.value = true;
	try {
		await frappeCall("workshop_mgmt.api.appointment_mark_complete", { name: apptDrawerName.value });
		await refreshApptDetail();
		await loadList();
	} catch (e) {
		apptDrawerActionError.value = e.message || "Could not mark complete";
	} finally {
		apptDrawerActionLoading.value = false;
	}
}

async function runApptCreateInspection() {
	apptDrawerActionError.value = "";
	apptDrawerActionLoading.value = true;
	try {
		await frappeCall("workshop_mgmt.api.create_inspection_for_appointment", { appointment: apptDrawerName.value });
		await refreshApptDetail();
		await loadList();
	} catch (e) {
		apptDrawerActionError.value = e.message || "Could not create inspection";
	} finally {
		apptDrawerActionLoading.value = false;
	}
}

// ── Vehicle drawer ────────────────────────────────────────────────────────────
const vehicleDrawerOpen = ref(false);
const vehicleDrawerName = ref("");
const vehicleDrawerLoading = ref(false);
const vehicleDrawerError = ref("");
const vehicleDrawerDoc = ref(null);

async function openVehicleDetail(name) {
	vehicleDrawerName.value = name;
	vehicleDrawerError.value = "";
	vehicleDrawerDoc.value = null;
	vehicleDrawerOpen.value = true;
	vehicleDrawerLoading.value = true;
	try {
		vehicleDrawerDoc.value = await restResourceGet("Vehicle", name);
		if (vehicleDrawerDoc.value?.customer) {
			await enrichCustomersForRows([{ customer: vehicleDrawerDoc.value.customer }]);
		}
	} catch (e) {
		vehicleDrawerError.value = e.message || "Failed to load vehicle";
	} finally {
		vehicleDrawerLoading.value = false;
	}
}

function closeVehicleDetail() {
	vehicleDrawerOpen.value = false;
	vehicleDrawerDoc.value = null;
	vehicleDrawerName.value = "";
	vehicleDrawerError.value = "";
}

// ── Job card creation wizard ──────────────────────────────────────────────────
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
	return w.warehouse_name && w.warehouse_name !== w.name ? `${w.warehouse_name} (${w.name})` : w.name;
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
			filters: [["company", "=", jcCompany.value], ["is_group", "=", 0]],
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
			appointment: apptDrawerName.value,
			company: jcCompany.value,
			warehouse: jcWarehouse.value,
		});
		jcOpen.value = false;
		closeApptDetail();
		await loadList();
		if (msg?.name) {
			router.push({ name: "job-card-detail", params: { id: String(msg.name) } });
		}
	} catch (e) {
		jcError.value = e.message || "Could not create job card";
	} finally {
		jcSubmitting.value = false;
	}
}

onMounted(() => {
	loadList();
	countdownTimer = window.setInterval(() => { nowTick.value = Date.now(); }, 1000);
});

onUnmounted(() => {
	if (countdownTimer) window.clearInterval(countdownTimer);
});
</script>
