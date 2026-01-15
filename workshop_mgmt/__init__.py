__version__ = "0.0.1"

# Import page modules at app load time to register whitelisted methods
# This ensures the @frappe.whitelist() decorators run when the app is loaded
def _register_whitelisted_methods():
    try:
        from workshop_mgmt.workshop_management.page.garage_dashboard import garage_dashboard
    except Exception:
        pass

_register_whitelisted_methods()
