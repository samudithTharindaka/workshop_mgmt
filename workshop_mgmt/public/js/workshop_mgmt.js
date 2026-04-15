// Workshop Management App - Custom JS
// Copyright (c) 2025, Infoney

frappe.provide("workshop_mgmt");

// Show a simple first-session hint for Workshop users
$(document).on('app_ready', function() {
	if (frappe.boot.user && frappe.boot.user.can_read.includes("Job Card")) {
		if (!sessionStorage.getItem('workshop_welcome_shown')) {
			setTimeout(function() {
				frappe.show_alert({
					message: __('Welcome to Workshop Management! Open Job Card or Service Appointment to continue.'),
					indicator: 'blue'
				}, 7);
				sessionStorage.setItem('workshop_welcome_shown', '1');
			}, 2000);
		}
	}
});
