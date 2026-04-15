# Copyright (c) 2026, Infoney and contributors
# For license information, please see license.txt

from __future__ import annotations

from datetime import timedelta

import frappe
from frappe.utils import cint, flt, getdate, nowdate


def _sum_value(query: str, params: tuple | None = None) -> float:
	row = frappe.db.sql(query, params or (), as_dict=True)
	if not row:
		return 0.0
	return flt(row[0].get("value"))


def _count_value(query: str, params: tuple | None = None) -> int:
	row = frappe.db.sql(query, params or (), as_dict=True)
	if not row:
		return 0
	return cint(row[0].get("value"))


@frappe.whitelist(allow_guest=True)
def get_dashboard_data(days: int = 7):
	"""Return high-level operational and financial metrics for the garage dashboard."""

	span_days = min(max(cint(days) or 7, 7), 30)
	today = getdate(nowdate())
	month_start = today.replace(day=1)
	trend_start = today - timedelta(days=span_days - 1)

	today_revenue = _sum_value(
		"""
		select sum(base_grand_total) as value
		from `tabSales Invoice`
		where docstatus = 1
			and ifnull(custom_job_card, '') != ''
			and posting_date = %s
		""",
		(today,),
	)
	month_revenue = _sum_value(
		"""
		select sum(base_grand_total) as value
		from `tabSales Invoice`
		where docstatus = 1
			and ifnull(custom_job_card, '') != ''
			and posting_date between %s and %s
		""",
		(month_start, today),
	)
	outstanding = _sum_value(
		"""
		select sum(outstanding_amount) as value
		from `tabSales Invoice`
		where docstatus = 1
			and ifnull(custom_job_card, '') != ''
		"""
	)

	today_appointments = _count_value(
		"""
		select count(*) as value
		from `tabService Appointment`
		where date(scheduled_start) = %s
		""",
		(today,),
	)
	upcoming_appointments = _count_value(
		"""
		select count(*) as value
		from `tabService Appointment`
		where date(scheduled_start) >= %s
			and status not in ('Completed', 'Cancelled', 'No-Show')
		""",
		(today,),
	)
	in_progress_appointments = _count_value(
		"""
		select count(*) as value
		from `tabService Appointment`
		where status = 'In Progress'
		"""
	)
	open_jobs = _count_value(
		"""
		select count(*) as value
		from `tabJob Card`
		where status not in ('Closed', 'Cancelled', 'Invoiced')
		"""
	)
	ready_to_invoice = _count_value(
		"""
		select count(*) as value
		from `tabJob Card`
		where status = 'Ready to Invoice'
		"""
	)

	total_appointments_month = _count_value(
		"""
		select count(*) as value
		from `tabService Appointment`
		where date(scheduled_start) between %s and %s
		""",
		(month_start, today),
	)
	completed_appointments_month = _count_value(
		"""
		select count(*) as value
		from `tabService Appointment`
		where status = 'Completed'
			and date(scheduled_start) between %s and %s
		""",
		(month_start, today),
	)
	completion_rate = (
		flt(completed_appointments_month) / flt(total_appointments_month) * 100
		if total_appointments_month
		else 0
	)

	job_status = frappe.db.sql(
		"""
		select status, count(*) as count
		from `tabJob Card`
		group by status
		order by count desc
		""",
		as_dict=True,
	)
	appointment_status = frappe.db.sql(
		"""
		select status, count(*) as count
		from `tabService Appointment`
		group by status
		order by count desc
		""",
		as_dict=True,
	)

	revenue_rows = frappe.db.sql(
		"""
		select posting_date, sum(base_grand_total) as amount
		from `tabSales Invoice`
		where docstatus = 1
			and ifnull(custom_job_card, '') != ''
			and posting_date between %s and %s
		group by posting_date
		order by posting_date asc
		""",
		(trend_start, today),
		as_dict=True,
	)
	revenue_map = {str(r.posting_date): flt(r.amount) for r in revenue_rows}
	revenue_trend = []
	for i in range(span_days):
		day = trend_start + timedelta(days=i)
		key = str(day)
		revenue_trend.append(
			{
				"date": key,
				"label": day.strftime("%d %b"),
				"amount": revenue_map.get(key, 0),
			}
		)

	top_services = frappe.db.sql(
		"""
		select
			jsi.item_code,
			coalesce(i.item_name, jsi.item_code) as item_name,
			sum(jsi.qty) as qty,
			sum(jsi.amount) as amount
		from `tabJob Card Service Item` jsi
		inner join `tabJob Card` jc on jc.name = jsi.parent
		left join `tabItem` i on i.name = jsi.item_code
		where jc.posting_date between %s and %s
		group by jsi.item_code, i.item_name
		order by amount desc
		limit 6
		""",
		(month_start, today),
		as_dict=True,
	)
	top_parts = frappe.db.sql(
		"""
		select
			jpi.item_code,
			coalesce(i.item_name, jpi.item_code) as item_name,
			sum(jpi.qty) as qty,
			sum(jpi.amount) as amount
		from `tabJob Card Part Item` jpi
		inner join `tabJob Card` jc on jc.name = jpi.parent
		left join `tabItem` i on i.name = jpi.item_code
		where jc.posting_date between %s and %s
		group by jpi.item_code, i.item_name
		order by amount desc
		limit 6
		""",
		(month_start, today),
		as_dict=True,
	)

	recent_jobs = frappe.db.sql(
		"""
		select
			name,
			customer,
			status,
			posting_date
		from `tabJob Card`
		order by modified desc
		limit 8
		""",
		as_dict=True,
	)
	upcoming_appointments_rows = frappe.db.sql(
		"""
		select
			name,
			customer,
			status,
			scheduled_start
		from `tabService Appointment`
		where date(scheduled_start) >= %s
			and status not in ('Completed', 'Cancelled', 'No-Show')
		order by scheduled_start asc
		limit 6
		""",
		(today,),
		as_dict=True,
	)

	return {
		"kpis": {
			"today_revenue": today_revenue,
			"month_revenue": month_revenue,
			"outstanding": outstanding,
			"today_date": str(today),
			"today_appointments": today_appointments,
			"upcoming_appointments": upcoming_appointments,
			"in_progress_appointments": in_progress_appointments,
			"open_jobs": open_jobs,
			"ready_to_invoice": ready_to_invoice,
			"completion_rate": completion_rate,
		},
		"job_status": job_status,
		"appointment_status": appointment_status,
		"revenue_trend": revenue_trend,
		"top_services": top_services,
		"top_parts": top_parts,
		"recent_jobs": recent_jobs,
		"upcoming_appointments": upcoming_appointments_rows,
	}
