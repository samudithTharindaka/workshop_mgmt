# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

import frappe
from frappe import _

JOB_CARD_ALLOWED_STATUSES = (
	"Draft",
	"Checked In",
	"Inspected",
	"Estimated",
	"Approved",
	"In Progress",
	"Ready to Invoice",
	"Invoiced",
	"Closed",
	"Cancelled",
)


def _job_card_workflow_path_to_status(name, target_status):
	"""Return a list of workflow action names to reach target_status, or None if unreachable."""
	from collections import deque

	from frappe.model.workflow import (
		get_workflow,
		get_workflow_name,
		has_approval_access,
		is_transition_condition_satisfied,
	)

	if not get_workflow_name("Job Card"):
		return None

	workflow = get_workflow("Job Card")
	field = workflow.workflow_state_field
	base = frappe.get_doc("Job Card", name)
	base.load_from_db()
	start = base.get(field)
	if not start and workflow.states:
		start = workflow.states[0].state
	if not start:
		return None
	if start == target_status:
		return []

	roles = frappe.get_roles()
	user = frappe.session.user
	queue = deque([(start, [])])
	visited = {start}

	while queue:
		state, path = queue.popleft()
		eval_doc = frappe.get_doc("Job Card", name)
		eval_doc.load_from_db()
		eval_doc.set(field, state)

		for tr in workflow.transitions:
			if tr.state != state or tr.allowed not in roles:
				continue
			trans_dict = tr.as_dict()
			if not is_transition_condition_satisfied(tr, eval_doc):
				continue
			if not has_approval_access(user, eval_doc, trans_dict):
				continue
			next_state = tr.next_state
			new_path = path + [tr.action]
			if next_state == target_status:
				return new_path
			if next_state not in visited:
				visited.add(next_state)
				queue.append((next_state, new_path))

	return None


@frappe.whitelist()
def job_card_set_status(name, status):
	"""Move Job Card to the given status (shortest workflow path), or set directly when no workflow."""
	status = (status or "").strip()
	if status not in JOB_CARD_ALLOWED_STATUSES:
		frappe.throw(_("Invalid status."), title=_("Job Card"))

	doc = frappe.get_doc("Job Card", name)
	doc.check_permission("write")

	from frappe.model.workflow import apply_workflow, get_workflow_name

	if doc.status == status:
		return {"name": doc.name, "status": doc.status}

	if not get_workflow_name("Job Card"):
		doc.status = status
		doc.save()
		return {"name": doc.name, "status": doc.status}

	actions = _job_card_workflow_path_to_status(name, status)
	if not actions:
		frappe.throw(
			_("No allowed workflow path from {0} to {1}.").format(
				frappe.bold(doc.status or _("(empty)")),
				frappe.bold(status),
			),
			title=_("Job Card"),
		)

	for action in actions:
		apply_workflow({"doctype": "Job Card", "name": name}, action)

	doc = frappe.get_doc("Job Card", name)
	return {"name": doc.name, "status": doc.status}


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
def appointment_cancel(name):
    """Set status to Cancelled (portal / desk parity for open appointments)."""
    doc = frappe.get_doc("Service Appointment", name)
    doc.check_permission("write")
    if doc.status in ("Completed", "Cancelled", "No-Show"):
        frappe.throw(_("This appointment cannot be cancelled."))
    if doc.status == "In Progress":
        frappe.throw(
            _("Cannot cancel while the appointment is in progress. Complete it in Desk if needed.")
        )
    doc.status = "Cancelled"
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
def job_card_update_line_items(name, service_items=None, part_items=None):
    """Update Job Card service/part lines from portal mechanic UI."""
    doc = frappe.get_doc("Job Card", name)
    doc.check_permission("write")

    service_items = frappe.parse_json(service_items) or []
    part_items = frappe.parse_json(part_items) or []

    def _num(v, default=0.0):
        try:
            return float(v)
        except Exception:
            return default

    normalized_service = []
    for row in service_items:
        item_code = (row.get("item_code") or "").strip()
        if not item_code:
            continue
        qty = _num(row.get("qty"), 1.0)
        rate = _num(row.get("rate"), 0.0)
        normalized_service.append(
            {
                "doctype": "Job Card Service Item",
                "item_code": item_code,
                "qty": qty if qty > 0 else 1.0,
                "rate": rate if rate >= 0 else 0.0,
            }
        )

    normalized_parts = []
    for row in part_items:
        item_code = (row.get("item_code") or "").strip()
        if not item_code:
            continue
        qty = _num(row.get("qty"), 1.0)
        rate = _num(row.get("rate"), 0.0)
        out = {
            "doctype": "Job Card Part Item",
            "item_code": item_code,
            "qty": qty if qty > 0 else 1.0,
            "rate": rate if rate >= 0 else 0.0,
        }
        warehouse = (row.get("warehouse") or "").strip()
        if warehouse:
            out["warehouse"] = warehouse
        normalized_parts.append(out)

    doc.set("service_items", [])
    for row in normalized_service:
        doc.append("service_items", row)

    doc.set("part_items", [])
    for row in normalized_parts:
        doc.append("part_items", row)

    doc.save()

    return {
        "name": doc.name,
        "status": doc.status,
        "service_items": doc.get("service_items"),
        "part_items": doc.get("part_items"),
    }


@frappe.whitelist()
def job_card_create_sales_invoice(name):
    """Run Job Card.create_sales_invoice (same as desk)."""
    doc = frappe.get_doc("Job Card", name)
    return doc.create_sales_invoice()


































