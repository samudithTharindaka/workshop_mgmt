const csrf = () => window?.frappe?.csrf_token || "";

export async function restResourceGet(doctype, name) {
	const url = `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`;
	const res = await fetch(url, { credentials: "same-origin" });
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.exc || data.message || "Load failed");
	return data.data;
}

export async function frappeCall(method, args = {}) {
	const res = await fetch(`/api/method/${method}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Frappe-CSRF-Token": csrf(),
		},
		body: JSON.stringify(args),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok || data.exc) {
		let msg = `HTTP ${res.status}`;
		if (data._server_messages) {
			try {
				const msgs = JSON.parse(data._server_messages);
				msg = JSON.parse(msgs[0]).message || msg;
			} catch {
				/* ignore */
			}
		} else if (data.message && typeof data.message === "string") {
			msg = data.message;
		} else if (data.exc) {
			msg = String(data.exc).split("\n").pop() || msg;
		}
		throw new Error(msg);
	}
	return data.message;
}

export async function restResourceList(
	doctype,
	{ fields, order_by, limit_page_length, filters } = {}
) {
	const f = encodeURIComponent(fields || '["name"]');
	const ob = encodeURIComponent(order_by || "modified desc");
	const lim = limit_page_length ?? 20;
	const parts = [
		`fields=${f}`,
		`order_by=${ob}`,
		`limit_page_length=${lim}`,
	];
	if (filters != null && (!Array.isArray(filters) || filters.length)) {
		const raw = typeof filters === "string" ? filters : JSON.stringify(filters);
		parts.push(`filters=${encodeURIComponent(raw)}`);
	}
	const url = `/api/resource/${encodeURIComponent(doctype)}?${parts.join("&")}`;
	const res = await fetch(url, { credentials: "same-origin" });
	const data = await res.json();
	if (!res.ok) throw new Error(data.exc || data.message || "List failed");
	return data.data || [];
}

export async function restResourcePut(doctype, name, doc) {
	const res = await fetch(
		`/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"X-Frappe-CSRF-Token": csrf(),
			},
			credentials: "same-origin",
			body: JSON.stringify(doc),
		}
	);
	const data = await res.json();
	if (!res.ok || data.exc) {
		let msg = "Update failed";
		if (data._server_messages) {
			try {
				const msgs = JSON.parse(data._server_messages);
				msg = JSON.parse(msgs[0]).message || msg;
			} catch {
				/* ignore */
			}
		} else if (data.exc) {
			msg = String(data.exc).split("\n").pop() || msg;
		}
		throw new Error(msg);
	}
	return data.data;
}

export async function restInsert(doctype, doc) {
	const res = await fetch(`/api/resource/${encodeURIComponent(doctype)}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Frappe-CSRF-Token": csrf(),
		},
		credentials: "same-origin",
		body: JSON.stringify(doc),
	});
	const data = await res.json();
	if (!res.ok || data.exc) {
		let msg = "Save failed";
		if (data._server_messages) {
			try {
				const msgs = JSON.parse(data._server_messages);
				msg = JSON.parse(msgs[0]).message || msg;
			} catch {
				/* ignore */
			}
		} else if (data.exc) {
			msg = String(data.exc).split("\n").pop() || msg;
		}
		throw new Error(msg);
	}
	return data.data;
}
