// Copyright (c) 2025, Infoney and contributors
// For license information, please see license.txt

frappe.ui.form.on("Vehicle Inspection", {
	refresh(frm) {
		// Custom logic here
	},
	
	job_card(frm) {
		// Fetch vehicle from Job Card
		if (frm.doc.job_card) {
			frappe.db.get_value("Job Card", frm.doc.job_card, "vehicle", (r) => {
				if (r && r.vehicle) {
					frm.set_value("vehicle", r.vehicle);
				}
			});
		}
	}
});

