// Copyright (c) 2025, Infoney and contributors
// For license information, please see license.txt

frappe.pages['garage-dashboard'].on_page_load = function(wrapper) {
	new GarageDashboard(wrapper);
}

frappe.pages['garage-dashboard'].on_page_hide = function() {
	if (window._garageDashboardIntervalId) {
		clearInterval(window._garageDashboardIntervalId);
		window._garageDashboardIntervalId = null;
	}
	frappe.hide_progress();
}

class GarageDashboard {
	constructor(wrapper) {
		if (window._garageDashboardIntervalId) {
			clearInterval(window._garageDashboardIntervalId);
			window._garageDashboardIntervalId = null;
		}
		frappe.hide_progress();
		
		this.page = frappe.ui.make_app_page({
			parent: wrapper,
			title: __('Garage Dashboard'),
			single_column: false
		});
		
		this.wrapper = $(this.page.body);
		this.sidebar = $(this.page.sidebar);
		this.company = frappe.defaults.get_user_default("Company");
		this.active_tab = 'jobs';
		
		this.setup_filters();
		this.setup_sidebar();
		this.setup_layout();
		this.load_dashboard_data('constructor');
		this.load_sidebar_data('jobs');
		
		// Auto-refresh every 2 minutes
		window._garageDashboardIntervalId = setInterval(() => {
			this.load_dashboard_data('interval');
			this.load_sidebar_data(this.active_tab);
		}, 120000);
		window._garageDashboardInstance = this;
	}
	
	setup_filters() {
		this.page.set_primary_action(__('New Job Card'), () => {
			frappe.new_doc('Job Card');
		}, 'add');
		
		this.page.add_action_icon('octicon octicon-calendar', () => {
			frappe.new_doc('Service Appointment');
		}, __('New Appointment'));
		
		this.page.add_action_icon('octicon octicon-repo', () => {
			frappe.new_doc('Vehicle');
		}, __('New Vehicle'));
		
		this.page.add_button(__('Refresh'), () => {
			this.load_dashboard_data('refresh_button');
			this.load_sidebar_data(this.active_tab);
		}, {icon: 'refresh'});
		
		this.page.add_field({
			fieldname: 'company',
			label: __('Company'),
			fieldtype: 'Link',
			options: 'Company',
			default: this.company,
			change: () => {
				this.company = this.page.fields_dict.company.get_value();
				this.load_dashboard_data('company_filter');
				this.load_sidebar_data(this.active_tab);
			}
		});
		
		this.page.add_menu_item(__('View All Job Cards'), () => {
			frappe.set_route('List', 'Job Card');
		});
		
		this.page.add_menu_item(__('View All Appointments'), () => {
			frappe.set_route('List', 'Service Appointment');
		});
		
		this.page.add_menu_item(__('View All Inspections'), () => {
			frappe.set_route('List', 'Vehicle Inspection');
		});
		
		this.page.add_menu_item(__('View All Invoices'), () => {
			frappe.set_route('List', 'Sales Invoice');
		});
	}
	
	setup_sidebar() {
		this.sidebar.html(`
			<style>
				.garage-sidebar {
					padding: 0;
				}
				.garage-sidebar-tabs {
					display: flex;
					flex-direction: column;
					border-bottom: 1px solid var(--border-color);
					background: var(--bg-color);
					position: sticky;
					top: 0;
					z-index: 1;
				}
				.garage-sidebar-tab {
					padding: 12px 15px;
					cursor: pointer;
					font-size: 13px;
					font-weight: 500;
					color: var(--text-muted);
					border-left: 3px solid transparent;
					display: flex;
					align-items: center;
					gap: 10px;
					transition: all 0.15s;
				}
				.garage-sidebar-tab:hover {
					background: var(--bg-light-gray);
					color: var(--text-color);
				}
				.garage-sidebar-tab.active {
					background: var(--bg-blue);
					color: var(--text-color);
					border-left-color: var(--primary);
					font-weight: 600;
				}
				.garage-sidebar-tab .tab-icon {
					font-size: 16px;
					width: 20px;
					text-align: center;
				}
				.garage-sidebar-tab .tab-badge {
					margin-left: auto;
					background: var(--bg-dark-gray);
					color: var(--text-muted);
					padding: 2px 8px;
					border-radius: 10px;
					font-size: 11px;
					font-weight: 600;
				}
				.garage-sidebar-tab.active .tab-badge {
					background: var(--primary);
					color: white;
				}
				.garage-sidebar-content {
					max-height: calc(100vh - 250px);
					overflow-y: auto;
				}
				.sidebar-section {
					border-bottom: 1px solid var(--border-color);
				}
				.sidebar-section:last-child {
					border-bottom: none;
				}
				.sidebar-section-header {
					padding: 10px 15px;
					font-size: 10px;
					font-weight: 700;
					text-transform: uppercase;
					letter-spacing: 0.5px;
					color: var(--text-muted);
					background: var(--bg-color);
					display: flex;
					justify-content: space-between;
					align-items: center;
					position: sticky;
					top: 0;
				}
				.sidebar-section-header .section-count {
					background: var(--bg-dark-gray);
					padding: 2px 6px;
					border-radius: 8px;
					font-size: 10px;
				}
				.sidebar-item {
					padding: 10px 15px;
					border-bottom: 1px solid var(--border-color);
					cursor: pointer;
					transition: background 0.1s;
				}
				.sidebar-item:hover {
					background: var(--bg-light-gray);
				}
				.sidebar-item:last-child {
					border-bottom: none;
				}
				.sidebar-item-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 4px;
				}
				.sidebar-item-title {
					font-weight: 600;
					font-size: 12px;
					color: var(--text-color);
				}
				.sidebar-item-details {
					font-size: 11px;
					color: var(--text-muted);
					display: flex;
					gap: 10px;
					flex-wrap: wrap;
				}
				.sidebar-empty {
					padding: 25px 15px;
					text-align: center;
					color: var(--text-muted);
					font-size: 12px;
				}
				.status-badge {
					display: inline-block;
					padding: 2px 8px;
					border-radius: 10px;
					font-size: 10px;
					font-weight: 600;
				}
				.status-draft { background: #e0e0e0; color: #555; }
				.status-scheduled { background: #e3f2fd; color: #1565c0; }
				.status-checked-in { background: #bbdefb; color: #1976d2; }
				.status-in-progress { background: #fff3e0; color: #ef6c00; }
				.status-inspected { background: #e8eaf6; color: #3f51b5; }
				.status-estimated { background: #fce4ec; color: #c2185b; }
				.status-approved { background: #e8f5e9; color: #2e7d32; }
				.status-ready-to-invoice { background: #fff8e1; color: #f57c00; }
				.status-invoiced { background: #c8e6c9; color: #1b5e20; }
				.status-closed { background: #eceff1; color: #546e7a; }
				.status-completed { background: #c8e6c9; color: #1b5e20; }
				.status-cancelled { background: #ffebee; color: #c62828; }
				.status-no-show { background: #fbe9e7; color: #d84315; }
				.status-paid { background: #c8e6c9; color: #1b5e20; }
				.status-unpaid { background: #ffebee; color: #c62828; }
			</style>
			
			<div class="garage-sidebar">
				<div class="garage-sidebar-tabs">
					<div class="garage-sidebar-tab active" data-tab="jobs">
						<span class="tab-icon">🔧</span>
						<span>Jobs</span>
						<span class="tab-badge" id="sidebar-jobs-count">0</span>
					</div>
					<div class="garage-sidebar-tab" data-tab="appointments">
						<span class="tab-icon">📅</span>
						<span>Appointments</span>
						<span class="tab-badge" id="sidebar-appointments-count">0</span>
					</div>
					<div class="garage-sidebar-tab" data-tab="inspections">
						<span class="tab-icon">🔍</span>
						<span>Inspections</span>
						<span class="tab-badge" id="sidebar-inspections-count">0</span>
					</div>
					<div class="garage-sidebar-tab" data-tab="sales">
						<span class="tab-icon">💰</span>
						<span>Sales</span>
						<span class="tab-badge" id="sidebar-sales-count">0</span>
					</div>
				</div>
				<div class="garage-sidebar-content" id="garage-sidebar-content">
					<div class="sidebar-empty">Loading...</div>
				</div>
			</div>
		`);
		
		// Tab click handlers
		this.sidebar.find('.garage-sidebar-tab').on('click', (e) => {
			const tab = $(e.currentTarget).data('tab');
			this.switch_tab(tab);
		});
	}
	
	switch_tab(tab) {
		this.active_tab = tab;
		this.sidebar.find('.garage-sidebar-tab').removeClass('active');
		this.sidebar.find(`.garage-sidebar-tab[data-tab="${tab}"]`).addClass('active');
		this.load_sidebar_data(tab);
	}
	
	load_sidebar_data(tab) {
		$('#garage-sidebar-content').html('<div class="sidebar-empty">Loading...</div>');
		
		frappe.call({
			method: 'workshop_mgmt.workshop_management.page.garage_dashboard.garage_dashboard.get_sidebar_data',
			args: {
				filters: { company: this.company },
				tab: tab
			},
			callback: (r) => {
				if (r.message) {
					this.render_sidebar_content(tab, r.message);
				}
			}
		});
	}
	
	render_sidebar_content(tab, data) {
		let html = '';
		
		if (tab === 'jobs') {
			html = this.render_jobs_sidebar(data);
			$('#sidebar-jobs-count').text(data.counts.active + data.counts.pending);
		} else if (tab === 'appointments') {
			html = this.render_appointments_sidebar(data);
			$('#sidebar-appointments-count').text(data.counts.today + data.counts.checked_in);
		} else if (tab === 'inspections') {
			html = this.render_inspections_sidebar(data);
			$('#sidebar-inspections-count').text(data.counts.today + data.counts.pending_action);
		} else if (tab === 'sales') {
			html = this.render_sales_sidebar(data);
			$('#sidebar-sales-count').text(data.counts.today);
		}
		
		$('#garage-sidebar-content').html(html);
		
		// Click handlers for items
		$('#garage-sidebar-content .sidebar-item').on('click', function() {
			const doctype = $(this).data('doctype');
			const name = $(this).data('name');
			if (doctype && name) {
				frappe.set_route('Form', doctype, name);
			}
		});
	}
	
	render_jobs_sidebar(data) {
		let html = '';
		
		html += `<div class="sidebar-section">
			<div class="sidebar-section-header">
				<span>Active Jobs</span>
				<span class="section-count">${data.counts.active}</span>
			</div>`;
		if (data.active.length > 0) {
			data.active.forEach(job => { html += this.render_job_item(job); });
		} else {
			html += '<div class="sidebar-empty">No active jobs</div>';
		}
		html += '</div>';
		
		html += `<div class="sidebar-section">
			<div class="sidebar-section-header">
				<span>Pending Invoice</span>
				<span class="section-count">${data.counts.pending}</span>
			</div>`;
		if (data.pending.length > 0) {
			data.pending.forEach(job => { html += this.render_job_item(job); });
		} else {
			html += '<div class="sidebar-empty">No pending invoices</div>';
		}
		html += '</div>';
		
		html += `<div class="sidebar-section">
			<div class="sidebar-section-header">
				<span>Recently Completed</span>
				<span class="section-count">${data.counts.completed}</span>
			</div>`;
		if (data.completed.length > 0) {
			data.completed.slice(0, 10).forEach(job => { html += this.render_job_item(job); });
		} else {
			html += '<div class="sidebar-empty">No completed jobs</div>';
		}
		html += '</div>';
		
		return html;
	}
	
	render_job_item(job) {
		const status_class = 'status-' + job.status.toLowerCase().replace(/ /g, '-');
		return `
			<div class="sidebar-item" data-doctype="Job Card" data-name="${job.name}">
				<div class="sidebar-item-header">
					<span class="sidebar-item-title">${job.name}</span>
					<span class="status-badge ${status_class}">${job.status}</span>
				</div>
				<div class="sidebar-item-details">
					<span>${job.customer || '-'}</span>
					<span>${job.vehicle || '-'}</span>
				</div>
			</div>
		`;
	}
	
	render_appointments_sidebar(data) {
		let html = '';
		
		html += `<div class="sidebar-section">
			<div class="sidebar-section-header">
				<span>Checked-In</span>
				<span class="section-count">${data.counts.checked_in}</span>
			</div>`;
		if (data.checked_in.length > 0) {
			data.checked_in.forEach(apt => { html += this.render_appointment_item(apt); });
		} else {
			html += '<div class="sidebar-empty">No checked-in</div>';
		}
		html += '</div>';
		
		html += `<div class="sidebar-section">
			<div class="sidebar-section-header">
				<span>Today</span>
				<span class="section-count">${data.counts.today}</span>
			</div>`;
		if (data.today.length > 0) {
			data.today.forEach(apt => { html += this.render_appointment_item(apt); });
		} else {
			html += '<div class="sidebar-empty">No appointments today</div>';
		}
		html += '</div>';
		
		html += `<div class="sidebar-section">
			<div class="sidebar-section-header">
				<span>Upcoming</span>
				<span class="section-count">${data.counts.upcoming}</span>
			</div>`;
		if (data.upcoming.length > 0) {
			data.upcoming.slice(0, 10).forEach(apt => { html += this.render_appointment_item(apt); });
		} else {
			html += '<div class="sidebar-empty">No upcoming</div>';
		}
		html += '</div>';
		
		return html;
	}
	
	render_appointment_item(apt) {
		const status_class = 'status-' + apt.status.toLowerCase().replace(/-/g, '-');
		const time = apt.scheduled_start ? frappe.datetime.str_to_user(apt.scheduled_start) : '-';
		return `
			<div class="sidebar-item" data-doctype="Service Appointment" data-name="${apt.name}">
				<div class="sidebar-item-header">
					<span class="sidebar-item-title">${apt.name}</span>
					<span class="status-badge ${status_class}">${apt.status}</span>
				</div>
				<div class="sidebar-item-details">
					<span>${apt.customer || '-'}</span>
					<span>${time}</span>
				</div>
			</div>
		`;
	}
	
	render_inspections_sidebar(data) {
		let html = '';
		
		html += `<div class="sidebar-section">
			<div class="sidebar-section-header">
				<span>Pending Action</span>
				<span class="section-count">${data.counts.pending_action}</span>
			</div>`;
		if (data.pending_action.length > 0) {
			data.pending_action.forEach(ins => { html += this.render_inspection_item(ins); });
		} else {
			html += '<div class="sidebar-empty">No pending</div>';
		}
		html += '</div>';
		
		html += `<div class="sidebar-section">
			<div class="sidebar-section-header">
				<span>Today</span>
				<span class="section-count">${data.counts.today}</span>
			</div>`;
		if (data.today.length > 0) {
			data.today.forEach(ins => { html += this.render_inspection_item(ins); });
		} else {
			html += '<div class="sidebar-empty">No inspections today</div>';
		}
		html += '</div>';
		
		html += `<div class="sidebar-section">
			<div class="sidebar-section-header">
				<span>Recent</span>
				<span class="section-count">${data.counts.recent}</span>
			</div>`;
		if (data.recent.length > 0) {
			data.recent.slice(0, 10).forEach(ins => { html += this.render_inspection_item(ins); });
		} else {
			html += '<div class="sidebar-empty">No recent</div>';
		}
		html += '</div>';
		
		return html;
	}
	
	render_inspection_item(ins) {
		const date = ins.inspection_date ? frappe.datetime.str_to_user(ins.inspection_date) : '-';
		const hasJobCard = ins.job_card ? '✅' : '⏳';
		return `
			<div class="sidebar-item" data-doctype="Vehicle Inspection" data-name="${ins.name}">
				<div class="sidebar-item-header">
					<span class="sidebar-item-title">${ins.name}</span>
					<span>${hasJobCard}</span>
				</div>
				<div class="sidebar-item-details">
					<span>${ins.customer || '-'}</span>
					<span>${ins.vehicle || '-'}</span>
				</div>
			</div>
		`;
	}
	
	render_sales_sidebar(data) {
		let html = '';
		
		html += `<div class="sidebar-section">
			<div class="sidebar-section-header">
				<span>Today's Sales</span>
				<span class="section-count">${format_currency(data.totals.today)}</span>
			</div>`;
		if (data.today.length > 0) {
			data.today.forEach(inv => { html += this.render_invoice_item(inv); });
		} else {
			html += '<div class="sidebar-empty">No sales today</div>';
		}
		html += '</div>';
		
		html += `<div class="sidebar-section">
			<div class="sidebar-section-header">
				<span>Unpaid</span>
				<span class="section-count">${data.counts.unpaid}</span>
			</div>`;
		if (data.unpaid.length > 0) {
			data.unpaid.slice(0, 10).forEach(inv => { html += this.render_invoice_item(inv, true); });
		} else {
			html += '<div class="sidebar-empty">No unpaid invoices</div>';
		}
		html += '</div>';
		
		html += `<div class="sidebar-section">
			<div class="sidebar-section-header">
				<span>Draft</span>
				<span class="section-count">${data.counts.draft}</span>
			</div>`;
		if (data.draft.length > 0) {
			data.draft.slice(0, 10).forEach(inv => { html += this.render_invoice_item(inv); });
		} else {
			html += '<div class="sidebar-empty">No drafts</div>';
		}
		html += '</div>';
		
		return html;
	}
	
	render_invoice_item(inv, showOutstanding = false) {
		const amount = showOutstanding && inv.outstanding_amount 
			? format_currency(inv.outstanding_amount) + ' due'
			: format_currency(inv.grand_total);
		const status = inv.status || 'Draft';
		const status_class = 'status-' + status.toLowerCase().replace(/ /g, '-');
		return `
			<div class="sidebar-item" data-doctype="Sales Invoice" data-name="${inv.name}">
				<div class="sidebar-item-header">
					<span class="sidebar-item-title">${inv.name}</span>
					<span class="status-badge ${status_class}">${status}</span>
				</div>
				<div class="sidebar-item-details">
					<span>${inv.customer || '-'}</span>
					<span>${amount}</span>
				</div>
			</div>
		`;
	}
	
	setup_layout() {
		this.wrapper.html(`
			<style>
				.garage-dashboard {
					padding: 20px;
					background: var(--bg-color);
				}
				.quick-access-banner {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					color: white;
					padding: 20px 25px;
					border-radius: 10px;
					margin-bottom: 20px;
					display: flex;
					justify-content: space-between;
					align-items: center;
					box-shadow: 0 4px 15px rgba(0,0,0,0.15);
				}
				.quick-access-banner h2 {
					margin: 0;
					font-size: 22px;
					font-weight: 600;
				}
				.quick-access-banner p {
					margin: 5px 0 0 0;
					opacity: 0.9;
					font-size: 13px;
				}
				.quick-actions-buttons {
					display: flex;
					gap: 10px;
				}
				.quick-action-btn {
					background: rgba(255,255,255,0.2);
					border: 1px solid rgba(255,255,255,0.3);
					color: white;
					padding: 10px 18px;
					border-radius: 6px;
					cursor: pointer;
					transition: all 0.2s;
					font-weight: 500;
					font-size: 13px;
				}
				.quick-action-btn:hover {
					background: rgba(255,255,255,0.3);
					transform: translateY(-2px);
				}
				.kpi-cards {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
					gap: 15px;
					margin-bottom: 20px;
				}
				.kpi-card {
					background: var(--card-bg);
					border-radius: 8px;
					padding: 18px;
					box-shadow: var(--card-shadow);
					transition: transform 0.2s;
				}
				.kpi-card:hover {
					transform: translateY(-3px);
				}
				.kpi-value {
					font-size: 28px;
					font-weight: bold;
					margin: 8px 0;
				}
				.kpi-label {
					color: var(--text-muted);
					font-size: 12px;
					text-transform: uppercase;
					font-weight: 600;
				}
				.kpi-card.blue { border-left: 4px solid #2196f3; }
				.kpi-card.blue .kpi-value { color: #2196f3; }
				.kpi-card.green { border-left: 4px solid #4caf50; }
				.kpi-card.green .kpi-value { color: #4caf50; }
				.kpi-card.orange { border-left: 4px solid #ff9800; }
				.kpi-card.orange .kpi-value { color: #ff9800; }
				.kpi-card.purple { border-left: 4px solid #9c27b0; }
				.kpi-card.purple .kpi-value { color: #9c27b0; }
				
				.dashboard-row {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
					gap: 15px;
					margin-bottom: 15px;
				}
				.dashboard-card {
					background: var(--card-bg);
					border-radius: 8px;
					padding: 18px;
					box-shadow: var(--card-shadow);
				}
				.dashboard-card h4 {
					margin: 0 0 12px 0;
					font-size: 15px;
					color: var(--heading-color);
					font-weight: 600;
				}
				.chart-container {
					height: 250px;
					position: relative;
				}
				.list-item {
					padding: 10px 0;
					border-bottom: 1px solid var(--border-color);
					display: flex;
					justify-content: space-between;
					align-items: center;
				}
				.list-item:last-child {
					border-bottom: none;
				}
				.empty-state {
					text-align: center;
					padding: 30px;
					color: var(--text-muted);
					font-size: 13px;
				}
			</style>
			
			<div class="garage-dashboard">
				<div class="quick-access-banner">
					<div>
						<h2>🚗 Garage Dashboard</h2>
						<p>Manage workshop operations, track jobs, and monitor performance</p>
					</div>
					<div class="quick-actions-buttons">
						<button class="quick-action-btn" onclick="frappe.new_doc('Job Card')">+ New Job</button>
						<button class="quick-action-btn" onclick="frappe.new_doc('Service Appointment')">📅 Appointment</button>
						<button class="quick-action-btn" onclick="frappe.new_doc('Vehicle Inspection')">🔍 Inspection</button>
					</div>
				</div>
				
				<div class="kpi-cards">
					<div class="kpi-card blue">
						<div class="kpi-label">Jobs In Progress</div>
						<div class="kpi-value" id="kpi-in-progress">-</div>
					</div>
					<div class="kpi-card orange">
						<div class="kpi-label">Ready to Invoice</div>
						<div class="kpi-value" id="kpi-ready-invoice">-</div>
					</div>
					<div class="kpi-card green">
						<div class="kpi-label">Today's Revenue</div>
						<div class="kpi-value" id="kpi-revenue">-</div>
					</div>
					<div class="kpi-card purple">
						<div class="kpi-label">Vehicles This Month</div>
						<div class="kpi-value" id="kpi-vehicles">-</div>
					</div>
				</div>
				
				<div class="dashboard-row">
					<div class="dashboard-card">
						<h4>Revenue Trend (30 Days)</h4>
						<div class="chart-container" id="revenue-chart"></div>
					</div>
					<div class="dashboard-card">
						<h4>Job Status Distribution</h4>
						<div class="chart-container" id="status-chart"></div>
					</div>
				</div>
				
				<div class="dashboard-row">
					<div class="dashboard-card">
						<h4>Top Services</h4>
						<div id="top-services-list"></div>
					</div>
					<div class="dashboard-card">
						<h4>Top Parts</h4>
						<div id="top-parts-list"></div>
					</div>
				</div>
			</div>
		`);
	}
	
	load_dashboard_data(source = 'unknown') {
		const showProgress = source !== 'interval';
		if (showProgress) {
			frappe.show_progress(__('Loading'), 50, 100);
		}
		
		frappe.call({
			method: 'workshop_mgmt.workshop_management.page.garage_dashboard.garage_dashboard.get_dashboard_data',
			args: { filters: { company: this.company } },
			callback: (r) => {
				if (showProgress) frappe.hide_progress();
				if (r.message) this.render_dashboard(r.message);
			},
			error: () => { if (showProgress) frappe.hide_progress(); }
		});
	}
	
	render_dashboard(data) {
		$('#kpi-in-progress').text(data.kpis.jobs_in_progress);
		$('#kpi-ready-invoice').text(data.kpis.ready_to_invoice);
		$('#kpi-revenue').text(format_currency(data.kpis.today_revenue));
		$('#kpi-vehicles').text(data.kpis.vehicles_serviced);
		
		this.render_revenue_chart(data.revenue_chart);
		this.render_status_chart(data.job_status_summary);
		this.render_top_services(data.top_services);
		this.render_top_parts(data.top_parts);
	}
	
	render_revenue_chart(data) {
		if (!data || data.length === 0) {
			$('#revenue-chart').html('<div class="empty-state">No revenue data</div>');
			return;
		}
		new frappe.Chart('#revenue-chart', {
			type: 'line',
			data: {
				labels: data.map(d => frappe.datetime.str_to_user(d.date)),
				datasets: [{ name: 'Revenue', values: data.map(d => d.revenue) }]
			},
			colors: ['#4caf50'],
			height: 220
		});
	}
	
	render_status_chart(data) {
		if (!data || data.length === 0) {
			$('#status-chart').html('<div class="empty-state">No status data</div>');
			return;
		}
		new frappe.Chart('#status-chart', {
			type: 'donut',
			data: {
				labels: data.map(d => d.status),
				datasets: [{ values: data.map(d => d.count) }]
			},
			height: 220
		});
	}
	
	render_top_services(services) {
		if (!services || services.length === 0) {
			$('#top-services-list').html('<div class="empty-state">No service data</div>');
			return;
		}
		let html = '';
		services.forEach(s => {
			html += `<div class="list-item"><div><strong>${s.item_code}</strong><br><small>Used ${s.usage_count} times</small></div><strong>${format_currency(s.total_amount)}</strong></div>`;
		});
		$('#top-services-list').html(html);
	}
	
	render_top_parts(parts) {
		if (!parts || parts.length === 0) {
			$('#top-parts-list').html('<div class="empty-state">No parts data</div>');
			return;
		}
		let html = '';
		parts.forEach(p => {
			html += `<div class="list-item"><div><strong>${p.item_code}</strong><br><small>Qty: ${p.total_qty}</small></div><strong>${format_currency(p.total_amount)}</strong></div>`;
		});
		$('#top-parts-list').html(html);
	}
}
