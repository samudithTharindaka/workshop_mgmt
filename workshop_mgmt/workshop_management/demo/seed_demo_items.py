# Copyright (c) 2026, Infoney and contributors
# Demo Item master data for workshop (parts + services).

import frappe
from frappe import _
from frappe.utils import cint

PARTS = [
	{
		"item_code": "ENG-OIL-001",
		"item_name": "Engine Oil 5W-30",
		"item_group": "Vehicle Parts",
		"stock_uom": "Litre",
		"is_stock_item": 1,
		"standard_rate": 4500,
	},
	{
		"item_code": "BRK-PAD-001",
		"item_name": "Brake Pad Set",
		"item_group": "Vehicle Parts",
		"stock_uom": "Unit",
		"is_stock_item": 1,
		"standard_rate": 8500,
	},
	{
		"item_code": "AIR-FLTR-001",
		"item_name": "Air Filter",
		"item_group": "Vehicle Parts",
		"stock_uom": "Unit",
		"is_stock_item": 1,
		"standard_rate": 3000,
	},
	{
		"item_code": "OIL-FLTR-001",
		"item_name": "Oil Filter",
		"item_group": "Vehicle Parts",
		"stock_uom": "Unit",
		"is_stock_item": 1,
		"standard_rate": 2500,
	},
	{
		"item_code": "SPRK-PLUG-001",
		"item_name": "Spark Plug",
		"item_group": "Vehicle Parts",
		"stock_uom": "Unit",
		"is_stock_item": 1,
		"standard_rate": 1200,
	},
]

SERVICES = [
	{
		"item_code": "SRV-OIL-CHANGE",
		"item_name": "Oil Change Service",
		"item_group": "Services",
		"stock_uom": "Job",
		"is_stock_item": 0,
		"standard_rate": 3000,
	},
	{
		"item_code": "SRV-FULL-SERVICE",
		"item_name": "Full Vehicle Service",
		"item_group": "Services",
		"stock_uom": "Job",
		"is_stock_item": 0,
		"standard_rate": 12000,
	},
	{
		"item_code": "SRV-BRAKE-SERVICE",
		"item_name": "Brake Service",
		"item_group": "Services",
		"stock_uom": "Job",
		"is_stock_item": 0,
		"standard_rate": 5000,
	},
	{
		"item_code": "SRV-ENGINE-DIAG",
		"item_name": "Engine Diagnostics",
		"item_group": "Services",
		"stock_uom": "Job",
		"is_stock_item": 0,
		"standard_rate": 4000,
	},
	{
		"item_code": "SRV-WHEEL-ALIGN",
		"item_name": "Wheel Alignment",
		"item_group": "Services",
		"stock_uom": "Job",
		"is_stock_item": 0,
		"standard_rate": 3500,
	},
]


def _ensure_uom(uom_name: str) -> None:
	if frappe.db.exists("UOM", uom_name):
		return
	frappe.get_doc({"doctype": "UOM", "uom_name": uom_name}).insert(ignore_permissions=True)


def _ensure_item_group(name: str) -> None:
	if frappe.db.exists("Item Group", name):
		return
	parent = "All Item Groups"
	if not frappe.db.exists("Item Group", parent):
		parent = frappe.db.get_value("Item Group", {"is_group": 1}, "name") or "All Item Groups"
	frappe.get_doc(
		{
			"doctype": "Item Group",
			"item_group_name": name,
			"parent_item_group": parent,
			"is_group": 0,
		}
	).insert(ignore_permissions=True)


def _default_company_warehouse():
	"""Return (company, warehouse) for Item Defaults. Warehouse always belongs to company."""
	defaults = frappe.defaults.get_defaults() or {}
	company = defaults.get("company")
	if company and not frappe.db.exists("Company", company):
		company = None
	if not company:
		company = frappe.db.get_single_value("Global Defaults", "default_company")
	if not company:
		row = frappe.db.sql(
			"select name from `tabCompany` order by creation asc limit 1", as_dict=True
		)
		company = row[0].name if row else None
	warehouse = None
	if company:
		row = frappe.db.sql(
			"""
			select name from `tabWarehouse`
			where company = %s and ifnull(disabled,0) = 0 and ifnull(is_group,0) = 0
			order by creation asc
			limit 1
			""",
			company,
			as_dict=True,
		)
		warehouse = row[0].name if row else None
	return company, warehouse


def seed_demo_workshop_items(force: bool = False) -> dict:
	"""Insert demo parts and service Items. Idempotent: only creates missing item codes.

	Run manually:
	bench --site [site] execute workshop_mgmt.workshop_management.demo.seed_demo_items.seed_demo_workshop_items
	"""
	all_rows = PARTS + SERVICES
	if not force:
		missing_rows = [r for r in all_rows if not frappe.db.exists("Item", r["item_code"])]
		if not missing_rows:
			return {"skipped": True, "reason": "All demo items already exist"}
		rows_to_create = missing_rows
	else:
		rows_to_create = [r for r in all_rows if not frappe.db.exists("Item", r["item_code"])]

	for u in ("Litre", "Unit", "Job"):
		_ensure_uom(u)

	_ensure_item_group("Vehicle Parts")
	_ensure_item_group("Services")

	company, warehouse = _default_company_warehouse()
	if not company:
		frappe.log_error("seed_demo_workshop_items: No Company found")
		return {"skipped": True, "reason": "No Company"}

	created = []
	for row in rows_to_create:
		code = row["item_code"]

		doc = frappe.new_doc("Item")
		doc.item_code = code
		doc.item_name = row["item_name"]
		doc.item_group = row["item_group"]
		doc.stock_uom = row["stock_uom"]
		doc.is_stock_item = row["is_stock_item"]
		doc.standard_rate = row["standard_rate"]
		doc.is_sales_item = 1
		doc.is_purchase_item = 1 if row["is_stock_item"] else 0
		doc.include_item_in_manufacturing = 0

		# Only stock items get Item Defaults rows. For non-stock services, do not append
		# item_defaults: insert() runs _set_defaults() which merges session defaults into
		# each new Item Default row (e.g. default_warehouse) and can pair the wrong
		# warehouse with the default company (multi-company sites).
		if company and cint(row["is_stock_item"]):
			id_row = {"company": company}
			if warehouse:
				id_row["default_warehouse"] = warehouse
			doc.append("item_defaults", id_row)

		doc.insert(ignore_permissions=True)
		created.append(code)

	return {"skipped": False, "created": created, "company": company}


@frappe.whitelist()
def seed_demo_workshop_items_whitelist(force: int = 0):
	"""Desk-callable reseed (optional)."""
	return seed_demo_workshop_items(force=bool(force))
