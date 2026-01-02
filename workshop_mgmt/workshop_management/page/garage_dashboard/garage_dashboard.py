# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

import frappe
from frappe import _


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
		AND si.custom_job_card IS NOT NULL
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
		AND si.custom_job_card IS NOT NULL
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
	filters = {
		"scheduled_start": [">=", frappe.utils.now()],
		"scheduled_start": ["<", frappe.utils.add_days(frappe.utils.now(), 1)],
		"status": ["!=", "Cancelled"]
	}
	if company:
		# Get company from linked customer's default company
		pass
	
	appointments = frappe.get_all("Service Appointment",
		filters=filters,
		fields=["name", "customer", "vehicle", "scheduled_start", "scheduled_end", "status"],
		order_by="scheduled_start",
		limit=20
	)
	
	return appointments

