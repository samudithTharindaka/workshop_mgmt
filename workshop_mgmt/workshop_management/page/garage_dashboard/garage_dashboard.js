// Copyright (c) 2025, Infoney and contributors
// For license information, please see license.txt

function format_currency(value) {
	if (!value && value !== 0) return '-';
	return frappe.format(value, {fieldtype: 'Currency'});
}

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
		this.active_tab = 'dashboard';
		
		this.setup_filters();
		this.setup_sidebar();
		this.setup_common_styles();
		this.render_layout('dashboard');
		this.load_dashboard_data('constructor');
		
		// Auto-refresh every 2 minutes
		window._garageDashboardIntervalId = setInterval(() => {
			if (this.active_tab === 'dashboard') {
				this.load_dashboard_data('interval');
			} else {
				this.load_tab_content(this.active_tab);
			}
		}, 120000);
		window._garageDashboardInstance = this;
	}
	
	setup_filters() {
		this.page.add_button(__('Refresh'), () => {
			this.load_dashboard_data('refresh_button');
			if (this.active_tab !== 'dashboard') {
				this.load_tab_content(this.active_tab);
			}
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
				this.load_tab_content(this.active_tab);
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
			</style>
			
			<div class="garage-sidebar">
				<div class="garage-sidebar-tabs">
					<div class="garage-sidebar-tab active" data-tab="dashboard">
						<span class="tab-icon"><i class="fa fa-dashboard"></i></span>
						<span>Dashboard</span>
					</div>
					<div class="garage-sidebar-tab" data-tab="jobs">
						<span class="tab-icon"><i class="fa fa-wrench"></i></span>
						<span>Jobs</span>
						<span class="tab-badge" id="sidebar-jobs-count">-</span>
					</div>
					<div class="garage-sidebar-tab" data-tab="appointments">
						<span class="tab-icon"><i class="fa fa-calendar"></i></span>
						<span>Appointments</span>
						<span class="tab-badge" id="sidebar-appointments-count">-</span>
					</div>
					<div class="garage-sidebar-tab" data-tab="inspections">
						<span class="tab-icon"><i class="fa fa-search"></i></span>
						<span>Inspections</span>
						<span class="tab-badge" id="sidebar-inspections-count">-</span>
					</div>
					<div class="garage-sidebar-tab" data-tab="sales">
						<span class="tab-icon"><i class="fa fa-money"></i></span>
						<span>Sales</span>
						<span class="tab-badge" id="sidebar-sales-count">-</span>
					</div>
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
		this.render_layout(tab);
		
		if (tab === 'dashboard') {
			this.load_dashboard_data('tab_switch');
		} else {
			this.load_tab_content(tab);
		}
	}
	
	setup_common_styles() {
		// Common styles that apply to all layouts
		if (!$('#garage-common-styles').length) {
			$('head').append(`
				<style id="garage-common-styles">
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
					.kpi-subtext {
						font-size: 11px;
						color: var(--text-muted);
						margin-top: 5px;
						font-weight: normal;
					}
					.summary-section {
						margin-top: 30px;
						margin-bottom: 20px;
					}
					.summary-section-title {
						font-size: 18px;
						font-weight: 600;
						color: var(--heading-color);
						margin-bottom: 15px;
						display: flex;
						align-items: center;
						gap: 8px;
					}
					.summary-card {
						min-height: 200px;
					}
					.summary-item {
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding: 8px 0;
						border-bottom: 1px solid var(--border-color);
					}
					.summary-item:last-child {
						border-bottom: none;
					}
					.summary-item-label {
						font-size: 13px;
						color: var(--text-color);
						display: flex;
						align-items: center;
						gap: 8px;
					}
					.summary-item-value {
						font-size: 14px;
						font-weight: 600;
						color: var(--text-color);
					}
					.summary-item-value.positive {
						color: #4caf50;
					}
					.summary-item-value.negative {
						color: #f44336;
					}
					.summary-item-value.neutral {
						color: var(--text-muted);
					}
					.summary-period {
						font-size: 11px;
						color: var(--text-muted);
						margin-top: 2px;
					}
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
						display: flex;
						justify-content: space-between;
						align-items: center;
					}
					.dashboard-card-header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin-bottom: 12px;
					}
					.dashboard-card-header h4 {
						margin: 0;
					}
					.view-all-link {
						font-size: 12px;
						color: var(--primary);
						cursor: pointer;
						text-decoration: none;
					}
					.view-all-link:hover {
						text-decoration: underline;
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
						cursor: pointer;
						transition: background 0.1s;
					}
					.list-item:hover {
						background: var(--bg-light-gray);
					}
					.list-item:last-child {
						border-bottom: none;
					}
					.list-item-content {
						flex: 1;
					}
					.list-item-title {
						font-weight: 600;
						font-size: 13px;
						color: var(--text-color);
						margin-bottom: 4px;
					}
					.list-item-details {
						font-size: 11px;
						color: var(--text-muted);
						display: flex;
						gap: 10px;
						flex-wrap: wrap;
					}
					.list-item-meta {
						text-align: right;
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
					.empty-state {
						text-align: center;
						padding: 30px;
						color: var(--text-muted);
						font-size: 13px;
					}
					.section-header {
						padding: 10px 0;
						font-size: 11px;
						font-weight: 700;
						text-transform: uppercase;
						letter-spacing: 0.5px;
						color: var(--text-muted);
						margin-top: 15px;
						margin-bottom: 8px;
						border-bottom: 1px solid var(--border-color);
					}
					.section-header:first-child {
						margin-top: 0;
					}
				</style>
			`);
		}
	}
	
	render_layout(tab) {
		// Clear existing content
		this.wrapper.empty();
		
		// Render appropriate layout based on tab
		if (tab === 'dashboard') {
			this.render_dashboard_layout();
		} else if (tab === 'jobs') {
			this.render_jobs_layout();
		} else if (tab === 'appointments') {
			this.render_appointments_layout();
		} else if (tab === 'inspections') {
			this.render_inspections_layout();
		} else if (tab === 'sales') {
			this.render_sales_layout();
		}
	}
	
	render_dashboard_layout() {
		this.wrapper.html(`
			<div class="garage-dashboard">
				<div class="quick-access-banner">
					<div>
						<h2><i class="fa fa-car"></i> Garage Dashboard</h2>
						<p>Manage workshop operations, track jobs, and monitor performance</p>
					</div>
					<div class="quick-actions-buttons">
						<button class="quick-action-btn" onclick="frappe.new_doc('Customer')"><i class="fa fa-user"></i> Customer</button>
						<button class="quick-action-btn" onclick="frappe.new_doc('Vehicle')"><i class="fa fa-car"></i> Vehicle</button>
						<button class="quick-action-btn" onclick="frappe.new_doc('Service Appointment')"><i class="fa fa-calendar"></i> Appointment</button>
						<button class="quick-action-btn" onclick="frappe.new_doc('Job Card')"><i class="fa fa-wrench"></i> Job Card</button>
					</div>
				</div>
				
				<div class="kpi-cards">
					<div class="kpi-card blue">
						<div class="kpi-label">Jobs In Progress</div>
						<div class="kpi-value" id="kpi-in-progress">-</div>
						<div class="kpi-subtext" id="kpi-in-progress-detail">-</div>
					</div>
					<div class="kpi-card orange">
						<div class="kpi-label">Ready to Invoice</div>
						<div class="kpi-value" id="kpi-ready-invoice">-</div>
						<div class="kpi-subtext" id="kpi-ready-invoice-detail">-</div>
					</div>
					<div class="kpi-card green">
						<div class="kpi-label">Today's Revenue</div>
						<div class="kpi-value" id="kpi-revenue">-</div>
						<div class="kpi-subtext" id="kpi-revenue-detail">-</div>
					</div>
					<div class="kpi-card purple">
						<div class="kpi-label">Vehicles This Month</div>
						<div class="kpi-value" id="kpi-vehicles">-</div>
						<div class="kpi-subtext" id="kpi-vehicles-detail">-</div>
					</div>
				</div>
				
				<div class="dashboard-row">
					<div class="dashboard-card">
						<div class="dashboard-card-header">
							<h4><i class="fa fa-check-circle"></i> Recently Closed Jobs</h4>
							<a class="view-all-link" onclick="frappe.set_route('List', 'Job Card')">View All</a>
						</div>
						<div id="recently-closed-jobs-list" style="max-height: 300px; overflow-y: auto;"><div class="empty-state">Loading...</div></div>
					</div>
					<div class="dashboard-card">
						<div class="dashboard-card-header">
							<h4><i class="fa fa-calendar"></i> Today's Appointments</h4>
							<a class="view-all-link" onclick="frappe.set_route('List', 'Service Appointment')">View All</a>
						</div>
						<div id="today-appointments-list" style="max-height: 300px; overflow-y: auto;"><div class="empty-state">Loading...</div></div>
					</div>
				</div>
				
				<div class="dashboard-row">
					<div class="dashboard-card">
						<div class="dashboard-card-header">
							<h4><i class="fa fa-exclamation-circle"></i> Pending Inspections</h4>
							<a class="view-all-link" onclick="frappe.set_route('List', 'Vehicle Inspection')">View All</a>
						</div>
						<div id="pending-inspections-list" style="max-height: 300px; overflow-y: auto;"><div class="empty-state">Loading...</div></div>
					</div>
					<div class="dashboard-card">
						<div class="dashboard-card-header">
							<h4><i class="fa fa-file-text"></i> Jobs Ready to Invoice</h4>
							<a class="view-all-link" onclick="frappe.set_route('List', 'Job Card')">View All</a>
						</div>
						<div id="jobs-ready-invoice-list" style="max-height: 300px; overflow-y: auto;"><div class="empty-state">Loading...</div></div>
					</div>
				</div>
				
				<div class="dashboard-row">
					<div class="dashboard-card">
						<h4><i class="fa fa-bar-chart"></i> Daily Jobs Count (30 Days)</h4>
						<div class="chart-container" id="daily-jobs-chart"><div class="empty-state">Loading...</div></div>
					</div>
					<div class="dashboard-card">
						<div class="dashboard-card-header">
							<h4><i class="fa fa-calendar-check-o"></i> Today's Completed Tasks</h4>
						</div>
						<div id="today-completed-tasks" style="padding: 15px;"><div class="empty-state">Loading...</div></div>
					</div>
				</div>
				
				<div class="dashboard-row">
					<div class="dashboard-card">
						<div class="dashboard-card-header">
							<h4><i class="fa fa-calendar"></i> Upcoming Appointments</h4>
							<a class="view-all-link" onclick="frappe.set_route('List', 'Service Appointment')">View All</a>
						</div>
						<div id="upcoming-appointments-list" style="max-height: 400px; overflow-y: auto;"><div class="empty-state">Loading...</div></div>
					</div>
				</div>
			</div>
		`);
	}
	
	render_jobs_layout() {
		this.wrapper.html(`
			<div class="garage-dashboard">
				<div class="quick-access-banner">
					<div>
						<h2><i class="fa fa-wrench"></i> Jobs Management</h2>
						<p>View and manage all service jobs</p>
					</div>
					<div class="quick-actions-buttons">
						<button class="quick-action-btn" onclick="frappe.new_doc('Job Card')"><i class="fa fa-plus"></i> New Job</button>
					</div>
				</div>
				
				<div class="dashboard-card" style="margin-bottom: 15px;">
					<div class="dashboard-card-header">
						<h4><i class="fa fa-filter"></i> Filters</h4>
					</div>
					<div style="display: flex; gap: 15px; flex-wrap: wrap; padding: 10px 0;">
						<div>
							<label style="font-size: 12px; color: var(--text-muted); margin-right: 5px;">Status:</label>
							<select id="jobs-status-filter" class="form-control" style="width: 150px; display: inline-block;">
								<option value="">All Status</option>
								<option value="Draft">Draft</option>
								<option value="Checked In">Checked In</option>
								<option value="Inspected">Inspected</option>
								<option value="Estimated">Estimated</option>
								<option value="Approved">Approved</option>
								<option value="In Progress">In Progress</option>
								<option value="Ready to Invoice">Ready to Invoice</option>
								<option value="Invoiced">Invoiced</option>
								<option value="Closed">Closed</option>
							</select>
						</div>
						<div>
							<label style="font-size: 12px; color: var(--text-muted); margin-right: 5px;">Date Range:</label>
							<input type="date" id="jobs-date-from" class="form-control" style="width: 130px; display: inline-block; margin-right: 5px;">
							<input type="date" id="jobs-date-to" class="form-control" style="width: 130px; display: inline-block;">
						</div>
						<button class="btn btn-sm btn-primary" onclick="window._garageDashboardInstance.apply_jobs_filters()" style="margin-left: auto;">
							<i class="fa fa-search"></i> Apply Filters
						</button>
					</div>
				</div>
				
				<div class="dashboard-card">
					<div class="dashboard-card-header">
						<h4><i class="fa fa-wrench"></i> Jobs</h4>
						<a class="view-all-link" onclick="frappe.set_route('List', 'Job Card')">View All</a>
					</div>
					<div id="jobs-content" style="max-height: 600px; overflow-y: auto;"></div>
				</div>
			</div>
		`);
		this.jobs_filters = { status: '', date_from: '', date_to: '' };
	}
	
	render_appointments_layout() {
		this.wrapper.html(`
			<div class="garage-dashboard">
				<div class="quick-access-banner">
					<div>
						<h2><i class="fa fa-calendar"></i> Appointments Management</h2>
						<p>View and manage service appointments</p>
					</div>
					<div class="quick-actions-buttons">
						<button class="quick-action-btn" onclick="frappe.new_doc('Service Appointment')"><i class="fa fa-plus"></i> New Appointment</button>
					</div>
				</div>
				
				<div class="dashboard-card" style="margin-bottom: 15px;">
					<div class="dashboard-card-header">
						<h4><i class="fa fa-filter"></i> Filters</h4>
					</div>
					<div style="display: flex; gap: 15px; flex-wrap: wrap; padding: 10px 0;">
						<div>
							<label style="font-size: 12px; color: var(--text-muted); margin-right: 5px;">Status:</label>
							<select id="appointments-status-filter" class="form-control" style="width: 150px; display: inline-block;">
								<option value="">All Status</option>
								<option value="Scheduled">Scheduled</option>
								<option value="Checked-In">Checked-In</option>
								<option value="Completed">Completed</option>
								<option value="Cancelled">Cancelled</option>
								<option value="No-Show">No-Show</option>
							</select>
						</div>
						<div>
							<label style="font-size: 12px; color: var(--text-muted); margin-right: 5px;">Date Range:</label>
							<input type="date" id="appointments-date-from" class="form-control" style="width: 130px; display: inline-block; margin-right: 5px;">
							<input type="date" id="appointments-date-to" class="form-control" style="width: 130px; display: inline-block;">
						</div>
						<button class="btn btn-sm btn-primary" onclick="window._garageDashboardInstance.apply_appointments_filters()" style="margin-left: auto;">
							<i class="fa fa-search"></i> Apply Filters
						</button>
					</div>
				</div>
				
				<div class="dashboard-card">
					<div class="dashboard-card-header">
						<h4><i class="fa fa-calendar"></i> Appointments</h4>
						<a class="view-all-link" onclick="frappe.set_route('List', 'Service Appointment')">View All</a>
					</div>
					<div id="appointments-content" style="max-height: 600px; overflow-y: auto;"></div>
				</div>
			</div>
		`);
		this.appointments_filters = { status: '', date_from: '', date_to: '' };
	}
	
	render_inspections_layout() {
		this.wrapper.html(`
			<div class="garage-dashboard">
				<div class="quick-access-banner">
					<div>
						<h2><i class="fa fa-search"></i> Inspections Management</h2>
						<p>View and manage vehicle inspections</p>
					</div>
					<div class="quick-actions-buttons">
						<button class="quick-action-btn" onclick="frappe.new_doc('Vehicle Inspection')"><i class="fa fa-plus"></i> New Inspection</button>
					</div>
				</div>
				
				<div class="dashboard-card" style="margin-bottom: 15px;">
					<div class="dashboard-card-header">
						<h4><i class="fa fa-filter"></i> Filters</h4>
					</div>
					<div style="display: flex; gap: 15px; flex-wrap: wrap; padding: 10px 0;">
						<div>
							<label style="font-size: 12px; color: var(--text-muted); margin-right: 5px;">Has Job Card:</label>
							<select id="inspections-jobcard-filter" class="form-control" style="width: 150px; display: inline-block;">
								<option value="">All</option>
								<option value="yes">Yes</option>
								<option value="no">No</option>
							</select>
						</div>
						<div>
							<label style="font-size: 12px; color: var(--text-muted); margin-right: 5px;">Date Range:</label>
							<input type="date" id="inspections-date-from" class="form-control" style="width: 130px; display: inline-block; margin-right: 5px;">
							<input type="date" id="inspections-date-to" class="form-control" style="width: 130px; display: inline-block;">
						</div>
						<button class="btn btn-sm btn-primary" onclick="window._garageDashboardInstance.apply_inspections_filters()" style="margin-left: auto;">
							<i class="fa fa-search"></i> Apply Filters
						</button>
					</div>
				</div>
				
				<div class="dashboard-card">
					<div class="dashboard-card-header">
						<h4><i class="fa fa-search"></i> Inspections</h4>
						<a class="view-all-link" onclick="frappe.set_route('List', 'Vehicle Inspection')">View All</a>
					</div>
					<div id="inspections-content" style="max-height: 600px; overflow-y: auto;"></div>
				</div>
			</div>
		`);
		this.inspections_filters = { has_jobcard: '', date_from: '', date_to: '' };
	}
	
	render_sales_layout() {
		this.wrapper.html(`
			<div class="garage-dashboard">
				<div class="quick-access-banner">
					<div>
						<h2><i class="fa fa-money"></i> Sales Management</h2>
						<p>View and manage sales invoices</p>
					</div>
					<div class="quick-actions-buttons">
						<button class="quick-action-btn" onclick="frappe.set_route('List', 'Sales Invoice')"><i class="fa fa-list"></i> View All Invoices</button>
					</div>
				</div>
				
				<div class="dashboard-card" style="margin-bottom: 15px;">
					<div class="dashboard-card-header">
						<h4><i class="fa fa-filter"></i> Filters</h4>
					</div>
					<div style="display: flex; gap: 15px; flex-wrap: wrap; padding: 10px 0;">
						<div>
							<label style="font-size: 12px; color: var(--text-muted); margin-right: 5px;">Status:</label>
							<select id="sales-status-filter" class="form-control" style="width: 150px; display: inline-block;">
								<option value="">All Status</option>
								<option value="Draft">Draft</option>
								<option value="Submitted">Submitted</option>
								<option value="Paid">Paid</option>
								<option value="Unpaid">Unpaid</option>
								<option value="Cancelled">Cancelled</option>
							</select>
						</div>
						<div>
							<label style="font-size: 12px; color: var(--text-muted); margin-right: 5px;">Date Range:</label>
							<input type="date" id="sales-date-from" class="form-control" style="width: 130px; display: inline-block; margin-right: 5px;">
							<input type="date" id="sales-date-to" class="form-control" style="width: 130px; display: inline-block;">
						</div>
						<button class="btn btn-sm btn-primary" onclick="window._garageDashboardInstance.apply_sales_filters()" style="margin-left: auto;">
							<i class="fa fa-search"></i> Apply Filters
						</button>
					</div>
				</div>
				
				<div class="dashboard-card">
					<div class="dashboard-card-header">
						<h4><i class="fa fa-money"></i> Sales</h4>
						<a class="view-all-link" onclick="frappe.set_route('List', 'Sales Invoice')">View All</a>
					</div>
					<div id="sales-content" style="max-height: 600px; overflow-y: auto;"></div>
				</div>
			</div>
		`);
		this.sales_filters = { status: '', date_from: '', date_to: '' };
	}
	
	
	load_dashboard_data(source = 'unknown') {
		const showProgress = source !== 'interval';
		if (showProgress) {
			frappe.show_progress(__('Loading'), 50, 100);
		}
		
		frappe.call({
			method: 'workshop_mgmt.workshop_management.page.garage_dashboard.garage_dashboard.get_dashboard_data',
			args: { filters: JSON.stringify({ company: this.company }) },
			callback: (r) => {
				if (showProgress) frappe.hide_progress();
				if (r.message) {
					// Use setTimeout to ensure DOM elements exist
					setTimeout(() => {
						this.render_dashboard(r.message);
					}, 100);
				} else {
					console.error('No data received from get_dashboard_data');
				}
			},
			error: (r) => {
				if (showProgress) frappe.hide_progress();
				console.error('Error loading dashboard data:', r);
			}
		});
	}
	
	load_tab_content(tab) {
		const contentId = tab + '-content';
		$('#' + contentId).html('<div class="empty-state">Loading...</div>');
		
		// Get filters for the current tab
		let filters = { company: this.company };
		if (tab === 'jobs' && this.jobs_filters) {
			filters = { ...filters, ...this.jobs_filters };
		} else if (tab === 'appointments' && this.appointments_filters) {
			filters = { ...filters, ...this.appointments_filters };
		} else if (tab === 'inspections' && this.inspections_filters) {
			filters = { ...filters, ...this.inspections_filters };
		} else if (tab === 'sales' && this.sales_filters) {
			filters = { ...filters, ...this.sales_filters };
		}
		
		frappe.call({
			method: 'workshop_mgmt.workshop_management.page.garage_dashboard.garage_dashboard.get_sidebar_data',
			args: {
				filters: filters,
				tab: tab
			},
			callback: (r) => {
				if (r.message) {
					this.render_tab_content(tab, r.message);
				}
			}
		});
	}
	
	apply_jobs_filters() {
		this.jobs_filters = {
			status: $('#jobs-status-filter').val() || '',
			date_from: $('#jobs-date-from').val() || '',
			date_to: $('#jobs-date-to').val() || ''
		};
		this.load_tab_content('jobs');
	}
	
	apply_appointments_filters() {
		this.appointments_filters = {
			status: $('#appointments-status-filter').val() || '',
			date_from: $('#appointments-date-from').val() || '',
			date_to: $('#appointments-date-to').val() || ''
		};
		this.load_tab_content('appointments');
	}
	
	apply_inspections_filters() {
		this.inspections_filters = {
			has_jobcard: $('#inspections-jobcard-filter').val() || '',
			date_from: $('#inspections-date-from').val() || '',
			date_to: $('#inspections-date-to').val() || ''
		};
		this.load_tab_content('inspections');
	}
	
	apply_sales_filters() {
		this.sales_filters = {
			status: $('#sales-status-filter').val() || '',
			date_from: $('#sales-date-from').val() || '',
			date_to: $('#sales-date-to').val() || ''
		};
		this.load_tab_content('sales');
	}
	
	render_tab_content(tab, data) {
		// Update tab badge counts
		if (tab === 'jobs') {
			$('#sidebar-jobs-count').text((data.counts.active || 0) + (data.counts.pending || 0));
			this.render_jobs_section(data);
		} else if (tab === 'appointments') {
			$('#sidebar-appointments-count').text((data.counts.today || 0) + (data.counts.checked_in || 0));
			this.render_appointments_section(data);
		} else if (tab === 'inspections') {
			$('#sidebar-inspections-count').text((data.counts.today || 0) + (data.counts.pending_action || 0));
			this.render_inspections_section(data);
		} else if (tab === 'sales') {
			$('#sidebar-sales-count').text(data.counts.today || 0);
			this.render_sales_section(data);
		}
	}
	
	render_jobs_section(data) {
		let html = '';
		
		if (data.active && data.active.length > 0) {
			html += '<div class="section-header">Active Jobs (' + data.counts.active + ')</div>';
			data.active.forEach(job => {
				html += this.render_job_list_item(job);
			});
		}
		
		if (data.pending && data.pending.length > 0) {
			html += '<div class="section-header">Pending Invoice (' + data.counts.pending + ')</div>';
			data.pending.forEach(job => {
				html += this.render_job_list_item(job);
			});
		}
		
		if (!html) {
			html = '<div class="empty-state">No jobs found</div>';
		}
		
		$('#jobs-content').html(html);
		this.bind_list_item_clicks();
	}
	
	render_appointments_section(data) {
		let html = '';
		
		if (data.checked_in && data.checked_in.length > 0) {
			html += '<div class="section-header">Checked-In (' + data.counts.checked_in + ')</div>';
			data.checked_in.forEach(apt => {
				html += this.render_appointment_list_item(apt);
			});
		}
		
		if (data.today && data.today.length > 0) {
			html += '<div class="section-header">Today (' + data.counts.today + ')</div>';
			data.today.forEach(apt => {
				html += this.render_appointment_list_item(apt);
			});
		}
		
		if (data.upcoming && data.upcoming.length > 0) {
			html += '<div class="section-header">Upcoming (' + data.counts.upcoming + ')</div>';
			data.upcoming.slice(0, 20).forEach(apt => {
				html += this.render_appointment_list_item(apt);
			});
		}
		
		if (!html) {
			html = '<div class="empty-state">No appointments found</div>';
		}
		
		$('#appointments-content').html(html);
		this.bind_list_item_clicks();
	}
	
	render_inspections_section(data) {
		let html = '';
		
		if (data.pending_action && data.pending_action.length > 0) {
			html += '<div class="section-header">Pending Action (' + data.counts.pending_action + ')</div>';
			data.pending_action.forEach(ins => {
				html += this.render_inspection_list_item(ins);
			});
		}
		
		if (data.today && data.today.length > 0) {
			html += '<div class="section-header">Today (' + data.counts.today + ')</div>';
			data.today.forEach(ins => {
				html += this.render_inspection_list_item(ins);
			});
		}
		
		if (!html) {
			html = '<div class="empty-state">No inspections found</div>';
		}
		
		$('#inspections-content').html(html);
		this.bind_list_item_clicks();
	}
	
	render_sales_section(data) {
		let html = '';
		
		if (data.today && data.today.length > 0) {
			html += '<div class="section-header">Today\'s Sales (' + data.counts.today + ')</div>';
			data.today.forEach(inv => {
				html += this.render_invoice_list_item(inv);
			});
		}
		
		if (data.unpaid && data.unpaid.length > 0) {
			html += '<div class="section-header">Unpaid (' + data.counts.unpaid + ')</div>';
			data.unpaid.forEach(inv => {
				html += this.render_invoice_list_item(inv, true);
			});
		}
		
		if (data.draft && data.draft.length > 0) {
			html += '<div class="section-header">Draft (' + data.counts.draft + ')</div>';
			data.draft.slice(0, 20).forEach(inv => {
				html += this.render_invoice_list_item(inv);
			});
		}
		
		if (!html) {
			html = '<div class="empty-state">No sales found</div>';
		}
		
		$('#sales-content').html(html);
		this.bind_list_item_clicks();
	}
	
	render_job_list_item(job) {
		const status_class = 'status-' + job.status.toLowerCase().replace(/ /g, '-');
		return `
			<div class="list-item" data-doctype="Job Card" data-name="${job.name}">
				<div class="list-item-content">
					<div class="list-item-title">${job.name}</div>
					<div class="list-item-details">
						<span>${job.customer || '-'}</span>
						<span>${job.vehicle || '-'}</span>
					</div>
				</div>
				<div class="list-item-meta">
					<span class="status-badge ${status_class}">${job.status}</span>
				</div>
			</div>
		`;
	}
	
	render_appointment_list_item(apt) {
		const status_class = 'status-' + apt.status.toLowerCase().replace(/-/g, '-');
		const time = apt.scheduled_start ? frappe.datetime.str_to_user(apt.scheduled_start) : '-';
		return `
			<div class="list-item" data-doctype="Service Appointment" data-name="${apt.name}">
				<div class="list-item-content">
					<div class="list-item-title">${apt.name}</div>
					<div class="list-item-details">
						<span>${apt.customer || '-'}</span>
						<span>${time}</span>
					</div>
				</div>
				<div class="list-item-meta">
					<span class="status-badge ${status_class}">${apt.status}</span>
				</div>
			</div>
		`;
	}
	
	render_inspection_list_item(ins) {
		const date = ins.inspection_date ? frappe.datetime.str_to_user(ins.inspection_date) : '-';
		const hasJobCard = ins.job_card ? '<i class="fa fa-check-circle" style="color: green;"></i>' : '<i class="fa fa-clock-o" style="color: orange;"></i>';
		return `
			<div class="list-item" data-doctype="Vehicle Inspection" data-name="${ins.name}">
				<div class="list-item-content">
					<div class="list-item-title">${ins.name} ${hasJobCard}</div>
					<div class="list-item-details">
						<span>${ins.customer || '-'}</span>
						<span>${ins.vehicle || '-'}</span>
						<span>${date}</span>
					</div>
				</div>
			</div>
		`;
	}
	
	render_invoice_list_item(inv, showOutstanding = false) {
		const amount = showOutstanding && inv.outstanding_amount 
			? format_currency(inv.outstanding_amount) + ' due'
			: format_currency(inv.grand_total);
		const status = inv.status || 'Draft';
		const status_class = 'status-' + status.toLowerCase().replace(/ /g, '-');
		return `
			<div class="list-item" data-doctype="Sales Invoice" data-name="${inv.name}">
				<div class="list-item-content">
					<div class="list-item-title">${inv.name}</div>
					<div class="list-item-details">
						<span>${inv.customer || '-'}</span>
						<span>${amount}</span>
					</div>
				</div>
				<div class="list-item-meta">
					<span class="status-badge ${status_class}">${status}</span>
				</div>
			</div>
		`;
	}
	
	bind_list_item_clicks() {
		$('.list-item[data-doctype][data-name]').off('click').on('click', function() {
			const doctype = $(this).data('doctype');
			const name = $(this).data('name');
			if (doctype && name) {
				frappe.set_route('Form', doctype, name);
			}
		});
	}
	
	render_dashboard(data) {
		if (!data) {
			console.error('No dashboard data received');
			return;
		}
		
		console.log('Dashboard data received:', data);
		
		// Update KPIs
		if (data.kpis) {
			$('#kpi-in-progress').text(data.kpis.jobs_in_progress || 0);
			$('#kpi-ready-invoice').text(data.kpis.ready_to_invoice || 0);
			$('#kpi-revenue').text(format_currency(data.kpis.today_revenue || 0));
			$('#kpi-vehicles').text(data.kpis.vehicles_serviced || 0);
			
			// Update KPI details
			$('#kpi-in-progress-detail').text(`${data.kpis.total_jobs || 0} total jobs`);
			$('#kpi-ready-invoice-detail').text(`Value: ${format_currency(data.kpis.ready_to_invoice_value || 0)}`);
			$('#kpi-revenue-detail').text(`This week: ${format_currency(data.kpis.week_revenue || 0)}`);
			$('#kpi-vehicles-detail').text(`This week: ${data.kpis.vehicles_this_week || 0}`);
		}
		
		// Render recently closed jobs (always render, even if empty)
		this.render_recently_closed_jobs(data.recently_closed_jobs || []);
		
		// Render today's appointments (always render, even if empty)
		this.render_today_appointments(data.today_appointments || []);
		
		// Render pending inspections (always render, even if empty)
		this.render_pending_inspections(data.pending_inspections || []);
		
		// Render jobs ready to invoice (always render, even if empty)
		this.render_jobs_ready_to_invoice(data.jobs_ready_to_invoice || []);
		
		// Render today's completed tasks (always render, even if empty)
		this.render_today_completed_tasks(data.today_completed_tasks || { jobs: 0, appointments: 0, inspections: 0, total: 0 });
		
		// Render daily jobs chart (always render, even if empty)
		this.render_daily_jobs_chart(data.daily_jobs_chart || []);
		
		// Render upcoming appointments (always render, even if empty)
		this.render_upcoming_appointments(data.upcoming_appointments || []);
	}
	
	render_detailed_summaries(summaries) {
		if (!summaries) {
			console.warn('render_detailed_summaries called with no summaries');
			// Show empty state if no summaries
			if ($('#jobs-summary-detail').length) {
				$('#jobs-summary-detail').html('<div class="empty-state">No data available</div>');
			}
			if ($('#appointments-summary-detail').length) {
				$('#appointments-summary-detail').html('<div class="empty-state">No data available</div>');
			}
			if ($('#financial-summary-detail').length) {
				$('#financial-summary-detail').html('<div class="empty-state">No data available</div>');
			}
			if ($('#inspections-summary-detail').length) {
				$('#inspections-summary-detail').html('<div class="empty-state">No data available</div>');
			}
			return;
		}
		
		// Jobs Summary
		if (summaries.jobs) {
			let html = '';
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-check-circle"></i> Completed Today</span>
				<span class="summary-item-value">${summaries.jobs.completed_today || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-clock-o"></i> In Progress</span>
				<span class="summary-item-value">${summaries.jobs.in_progress || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-file-text"></i> Draft</span>
				<span class="summary-item-value">${summaries.jobs.draft || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-check-square"></i> Approved</span>
				<span class="summary-item-value">${summaries.jobs.approved || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-calendar-check-o"></i> This Week</span>
				<span class="summary-item-value">${summaries.jobs.this_week || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-calendar"></i> This Month</span>
				<span class="summary-item-value">${summaries.jobs.this_month || 0}</span>
			</div>`;
			$('#jobs-summary-detail').html(html);
		} else {
			$('#jobs-summary-detail').html('<div class="empty-state">No jobs data available</div>');
		}
		
		// Appointments Summary
		if (summaries.appointments) {
			let html = '';
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-calendar"></i> Today</span>
				<span class="summary-item-value">${summaries.appointments.today || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-sign-in"></i> Checked-In</span>
				<span class="summary-item-value">${summaries.appointments.checked_in || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-clock-o"></i> Scheduled</span>
				<span class="summary-item-value">${summaries.appointments.scheduled || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-check-circle"></i> Completed</span>
				<span class="summary-item-value positive">${summaries.appointments.completed || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-times-circle"></i> Cancelled</span>
				<span class="summary-item-value negative">${summaries.appointments.cancelled || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-calendar-check-o"></i> This Week</span>
				<span class="summary-item-value">${summaries.appointments.this_week || 0}</span>
			</div>`;
			$('#appointments-summary-detail').html(html);
		} else {
			$('#appointments-summary-detail').html('<div class="empty-state">No appointments data available</div>');
		}
		
		// Financial Summary
		if (summaries.financial) {
			let html = '';
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-money"></i> Today's Revenue</span>
				<span class="summary-item-value positive">${format_currency(summaries.financial.today_revenue || 0)}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-calendar-week"></i> This Week</span>
				<span class="summary-item-value positive">${format_currency(summaries.financial.week_revenue || 0)}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-calendar"></i> This Month</span>
				<span class="summary-item-value positive">${format_currency(summaries.financial.month_revenue || 0)}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-exclamation-triangle"></i> Outstanding</span>
				<span class="summary-item-value negative">${format_currency(summaries.financial.outstanding || 0)}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-file-text"></i> Draft Invoices</span>
				<span class="summary-item-value neutral">${summaries.financial.draft_invoices || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-check-circle"></i> Paid Today</span>
				<span class="summary-item-value positive">${format_currency(summaries.financial.paid_today || 0)}</span>
			</div>`;
			$('#financial-summary-detail').html(html);
		} else {
			$('#financial-summary-detail').html('<div class="empty-state">No financial data available</div>');
		}
		
		// Inspections Summary
		if (summaries.inspections) {
			let html = '';
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-calendar"></i> Today</span>
				<span class="summary-item-value">${summaries.inspections.today || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-exclamation-circle"></i> Pending Action</span>
				<span class="summary-item-value negative">${summaries.inspections.pending_action || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-check-circle"></i> With Job Card</span>
				<span class="summary-item-value positive">${summaries.inspections.with_jobcard || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-clock-o"></i> Without Job Card</span>
				<span class="summary-item-value">${summaries.inspections.without_jobcard || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-calendar-check-o"></i> This Week</span>
				<span class="summary-item-value">${summaries.inspections.this_week || 0}</span>
			</div>`;
			html += `<div class="summary-item">
				<span class="summary-item-label"><i class="fa fa-calendar"></i> This Month</span>
				<span class="summary-item-value">${summaries.inspections.this_month || 0}</span>
			</div>`;
			$('#inspections-summary-detail').html(html);
		} else {
			$('#inspections-summary-detail').html('<div class="empty-state">No inspections data available</div>');
		}
	}
	
	render_recently_closed_jobs(jobs) {
		let html = '';
		if (jobs && Array.isArray(jobs) && jobs.length > 0) {
			jobs.forEach(job => {
				html += this.render_job_list_item(job);
			});
		} else {
			html = '<div class="empty-state">No recently closed jobs</div>';
		}
		if ($('#recently-closed-jobs-list').length) {
			$('#recently-closed-jobs-list').html(html);
			this.bind_list_item_clicks();
		} else {
			console.warn('Element #recently-closed-jobs-list not found');
		}
	}
	
	render_today_appointments(appointments) {
		let html = '';
		if (appointments && Array.isArray(appointments) && appointments.length > 0) {
			appointments.forEach(apt => {
				html += this.render_appointment_list_item(apt);
			});
		} else {
			html = '<div class="empty-state">No appointments today</div>';
		}
		if ($('#today-appointments-list').length) {
			$('#today-appointments-list').html(html);
			this.bind_list_item_clicks();
		} else {
			console.warn('Element #today-appointments-list not found');
		}
	}
	
	render_pending_inspections(inspections) {
		let html = '';
		if (inspections && Array.isArray(inspections) && inspections.length > 0) {
			inspections.forEach(ins => {
				html += this.render_inspection_list_item(ins);
			});
		} else {
			html = '<div class="empty-state">No pending inspections</div>';
		}
		if ($('#pending-inspections-list').length) {
			$('#pending-inspections-list').html(html);
			this.bind_list_item_clicks();
		} else {
			console.warn('Element #pending-inspections-list not found');
		}
	}
	
	render_jobs_ready_to_invoice(jobs) {
		let html = '';
		if (jobs && Array.isArray(jobs) && jobs.length > 0) {
			jobs.forEach(job => {
				html += this.render_job_list_item(job);
			});
		} else {
			html = '<div class="empty-state">No jobs ready to invoice</div>';
		}
		if ($('#jobs-ready-invoice-list').length) {
			$('#jobs-ready-invoice-list').html(html);
			this.bind_list_item_clicks();
		} else {
			console.warn('Element #jobs-ready-invoice-list not found');
		}
	}
	
	render_today_completed_tasks(tasks) {
		if (!$('#today-completed-tasks').length) {
			console.warn('Element #today-completed-tasks not found');
			return;
		}
		let html = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">';
		html += `<div><div style="font-size: 24px; font-weight: bold; color: var(--primary);">${tasks.jobs || 0}</div><div style="font-size: 12px; color: var(--text-muted);">Jobs</div></div>`;
		html += `<div><div style="font-size: 24px; font-weight: bold; color: var(--primary);">${tasks.appointments || 0}</div><div style="font-size: 12px; color: var(--text-muted);">Appointments</div></div>`;
		html += `<div><div style="font-size: 24px; font-weight: bold; color: var(--primary);">${tasks.inspections || 0}</div><div style="font-size: 12px; color: var(--text-muted);">Inspections</div></div>`;
		html += '</div>';
		html += `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color); text-align: center;"><div style="font-size: 18px; font-weight: 600;">Total: ${tasks.total || 0}</div></div>`;
		$('#today-completed-tasks').html(html);
	}
	
	render_daily_jobs_chart(data) {
		if (!$('#daily-jobs-chart').length) {
			console.warn('Element #daily-jobs-chart not found');
			return;
		}
		if (!data || !Array.isArray(data) || data.length === 0) {
			$('#daily-jobs-chart').html('<div class="empty-state">No job data available</div>');
			return;
		}
		try {
			new frappe.Chart('#daily-jobs-chart', {
				type: 'line',
				data: {
					labels: data.map(d => frappe.datetime.str_to_user(d.date)),
					datasets: [{ name: 'Jobs', values: data.map(d => d.job_count) }]
				},
				colors: ['#2196f3'],
				height: 220
			});
		} catch (e) {
			console.error('Error rendering chart:', e);
			$('#daily-jobs-chart').html('<div class="empty-state">Error loading chart</div>');
		}
	}
	
	render_upcoming_appointments(appointments) {
		let html = '';
		if (appointments && Array.isArray(appointments) && appointments.length > 0) {
			appointments.forEach(apt => {
				html += this.render_appointment_list_item(apt);
			});
		} else {
			html = '<div class="empty-state">No upcoming appointments</div>';
		}
		if ($('#upcoming-appointments-list').length) {
			$('#upcoming-appointments-list').html(html);
			this.bind_list_item_clicks();
		} else {
			console.warn('Element #upcoming-appointments-list not found');
		}
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
