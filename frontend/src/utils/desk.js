/** Frappe Desk form URL slugs for workshop doctypes */
const DOCTYPE_ROUTE = {
	"Service Appointment": "service-appointment",
	"Vehicle Inspection": "vehicle-inspection",
	"Job Card": "job-card",
	Quotation: "quotation",
	"Sales Invoice": "sales-invoice",
};

export function deskFormUrl(doctype, name) {
	const slug =
		DOCTYPE_ROUTE[doctype] || String(doctype || "").toLowerCase().replace(/\s+/g, "-");
	return `/app/${slug}/${encodeURIComponent(name)}`;
}
