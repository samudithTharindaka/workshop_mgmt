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


































