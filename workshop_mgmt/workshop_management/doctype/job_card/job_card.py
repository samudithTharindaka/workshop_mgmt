# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _


class JobCard(Document):
	def validate(self):
		"""Validate Job Card data"""
		self.validate_vehicle_customer_match()
		self.validate_duplicate_invoice()
		self.calculate_amounts()
		self.fetch_from_appointment()
	
	def after_insert(self):
		"""Link job card back to the appointment"""
		self.update_appointment_link()
	
	def on_update(self):
		"""Update appointment link when job card is modified"""
		self.update_appointment_link()
	
	def fetch_from_appointment(self):
		"""Fetch customer and vehicle from appointment if set"""
		if self.appointment:
			appointment = frappe.db.get_value("Service Appointment", self.appointment,
				["customer", "vehicle", "service_advisor"], as_dict=True)
			if appointment:
				if not self.customer:
					self.customer = appointment.customer
				if not self.vehicle:
					self.vehicle = appointment.vehicle
				if not self.service_advisor and appointment.service_advisor:
					self.service_advisor = appointment.service_advisor
	
	def update_appointment_link(self):
		"""Update the job_card field in the linked Service Appointment"""
		if self.appointment:
			# Check if appointment doesn't already have this job card linked
			current_job_card = frappe.db.get_value("Service Appointment", 
				self.appointment, "job_card")
			if current_job_card != self.name:
				frappe.db.set_value("Service Appointment", self.appointment, 
					"job_card", self.name, update_modified=False)
				# Also update appointment status to In Progress
				frappe.db.set_value("Service Appointment", self.appointment,
					"status", "In Progress", update_modified=False)
	
	def on_trash(self):
		"""Clear job card link from appointment when deleted"""
		if self.appointment:
			frappe.db.set_value("Service Appointment", self.appointment, 
				"job_card", None, update_modified=False)
	
	def validate_vehicle_customer_match(self):
		"""Ensure vehicle belongs to the customer"""
		if self.vehicle and self.customer:
			vehicle_customer = frappe.db.get_value("Vehicle", self.vehicle, "customer")
			if vehicle_customer != self.customer:
				frappe.throw(_("Vehicle {0} does not belong to Customer {1}").format(
					self.vehicle, self.customer
				))
	
	def validate_duplicate_invoice(self):
		"""Prevent multiple invoices for same job card"""
		if self.sales_invoice and self.is_new():
			frappe.throw(_("Sales Invoice already exists for this Job Card"))
	
	def calculate_amounts(self):
		"""Calculate amounts for service and part items"""
		# Calculate service item amounts
		for item in self.service_items:
			item.amount = (item.qty or 0) * (item.rate or 0)
		
		# Calculate part item amounts
		for item in self.part_items:
			item.amount = (item.qty or 0) * (item.rate or 0)
	
	@frappe.whitelist()
	def create_quotation(self):
		"""Create Quotation from Job Card"""
		# Validate items exist
		if not self.service_items and not self.part_items:
			frappe.throw(_("Please add at least one service or part item"))
		
		# Create Quotation
		quotation = frappe.new_doc("Quotation")
		quotation.quotation_to = "Customer"
		quotation.party_name = self.customer
		quotation.company = self.company
		
		# Add service items
		for service_item in self.service_items:
			quotation.append("items", {
				"item_code": service_item.item_code,
				"qty": service_item.qty,
				"rate": service_item.rate
			})
		
		# Add part items
		for part_item in self.part_items:
			quotation.append("items", {
				"item_code": part_item.item_code,
				"qty": part_item.qty,
				"rate": part_item.rate
			})
		
		quotation.insert()
		
		# Link quotation to job card
		self.quotation = quotation.name
		self.save()
		
		frappe.msgprint(_("Quotation {0} created successfully").format(quotation.name))
		return quotation.name
	
	@frappe.whitelist()
	def create_sales_invoice(self):
		"""Create Sales Invoice from Job Card with Update Stock"""
		# Validate status
		if self.status not in ["Approved", "Ready to Invoice"]:
			frappe.throw(_("Job Card must be Approved or Ready to Invoice to create Sales Invoice"))
		
		# Validate no existing invoice
		if self.sales_invoice:
			frappe.throw(_("Sales Invoice {0} already exists for this Job Card").format(self.sales_invoice))
		
		# Validate items exist
		if not self.service_items and not self.part_items:
			frappe.throw(_("Please add at least one service or part item before creating invoice"))
		
		# Validate stock availability for parts
		self.validate_stock_availability()
		
		try:
			# Create Sales Invoice
			invoice = frappe.new_doc("Sales Invoice")
			invoice.customer = self.customer
			invoice.company = self.company
			invoice.posting_date = self.posting_date
			invoice.set_warehouse = self.warehouse
			invoice.update_stock = 1
			invoice.custom_job_card = self.name  # Custom field link
			
			# Add service items
			for service_item in self.service_items:
				invoice.append("items", {
					"item_code": service_item.item_code,
					"qty": service_item.qty,
					"rate": service_item.rate,
					"warehouse": self.warehouse
				})
			
			# Add part items
			for part_item in self.part_items:
				warehouse = part_item.warehouse or self.warehouse
				invoice.append("items", {
					"item_code": part_item.item_code,
					"qty": part_item.qty,
					"rate": part_item.rate,
					"warehouse": warehouse
				})
			
			# Calculate taxes and totals
			invoice.calculate_taxes_and_totals()
			invoice.insert()
			
			# Update job card status to Invoiced and link the invoice
			self.db_set("sales_invoice", invoice.name)
			self.db_set("status", "Invoiced")
			self.reload()
			
			# Add comment to track the change
			self.add_comment("Comment", _("Sales Invoice {0} created and Job Card status changed to Invoiced").format(invoice.name))
			
			frappe.msgprint(_("Sales Invoice {0} created successfully and Job Card status updated to Invoiced").format(invoice.name))
			return invoice.name
			
		except Exception as e:
			frappe.log_error(frappe.get_traceback(), _("Job Card Invoice Creation Error"))
			frappe.throw(_("Error creating Sales Invoice: {0}").format(str(e)))
	
	def validate_stock_availability(self):
		"""Check if sufficient stock exists for all part items"""
		insufficient_items = []
		
		for part_item in self.part_items:
			warehouse = part_item.warehouse or self.warehouse
			
			# Get available stock
			available_qty = frappe.db.get_value(
				"Bin",
				{"item_code": part_item.item_code, "warehouse": warehouse},
				"actual_qty"
			) or 0
			
			if available_qty < part_item.qty:
				insufficient_items.append({
					"item": part_item.item_code,
					"warehouse": warehouse,
					"available": available_qty,
					"required": part_item.qty
				})
		
		if insufficient_items:
			error_msg = _("Insufficient stock for the following items:") + "<br><br>"
			for item in insufficient_items:
				error_msg += _("• Item: {0} | Warehouse: {1} | Available: {2} | Required: {3}").format(
					item["item"], item["warehouse"], item["available"], item["required"]
				) + "<br>"
			frappe.throw(error_msg, title=_("Stock Not Available"))

