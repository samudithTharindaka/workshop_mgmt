import { ref } from "vue";
import { restResourceList } from "../utils/api";

const globalCustomerMeta = ref({});

export function useCustomerMeta() {
	function customerDisplayName(customerId) {
		if (!customerId) return "—";
		const m = globalCustomerMeta.value[customerId];
		if (m?.customer_name) return m.customer_name;
		return customerId;
	}

	function customerAvatarSrc(customerId) {
		const img = globalCustomerMeta.value[customerId]?.image;
		if (!img || !String(img).trim()) return "";
		const u = String(img).trim();
		if (u.startsWith("http://") || u.startsWith("https://")) return u;
		return u.startsWith("/") ? u : `/${u}`;
	}

	function customerInitials(customerId) {
		const name = customerDisplayName(customerId);
		const s = (name || "?").trim();
		if (!s) return "?";
		const parts = s.split(/\s+/).filter(Boolean);
		if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		return s.slice(0, 2).toUpperCase();
	}

	async function enrichCustomersForRows(rows) {
		const ids = [...new Set((rows || []).map((r) => r.customer).filter(Boolean))];
		const missing = ids.filter((id) => !globalCustomerMeta.value[id]);
		if (!missing.length) return;
		try {
			const chunk = await restResourceList("Customer", {
				fields: '["name","customer_name","image"]',
				filters: [["name", "in", missing]],
				limit_page_length: missing.length + 10,
			});
			const map = { ...globalCustomerMeta.value };
			for (const c of chunk || []) {
				map[c.name] = { customer_name: c.customer_name || "", image: c.image || "" };
			}
			globalCustomerMeta.value = map;
		} catch {
			/* ignore */
		}
	}

	return {
		customerMeta: globalCustomerMeta,
		customerDisplayName,
		customerAvatarSrc,
		customerInitials,
		enrichCustomersForRows,
	};
}
