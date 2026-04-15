# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

import frappe


def on_session_creation(login_manager):
	"""Called when a user session is created"""
	# Add custom logic here if needed
	pass


@frappe.whitelist()
def get_dashboard_link():
	"""Return the workspace link for quick access"""
	return {
		"page": "Workspaces",
		"label": "Workshop Management",
		"description": "Open the Workshop Management workspace"
	}




