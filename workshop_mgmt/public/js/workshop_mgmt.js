// Workshop Management App - Custom JS
// Copyright (c) 2025, Infoney

frappe.provide("workshop_mgmt");

// Open Workshop Vue portal (/workshop) in a new tab from workspace URL shortcuts (Frappe otherwise uses same tab).
(function () {
	const PORTAL_LABEL = "Workshop Portal";
	const PORTAL_PATH = "/workshop";
	const WORKSPACES_PORTAL_NEW_TAB = ["Workshop Management", "Workshop Module"];

	function isTargetWorkspace() {
		if (!frappe.get_route) return false;
		const r = frappe.get_route();
		if (r[0] !== "Workspaces") return false;
		return WORKSPACES_PORTAL_NEW_TAB.includes(r[1]);
	}

	function isWorkshopPortalShortcutWidget(el) {
		if (!el || !el.classList || !el.classList.contains("shortcut-widget-box")) return false;
		const title = el.querySelector(".widget-title");
		if (!title) return false;
		const t = (title.textContent || "").trim();
		return t === PORTAL_LABEL || t === __(PORTAL_LABEL);
	}

	document.addEventListener(
		"click",
		function (ev) {
			if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
			const el = ev.target && ev.target.closest && ev.target.closest(".widget.shortcut-widget-box");
			if (!el || !isTargetWorkspace() || !isWorkshopPortalShortcutWidget(el)) return;
			ev.preventDefault();
			ev.stopPropagation();
			ev.stopImmediatePropagation();
			const url = frappe.urllib && frappe.urllib.get_full_url
				? frappe.urllib.get_full_url(PORTAL_PATH)
				: PORTAL_PATH;
			window.open(url, "_blank", "noopener,noreferrer");
		},
		true
	);
})();

// Show a simple first-session hint for Workshop users
$(document).on('app_ready', function() {
	if (frappe.boot.user && frappe.boot.user.can_read.includes("Job Card")) {
		if (!sessionStorage.getItem('workshop_welcome_shown')) {
			setTimeout(function() {
				frappe.show_alert({
					message: __('Welcome to Workshop Management! Open Job Card or Service Appointment to continue.'),
					indicator: 'blue'
				}, 7);
				sessionStorage.setItem('workshop_welcome_shown', '1');
			}, 2000);
		}
	}
});
