# Copyright (c) 2026, Infoney and contributors
# Server-side actions for Vehicle Inspection (kept out of doctype controller for reliable whitelisting).

import frappe
from frappe import _
from frappe.utils import cint, flt

# Inspection lines that should appear on the Job Card complaint summary
_INSPECTION_COMPLAINT_STATUSES = frozenset({"Needs Attention", "Critical"})


def _item_rate(item_code: str) -> float:
	rate = frappe.db.get_value("Item", item_code, "standard_rate")
	return flt(rate)


def _active_bom_for_item(item_code: str, company: str) -> str | None:
	if not frappe.db.table_exists("BOM"):
		return None
	filters = {"item": item_code, "docstatus": 1, "is_active": 1}
	if company:
		filters["company"] = company
	return frappe.db.get_value("BOM", filters, "name", order_by="is_default desc, modified desc")


def _bom_part_quantities(bom_name: str) -> dict[str, float]:
	"""Per finished-unit quantities of stock components for one BOM."""
	out: dict[str, float] = {}
	bom = frappe.get_doc("BOM", bom_name)
	base = flt(bom.quantity) or 1
	for row in bom.items or []:
		if not row.item_code:
			continue
		consumed = flt(row.stock_qty) if row.stock_qty else flt(row.qty)
		per_fg = consumed / base
		out[row.item_code] = out.get(row.item_code, 0) + per_fg
	return out


def _build_complaint_summary_from_inspection(doc) -> str:
	"""Only rows marked Needs Attention or Critical; include section, item, status, and notes."""
	lines: list[str] = []
	for r in doc.inspection_items or []:
		st = (r.status or "").strip()
		if st not in _INSPECTION_COMPLAINT_STATUSES:
			continue
		sec = (r.section or "").strip()
		item = (r.check_item or "").strip()
		if sec and item:
			label = f"{sec} — {item}"
		elif item:
			label = item
		elif sec:
			label = sec
		else:
			label = _("(no label)")
		block = f"{label} — {st}"
		notes = (r.notes or "").strip()
		if notes:
			block += f"\n{notes}"
		lines.append(block)
	return "\n\n".join(lines[:50])


def _populate_job_lines_from_inspection(jc, inspection_doc, company: str):
	"""Append service_items and part_items from inspection recommendations (+ BOM parts for services)."""
	service_codes: list[str] = []
	service_qty: dict[str, float] = {}
	part_qty: dict[str, float] = {}

	for row in inspection_doc.inspection_items or []:
		code = row.recommended_service
		if not code:
			continue
		meta = frappe.db.get_value(
			"Item",
			code,
			["is_stock_item", "disabled"],
			as_dict=True,
		)
		if not meta or cint(meta.disabled):
			continue
		if cint(meta.is_stock_item):
			part_qty[code] = part_qty.get(code, 0) + 1
		else:
			service_qty[code] = service_qty.get(code, 0) + 1
			if code not in service_codes:
				service_codes.append(code)

	for code, qty in service_qty.items():
		jc.append(
			"service_items",
			{
				"item_code": code,
				"qty": qty,
				"rate": _item_rate(code),
			},
		)

	for svc in service_codes:
		bom_name = _active_bom_for_item(svc, company)
		if not bom_name:
			continue
		for part_code, bom_qty in _bom_part_quantities(bom_name).items():
			pmeta = frappe.db.get_value("Item", part_code, ["is_stock_item", "disabled"], as_dict=True)
			if not pmeta or cint(pmeta.disabled) or not cint(pmeta.is_stock_item):
				continue
			part_qty[part_code] = part_qty.get(part_code, 0) + bom_qty * service_qty.get(svc, 1)

	for code, qty in sorted(part_qty.items()):
		jc.append(
			"part_items",
			{
				"item_code": code,
				"qty": qty,
				"rate": _item_rate(code),
				"warehouse": jc.warehouse,
			},
		)


@frappe.whitelist()
def create_job_card_from_inspection(
	inspection: str,
	company: str,
	warehouse: str,
	populate_from_recommendations=1,
):
	"""Create a Job Card linked to this inspection and appointment; optionally fill lines from recommendations."""
	frappe.has_permission("Job Card", ptype="create", throw=True)
	doc = frappe.get_doc("Vehicle Inspection", inspection)
	doc.check_permission("write")

	if doc.job_card and frappe.db.exists("Job Card", doc.job_card):
		frappe.throw(_("This inspection is already linked to Job Card {0}").format(doc.job_card))

	if not doc.customer or not doc.vehicle:
		frappe.throw(_("Customer and Vehicle are required on the inspection"))

	if not frappe.db.exists("Warehouse", {"name": warehouse, "company": company}):
		frappe.throw(_("Warehouse {0} must belong to Company {1}").format(warehouse, company))

	populate = cint(populate_from_recommendations)

	jc = frappe.new_doc("Job Card")
	jc.company = company
	jc.warehouse = warehouse
	jc.customer = doc.customer
	jc.vehicle = doc.vehicle
	jc.appointment = doc.appointment
	jc.inspection = doc.name
	jc.complaint_summary = _build_complaint_summary_from_inspection(doc)

	if populate:
		_populate_job_lines_from_inspection(jc, doc, company)

	jc.insert()

	return jc.name
