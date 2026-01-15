# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Vehicle(Document):
	def validate(self):
		"""Validate Vehicle data"""
		# Validate customer exists
		if self.customer and not frappe.db.exists("Customer", self.customer):
			frappe.throw(frappe._("Customer {0} does not exist").format(self.customer))
		
		# Validate license plate is unique
		if self.license_plate:
			existing = frappe.db.get_value(
				"Vehicle",
				{"license_plate": self.license_plate, "name": ["!=", self.name]},
				"name"
			)
			if existing:
				frappe.throw(frappe._("License Plate {0} already exists for another vehicle").format(self.license_plate))




