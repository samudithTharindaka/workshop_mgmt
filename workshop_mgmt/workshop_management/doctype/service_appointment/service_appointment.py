# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import get_datetime


class ServiceAppointment(Document):
	def validate(self):
		"""Validate Service Appointment data"""
		# Validate scheduled_end is after scheduled_start
		if self.scheduled_start and self.scheduled_end:
			start_dt = get_datetime(self.scheduled_start)
			end_dt = get_datetime(self.scheduled_end)
			
			if end_dt <= start_dt:
				frappe.throw(frappe._("Scheduled End must be after Scheduled Start"))
		
		# Validate vehicle belongs to customer
		if self.vehicle and self.customer:
			vehicle_customer = frappe.db.get_value("Vehicle", self.vehicle, "customer")
			if vehicle_customer != self.customer:
				frappe.throw(frappe._("Vehicle {0} does not belong to Customer {1}").format(
					self.vehicle, self.customer
				))




