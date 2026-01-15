# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import nowdate, add_days, getdate
import json


@frappe.whitelist()
def get_dashboard_data(filters=None):
    """Get comprehensive dashboard data for garage management"""
    from workshop_mgmt.workshop_management.page.garage_dashboard.garage_dashboard import (
        get_kpis,
        get_job_status_summary,
        get_recently_closed_jobs,
        get_today_appointments,
        get_pending_inspections,
        get_jobs_ready_to_invoice,
        get_today_completed_tasks,
        get_daily_jobs_chart_data,
        get_upcoming_appointments
    )
    
    if isinstance(filters, str):
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

