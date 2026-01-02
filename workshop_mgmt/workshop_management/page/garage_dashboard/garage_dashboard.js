// Copyright (c) 2025, Infoney and contributors
// For license information, please see license.txt

frappe.pages['garage-dashboard'].on_page_load = function(wrapper) {
	new GarageDashboard(wrapper);
}

class GarageDashboard {
	constructor(wrapper) {
		this.page = frappe.ui.make_app_page({
			parent: wrapper,
			title: __('Garage Dashboard'),
			single_column: false
		});
		
		this.wrapper = $(this.page.body);
		this.company = frappe.defaults.get_user_default("Company");
		
		this.setup_filters();
		this.setup_layout();
		this.load_dashboard_data();
		
		// Auto-refresh every 2 minutes
		setInterval(() => this.load_dashboard_data(), 120000);
	}
	
	setup_filters() {
		// Primary Action Buttons
		this.page.set_primary_action(__('New Job Card'), () => {
			frappe.new_doc('Job Card');
		}, 'add');
		
		this.page.add_action_icon('octicon octicon-calendar', () => {
			frappe.new_doc('Service Appointment');
		}, __('New Appointment'));
		
		this.page.add_action_icon('octicon octicon-repo', () => {
			frappe.new_doc('Vehicle');
		}, __('New Vehicle'));
		
		// Secondary action buttons
		this.page.add_button(__('View All Jobs'), () => {
			frappe.set_route('List', 'Job Card');
		}, 'secondary');
		
		this.page.add_button(__('View Vehicles'), () => {
			frappe.set_route('List', 'Vehicle');
		}, 'secondary');
		
		// Refresh button
		this.page.add_button(__('Refresh'), () => {
			this.load_dashboard_data();
		}, {icon: 'refresh'});
		
		// Company filter
		this.page.add_field({
			fieldname: 'company',
			label: __('Company'),
			fieldtype: 'Link',
			options: 'Company',
			default: this.company,
			change: () => {
				this.company = this.page.fields_dict.company.get_value();
				this.load_dashboard_data();
			}
		});
		
		// Additional menu items
		this.page.add_menu_item(__('View Reports'), () => {
			frappe.set_route('List', 'Report', {
				'ref_doctype': 'Job Card'
			});
		});
		
		this.page.add_menu_item(__('View Invoices'), () => {
			frappe.set_route('List', 'Sales Invoice', {
				'custom_job_card': ['is', 'set']
			});
		});
		
		this.page.add_menu_item(__('Workshop Settings'), () => {
			frappe.msgprint({
				title: __('Workshop Settings'),
				message: __('Configure workflow, items, and warehouse settings from respective modules.'),
				indicator: 'blue'
			});
		});
	}
	
	setup_layout() {
		this.wrapper.html(`
			<div class="garage-dashboard">
				<style>
					.quick-access-banner {
						background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
						color: white;
						padding: 20px;
						border-radius: 10px;
						margin-bottom: 25px;
						display: flex;
						justify-content: space-between;
						align-items: center;
						box-shadow: 0 4px 15px rgba(0,0,0,0.2);
					}
					.quick-access-banner h2 {
						margin: 0;
						font-size: 24px;
						font-weight: 600;
					}
					.quick-access-banner p {
						margin: 5px 0 0 0;
						opacity: 0.9;
						font-size: 14px;
					}
					.quick-actions-buttons {
						display: flex;
						gap: 10px;
					}
					.quick-action-btn {
						background: rgba(255,255,255,0.2);
						border: 1px solid rgba(255,255,255,0.3);
						padding: 10px 20px;
						border-radius: 6px;
						cursor: pointer;
						transition: all 0.2s;
						font-weight: 500;
						backdrop-filter: blur(10px);
					}
					.quick-action-btn:hover {
						background: rgba(255,255,255,0.3);
						transform: translateY(-2px);
					}
					.garage-dashboard {
						padding: 20px;
						background: #f5f7fa;
					}
					.kpi-cards {
						display: grid;
						grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
						gap: 20px;
						margin-bottom: 30px;
					}
					.kpi-card {
						background: white;
						border-radius: 8px;
						padding: 20px;
						box-shadow: 0 2px 4px rgba(0,0,0,0.1);
						transition: transform 0.2s;
					}
					.kpi-card:hover {
						transform: translateY(-5px);
						box-shadow: 0 4px 8px rgba(0,0,0,0.15);
					}
					.kpi-value {
						font-size: 32px;
						font-weight: bold;
						margin: 10px 0;
					}
					.kpi-label {
						color: #6c757d;
						font-size: 14px;
						text-transform: uppercase;
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
						grid-template-columns: 2fr 1fr;
						gap: 20px;
						margin-bottom: 20px;
					}
					.dashboard-card {
						background: white;
						border-radius: 8px;
						padding: 20px;
						box-shadow: 0 2px 4px rgba(0,0,0,0.1);
					}
					.dashboard-card h4 {
						margin: 0 0 15px 0;
						font-size: 18px;
						color: #333;
					}
					.chart-container {
						height: 300px;
						position: relative;
					}
					.status-badge {
						display: inline-block;
						padding: 4px 12px;
						border-radius: 12px;
						font-size: 12px;
						font-weight: 500;
					}
					.status-draft { background: #e0e0e0; color: #555; }
					.status-checked-in { background: #bbdefb; color: #1976d2; }
					.status-inspected { background: #c5cae9; color: #3f51b5; }
					.status-approved { background: #c8e6c9; color: #388e3c; }
					.status-in-progress { background: #fff9c4; color: #f57c00; }
					.status-ready-to-invoice { background: #ffccbc; color: #d84315; }
					.status-invoiced { background: #a5d6a7; color: #2e7d32; }
					.status-closed { background: #90a4ae; color: #455a64; }
					
					.list-item {
						padding: 12px;
						border-bottom: 1px solid #eee;
						display: flex;
						justify-content: space-between;
						align-items: center;
						cursor: pointer;
						transition: background 0.2s;
					}
					.list-item:hover {
						background: #f8f9fa;
					}
					.list-item:last-child {
						border-bottom: none;
					}
					.empty-state {
						text-align: center;
						padding: 40px;
						color: #999;
					}
				</style>
				
				<!-- Quick Access Banner -->
				<div class="quick-access-banner">
					<div>
						<h2>🚗 Garage Management Dashboard</h2>
						<p>Manage your workshop operations, track jobs, and monitor performance</p>
					</div>
					<div class="quick-actions-buttons">
						<button class="quick-action-btn" onclick="frappe.new_doc('Job Card')">
							+ New Job Card
						</button>
						<button class="quick-action-btn" onclick="frappe.new_doc('Service Appointment')">
							📅 New Appointment
						</button>
						<button class="quick-action-btn" onclick="frappe.set_route('List', 'Job Card')">
							📋 View All Jobs
						</button>
					</div>
				</div>
				
				<!-- KPI Cards -->
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
						<div class="kpi-label">Vehicles Serviced (Month)</div>
						<div class="kpi-value" id="kpi-vehicles">-</div>
					</div>
				</div>
				
				<!-- Charts Row -->
				<div class="dashboard-row">
					<div class="dashboard-card">
						<h4>Revenue Trend (Last 30 Days)</h4>
						<div class="chart-container" id="revenue-chart"></div>
					</div>
					<div class="dashboard-card">
						<h4>Job Status Distribution</h4>
						<div class="chart-container" id="status-chart"></div>
					</div>
				</div>
				
				<!-- Lists Row -->
				<div class="dashboard-row">
					<div class="dashboard-card">
						<h4>Recent Job Cards</h4>
						<div id="recent-jobs-list" style="max-height: 400px; overflow-y: auto;"></div>
					</div>
					<div class="dashboard-card">
						<h4>Pending Invoices</h4>
						<div id="pending-invoices-list" style="max-height: 400px; overflow-y: auto;"></div>
					</div>
				</div>
				
				<!-- Top Items Row -->
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
				
				<!-- Today's Appointments -->
				<div class="dashboard-card" style="margin-bottom: 20px;">
					<h4>Today's Appointments</h4>
					<div id="today-appointments-list"></div>
				</div>
			</div>
		`);
	}
	
	load_dashboard_data() {
		frappe.show_progress(__('Loading'), 50, 100);
		
		frappe.call({
			method: 'workshop_mgmt.workshop_management.page.garage_dashboard.garage_dashboard.get_dashboard_data',
			args: {
				filters: {
					company: this.company
				}
			},
			callback: (r) => {
				frappe.hide_progress();
				if (r.message) {
					this.render_dashboard(r.message);
				}
			}
		});
	}
	
	render_dashboard(data) {
		// Render KPIs
		$('#kpi-in-progress').text(data.kpis.jobs_in_progress);
		$('#kpi-ready-invoice').text(data.kpis.ready_to_invoice);
		$('#kpi-revenue').text(format_currency(data.kpis.today_revenue));
		$('#kpi-vehicles').text(data.kpis.vehicles_serviced);
		
		// Render charts
		this.render_revenue_chart(data.revenue_chart);
		this.render_status_chart(data.job_status_summary);
		
		// Render lists
		this.render_recent_jobs(data.recent_jobs);
		this.render_pending_invoices(data.pending_invoices);
		this.render_top_services(data.top_services);
		this.render_top_parts(data.top_parts);
		this.render_today_appointments(data.today_appointments);
	}
	
	render_revenue_chart(data) {
		if (!data || data.length === 0) {
			$('#revenue-chart').html('<div class="empty-state">No revenue data available</div>');
			return;
		}
		
		const dates = data.map(d => frappe.datetime.str_to_user(d.date));
		const revenues = data.map(d => d.revenue);
		
		new frappe.Chart('#revenue-chart', {
			type: 'line',
			data: {
				labels: dates,
				datasets: [{
					name: 'Revenue',
					values: revenues
				}]
			},
			colors: ['#4caf50'],
			height: 250
		});
	}
	
	render_status_chart(data) {
		if (!data || data.length === 0) {
			$('#status-chart').html('<div class="empty-state">No status data available</div>');
			return;
		}
		
		const labels = data.map(d => d.status);
		const values = data.map(d => d.count);
		
		new frappe.Chart('#status-chart', {
			type: 'donut',
			data: {
				labels: labels,
				datasets: [{
					values: values
				}]
			},
			height: 250
		});
	}
	
	render_recent_jobs(jobs) {
		if (!jobs || jobs.length === 0) {
			$('#recent-jobs-list').html('<div class="empty-state">No recent jobs</div>');
			return;
		}
		
		let html = '';
		jobs.forEach(job => {
			const status_class = 'status-' + job.status.toLowerCase().replace(/ /g, '-');
			html += `
				<div class="list-item" data-doctype="Job Card" data-name="${job.name}">
					<div>
						<strong>${job.name}</strong><br>
						<small>${job.customer} - ${job.vehicle}</small>
					</div>
					<span class="status-badge ${status_class}">${job.status}</span>
				</div>
			`;
		});
		
		$('#recent-jobs-list').html(html);
		
		// Add click handlers
		$('#recent-jobs-list .list-item').on('click', function() {
			frappe.set_route('Form', $(this).data('doctype'), $(this).data('name'));
		});
	}
	
	render_pending_invoices(jobs) {
		if (!jobs || jobs.length === 0) {
			$('#pending-invoices-list').html('<div class="empty-state">No pending invoices</div>');
			return;
		}
		
		let html = '';
		jobs.forEach(job => {
			html += `
				<div class="list-item" data-doctype="Job Card" data-name="${job.name}">
					<div>
						<strong>${job.name}</strong><br>
						<small>${job.customer} - ${job.vehicle}</small>
					</div>
					<span class="status-badge status-ready-to-invoice">${job.status}</span>
				</div>
			`;
		});
		
		$('#pending-invoices-list').html(html);
		
		// Add click handlers
		$('#pending-invoices-list .list-item').on('click', function() {
			frappe.set_route('Form', $(this).data('doctype'), $(this).data('name'));
		});
	}
	
	render_top_services(services) {
		if (!services || services.length === 0) {
			$('#top-services-list').html('<div class="empty-state">No service data</div>');
			return;
		}
		
		let html = '';
		services.forEach(service => {
			html += `
				<div class="list-item">
					<div>
						<strong>${service.item_code}</strong><br>
						<small>Used ${service.usage_count} times</small>
					</div>
					<strong>${format_currency(service.total_amount)}</strong>
				</div>
			`;
		});
		
		$('#top-services-list').html(html);
	}
	
	render_top_parts(parts) {
		if (!parts || parts.length === 0) {
			$('#top-parts-list').html('<div class="empty-state">No parts data</div>');
			return;
		}
		
		let html = '';
		parts.forEach(part => {
			html += `
				<div class="list-item">
					<div>
						<strong>${part.item_code}</strong><br>
						<small>Qty: ${part.total_qty}</small>
					</div>
					<strong>${format_currency(part.total_amount)}</strong>
				</div>
			`;
		});
		
		$('#top-parts-list').html(html);
	}
	
	render_today_appointments(appointments) {
		if (!appointments || appointments.length === 0) {
			$('#today-appointments-list').html('<div class="empty-state">No appointments today</div>');
			return;
		}
		
		let html = '';
		appointments.forEach(apt => {
			html += `
				<div class="list-item" data-doctype="Service Appointment" data-name="${apt.name}">
					<div>
						<strong>${apt.customer}</strong> - ${apt.vehicle}<br>
						<small>${frappe.datetime.str_to_user(apt.scheduled_start)}</small>
					</div>
					<span class="status-badge">${apt.status}</span>
				</div>
			`;
		});
		
		$('#today-appointments-list').html(html);
		
		// Add click handlers
		$('#today-appointments-list .list-item').on('click', function() {
			frappe.set_route('Form', $(this).data('doctype'), $(this).data('name'));
		});
	}
}

