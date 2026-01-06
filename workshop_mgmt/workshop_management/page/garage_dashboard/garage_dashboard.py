# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import nowdate, add_days, getdate


@frappe.whitelist()
def get_dashboard_data(filters=None):
	"""Get comprehensive dashboard data for garage management"""
	if isinstance(filters, str):
		import json
		filters = json.loads(filters)
	
	company = filters.get("company") if filters else None
	
	data = {
		"kpis": get_kpis(company),
		"job_status_summary": get_job_status_summary(company),
		"recent_jobs": get_recent_jobs(company, limit=10),
		"revenue_chart": get_revenue_chart_data(company, days=30),
		"top_services": get_top_services(company, limit=5),
		"top_parts": get_top_parts(company, limit=5),
		"pending_invoices": get_pending_invoices(company),
		"today_appointments": get_today_appointments(company)
	}
	
	return data


@frappe.whitelist()
def get_sidebar_data(filters=None, tab=None):
	"""Get data for sidebar tabs"""
	if isinstance(filters, str):
		import json
		filters = json.loads(filters)
	
	company = filters.get("company") if filters else None
	
	if tab == "jobs":
		return get_jobs_tab_data(company)
	elif tab == "appointments":
		return get_appointments_tab_data(company)
	elif tab == "inspections":
		return get_inspections_tab_data(company)
	elif tab == "sales":
		return get_sales_tab_data(company)
	else:
		return {}


def get_jobs_tab_data(company=None):
	"""Get all job cards grouped by status"""
	filters = {}
	if company:
		filters["company"] = company
	
	# Get jobs by status categories
	active_statuses = ["Draft", "Checked In", "Inspected", "Estimated", "Approved", "In Progress"]
	pending_statuses = ["Ready to Invoice"]
	completed_statuses = ["Invoiced", "Closed"]
	
	active_jobs = frappe.get_all("Job Card",
		filters={**filters, "status": ["in", active_statuses]},
		fields=["name", "customer", "vehicle", "status", "posting_date", "modified", "service_advisor"],
		order_by="modified desc",
		limit=50
	)
	
	pending_jobs = frappe.get_all("Job Card",
		filters={**filters, "status": ["in", pending_statuses]},
		fields=["name", "customer", "vehicle", "status", "posting_date", "modified", "service_advisor"],
		order_by="modified desc",
		limit=50
	)
	
	completed_jobs = frappe.get_all("Job Card",
		filters={**filters, "status": ["in", completed_statuses]},
		fields=["name", "customer", "vehicle", "status", "posting_date", "modified", "service_advisor"],
		order_by="modified desc",
		limit=50
	)
	
	return {
		"active": active_jobs,
		"pending": pending_jobs,
		"completed": completed_jobs,
		"counts": {
			"active": len(active_jobs),
			"pending": len(pending_jobs),
			"completed": len(completed_jobs)
		}
	}


def get_appointments_tab_data(company=None):
	"""Get all appointments grouped by status"""
	today = nowdate()
	
	# Today's appointments
	today_appointments = frappe.get_all("Service Appointment",
		filters={
			"scheduled_start": [">=", today],
			"scheduled_start": ["<", add_days(today, 1)]
		},
		fields=["name", "customer", "vehicle", "scheduled_start", "scheduled_end", "status", "service_advisor"],
		order_by="scheduled_start",
		limit=50
	)
	
	# Upcoming appointments (next 7 days)
	upcoming_appointments = frappe.get_all("Service Appointment",
		filters={
			"scheduled_start": [">=", add_days(today, 1)],
			"scheduled_start": ["<", add_days(today, 8)],
			"status": ["not in", ["Cancelled", "Completed", "No-Show"]]
		},
		fields=["name", "customer", "vehicle", "scheduled_start", "scheduled_end", "status", "service_advisor"],
		order_by="scheduled_start",
		limit=50
	)
	
	# Checked-in appointments (waiting for service)
	checked_in = frappe.get_all("Service Appointment",
		filters={
			"status": "Checked-In"
		},
		fields=["name", "customer", "vehicle", "scheduled_start", "scheduled_end", "status", "service_advisor"],
		order_by="scheduled_start",
		limit=50
	)
	
	# Recent completed
	completed = frappe.get_all("Service Appointment",
		filters={
			"status": ["in", ["Completed", "No-Show", "Cancelled"]]
		},
		fields=["name", "customer", "vehicle", "scheduled_start", "scheduled_end", "status", "service_advisor"],
		order_by="modified desc",
		limit=30
	)
	
	return {
		"today": today_appointments,
		"upcoming": upcoming_appointments,
		"checked_in": checked_in,
		"completed": completed,
		"counts": {
			"today": len(today_appointments),
			"upcoming": len(upcoming_appointments),
			"checked_in": len(checked_in),
			"completed": len(completed)
		}
	}


def get_inspections_tab_data(company=None):
	"""Get all vehicle inspections"""
	today = nowdate()
	
	# Today's inspections
	today_inspections = frappe.get_all("Vehicle Inspection",
		filters={
			"inspection_date": today
		},
		fields=["name", "customer", "vehicle", "inspection_date", "inspector", "appointment", "job_card"],
		order_by="modified desc",
		limit=50
	)
	
	# Recent inspections (last 7 days)
	recent_inspections = frappe.get_all("Vehicle Inspection",
		filters={
			"inspection_date": [">=", add_days(today, -7)],
			"inspection_date": ["<", today]
		},
		fields=["name", "customer", "vehicle", "inspection_date", "inspector", "appointment", "job_card"],
		order_by="inspection_date desc",
		limit=50
	)
	
	# Inspections without job card (pending action)
	pending_action = frappe.get_all("Vehicle Inspection",
		filters={
			"job_card": ["is", "not set"]
		},
		fields=["name", "customer", "vehicle", "inspection_date", "inspector", "appointment", "job_card"],
		order_by="inspection_date desc",
		limit=50
	)
	
	return {
		"today": today_inspections,
		"recent": recent_inspections,
		"pending_action": pending_action,
		"counts": {
			"today": len(today_inspections),
			"recent": len(recent_inspections),
			"pending_action": len(pending_action)
		}
	}


def get_sales_tab_data(company=None):
	"""Get sales invoices related to workshop"""
	today = nowdate()
	company_condition = f"AND si.company = '{company}'" if company else ""
	
	# Today's invoices
	today_invoices = frappe.db.sql("""
		SELECT si.name, si.customer, si.grand_total, si.status, si.posting_date,
			   si.custom_job_card as job_card
		FROM `tabSales Invoice` si
		WHERE si.posting_date = %s
		AND si.docstatus != 2
		{company_condition}
		ORDER BY si.modified DESC
		LIMIT 50
	""".format(company_condition=company_condition), (today,), as_dict=True)
	
	# This week's invoices
	week_start = add_days(today, -7)
	week_invoices = frappe.db.sql("""
		SELECT si.name, si.customer, si.grand_total, si.status, si.posting_date,
			   si.custom_job_card as job_card
		FROM `tabSales Invoice` si
		WHERE si.posting_date >= %s
		AND si.posting_date < %s
		AND si.docstatus != 2
		{company_condition}
		ORDER BY si.posting_date DESC
		LIMIT 50
	""".format(company_condition=company_condition), (week_start, today), as_dict=True)
	
	# Draft invoices
	draft_invoices = frappe.db.sql("""
		SELECT si.name, si.customer, si.grand_total, si.status, si.posting_date,
			   si.custom_job_card as job_card
		FROM `tabSales Invoice` si
		WHERE si.docstatus = 0
		{company_condition}
		ORDER BY si.modified DESC
		LIMIT 50
	""".format(company_condition=company_condition), as_dict=True)
	
	# Unpaid invoices
	unpaid_invoices = frappe.db.sql("""
		SELECT si.name, si.customer, si.grand_total, si.outstanding_amount, si.status, si.posting_date,
			   si.custom_job_card as job_card
		FROM `tabSales Invoice` si
		WHERE si.docstatus = 1
		AND si.outstanding_amount > 0
		{company_condition}
		ORDER BY si.posting_date
		LIMIT 50
	""".format(company_condition=company_condition), as_dict=True)
	
	# Calculate totals
	today_total = sum(inv.get("grand_total", 0) or 0 for inv in today_invoices if inv.get("status") != "Cancelled")
	week_total = sum(inv.get("grand_total", 0) or 0 for inv in week_invoices if inv.get("status") != "Cancelled")
	outstanding_total = sum(inv.get("outstanding_amount", 0) or 0 for inv in unpaid_invoices)
	
	return {
		"today": today_invoices,
		"this_week": week_invoices,
		"draft": draft_invoices,
		"unpaid": unpaid_invoices,
		"counts": {
			"today": len(today_invoices),
			"this_week": len(week_invoices),
			"draft": len(draft_invoices),
			"unpaid": len(unpaid_invoices)
		},
		"totals": {
			"today": today_total,
			"this_week": week_total,
			"outstanding": outstanding_total
		}
	}


def get_kpis(company=None):
	"""Get key performance indicators"""
	filters = {"company": company} if company else {}
	
	# Jobs in progress
	jobs_in_progress = frappe.db.count("Job Card", {
		**filters,
		"status": ["in", ["Checked In", "Inspected", "In Progress"]]
	})
	
	# Ready to invoice
	ready_to_invoice = frappe.db.count("Job Card", {
		**filters,
		"status": "Ready to Invoice",
		"sales_invoice": ["is", "not set"]
	})
	
	# Today's revenue
	today_revenue = frappe.db.sql("""
		SELECT COALESCE(SUM(si.grand_total), 0) as revenue
		FROM `tabSales Invoice` si
		WHERE si.docstatus = 1
		AND si.posting_date = CURDATE()
		{company_condition}
	""".format(
		company_condition=f"AND si.company = '{company}'" if company else ""
	))[0][0] or 0
	
	# Total vehicles serviced this month
	vehicles_serviced = frappe.db.sql("""
		SELECT COUNT(DISTINCT jc.vehicle)
		FROM `tabJob Card` jc
		WHERE MONTH(jc.posting_date) = MONTH(CURDATE())
		AND YEAR(jc.posting_date) = YEAR(CURDATE())
		{company_condition}
	""".format(
		company_condition=f"AND jc.company = '{company}'" if company else ""
	))[0][0] or 0
	
	return {
		"jobs_in_progress": jobs_in_progress,
		"ready_to_invoice": ready_to_invoice,
		"today_revenue": today_revenue,
		"vehicles_serviced": vehicles_serviced
	}


def get_job_status_summary(company=None):
	"""Get job count by status"""
	filters = {"company": company} if company else {}
	
	statuses = ["Draft", "Checked In", "Inspected", "Estimated", "Approved", 
	            "In Progress", "Ready to Invoice", "Invoiced", "Closed"]
	
	summary = []
	for status in statuses:
		count = frappe.db.count("Job Card", {**filters, "status": status})
		if count > 0:
			summary.append({"status": status, "count": count})
	
	return summary


def get_recent_jobs(company=None, limit=10):
	"""Get recent job cards"""
	filters = {"company": company} if company else {}
	
	jobs = frappe.get_all("Job Card",
		filters=filters,
		fields=["name", "customer", "vehicle", "status", "posting_date", "modified"],
		order_by="modified desc",
		limit=limit
	)
	
	return jobs


def get_revenue_chart_data(company=None, days=30):
	"""Get daily revenue for the last N days"""
	company_condition = f"AND si.company = '{company}'" if company else ""
	
	data = frappe.db.sql("""
		SELECT 
			si.posting_date as date,
			SUM(si.grand_total) as revenue,
			COUNT(si.name) as invoice_count
		FROM `tabSales Invoice` si
		WHERE si.docstatus = 1
		AND si.posting_date >= DATE_SUB(CURDATE(), INTERVAL {days} DAY)
		{company_condition}
		GROUP BY si.posting_date
		ORDER BY si.posting_date
	""".format(days=days, company_condition=company_condition), as_dict=True)
	
	return data


def get_top_services(company=None, limit=5):
	"""Get most used service items"""
	company_condition = f"AND jc.company = '{company}'" if company else ""
	
	services = frappe.db.sql("""
		SELECT 
			jcsi.item_code,
			COUNT(*) as usage_count,
			SUM(jcsi.amount) as total_amount
		FROM `tabJob Card Service Item` jcsi
		JOIN `tabJob Card` jc ON jcsi.parent = jc.name
		WHERE 1=1 {company_condition}
		GROUP BY jcsi.item_code
		ORDER BY usage_count DESC
		LIMIT {limit}
	""".format(company_condition=company_condition, limit=limit), as_dict=True)
	
	return services


def get_top_parts(company=None, limit=5):
	"""Get most used parts"""
	company_condition = f"AND jc.company = '{company}'" if company else ""
	
	parts = frappe.db.sql("""
		SELECT 
			jcpi.item_code,
			SUM(jcpi.qty) as total_qty,
			SUM(jcpi.amount) as total_amount
		FROM `tabJob Card Part Item` jcpi
		JOIN `tabJob Card` jc ON jcpi.parent = jc.name
		WHERE 1=1 {company_condition}
		GROUP BY jcpi.item_code
		ORDER BY total_qty DESC
		LIMIT {limit}
	""".format(company_condition=company_condition, limit=limit), as_dict=True)
	
	return parts


def get_pending_invoices(company=None):
	"""Get job cards pending invoice"""
	filters = {
		"status": ["in", ["Approved", "Ready to Invoice"]],
		"sales_invoice": ["is", "not set"]
	}
	if company:
		filters["company"] = company
	
	jobs = frappe.get_all("Job Card",
		filters=filters,
		fields=["name", "customer", "vehicle", "status", "posting_date"],
		order_by="posting_date",
		limit=20
	)
	
	return jobs


def get_today_appointments(company=None):
	"""Get today's appointments"""
	today = nowdate()
	
	appointments = frappe.get_all("Service Appointment",
		filters={
			"scheduled_start": [">=", today],
			"scheduled_start": ["<", add_days(today, 1)],
			"status": ["!=", "Cancelled"]
		},
		fields=["name", "customer", "vehicle", "scheduled_start", "scheduled_end", "status"],
		order_by="scheduled_start",
		limit=20
	)
	
	return appointments
