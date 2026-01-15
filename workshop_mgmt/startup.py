# Copyright (c) 2025, Infoney and contributors
# For license information, please see license.txt

def boot_session(bootinfo):
    """Import modules to register whitelisted methods"""
    # Import api module to register whitelisted functions
    import workshop_mgmt.api
    import workshop_mgmt.workshop_management.page.garage_dashboard.garage_dashboard

