# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

import frappe
from frappe.permissions import add_permission

from workshop_mgmt.permission_utils import WORKSHOP_CUSTOMER_ROLE
from workshop_mgmt.workshop_management.demo.seed_demo_items import seed_demo_workshop_items


def after_install():
	_setup_workshop_customer_access()
	_remove_legacy_garage_dashboard()
	ensure_workshop_job_card_workflow()
	_seed_demo_items_safe()


def after_migrate():
	_setup_workshop_customer_access()
	_remove_legacy_garage_dashboard()
	ensure_workshop_job_card_workflow()
	_seed_demo_items_safe()


def _seed_demo_items_safe():
	try:
		seed_demo_workshop_items()
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Workshop demo items seed")


def _setup_workshop_customer_access():
	"""Create role and Custom DocPerms on core ERPNext doctypes (idempotent)."""
	if not frappe.db.exists("Role", WORKSHOP_CUSTOMER_ROLE):
		frappe.get_doc(
			{
				"doctype": "Role",
				"role_name": WORKSHOP_CUSTOMER_ROLE,
				"desk_access": 1,
			}
		).insert(ignore_permissions=True)

	for doctype in ("Customer", "Sales Invoice"):
		if not frappe.db.exists("DocType", doctype):
			continue
		try:
			add_permission(doctype, WORKSHOP_CUSTOMER_ROLE, 0, "read")
		except Exception:
			pass
		name = frappe.db.get_value(
			"Custom DocPerm",
			{"parent": doctype, "role": WORKSHOP_CUSTOMER_ROLE, "permlevel": 0, "if_owner": 0},
			"name",
		)
		if name:
			frappe.db.set_value(
				"Custom DocPerm",
				name,
				{"export": 0, "report": 0, "import": 0},
				update_modified=False,
			)


def _remove_legacy_garage_dashboard():
	"""Delete old custom Page route now replaced by Workspace dashboard."""
	if frappe.db.exists("Page", "garage-dashboard"):
		try:
			frappe.delete_doc("Page", "garage-dashboard", force=1, ignore_permissions=True)
		except Exception:
			pass


WORKSHOP_JOB_CARD_WORKFLOW = "Workshop Job Card"
"""ERPNext Workflow name for Job Card (status field)."""


def ensure_workshop_job_card_workflow():
	"""Create standard Workflow for workshop Job Card if none is active yet.

	Uses the existing Select field `status` as workflow_state_field so values stay
	aligned with reports and server logic. Skips if another Workflow is already
	active for Job Card (lets you replace this entirely from the desk).
	"""
	if not frappe.db.exists("DocType", "Job Card"):
		return

	active = frappe.db.get_value(
		"Workflow", {"document_type": "Job Card", "is_active": 1}, "name"
	)
	if active and active != WORKSHOP_JOB_CARD_WORKFLOW:
		return

	statuses = [
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
	]
	for s in statuses:
		if not frappe.db.exists("Workflow State", s):
			frappe.get_doc(
				{"doctype": "Workflow State", "workflow_state_name": s}
			).insert(ignore_permissions=True)

	actions = [
		"WS Check In",
		"WS Inspect",
		"WS Estimate",
		"WS Approve",
		"WS Start Work",
		"WS Ready To Invoice",
		"WS Close",
		"WS Cancel",
	]
	for a in actions:
		if not frappe.db.exists("Workflow Action Master", a):
			frappe.get_doc(
				{"doctype": "Workflow Action Master", "workflow_action_name": a}
			).insert(ignore_permissions=True)

	role = "Desk User"
	states_rows = [
		{
			"state": s,
			"doc_status": "0",
			"allow_edit": role,
			"send_email": 0,
		}
		for s in statuses
	]

	transitions = [
		("Draft", "WS Check In", "Checked In"),
		("Checked In", "WS Inspect", "Inspected"),
		("Inspected", "WS Estimate", "Estimated"),
		("Estimated", "WS Approve", "Approved"),
		("Approved", "WS Start Work", "In Progress"),
		("In Progress", "WS Ready To Invoice", "Ready to Invoice"),
		("Invoiced", "WS Close", "Closed"),
	]
	cancel_from = [
		"Draft",
		"Checked In",
		"Inspected",
		"Estimated",
		"Approved",
		"In Progress",
		"Ready to Invoice",
	]
	for st in cancel_from:
		transitions.append((st, "WS Cancel", "Cancelled"))

	trans_rows = [
		{
			"state": a,
			"action": act,
			"next_state": b,
			"allowed": role,
			"allow_self_approval": 1,
		}
		for a, act, b in transitions
	]

	if frappe.db.exists("Workflow", WORKSHOP_JOB_CARD_WORKFLOW):
		wf = frappe.get_doc("Workflow", WORKSHOP_JOB_CARD_WORKFLOW)
	else:
		wf = frappe.new_doc("Workflow")
		wf.workflow_name = WORKSHOP_JOB_CARD_WORKFLOW

	wf.document_type = "Job Card"
	wf.is_active = 1
	wf.override_status = 0
	wf.send_email_alert = 0
	wf.workflow_state_field = "status"
	wf.states = []
	for row in states_rows:
		wf.append("states", row)
	wf.transitions = []
	for row in trans_rows:
		wf.append("transitions", row)

	if wf.is_new():
		wf.insert(ignore_permissions=True)
	else:
		wf.save(ignore_permissions=True)

	frappe.clear_cache(doctype="Job Card")
