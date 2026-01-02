// Copyright (c) 2025, Infoney and contributors
// For license information, please see license.txt

frappe.ui.form.on("Service Appointment", {
	refresh(frm) {
		// Custom buttons or logic here
	},
	
	customer(frm) {
		// Filter vehicles by customer
		frm.set_query("vehicle", function() {
			return {
				filters: {
					customer: frm.doc.customer
				}
			};
		});
		
		// Clear vehicle if customer changes
		if (frm.doc.vehicle) {
			frappe.db.get_value("Vehicle", frm.doc.vehicle, "customer", (r) => {
				if (r && r.customer !== frm.doc.customer) {
					frm.set_value("vehicle", "");
				}
			});
		}
	}
});

