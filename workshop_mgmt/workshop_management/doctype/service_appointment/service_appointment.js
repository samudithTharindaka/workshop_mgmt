// Copyright (c) 2025, Infoney and contributors
// For license information, please see license.txt

frappe.ui.form.on("Service Appointment", {
	refresh(frm) {
		// Filter vehicles by customer
		frm.set_query("vehicle", function() {
			if (frm.doc.customer) {
				return {
					filters: {
						customer: frm.doc.customer
					}
				};
			}
		});
		
		// Show action buttons only when appointment is saved and status is Checked-In
		if (!frm.is_new() && frm.doc.status === "Checked-In") {
			// Add Create Inspection button if no inspection exists
			if (!frm.doc.inspection) {
				frm.add_custom_button(__("Create Inspection"), function() {
					frappe.new_doc("Vehicle Inspection", {
						appointment: frm.doc.name,
						customer: frm.doc.customer,
						vehicle: frm.doc.vehicle
					});
				}, __("Create"));
			}
			
			// Add Create Job Card button if no job card exists
			if (!frm.doc.job_card) {
				frm.add_custom_button(__("Create Job Card"), function() {
					// Show company and warehouse selection dialog
					let d = new frappe.ui.Dialog({
						title: __("Create Job Card"),
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
								appointment: frm.doc.name,
								company: values.company,
								warehouse: values.warehouse,
								service_advisor: frm.doc.service_advisor
							});
						}
					});
					d.show();
				}, __("Create"));
			}
		}
		
		// Show linked documents section with view buttons
		if (frm.doc.inspection) {
			frm.add_custom_button(__("View Inspection"), function() {
				frappe.set_route("Form", "Vehicle Inspection", frm.doc.inspection);
			}, __("View"));
		}
		
		if (frm.doc.job_card) {
			frm.add_custom_button(__("View Job Card"), function() {
				frappe.set_route("Form", "Job Card", frm.doc.job_card);
			}, __("View"));
		}
		
		// Add Check-In button for Scheduled appointments
		if (!frm.is_new() && frm.doc.status === "Scheduled") {
			frm.add_custom_button(__("Check In"), function() {
				frm.set_value("status", "Checked-In");
				frm.save();
			}).css({"background-color": "#28a745", "color": "white"});
		}
		
		// Add Complete button for In Progress appointments
		if (!frm.is_new() && frm.doc.status === "In Progress") {
			frm.add_custom_button(__("Mark Complete"), function() {
				frm.set_value("status", "Completed");
				frm.save();
			}).css({"background-color": "#17a2b8", "color": "white"});
		}
	},
	
	customer(frm) {
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
