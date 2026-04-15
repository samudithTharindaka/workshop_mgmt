// Copyright (c) 2025, Infoney and contributors
// For license information, please see license.txt

function call_create_job_card_from_inspection(args, on_success) {
	const method_chain = [
		"workshop_mgmt.api.create_job_card_from_inspection",
		"workshop_mgmt.workshop_management.vehicle_inspection_jobs.create_job_card_from_inspection",
	];

	const try_method = (index) => {
		if (index >= method_chain.length) {
			return;
		}

		frappe.call({
			method: method_chain[index],
			args,
			freeze: true,
			freeze_message: __("Creating Job Card..."),
			callback(r) {
				if (r.message) {
					on_success(r.message);
				}
			},
			error(err) {
				const msg = (err && err.message) || "";
				const missing_method =
					msg.includes("Failed to get method for command") ||
					msg.includes("has no attribute");
				if (missing_method && index < method_chain.length - 1) {
					try_method(index + 1);
				}
			},
		});
	};

	try_method(0);
}

function open_create_job_card_from_inspection_dialog(frm) {
	const d = new frappe.ui.Dialog({
		title: __("Create Job Card from inspection"),
		fields: [
			{
				fieldname: "company",
				fieldtype: "Link",
				label: __("Company"),
				options: "Company",
				reqd: 1,
				default: frappe.defaults.get_user_default("Company"),
			},
			{
				fieldname: "warehouse",
				fieldtype: "Link",
				label: __("Warehouse"),
				options: "Warehouse",
				reqd: 1,
				get_query: function () {
					const company = d.get_value("company");
					if (!company) {
						return { filters: { is_group: 0 } };
					}
					return {
						filters: {
							company: company,
							is_group: 0,
						},
					};
				},
			},
			{
				fieldname: "populate_from_recommendations",
				fieldtype: "Check",
				label: __("Fill lines from inspection recommendations"),
				default: 1,
				description: __(
					"Adds each Recommended Service (non-stock) as a service line, stock items as parts, and BOM components when a default BOM exists for a service."
				),
			},
		],
		primary_action_label: __("Create"),
		primary_action(values) {
			d.hide();
			call_create_job_card_from_inspection(
				{
					inspection: frm.doc.name,
					company: values.company,
					warehouse: values.warehouse,
					populate_from_recommendations: values.populate_from_recommendations ? 1 : 0,
				},
				(job_card) => frappe.set_route("Form", "Job Card", job_card)
			);
		},
	});
	d.show();
}

function load_standard_checklist(frm) {
	const apply = () => {
		frappe.call({
			method: "workshop_mgmt.workshop_management.vehicle_inspection_template.get_standard_vehicle_inspection_checklist",
			callback: (r) => {
				if (!r.message || !r.message.length) {
					return;
				}
				frm.clear_table("inspection_items");
				r.message.forEach((row) => {
					const d = frm.add_child("inspection_items");
					d.section = row.section;
					d.check_item = row.check_item;
					d.status = "N/A";
				});
				frm.refresh_field("inspection_items");
				recalc_inspection_estimated_total(frm);
			},
		});
	};
	if (frm.doc.inspection_items && frm.doc.inspection_items.length) {
		frappe.confirm(__("Replace existing inspection rows with the standard checklist?"), apply);
	} else {
		apply();
	}
}

frappe.ui.form.on("Vehicle Inspection", {
	refresh(frm) {
		frm.set_query("recommended_service", "inspection_items", () => ({
			filters: {
				disabled: 0,
				is_sales_item: 1,
			},
		}));
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
		
		frm.add_custom_button(__("Load standard checklist"), () => load_standard_checklist(frm), __("Checklist"));

		if (frm.doc.name && !frm.is_new()) {
			if (frm.doc.job_card) {
				frm.add_custom_button(__("Open Job Card"), function () {
					frappe.set_route("Form", "Job Card", frm.doc.job_card);
				}, __("Job Card"));
			} else {
				frm.add_custom_button(
					__("Create Job Card"),
					function () {
						open_create_job_card_from_inspection_dialog(frm);
					},
					__("Job Card")
				);
			}
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

function recalc_inspection_estimated_total(frm) {
	let total = 0;
	(frm.doc.inspection_items || []).forEach((row) => {
		total += flt(row.estimated_price);
	});
	frm.set_value("estimated_total", total);
}

frappe.ui.form.on("Inspection Item", {
	estimated_price(frm) {
		recalc_inspection_estimated_total(frm);
	},
});

frappe.ui.form.on("Inspection Item", "inspection_items_remove", function (frm) {
	recalc_inspection_estimated_total(frm);
});
