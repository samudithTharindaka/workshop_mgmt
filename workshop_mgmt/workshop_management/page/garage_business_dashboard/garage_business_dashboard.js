// Copyright (c) 2026, Infoney and contributors
// For license information, please see license.txt

const GARAGE_DASHBOARD_METHOD =
	"workshop_mgmt.workshop_management.page.garage_business_dashboard.garage_business_dashboard.get_dashboard_data";

function getMountNode(wrapper) {
	if (!wrapper) {
		return null;
	}
	if (wrapper.nodeType === 1) {
		return wrapper;
	}
	if (wrapper.jquery && wrapper.length) {
		return wrapper.get(0);
	}
	if (Array.isArray(wrapper) && wrapper.length && wrapper[0]?.nodeType === 1) {
		return wrapper[0];
	}
	return null;
}

function ensureVue() {
	if (window.Vue && window.Vue.createApp) {
		return Promise.resolve(window.Vue);
	}
	return new Promise((resolve, reject) => {
		const paths = [
			"/assets/workshop_mgmt/js/vendor/vue.global.prod.js",
			"/assets/workshop_mgmt/js/vendor/vue.global.prod.js?v=1",
		];

		const tryLoad = (idx) => {
			if (idx >= paths.length) {
				reject(new Error("Failed to load Vue.js"));
				return;
			}
			const src = paths[idx];
			if (frappe.require) {
				frappe.require(src, () => {
					if (window.Vue && window.Vue.createApp) {
						resolve(window.Vue);
					} else {
						tryLoad(idx + 1);
					}
				});
				return;
			}
			const script = document.createElement("script");
			script.src = src;
			script.onload = () => {
				if (window.Vue && window.Vue.createApp) {
					resolve(window.Vue);
				} else {
					tryLoad(idx + 1);
				}
			};
			script.onerror = () => tryLoad(idx + 1);
			document.head.appendChild(script);
		};

		tryLoad(0);
	});
}

function injectStyles() {
	if (document.getElementById("garage-business-dashboard-style")) {
		return;
	}
	const style = document.createElement("style");
	style.id = "garage-business-dashboard-style";
	style.textContent = `
		:root {
			--cc-bg: #0E121B;
			--cc-bg-sec: #161C27;
			--cc-bg-ter: #1F2533;
			--cc-border: #252B37;
			--cc-border-hover: #3D4660;
			--cc-text: #EDF2F7;
			--cc-muted: #7B899D;
			--cc-pink: #E23670;
			--cc-orange: #F46A25;
			--cc-green: #34B29D;
			--cc-blue: #60a5fa;
		}
		.gb-wrap {
			background: var(--cc-bg);
			color: var(--cc-text);
			min-height: calc(100vh - 120px);
			padding: 18px;
			border-radius: 14px;
			box-shadow: 0 8px 36px rgba(0,0,0,.55);
		}
		.gb-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; gap:12px; }
		.gb-brand { display:flex; align-items:center; gap:10px; }
		.gb-logo {
			width: 32px; height: 32px; border-radius: 10px; display:flex; align-items:center; justify-content:center;
			font-size: 11px; font-weight: 700; color: #fff;
			background: linear-gradient(135deg, var(--cc-pink), var(--cc-orange));
		}
		.gb-title { font-size:20px; font-weight:700; color:var(--cc-text); margin:0; letter-spacing:-.02em; }
		.gb-title-accent {
			background: linear-gradient(135deg, var(--cc-pink), var(--cc-orange));
			-webkit-background-clip: text;
			background-clip: text;
			color: transparent;
		}
		.gb-sub { font-size:12px; color:var(--cc-muted); margin-top:2px; }
		.gb-badge {
			border:1px solid rgba(52,178,157,.25);
			color:#6fe5ce;
			background:rgba(52,178,157,.08);
			border-radius:999px; padding:4px 10px; font-size:11px; font-weight:600; letter-spacing:.03em;
		}
		.gb-grid-4 { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-bottom:12px; }
		.gb-card {
			position: relative;
			background: rgba(22,28,39,.8);
			border:1px solid var(--cc-border);
			border-radius:12px;
			padding:14px;
			box-shadow: 0 2px 8px rgba(0,0,0,.35);
		}
		.gb-card::before {
			content:"";
			position:absolute; left:0; right:0; top:0; height:2px;
			background: linear-gradient(90deg, var(--cc-pink), var(--cc-orange));
			border-radius: 12px 12px 0 0;
			opacity:.7;
		}
		.gb-card h4 { margin:0; color:var(--cc-muted); font-size:11px; text-transform:uppercase; letter-spacing:.06em; font-weight:700; }
		.gb-val { margin-top:7px; font-size:24px; font-weight:700; color:var(--cc-text); font-variant-numeric: tabular-nums; }
		.gb-meta { margin-top:4px; font-size:11px; color:var(--cc-muted); }
		.gb-grid-3 { display:grid; grid-template-columns:2fr 2fr 1.4fr; gap:12px; margin-bottom:12px; }
		.gb-list { margin:10px 0 0; padding:0; list-style:none; }
		.gb-row { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px; }
		.gb-label { font-size:12px; color:#ced9eb; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
		.gb-num { font-size:12px; color:#f3f7ff; font-weight:600; font-variant-numeric: tabular-nums; }
		.gb-track { width:100%; height:5px; border-radius:6px; background:#232c3d; margin-top:4px; overflow:hidden; }
		.gb-fill { height:100%; border-radius:6px; background:linear-gradient(90deg,var(--cc-pink),var(--cc-orange)); }
		.gb-status-pill { font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px; border:1px solid transparent; letter-spacing:.03em; }
		.gb-scheduled { background:#1f2533; border-color:#4b5b79; color:#a6b8db; }
		.gb-progress { background:rgba(96,165,250,.12); border-color:rgba(96,165,250,.35); color:#9bcbff; }
		.gb-ready { background:rgba(52,178,157,.12); border-color:rgba(52,178,157,.35); color:#8de6d5; }
		.gb-danger { background:rgba(226,54,112,.12); border-color:rgba(226,54,112,.4); color:#ff95ba; }
		.gb-default { background:#1e2233; border-color:#576487; color:#b2c0df; }
		.gb-spark { width:100%; height:120px; margin-top:10px; }
		.gb-spark-labels { display:flex; justify-content:space-between; font-size:10px; color:var(--cc-muted); margin-top:4px; }
		.gb-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
		.gb-jobs table { width:100%; border-collapse:collapse; margin-top:8px; }
		.gb-jobs th { text-align:left; font-size:11px; color:var(--cc-muted); font-weight:600; border-bottom:1px solid #2a3346; padding:8px 0; }
		.gb-jobs td { font-size:12px; color:#dbe7fb; border-bottom:1px solid #202a3d; padding:8px 0; }
		.gb-jobs tr:last-child td { border-bottom:none; }
		.gb-empty { color:var(--cc-muted); font-size:12px; padding:12px 0; }
		.gb-loading { color:var(--cc-muted); font-size:13px; padding:24px; text-align:center; }
		@media (max-width: 1200px) {
			.gb-grid-4 { grid-template-columns:repeat(2,minmax(0,1fr)); }
			.gb-grid-3 { grid-template-columns:1fr; }
			.gb-grid-2 { grid-template-columns:1fr; }
		}
	`;
	document.head.appendChild(style);
}

function mountGarageDashboard(wrapper) {
	injectStyles();
	const mountNode = getMountNode(wrapper);
	if (!mountNode) {
		return;
	}
	const mountPoint = document.createElement("div");
	mountNode.innerHTML = "";
	mountNode.appendChild(mountPoint);

	const { createApp } = window.Vue;
	createApp({
		template: `
			<div class="gb-wrap">
				<div class="gb-header">
					<div>
						<div class="gb-brand">
							<div class="gb-logo">CC</div>
							<h3 class="gb-title">Garage <span class="gb-title-accent">Command Center</span></h3>
						</div>
						<div class="gb-sub">Real-time operations dashboard</div>
					</div>
					<div class="gb-badge">Last refresh: {{ refreshedAt }}</div>
				</div>

				<div v-if="loading" class="gb-loading">Loading dashboard data...</div>
				<div v-else>
					<div class="gb-grid-4">
						<div class="gb-card"><h4>Today Revenue</h4><div class="gb-val">{{ money(kpi.today_revenue) }}</div><div class="gb-meta">Sales invoices linked to job cards</div></div>
						<div class="gb-card"><h4>Month Revenue</h4><div class="gb-val">{{ money(kpi.month_revenue) }}</div><div class="gb-meta">From month start to today</div></div>
						<div class="gb-card"><h4>Outstanding</h4><div class="gb-val">{{ money(kpi.outstanding) }}</div><div class="gb-meta">Pending receivables</div></div>
						<div class="gb-card"><h4>Open Jobs</h4><div class="gb-val">{{ number(kpi.open_jobs) }}</div><div class="gb-meta">Ready to invoice: {{ number(kpi.ready_to_invoice) }}</div></div>
					</div>

					<div class="gb-grid-3">
						<div class="gb-card">
							<h4>Job Card Status Mix</h4>
							<ul class="gb-list">
								<li class="gb-row" v-for="row in jobStatus" :key="'job-' + row.status">
									<div style="width:100%">
										<div class="gb-row">
											<span class="gb-label">{{ row.status }}</span>
											<span class="gb-num">{{ number(row.count) }}</span>
										</div>
										<div class="gb-track"><div class="gb-fill" :style="{ width: pct(row.count, jobStatusMax) + '%' }"></div></div>
									</div>
								</li>
							</ul>
						</div>

						<div class="gb-card">
							<h4>Top Services (Month)</h4>
							<ul class="gb-list">
								<li class="gb-row" v-for="row in topServices" :key="'svc-' + row.item_code">
									<div style="width:100%">
										<div class="gb-row">
											<span class="gb-label">{{ row.item_name }}</span>
											<span class="gb-num">{{ money(row.amount) }}</span>
										</div>
										<div class="gb-meta">Qty {{ number(row.qty) }}</div>
										<div class="gb-track"><div class="gb-fill" :style="{ width: pct(row.amount, topServiceMax) + '%' }"></div></div>
									</div>
								</li>
							</ul>
							<div v-if="!topServices.length" class="gb-empty">No service data yet.</div>
						</div>

						<div class="gb-card">
							<h4>Service Appointments Today</h4>
							<div class="gb-val">{{ number(kpi.today_appointments) }}</div>
							<div class="gb-meta">Completion rate (month): {{ formatPct(kpi.completion_rate) }}</div>
							<div class="gb-track" style="margin-top:10px;"><div class="gb-fill" :style="{ width: Math.min(kpi.completion_rate || 0, 100) + '%' }"></div></div>
							<h4 style="margin-top:16px;">Appointment Status Mix</h4>
							<ul class="gb-list">
								<li class="gb-row" v-for="row in appointmentStatus.slice(0, 6)" :key="'apt-' + row.status">
									<span class="gb-label">{{ row.status }}</span>
									<span class="gb-num">{{ number(row.count) }}</span>
								</li>
							</ul>
						</div>
					</div>

					<div class="gb-grid-2">
						<div class="gb-card">
							<h4>Revenue Trend</h4>
							<svg class="gb-spark" viewBox="0 0 600 140" preserveAspectRatio="none">
								<polyline :points="sparklinePoints" fill="none" stroke="#49b8ff" stroke-width="3" />
								<polyline :points="sparklineFill" fill="rgba(73,184,255,0.12)" stroke="none" />
							</svg>
							<div class="gb-spark-labels">
								<span>{{ trendStartLabel }}</span>
								<span>{{ trendEndLabel }}</span>
							</div>
						</div>
						<div class="gb-card">
							<h4>Top Parts (Month)</h4>
							<ul class="gb-list">
								<li class="gb-row" v-for="row in topParts" :key="'part-' + row.item_code">
									<div style="width:100%">
										<div class="gb-row">
											<span class="gb-label">{{ row.item_name }}</span>
											<span class="gb-num">{{ money(row.amount) }}</span>
										</div>
										<div class="gb-meta">Qty {{ number(row.qty) }}</div>
										<div class="gb-track"><div class="gb-fill" :style="{ width: pct(row.amount, topPartMax) + '%' }"></div></div>
									</div>
								</li>
							</ul>
							<div v-if="!topParts.length" class="gb-empty">No parts data yet.</div>
						</div>
					</div>

					<div class="gb-card gb-jobs">
						<h4>Recent Job Cards</h4>
						<table v-if="recentJobs.length">
							<thead>
								<tr><th>Job Card</th><th>Customer</th><th>Status</th><th>Date</th></tr>
							</thead>
							<tbody>
								<tr v-for="row in recentJobs" :key="row.name">
									<td><a :href="'/app/job-card/' + row.name" style="color:#89beff">{{ row.name }}</a></td>
									<td>{{ row.customer || '-' }}</td>
									<td>
										<span class="gb-status-pill" :class="statusClass(row.status)">{{ row.status }}</span>
									</td>
									<td>{{ row.posting_date || '-' }}</td>
								</tr>
							</tbody>
						</table>
						<div v-else class="gb-empty">No recent jobs found.</div>
					</div>
				</div>
			</div>
		`,
		data() {
			return {
				loading: true,
				refreshedAt: "-",
				kpi: {},
				jobStatus: [],
				appointmentStatus: [],
				revenueTrend: [],
				topServices: [],
				topParts: [],
				recentJobs: [],
			};
		},
		computed: {
			jobStatusMax() {
				return Math.max(1, ...this.jobStatus.map((x) => Number(x.count || 0)));
			},
			topServiceMax() {
				return Math.max(1, ...this.topServices.map((x) => Number(x.amount || 0)));
			},
			topPartMax() {
				return Math.max(1, ...this.topParts.map((x) => Number(x.amount || 0)));
			},
			trendStartLabel() {
				return this.revenueTrend.length ? this.revenueTrend[0].label : "-";
			},
			trendEndLabel() {
				return this.revenueTrend.length ? this.revenueTrend[this.revenueTrend.length - 1].label : "-";
			},
			sparklinePoints() {
				if (!this.revenueTrend.length) {
					return "";
				}
				const values = this.revenueTrend.map((x) => Number(x.amount || 0));
				const max = Math.max(1, ...values);
				const step = values.length > 1 ? 600 / (values.length - 1) : 600;
				return values
					.map((value, idx) => {
						const x = idx * step;
						const y = 130 - (value / max) * 110;
						return x + "," + y;
					})
					.join(" ");
			},
			sparklineFill() {
				if (!this.sparklinePoints) {
					return "";
				}
				return "0,130 " + this.sparklinePoints + " 600,130";
			},
		},
		methods: {
			number(v) {
				return Number(v || 0).toLocaleString();
			},
			money(v) {
				return format_currency(Number(v || 0), frappe.boot.sysdefaults.currency || "USD");
			},
			formatPct(v) {
				return (Number(v || 0)).toFixed(1) + "%";
			},
			pct(v, max) {
				if (!max) {
					return 0;
				}
				return Math.min(100, Math.max(0, (Number(v || 0) / Number(max)) * 100));
			},
			statusClass(status) {
				const s = String(status || "").toLowerCase();
				if (s.includes("ready")) return "gb-ready";
				if (s.includes("progress")) return "gb-progress";
				if (s.includes("cancel")) return "gb-danger";
				if (s.includes("schedule")) return "gb-scheduled";
				return "gb-default";
			},
			loadData() {
				this.loading = true;
				frappe.call({
					method: GARAGE_DASHBOARD_METHOD,
					args: { days: 7 },
					callback: (r) => {
						const data = (r && r.message) || {};
						this.kpi = data.kpis || {};
						this.jobStatus = data.job_status || [];
						this.appointmentStatus = data.appointment_status || [];
						this.revenueTrend = data.revenue_trend || [];
						this.topServices = data.top_services || [];
						this.topParts = data.top_parts || [];
						this.recentJobs = data.recent_jobs || [];
						this.refreshedAt = frappe.datetime.now_datetime();
					},
					always: () => {
						this.loading = false;
					},
				});
			},
		},
		mounted() {
			this.loadData();
			mountNode.__garage_dashboard_refresh = () => this.loadData();
		},
	}).mount(mountPoint);
}

function mountFallbackDashboard(wrapper) {
	injectStyles();
	const mountNode = getMountNode(wrapper);
	if (!mountNode) {
		return;
	}
	const mountPoint = document.createElement("div");
	mountNode.innerHTML = "";
	mountNode.appendChild(mountPoint);
	mountPoint.className = "gb-wrap";
	mountPoint.innerHTML = `<div class="gb-loading">Loading dashboard data...</div>`;

	frappe.call({
		method: GARAGE_DASHBOARD_METHOD,
		args: { days: 7 },
		callback: (r) => {
			const data = (r && r.message) || {};
			const k = data.kpis || {};
			const money = (v) =>
				format_currency(Number(v || 0), frappe.boot.sysdefaults.currency || "USD");
			const number = (v) => Number(v || 0).toLocaleString();
			const rows = (data.recent_jobs || [])
				.map(
					(x) => `<tr>
						<td><a href="/app/job-card/${x.name}" style="color:#89beff">${x.name}</a></td>
						<td>${x.customer || "-"}</td>
						<td>${x.status || "-"}</td>
						<td>${x.posting_date || "-"}</td>
					</tr>`
				)
				.join("");

			mountPoint.innerHTML = `
				<div class="gb-header">
					<div>
						<div class="gb-brand">
							<div class="gb-logo">CC</div>
							<h3 class="gb-title">Garage <span class="gb-title-accent">Command Center</span></h3>
						</div>
						<div class="gb-sub">Fallback mode (Vue unavailable), data is still live.</div>
					</div>
				</div>
				<div class="gb-grid-4">
					<div class="gb-card"><h4>Today Revenue</h4><div class="gb-val">${money(k.today_revenue)}</div></div>
					<div class="gb-card"><h4>Month Revenue</h4><div class="gb-val">${money(k.month_revenue)}</div></div>
					<div class="gb-card"><h4>Outstanding</h4><div class="gb-val">${money(k.outstanding)}</div></div>
					<div class="gb-card"><h4>Open Jobs</h4><div class="gb-val">${number(k.open_jobs)}</div></div>
				</div>
				<div class="gb-card gb-jobs">
					<h4>Recent Job Cards</h4>
					<table>
						<thead><tr><th>Job Card</th><th>Customer</th><th>Status</th><th>Date</th></tr></thead>
						<tbody>${rows || `<tr><td colspan="4">No recent jobs found.</td></tr>`}</tbody>
					</table>
				</div>
			`;
		},
		error: () => {
			mountPoint.innerHTML =
				`<div class="gb-card"><div class="gb-empty">Failed to load dashboard data.</div></div>`;
		},
	});
}

frappe.pages["garage-business-dashboard"].on_page_load = function (wrapper) {
	ensureVue()
		.then(() => mountGarageDashboard(wrapper))
		.catch(() => mountFallbackDashboard(wrapper));
};
