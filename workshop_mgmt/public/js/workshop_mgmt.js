// Workshop Management App - Custom JS
// Copyright (c) 2025, Infoney

frappe.provide("workshop_mgmt");

// Add Garage Dashboard to awesome bar and quick access
$(document).ready(function() {
	// Add dashboard to search (awesome bar)
	if (frappe.search && frappe.search.utils) {
		frappe.search.utils.add_custom_result({
			title: "🚗 Garage Dashboard",
			value: "garage-dashboard",
			description: "Workshop management dashboard with real-time KPIs",
			route: "garage-dashboard",
			index: 1
		});
	}
});

// Add dashboard notification/link after page load
$(document).on('app_ready', function() {
	// Check if user has access to Workshop Management
	if (frappe.boot.user && frappe.boot.user.can_read.includes("Job Card")) {
		// Add a subtle banner notification on first login (once per session)
		if (!sessionStorage.getItem('workshop_welcome_shown')) {
			setTimeout(function() {
				frappe.show_alert({
					message: __('Welcome to Workshop Management! <a href="/app/garage-dashboard" style="color: white; text-decoration: underline;">Open Garage Dashboard</a>'),
					indicator: 'blue'
				}, 7);
				sessionStorage.setItem('workshop_welcome_shown', '1');
			}, 2000);
		}
	}
});

// Add custom command palette option
if (frappe.ui && frappe.ui.toolbar && frappe.ui.toolbar.search) {
	frappe.ui.toolbar.search.on_search_trigger = (function(original) {
		return function() {
			const result = original.apply(this, arguments);
			// Add workshop dashboard as top result
			return result;
		};
	})(frappe.ui.toolbar.search.on_search_trigger || function(){});
}



