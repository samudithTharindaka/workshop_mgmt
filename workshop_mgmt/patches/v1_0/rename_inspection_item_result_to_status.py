# Copyright (c) 2026, Infoney and contributors
"""Rename legacy Inspection Item.result to status before schema sync (avoids data loss)."""

import frappe


def execute():
	if not frappe.db.table_exists("tabInspection Item"):
		return

	has_result = frappe.db.has_column("tabInspection Item", "result")
	has_status = frappe.db.has_column("tabInspection Item", "status")

	if has_result and not has_status:
		frappe.db.sql(
			"ALTER TABLE `tabInspection Item` CHANGE COLUMN `result` `status` VARCHAR(140)"
		)
	elif has_result and has_status:
		frappe.db.sql(
			"""
			UPDATE `tabInspection Item`
			SET `status` = COALESCE(NULLIF(`status`, ''), `result`)
			WHERE `result` IS NOT NULL AND `result` != ''
			"""
		)
		frappe.db.sql("ALTER TABLE `tabInspection Item` DROP COLUMN `result`")

	frappe.db.commit()
