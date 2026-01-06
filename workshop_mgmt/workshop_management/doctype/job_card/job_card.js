// Copyright (c) 2025, Infoney and contributors
// For license information, please see license.txt

frappe.ui.form.on("Job Card", {
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
		
		// Filter appointment by customer
		frm.set_query("appointment", function() {
			if (frm.doc.customer) {
				return {
					filters: {
						customer: frm.doc.customer
					}
				};
			}
		});
		
		// Add Create Quotation button
		if (["Inspected", "Estimated"].includes(frm.doc.status) && !frm.doc.quotation) {
			frm.add_custom_button(__("Create Quotation"), function() {
				frappe.call({
					method: "create_quotation",
					doc: frm.doc,
					freeze: true,
					freeze_message: __("Creating Quotation..."),
					callback: function(r) {
						if (r.message) {
							frm.reload_doc();
							frappe.show_alert({
								message: __("Quotation {0} created successfully", [r.message]),
								indicator: "green"
							}, 5);
						}
					}
				});
			}, __("Create"));
		}
		
		// Add Create Sales Invoice button
		if (["Approved", "Ready to Invoice"].includes(frm.doc.status) && !frm.doc.sales_invoice) {
			frm.add_custom_button(__("Create Sales Invoice"), function() {
				frappe.confirm(
					__("This will create a Sales Invoice and update stock. Continue?"),
					function() {
						// User confirmed, proceed with invoice creation
						frappe.call({
							method: "create_sales_invoice",
							doc: frm.doc,
							freeze: true,
							freeze_message: __("Creating Sales Invoice..."),
							callback: function(r) {
								if (r.message) {
									frm.reload_doc();
									frappe.show_alert({
										message: __("Sales Invoice {0} created successfully", [r.message]),
										indicator: "green"
									}, 5);
									
									// Prompt to view the invoice
									setTimeout(function() {
										frappe.msgprint({
											title: __("Invoice Created"),
											message: __("Sales Invoice {0} has been created. Would you like to view it?", [r.message]),
											primary_action: {
												label: __("View Invoice"),
												action: function() {
													frappe.set_route("Form", "Sales Invoice", r.message);
												}
											}
										});
									}, 1000);
								}
							},
							error: function(r) {
								frappe.show_alert({
									message: __("Failed to create Sales Invoice"),
									indicator: "red"
								}, 5);
							}
						});
					},
					function() {
						// User cancelled
						frappe.show_alert({
							message: __("Invoice creation cancelled"),
							indicator: "orange"
						}, 3);
					}
				);
			}, __("Create")).css({"background-color": "#28a745", "color": "white", "font-weight": "bold"});
		}
		
		// Show linked documents - View buttons
		if (frm.doc.appointment) {
			frm.add_custom_button(__("View Appointment"), function() {
				frappe.set_route("Form", "Service Appointment", frm.doc.appointment);
			}, __("View"));
		}
		
		if (frm.doc.quotation) {
			frm.add_custom_button(__("View Quotation"), function() {
				frappe.set_route("Form", "Quotation", frm.doc.quotation);
			}, __("View"));
		}
		
		if (frm.doc.sales_invoice) {
			frm.add_custom_button(__("View Invoice"), function() {
				frappe.set_route("Form", "Sales Invoice", frm.doc.sales_invoice);
			}, __("View"));
		}
	},
	
	appointment(frm) {
		// Fetch customer, vehicle and service_advisor from Appointment
		if (frm.doc.appointment) {
			frappe.db.get_value("Service Appointment", frm.doc.appointment, 
				["customer", "vehicle", "service_advisor"], (r) => {
				if (r) {
					if (r.customer) {
						frm.set_value("customer", r.customer);
					}
					if (r.vehicle) {
						frm.set_value("vehicle", r.vehicle);
					}
					if (r.service_advisor) {
						frm.set_value("service_advisor", r.service_advisor);
					}
				}
			});
		}
	},
	
	customer(frm) {
		// Clear vehicle and appointment if customer changes
		if (frm.doc.vehicle) {
			frappe.db.get_value("Vehicle", frm.doc.vehicle, "customer", (r) => {
				if (r && r.customer !== frm.doc.customer) {
					frm.set_value("vehicle", "");
				}
			});
		}
		
		if (frm.doc.appointment) {
			frappe.db.get_value("Service Appointment", frm.doc.appointment, "customer", (r) => {
				if (r && r.customer !== frm.doc.customer) {
					frm.set_value("appointment", "");
				}
			});
		}
	}
});

// Service Item child table
frappe.ui.form.on("Job Card Service Item", {
	item_code(frm, cdt, cdn) {
		// Fetch rate from Item
		let row = locals[cdt][cdn];
		if (row.item_code) {
			frappe.db.get_value("Item", row.item_code, "standard_rate", (r) => {
				if (r && r.standard_rate) {
					frappe.model.set_value(cdt, cdn, "rate", r.standard_rate);
				}
			});
		}
	},
	
	qty(frm, cdt, cdn) {
		calculate_service_item_amount(frm, cdt, cdn);
	},
	
	rate(frm, cdt, cdn) {
		calculate_service_item_amount(frm, cdt, cdn);
	}
});

// Part Item child table
frappe.ui.form.on("Job Card Part Item", {
	item_code(frm, cdt, cdn) {
		// Fetch rate from Item
		let row = locals[cdt][cdn];
		if (row.item_code) {
			frappe.db.get_value("Item", row.item_code, ["standard_rate", "is_stock_item"], (r) => {
				if (r) {
					if (r.standard_rate) {
						frappe.model.set_value(cdt, cdn, "rate", r.standard_rate);
					}
					// Validate it's a stock item
					if (!r.is_stock_item) {
						frappe.msgprint(__("Item {0} is not a stock item", [row.item_code]));
					}
				}
			});
		}
	},
	
	qty(frm, cdt, cdn) {
		calculate_part_item_amount(frm, cdt, cdn);
	},
	
	rate(frm, cdt, cdn) {
		calculate_part_item_amount(frm, cdt, cdn);
	}
});

function calculate_service_item_amount(frm, cdt, cdn) {
	let row = locals[cdt][cdn];
	let amount = (row.qty || 0) * (row.rate || 0);
	frappe.model.set_value(cdt, cdn, "amount", amount);
}

function calculate_part_item_amount(frm, cdt, cdn) {
	let row = locals[cdt][cdn];
	let amount = (row.qty || 0) * (row.rate || 0);
	frappe.model.set_value(cdt, cdn, "amount", amount);
}
