# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class VehicleInspection(Document):
	def validate(self):
		"""Fetch vehicle and customer from linked documents"""
		# Fetch from Job Card if set
		if self.job_card:
			job_card = frappe.db.get_value("Job Card", self.job_card, 
				["vehicle", "customer", "appointment"], as_dict=True)
			if job_card:
				if not self.vehicle:
					self.vehicle = job_card.vehicle
				if not self.customer:
					self.customer = job_card.customer
				if not self.appointment and job_card.appointment:
					self.appointment = job_card.appointment
		
		# Fetch from Appointment if set
		if self.appointment:
			appointment = frappe.db.get_value("Service Appointment", self.appointment,
				["vehicle", "customer"], as_dict=True)
			if appointment:
				if not self.vehicle:
					self.vehicle = appointment.vehicle
				if not self.customer:
					self.customer = appointment.customer
	
	def after_insert(self):
		"""Link inspection back to the appointment"""
		self.update_appointment_link()
	
	def on_update(self):
		"""Update appointment link when inspection is modified"""
		self.update_appointment_link()
	
	def update_appointment_link(self):
		"""Update the inspection field in the linked Service Appointment"""
		if self.appointment:
			# Check if appointment doesn't already have this inspection linked
			current_inspection = frappe.db.get_value("Service Appointment", 
				self.appointment, "inspection")
			if current_inspection != self.name:
				frappe.db.set_value("Service Appointment", self.appointment, 
					"inspection", self.name, update_modified=False)
	
	def on_trash(self):
		"""Clear inspection link from appointment when deleted"""
		if self.appointment:
			frappe.db.set_value("Service Appointment", self.appointment, 
				"inspection", None, update_modified=False)
