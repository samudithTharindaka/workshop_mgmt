# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

"""Row-level access helpers for Workshop Customer users (User Permissions on Customer)."""

import frappe
from frappe.core.doctype.user_permission.user_permission import get_user_permissions

WORKSHOP_CUSTOMER_ROLE = "Workshop Customer"


def is_workshop_portal_user(user: str | None = None) -> bool:
	"""True for desk users who should only see their own Customer's workshop data.

	Uses role *Workshop Customer* and no *write* permission on Job Card (staff overrides).
	"""
	user = user or frappe.session.user
	if user in ("Administrator", "Guest"):
		return False
	roles = frappe.get_roles(user)
	if WORKSHOP_CUSTOMER_ROLE not in roles:
		return False
	if frappe.has_permission("Job Card", "write", user=user):
		return False
	return True


def get_allowed_customer_names(user: str | None = None) -> list[str] | None:
	"""Return None if user is not portal-scoped (full access).

	Return [] if portal user has no Customer User Permissions (no data).
	Otherwise return allowed Customer names.
	"""
	user = user or frappe.session.user
	if not is_workshop_portal_user(user):
		return None
	perms = get_user_permissions(user)
	customers = perms.get("Customer") or []
	return [c.doc for c in customers]


def merge_customer_filters(doctype: str, filters: dict | None) -> dict | None:
	"""Narrow filters by allowed customers for portal users. Returns None if no rows may match."""
	allowed = get_allowed_customer_names()
	if allowed is None:
		return filters or {}
	if not allowed:
		return None
	out = dict(filters or {})
	if out.get("customer"):
		existing = out["customer"]
		if isinstance(existing, list) and len(existing) >= 2 and existing[0].lower() == "in":
			vals = [v for v in existing[1] if v in allowed]
			if not vals:
				return None
			out["customer"] = ["in", vals]
		elif isinstance(existing, str):
			if existing not in allowed:
				return None
		else:
			out["customer"] = ["in", allowed]
	else:
		out["customer"] = ["in", allowed]
	return out


def customer_in_sql(table_alias: str, fieldname: str = "customer") -> str:
	"""Append to SQL WHERE for portal users. Staff get empty string."""
	allowed = get_allowed_customer_names()
	if allowed is None:
		return ""
	if not allowed:
		return " AND 1=0 "
	escaped = ", ".join(frappe.db.escape(c, percent=False) for c in allowed)
	return f" AND `{table_alias}`.`{fieldname}` IN ({escaped}) "


def safe_count(doctype: str, filters: dict | None = None) -> int:
	"""Permission-aware count; uses get_list for portal users."""
	filters = merge_customer_filters(doctype, filters)
	if filters is None:
		return 0
	if is_workshop_portal_user():
		return len(
			frappe.get_list(doctype, filters=filters, fields=["name"], limit_page_length=0)
		)
	return frappe.db.count(doctype, filters)


def safe_get_list(doctype: str, **kwargs) -> list:
	"""Like frappe.get_list but applies Customer scope for portal users."""
	filters = merge_customer_filters(doctype, kwargs.get("filters"))
	if filters is None:
		return []
	kwargs["filters"] = filters
	if "limit_page_length" not in kwargs and "limit" not in kwargs:
		kwargs["limit_page_length"] = 0
	return frappe.get_list(doctype, **kwargs)
