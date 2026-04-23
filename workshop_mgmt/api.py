# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

import frappe
from frappe import _


@frappe.whitelist()
def get_dashboard_data(filters=None):
    """Deprecated endpoint kept for compatibility."""
    return {
        "message": _("Garage Dashboard page is removed. Use the Workshop Management workspace dashboard.")
    }


@frappe.whitelist()
def create_job_card_from_inspection(
    inspection,
    company,
    warehouse,
    populate_from_recommendations=1,
):
    """Create Job Card from Vehicle Inspection (linked appointment + inspection; optional line fill).

    Exposed on workshop_mgmt.api so the method resolves reliably from the desk (not only the DocType controller).
    """
    from workshop_mgmt.workshop_management.vehicle_inspection_jobs import (
        create_job_card_from_inspection as _create,
    )

    return _create(inspection, company, warehouse, populate_from_recommendations)


@frappe.whitelist()
def appointment_check_in(name):
    """Set status to Checked-In (same as desk Check In)."""
    doc = frappe.get_doc("Service Appointment", name)
    doc.check_permission("write")
    if doc.status != "Scheduled":
        frappe.throw(_("Only a Scheduled appointment can be checked in."))
    doc.status = "Checked-In"
    doc.save()
    return {"name": doc.name, "status": doc.status}


@frappe.whitelist()
def appointment_mark_complete(name):
    """Set status to Completed (same as desk Mark Complete)."""
    doc = frappe.get_doc("Service Appointment", name)
    doc.check_permission("write")
    if doc.status != "In Progress":
        frappe.throw(_("Only an In Progress appointment can be marked complete."))
    doc.status = "Completed"
    doc.save()
    return {"name": doc.name, "status": doc.status}


@frappe.whitelist()
def create_inspection_for_appointment(appointment):
    """Create a Vehicle Inspection linked to the appointment (desk: Create Inspection)."""
    appt = frappe.get_doc("Service Appointment", appointment)
    appt.check_permission("write")
    frappe.has_permission("Vehicle Inspection", "create", throw=True)
    if appt.status != "Checked-In":
        frappe.throw(_("Create Inspection is only available after check-in."))
    if appt.inspection:
        frappe.throw(_("This appointment already has an inspection."))
    ins = frappe.new_doc("Vehicle Inspection")
    ins.appointment = appt.name
    ins.customer = appt.customer
    ins.vehicle = appt.vehicle
    ins.insert()
    return {"name": ins.name}


@frappe.whitelist()
def create_job_card_for_appointment(appointment, company, warehouse):
    """Create a Job Card for the appointment (desk: Create Job Card with company/warehouse)."""
    from workshop_mgmt.workshop_management.vehicle_inspection_jobs import (
        _build_complaint_summary_from_inspection,
    )

    appt = frappe.get_doc("Service Appointment", appointment)
    appt.check_permission("write")
    frappe.has_permission("Job Card", "create", throw=True)
    if appt.status != "Checked-In":
        frappe.throw(_("Create Job Card is only available after check-in."))
    if appt.job_card:
        frappe.throw(_("This appointment already has a job card."))
    if not company or not warehouse:
        frappe.throw(_("Company and Warehouse are required."))
    jc = frappe.new_doc("Job Card")
    jc.company = company
    jc.warehouse = warehouse
    jc.customer = appt.customer
    jc.vehicle = appt.vehicle
    jc.appointment = appt.name
    if appt.service_advisor:
        jc.service_advisor = appt.service_advisor
    if appt.inspection and frappe.db.exists("Vehicle Inspection", appt.inspection):
        jc.inspection = appt.inspection
        ins_doc = frappe.get_doc("Vehicle Inspection", appt.inspection)
        summary = _build_complaint_summary_from_inspection(ins_doc)
        if summary:
            jc.complaint_summary = summary
    elif (appt.remarks or "").strip():
        jc.complaint_summary = (appt.remarks or "").strip()
    jc.insert()
    return {"name": jc.name}


@frappe.whitelist()
def job_card_create_quotation(name):
    """Run Job Card.create_quotation (same as desk)."""
    doc = frappe.get_doc("Job Card", name)
    return doc.create_quotation()


@frappe.whitelist()
def job_card_create_sales_invoice(name):
    """Run Job Card.create_sales_invoice (same as desk)."""
    doc = frappe.get_doc("Job Card", name)
    return doc.create_sales_invoice()


































