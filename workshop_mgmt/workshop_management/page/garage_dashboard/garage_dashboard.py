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
		"recently_closed_jobs": get_recently_closed_jobs(company, limit=10),
		"today_appointments": get_today_appointments(company),
		"pending_inspections": get_pending_inspections(company, limit=10),
		"jobs_ready_to_invoice": get_jobs_ready_to_invoice(company, limit=10),
		"today_completed_tasks": get_today_completed_tasks(company),
		"daily_jobs_chart": get_daily_jobs_chart_data(company, days=30),
		"upcoming_appointments": get_upcoming_appointments(company, limit=10)
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
		return get_jobs_tab_data(
			company=company,
			status=filters.get("status"),
			date_from=filters.get("date_from"),
			date_to=filters.get("date_to")
		)
	elif tab == "appointments":
		return get_appointments_tab_data(
			company=company,
			status=filters.get("status"),
			date_from=filters.get("date_from"),
			date_to=filters.get("date_to")
		)
	elif tab == "inspections":
		return get_inspections_tab_data(
			company=company,
			has_jobcard=filters.get("has_jobcard"),
			date_from=filters.get("date_from"),
			date_to=filters.get("date_to")
		)
	elif tab == "sales":
		return get_sales_tab_data(
			company=company,
			status=filters.get("status"),
			date_from=filters.get("date_from"),
			date_to=filters.get("date_to")
		)
	else:
		return {}


def get_jobs_tab_data(company=None, status=None, date_from=None, date_to=None):
	"""Get all job cards grouped by status"""
	filters = {}
	if company:
		filters["company"] = company
	if status:
		filters["status"] = status
	if date_from:
		filters["posting_date"] = [">=", date_from]
	if date_to:
		if "posting_date" in filters:
			filters["posting_date"].append(["<=", date_to])
		else:
			filters["posting_date"] = ["<=", date_to]
	
	# Get jobs by status categories
	active_statuses = ["Draft", "Checked In", "Inspected", "Estimated", "Approved", "In Progress"]
	pending_statuses = ["Ready to Invoice"]
	completed_statuses = ["Invoiced", "Closed"]
	
	# Apply status filter if specified
	if status:
		if status in active_statuses:
			active_statuses = [status]
			pending_statuses = []
			completed_statuses = []
		elif status in pending_statuses:
			active_statuses = []
			pending_statuses = [status]
			completed_statuses = []
		elif status in completed_statuses:
			active_statuses = []
			pending_statuses = []
			completed_statuses = [status]
	
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


def get_appointments_tab_data(company=None, status=None, date_from=None, date_to=None):
	"""Get all appointments grouped by status"""
	today = nowdate()
	
	# Build filters
	today_filters = {}
	upcoming_filters = {}
	checked_in_filters = {"status": "Checked-In"}
	
	if date_from:
		today_filters["scheduled_start"] = [">=", date_from]
		upcoming_filters["scheduled_start"] = [">=", date_from]
	if date_to:
		if "scheduled_start" in today_filters:
			today_filters["scheduled_start"].append(["<=", date_to])
		else:
			today_filters["scheduled_start"] = ["<=", date_to]
		if "scheduled_start" in upcoming_filters:
			upcoming_filters["scheduled_start"].append(["<=", date_to])
		else:
			upcoming_filters["scheduled_start"] = ["<=", date_to]
	
	if status:
		today_filters["status"] = status
		upcoming_filters["status"] = status
		checked_in_filters["status"] = status
	
	# Today's appointments
	if not date_from and not date_to:
		today_filters["scheduled_start"] = [">=", today]
		today_filters["scheduled_start"] = ["<", add_days(today, 1)]
	
	today_appointments = frappe.get_all("Service Appointment",
		filters=today_filters,
		fields=["name", "customer", "vehicle", "scheduled_start", "scheduled_end", "status", "service_advisor"],
		order_by="scheduled_start",
		limit=50
	)
	
	# Upcoming appointments (next 7 days)
	if not date_from and not date_to:
		upcoming_filters["scheduled_start"] = [">=", add_days(today, 1)]
		upcoming_filters["scheduled_start"] = ["<", add_days(today, 8)]
		upcoming_filters["status"] = ["not in", ["Cancelled", "Completed", "No-Show"]]
	
	upcoming_appointments = frappe.get_all("Service Appointment",
		filters=upcoming_filters,
		fields=["name", "customer", "vehicle", "scheduled_start", "scheduled_end", "status", "service_advisor"],
		order_by="scheduled_start",
		limit=50
	)
	
	# Checked-in appointments (waiting for service)
	checked_in = frappe.get_all("Service Appointment",
		filters=checked_in_filters,
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


def get_inspections_tab_data(company=None, has_jobcard=None, date_from=None, date_to=None):
	"""Get all vehicle inspections"""
	today = nowdate()
	
	# Build filters
	today_filters = {}
	pending_filters = {}
	recent_filters = {}
	
	if date_from:
		today_filters["inspection_date"] = [">=", date_from]
		pending_filters["inspection_date"] = [">=", date_from]
		recent_filters["inspection_date"] = [">=", date_from]
	if date_to:
		if "inspection_date" in today_filters:
			today_filters["inspection_date"].append(["<=", date_to])
		else:
			today_filters["inspection_date"] = ["<=", date_to]
		if "inspection_date" in pending_filters:
			pending_filters["inspection_date"].append(["<=", date_to])
		else:
			pending_filters["inspection_date"] = ["<=", date_to]
		if "inspection_date" in recent_filters:
			recent_filters["inspection_date"].append(["<=", date_to])
		else:
			recent_filters["inspection_date"] = ["<=", date_to]
	
	if has_jobcard == "yes":
		pending_filters["job_card"] = ["is", "set"]
	elif has_jobcard == "no":
		pending_filters["job_card"] = ["is", "not set"]
	
	# Today's inspections
	if not date_from and not date_to:
		today_filters["inspection_date"] = today
	
	today_inspections = frappe.get_all("Vehicle Inspection",
		filters=today_filters,
		fields=["name", "customer", "vehicle", "inspection_date", "inspector", "appointment", "job_card"],
		order_by="modified desc",
		limit=50
	)
	
	# Recent inspections (last 7 days)
	if not date_from and not date_to:
		recent_filters["inspection_date"] = [">=", add_days(today, -7)]
		recent_filters["inspection_date"] = ["<", today]
	
	recent_inspections = frappe.get_all("Vehicle Inspection",
		filters=recent_filters,
		fields=["name", "customer", "vehicle", "inspection_date", "inspector", "appointment", "job_card"],
		order_by="inspection_date desc",
		limit=50
	)
	
	# Inspections without job card (pending action)
	if not has_jobcard or has_jobcard == "no":
		pending_filters["job_card"] = ["is", "not set"]
	
	pending_action = frappe.get_all("Vehicle Inspection",
		filters=pending_filters,
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


def get_sales_tab_data(company=None, status=None, date_from=None, date_to=None):
	"""Get sales invoices related to workshop"""
	today = nowdate()
	company_condition = f"AND si.company = '{company}'" if company else ""
	
	# Build date filters
	date_condition = ""
	date_params = []
	if date_from and date_to:
		date_condition = "AND si.posting_date >= %s AND si.posting_date <= %s"
		date_params = [date_from, date_to]
	elif date_from:
		date_condition = "AND si.posting_date >= %s"
		date_params = [date_from]
	elif date_to:
		date_condition = "AND si.posting_date <= %s"
		date_params = [date_to]
	
	# Build status filter
	status_condition = ""
	if status:
		if status == "Unpaid":
			status_condition = "AND si.docstatus = 1 AND si.outstanding_amount > 0"
		elif status == "Paid":
			status_condition = "AND si.status = 'Paid'"
		else:
			status_condition = f"AND si.status = '{status}'"
	
	# Today's invoices
	if not date_from and not date_to:
		date_condition = "AND si.posting_date = %s"
		date_params = [today]
	
	# Build SQL query
	sql_query = """
		SELECT si.name, si.customer, si.grand_total, si.status, si.posting_date,
			   si.custom_job_card as job_card
		FROM `tabSales Invoice` si
		WHERE si.docstatus != 2
		{company_condition}
		{date_condition}
		{status_condition}
		ORDER BY si.modified DESC
		LIMIT 50
	""".format(
		company_condition=company_condition,
		date_condition=date_condition if date_condition else "",
		status_condition=status_condition if status_condition else ""
	)
	
	today_invoices = frappe.db.sql(sql_query, date_params if date_params else (), as_dict=True)
	
	# This week's invoices (only if no date filter)
	if not date_from and not date_to:
		week_start = add_days(today, -7)
		week_sql = """
			SELECT si.name, si.customer, si.grand_total, si.status, si.posting_date,
				   si.custom_job_card as job_card
			FROM `tabSales Invoice` si
			WHERE si.posting_date >= %s
			AND si.posting_date < %s
			AND si.docstatus != 2
			{company_condition}
			{status_condition}
			ORDER BY si.posting_date DESC
			LIMIT 50
		""".format(
			company_condition=company_condition,
			status_condition=status_condition if status_condition else ""
		)
		week_invoices = frappe.db.sql(week_sql, [week_start, today], as_dict=True)
	else:
		week_invoices = []
	
	# Draft invoices
	if not status or status == "Draft":
		draft_sql = """
			SELECT si.name, si.customer, si.grand_total, si.status, si.posting_date,
				   si.custom_job_card as job_card
			FROM `tabSales Invoice` si
			WHERE si.docstatus = 0
			{company_condition}
			{date_condition}
			ORDER BY si.modified DESC
			LIMIT 50
		""".format(
			company_condition=company_condition,
			date_condition=date_condition if date_condition else ""
		)
		draft_invoices = frappe.db.sql(draft_sql, date_params if date_params else (), as_dict=True)
	else:
		draft_invoices = []
	
	# Unpaid invoices
	if not status or status == "Unpaid":
		unpaid_sql = """
			SELECT si.name, si.customer, si.grand_total, si.outstanding_amount, si.status, si.posting_date,
				   si.custom_job_card as job_card
			FROM `tabSales Invoice` si
			WHERE si.docstatus = 1
			AND si.outstanding_amount > 0
			{company_condition}
			{date_condition}
			ORDER BY si.posting_date
			LIMIT 50
		""".format(
			company_condition=company_condition,
			date_condition=date_condition if date_condition else ""
		)
		unpaid_invoices = frappe.db.sql(unpaid_sql, date_params if date_params else (), as_dict=True)
	else:
		unpaid_invoices = []
	
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
	company_condition = f"AND jc.company = '{company}'" if company else ""
	company_condition_si = f"AND si.company = '{company}'" if company else ""
	
	# Jobs in progress
	jobs_in_progress = frappe.db.count("Job Card", {
		**filters,
		"status": ["in", ["Checked In", "Inspected", "In Progress"]]
	})
	
	# Total jobs
	total_jobs = frappe.db.count("Job Card", filters)
	
	# Ready to invoice
	ready_to_invoice = frappe.db.count("Job Card", {
		**filters,
		"status": "Ready to Invoice",
		"sales_invoice": ["is", "not set"]
	})
	
	# Ready to invoice value - calculate from service and part items
	service_total = frappe.db.sql("""
		SELECT COALESCE(SUM(jcsi.amount), 0) as total
		FROM `tabJob Card Service Item` jcsi
		INNER JOIN `tabJob Card` jc ON jcsi.parent = jc.name
		WHERE jc.status = 'Ready to Invoice'
		AND (jc.sales_invoice IS NULL OR jc.sales_invoice = '')
		{company_condition}
	""".format(company_condition=company_condition))[0][0] or 0
	
	part_total = frappe.db.sql("""
		SELECT COALESCE(SUM(jcpi.amount), 0) as total
		FROM `tabJob Card Part Item` jcpi
		INNER JOIN `tabJob Card` jc ON jcpi.parent = jc.name
		WHERE jc.status = 'Ready to Invoice'
		AND (jc.sales_invoice IS NULL OR jc.sales_invoice = '')
		{company_condition}
	""".format(company_condition=company_condition))[0][0] or 0
	
	ready_to_invoice_value = (service_total or 0) + (part_total or 0)
	
	# Today's revenue
	today_revenue = frappe.db.sql("""
		SELECT COALESCE(SUM(si.grand_total), 0) as revenue
		FROM `tabSales Invoice` si
		WHERE si.docstatus = 1
		AND si.posting_date = CURDATE()
		{company_condition}
	""".format(
		company_condition=company_condition_si
	))[0][0] or 0
	
	# This week's revenue
	week_revenue = frappe.db.sql("""
		SELECT COALESCE(SUM(si.grand_total), 0) as revenue
		FROM `tabSales Invoice` si
		WHERE si.docstatus = 1
		AND si.posting_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
		{company_condition}
	""".format(
		company_condition=company_condition_si
	))[0][0] or 0
	
	# Total vehicles serviced this month
	vehicles_serviced = frappe.db.sql("""
		SELECT COUNT(DISTINCT jc.vehicle)
		FROM `tabJob Card` jc
		WHERE MONTH(jc.posting_date) = MONTH(CURDATE())
		AND YEAR(jc.posting_date) = YEAR(CURDATE())
		{company_condition}
	""".format(
		company_condition=company_condition
	))[0][0] or 0
	
	# Vehicles serviced this week
	vehicles_this_week = frappe.db.sql("""
		SELECT COUNT(DISTINCT jc.vehicle)
		FROM `tabJob Card` jc
		WHERE jc.posting_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
		{company_condition}
	""".format(
		company_condition=company_condition
	))[0][0] or 0
	
	return {
		"jobs_in_progress": jobs_in_progress,
		"total_jobs": total_jobs,
		"ready_to_invoice": ready_to_invoice,
		"ready_to_invoice_value": ready_to_invoice_value,
		"today_revenue": today_revenue,
		"week_revenue": week_revenue,
		"vehicles_serviced": vehicles_serviced,
		"vehicles_this_week": vehicles_this_week
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


@frappe.whitelist()
def get_recently_closed_jobs(company=None, limit=10):
	"""Get recently closed jobs"""
	filters = {"company": company} if company else {}
	completed_jobs = frappe.get_all("Job Card",
		filters={
			**filters,
			"status": ["in", ["Invoiced", "Closed"]]
		},
		fields=["name", "customer", "vehicle", "status", "posting_date", "modified"],
		order_by="modified desc",
		limit=limit
	)
	return completed_jobs


def get_pending_inspections(company=None, limit=10):
	"""Get pending inspections (without job card)"""
	pending_inspections = frappe.get_all("Vehicle Inspection",
		filters={
			"job_card": ["is", "not set"]
		},
		fields=["name", "customer", "vehicle", "inspection_date", "inspector", "appointment"],
		order_by="inspection_date desc",
		limit=limit
	)
	return pending_inspections


def get_jobs_ready_to_invoice(company=None, limit=10):
	"""Get jobs ready to invoice"""
	filters = {"company": company} if company else {}
	jobs = frappe.get_all("Job Card",
		filters={
			**filters,
			"status": "Ready to Invoice",
			"sales_invoice": ["is", "not set"]
		},
		fields=["name", "customer", "vehicle", "status", "posting_date", "modified"],
		order_by="posting_date",
		limit=limit
	)
	return jobs


def get_today_completed_tasks(company=None):
	"""Get today's completed tasks summary"""
	filters = {"company": company} if company else {}
	today = nowdate()
	
	completed_jobs = frappe.db.count("Job Card", {
		**filters,
		"status": ["in", ["Invoiced", "Closed"]],
		"posting_date": today
	})
	
	completed_appointments = frappe.db.count("Service Appointment", {
		"status": "Completed",
		"scheduled_start": [">=", today],
		"scheduled_start": ["<", add_days(today, 1)]
	})
	
	completed_inspections = frappe.db.count("Vehicle Inspection", {
		"inspection_date": today
	})
	
	return {
		"jobs": completed_jobs,
		"appointments": completed_appointments,
		"inspections": completed_inspections,
		"total": completed_jobs + completed_appointments + completed_inspections
	}


def get_daily_jobs_chart_data(company=None, days=30):
	"""Get daily jobs count for chart"""
	company_condition = f"AND jc.company = '{company}'" if company else ""
	
	data = frappe.db.sql("""
		SELECT 
			jc.posting_date as date,
			COUNT(jc.name) as job_count
		FROM `tabJob Card` jc
		WHERE jc.posting_date >= DATE_SUB(CURDATE(), INTERVAL {days} DAY)
		{company_condition}
		GROUP BY jc.posting_date
		ORDER BY jc.posting_date
	""".format(days=days, company_condition=company_condition), as_dict=True)
	
	return data


def get_upcoming_appointments(company=None, limit=10):
	"""Get upcoming appointments for calendar"""
	today = nowdate()
	appointments = frappe.get_all("Service Appointment",
		filters={
			"scheduled_start": [">=", today],
			"status": ["not in", ["Cancelled", "Completed", "No-Show"]]
		},
		fields=["name", "customer", "vehicle", "scheduled_start", "scheduled_end", "status"],
		order_by="scheduled_start",
		limit=limit
	)
	return appointments


def get_detailed_summaries(company=None):
	"""Get detailed summaries for dashboard"""
	try:
		filters = {"company": company} if company else {}
		company_condition = f"AND jc.company = '{company}'" if company else ""
		company_condition_si = f"AND si.company = '{company}'" if company else ""
		today = nowdate()
		
		# Jobs Summary
		jobs_summary = {
		"completed_today": frappe.db.count("Job Card", {
			**filters,
			"status": ["in", ["Invoiced", "Closed"]],
			"posting_date": today
		}),
		"in_progress": frappe.db.count("Job Card", {
			**filters,
			"status": ["in", ["Checked In", "Inspected", "In Progress"]]
		}),
		"draft": frappe.db.count("Job Card", {
			**filters,
			"status": "Draft"
		}),
		"approved": frappe.db.count("Job Card", {
			**filters,
			"status": "Approved"
		}),
		"this_week": frappe.db.sql("""
			SELECT COUNT(*) as count
			FROM `tabJob Card` jc
			WHERE jc.posting_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
			{company_condition}
		""".format(company_condition=company_condition))[0][0] or 0,
			"this_month": frappe.db.sql("""
				SELECT COUNT(*) as count
				FROM `tabJob Card` jc
				WHERE MONTH(jc.posting_date) = MONTH(CURDATE())
				AND YEAR(jc.posting_date) = YEAR(CURDATE())
				{company_condition}
			""".format(company_condition=company_condition))[0][0] or 0
		}
		
		# Appointments Summary
		# Note: Service Appointment doesn't have company field, so we filter through linked Job Cards if company is specified
		if company:
			# Filter appointments through linked job cards
			job_card_filter = f"AND EXISTS (SELECT 1 FROM `tabJob Card` jc WHERE jc.appointment = sa.name AND jc.company = '{company}')"
		else:
			job_card_filter = ""
		
		appointments_summary = {
			"today": frappe.db.count("Service Appointment", {
				"scheduled_start": [">=", today],
				"scheduled_start": ["<", add_days(today, 1)]
			}),
			"checked_in": frappe.db.count("Service Appointment", {
				"status": "Checked-In"
			}),
			"scheduled": frappe.db.count("Service Appointment", {
				"status": "Scheduled"
			}),
			"completed": frappe.db.count("Service Appointment", {
				"status": "Completed"
			}),
			"cancelled": frappe.db.count("Service Appointment", {
				"status": "Cancelled"
			}),
			"this_week": frappe.db.sql("""
				SELECT COUNT(*) as count
				FROM `tabService Appointment` sa
				WHERE sa.scheduled_start >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
				{job_card_filter}
			""".format(job_card_filter=job_card_filter))[0][0] or 0
		}
		
		# Financial Summary
		financial_summary = {
			"today_revenue": frappe.db.sql("""
				SELECT COALESCE(SUM(si.grand_total), 0) as revenue
				FROM `tabSales Invoice` si
				WHERE si.docstatus = 1
				AND si.posting_date = CURDATE()
				{company_condition}
			""".format(company_condition=company_condition_si))[0][0] or 0,
			"week_revenue": frappe.db.sql("""
				SELECT COALESCE(SUM(si.grand_total), 0) as revenue
				FROM `tabSales Invoice` si
				WHERE si.docstatus = 1
				AND si.posting_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
				{company_condition}
			""".format(company_condition=company_condition_si))[0][0] or 0,
			"month_revenue": frappe.db.sql("""
				SELECT COALESCE(SUM(si.grand_total), 0) as revenue
				FROM `tabSales Invoice` si
				WHERE si.docstatus = 1
				AND MONTH(si.posting_date) = MONTH(CURDATE())
				AND YEAR(si.posting_date) = YEAR(CURDATE())
				{company_condition}
			""".format(company_condition=company_condition_si))[0][0] or 0,
			"outstanding": frappe.db.sql("""
				SELECT COALESCE(SUM(si.outstanding_amount), 0) as outstanding
				FROM `tabSales Invoice` si
				WHERE si.docstatus = 1
				AND si.outstanding_amount > 0
				{company_condition}
			""".format(company_condition=company_condition_si))[0][0] or 0,
			"draft_invoices": frappe.db.count("Sales Invoice", {
				"company": company,
				"docstatus": 0
			}) if company else frappe.db.count("Sales Invoice", {"docstatus": 0}),
			"paid_today": frappe.db.sql("""
				SELECT COALESCE(SUM(si.grand_total), 0) as paid
				FROM `tabSales Invoice` si
				WHERE si.docstatus = 1
				AND si.status = 'Paid'
				AND si.posting_date = CURDATE()
				{company_condition}
			""".format(company_condition=company_condition_si))[0][0] or 0
		}
		
		# Inspections Summary
		inspections_summary = {
			"today": frappe.db.count("Vehicle Inspection", {
				"inspection_date": today
			}),
			"pending_action": frappe.db.count("Vehicle Inspection", {
				"job_card": ["is", "not set"]
			}),
			"with_jobcard": frappe.db.count("Vehicle Inspection", {
				"job_card": ["is", "set"]
			}),
			"without_jobcard": frappe.db.count("Vehicle Inspection", {
				"job_card": ["is", "not set"]
			}),
			"this_week": frappe.db.sql("""
				SELECT COUNT(*) as count
				FROM `tabVehicle Inspection` vi
				WHERE vi.inspection_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
			""")[0][0] or 0,
			"this_month": frappe.db.sql("""
				SELECT COUNT(*) as count
				FROM `tabVehicle Inspection` vi
				WHERE MONTH(vi.inspection_date) = MONTH(CURDATE())
				AND YEAR(vi.inspection_date) = YEAR(CURDATE())
			""")[0][0] or 0
		}
		
		return {
			"jobs": jobs_summary,
			"appointments": appointments_summary,
			"financial": financial_summary,
			"inspections": inspections_summary
		}
	except Exception as e:
		frappe.log_error(frappe.get_traceback(), _("Get Detailed Summaries Error"))
		# Return empty summaries on error
		return {
			"jobs": {
				"completed_today": 0,
				"in_progress": 0,
				"draft": 0,
				"approved": 0,
				"this_week": 0,
				"this_month": 0
			},
			"appointments": {
				"today": 0,
				"checked_in": 0,
				"scheduled": 0,
				"completed": 0,
				"cancelled": 0,
				"this_week": 0
			},
			"financial": {
				"today_revenue": 0,
				"week_revenue": 0,
				"month_revenue": 0,
				"outstanding": 0,
				"draft_invoices": 0,
				"paid_today": 0
			},
			"inspections": {
				"today": 0,
				"pending_action": 0,
				"with_jobcard": 0,
				"without_jobcard": 0,
				"this_week": 0,
				"this_month": 0
			}
		}
