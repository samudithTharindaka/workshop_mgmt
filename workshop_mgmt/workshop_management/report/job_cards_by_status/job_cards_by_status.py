# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute(filters=None):
	columns = get_columns()
	data = get_data(filters)
	return columns, data


def get_columns():
	return [
		{
			"fieldname": "name",
			"label": _("Job Card"),
			"fieldtype": "Link",
			"options": "Job Card",
			"width": 150
		},
		{
			"fieldname": "posting_date",
			"label": _("Date"),
			"fieldtype": "Date",
			"width": 100
		},
		{
			"fieldname": "customer",
			"label": _("Customer"),
			"fieldtype": "Link",
			"options": "Customer",
			"width": 150
		},
		{
			"fieldname": "vehicle",
			"label": _("Vehicle"),
			"fieldtype": "Link",
			"options": "Vehicle",
			"width": 120
		},
		{
			"fieldname": "status",
			"label": _("Status"),
			"fieldtype": "Data",
			"width": 120
		},
		{
			"fieldname": "days_open",
			"label": _("Days Open"),
			"fieldtype": "Int",
			"width": 100
		},
		{
			"fieldname": "service_advisor",
			"label": _("Service Advisor"),
			"fieldtype": "Link",
			"options": "User",
			"width": 150
		}
	]


def get_data(filters):
	conditions = get_conditions(filters)
	
	data = frappe.db.sql("""
		SELECT
			jc.name,
			jc.posting_date,
			jc.customer,
			jc.vehicle,
			jc.status,
			DATEDIFF(CURDATE(), jc.posting_date) as days_open,
			jc.service_advisor
		FROM `tabJob Card` jc
		WHERE 1=1 {conditions}
		ORDER BY jc.posting_date DESC
	""".format(conditions=conditions), filters, as_dict=1)
	
	return data


def get_conditions(filters):
	conditions = []
	
	if filters.get("company"):
		conditions.append("AND jc.company = %(company)s")
	
	if filters.get("status"):
		conditions.append("AND jc.status = %(status)s")
	
	if filters.get("service_advisor"):
		conditions.append("AND jc.service_advisor = %(service_advisor)s")
	
	if filters.get("from_date"):
		conditions.append("AND jc.posting_date >= %(from_date)s")
	
	if filters.get("to_date"):
		conditions.append("AND jc.posting_date <= %(to_date)s")
	
	return " ".join(conditions)

