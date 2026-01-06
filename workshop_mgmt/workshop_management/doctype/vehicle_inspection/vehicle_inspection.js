// Copyright (c) 2025, Infoney and contributors
// For license information, please see license.txt

frappe.ui.form.on("Vehicle Inspection", {
	refresh(frm) {
		// Filter vehicle by customer
		frm.set_query("vehicle", function() {
			if (frm.doc.customer) {
				return {
					filters: {
						customer: frm.doc.customer
					}
				};
			}
		});
		
		// Filter appointment by customer if set
		frm.set_query("appointment", function() {
			if (frm.doc.customer) {
				return {
					filters: {
						customer: frm.doc.customer,
						status: ["in", ["Scheduled", "Checked-In"]]
					}
				};
			}
			return {
				filters: {
					status: ["in", ["Scheduled", "Checked-In"]]
				}
			};
		});
		
		// Add button to create Job Card from inspection
		if (frm.doc.name && !frm.doc.job_card && !frm.is_new()) {
			frm.add_custom_button(__("Create Job Card"), function() {
				// Show company selection dialog
				let d = new frappe.ui.Dialog({
					title: __("Select Company"),
					fields: [
						{
							fieldname: "company",
							fieldtype: "Link",
							label: __("Company"),
							options: "Company",
							reqd: 1,
							default: frappe.defaults.get_user_default("Company")
						},
						{
							fieldname: "warehouse",
							fieldtype: "Link",
							label: __("Warehouse"),
							options: "Warehouse",
							reqd: 1,
							get_query: function() {
								return {
									filters: {
										company: d.get_value("company"),
										is_group: 0
									}
								};
							}
						}
					],
					primary_action_label: __("Create"),
					primary_action: function(values) {
						d.hide();
						frappe.new_doc("Job Card", {
							customer: frm.doc.customer,
							vehicle: frm.doc.vehicle,
							appointment: frm.doc.appointment,
							company: values.company,
							warehouse: values.warehouse
						});
					}
				});
				d.show();
			}, __("Create"));
		}
	},
	
	appointment(frm) {
		// Fetch customer and vehicle from Appointment
		if (frm.doc.appointment) {
			frappe.db.get_value("Service Appointment", frm.doc.appointment, ["customer", "vehicle"], (r) => {
				if (r) {
					if (r.customer) {
						frm.set_value("customer", r.customer);
					}
					if (r.vehicle) {
						frm.set_value("vehicle", r.vehicle);
					}
				}
			});
		}
	},
	
	customer(frm) {
		// Clear vehicle if customer changes and vehicle doesn't belong to new customer
		if (frm.doc.vehicle && frm.doc.customer) {
			frappe.db.get_value("Vehicle", frm.doc.vehicle, "customer", (r) => {
				if (r && r.customer !== frm.doc.customer) {
					frm.set_value("vehicle", "");
				}
			});
		}
	},
	
	job_card(frm) {
		// Fetch vehicle and customer from Job Card if set
		if (frm.doc.job_card) {
			frappe.db.get_value("Job Card", frm.doc.job_card, ["vehicle", "customer", "appointment"], (r) => {
				if (r) {
					if (r.vehicle) {
						frm.set_value("vehicle", r.vehicle);
					}
					if (r.customer) {
						frm.set_value("customer", r.customer);
					}
					if (r.appointment) {
						frm.set_value("appointment", r.appointment);
					}
				}
			});
		}
	}
});
