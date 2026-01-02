// Copyright (c) 2025, Infoney and contributors
// For license information, please see license.txt

frappe.ui.form.on("Job Card", {
	refresh(frm) {
		// Filter vehicle by customer
		frm.set_query("vehicle", function() {
			return {
				filters: {
					customer: frm.doc.customer
				}
			};
		});
		
		// Filter appointment by customer
		frm.set_query("appointment", function() {
			return {
				filters: {
					customer: frm.doc.customer
				}
			};
		});
		
		// Add Create Quotation button
		if (frm.doc.status in ["Inspected", "Estimated"] && !frm.doc.quotation) {
			frm.add_custom_button(__("Create Quotation"), function() {
				frappe.call({
					method: "create_quotation",
					doc: frm.doc,
					callback: function(r) {
						if (r.message) {
							frm.reload_doc();
						}
					}
				});
			});
		}
		
		// Add Create Sales Invoice button
		if (frm.doc.status in ["Approved", "Ready to Invoice"] && !frm.doc.sales_invoice) {
			frm.add_custom_button(__("Create Sales Invoice"), function() {
				frappe.call({
					method: "create_sales_invoice",
					doc: frm.doc,
					callback: function(r) {
						if (r.message) {
							frm.reload_doc();
						}
					}
				});
			}).css({"background-color": "#28a745", "color": "white"});
		}
		
		// Show linked documents
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
			frm.set_value("appointment", "");
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

