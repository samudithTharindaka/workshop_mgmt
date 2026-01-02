# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class VehicleInspection(Document):
	def validate(self):
		"""Fetch vehicle from Job Card"""
		if self.job_card and not self.vehicle:
			self.vehicle = frappe.db.get_value("Job Card", self.job_card, "vehicle")

